import admin from '../config/firebase.js';
import { pool } from '../config/database.js';

const authController = {
  async signup(req, res) {
    try {
      const { email, password, username, firstname, lastname } = req.body;

      if (!email || !password || !username) {
        return res.status(400).json({
          error: 'Email, password, and username are required',
        });
      }

      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: username,
      });

      const sql = `
        INSERT INTO users (firebase_uid, username, email, firstname, lastname)
        VALUES (?, ?, ?, ?, ?);
      `;

      const [result] = await pool.execute(sql, [
        userRecord.uid,
        username,
        email,
        firstname || null,
        lastname || null,
      ]);

      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: result.insertId,
          firebaseUid: userRecord.uid,
          username,
          email,
          firstname: firstname || null,
          lastname: lastname || null,
        },
      });
    } catch (error) {
      console.error('Signup error:', error);
      if (error.code === 'auth/email-already-exists') {
        return res.status(400).json({ error: 'Email already in use' });
      }
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Username already exists' });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async login(req, res) {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        return res.status(400).json({
          error: 'Firebase ID token is required',
        });
      }

      const decodedToken = await admin.auth().verifyIdToken(idToken);

      res.cookie('session', idToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600 * 1000,
        path: '/',
      });

      res.status(200).json({
        message: 'Login successful',
        uid: decodedToken.uid,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({ error: 'Authentication failed' });
    }
  },

  async getMe(req, res) {
    try {
      const token =
        req.cookies.session || req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const decodedToken = await admin.auth().verifyIdToken(token);

      const sql = `
        SELECT id, firebase_uid AS firebaseUid, username, email, firstname, lastname
        FROM users
        WHERE firebase_uid = ?;
      `;

      const [rows] = await pool.execute(sql, [decodedToken.uid]);

      if (rows.length > 0) {
        return res.json(rows[0]);
      }

      return res.json({
        firebaseUid: decodedToken.uid,
        email: decodedToken.email,
        username: decodedToken.email?.split('@')[0] || 'user',
      });
    } catch (error) {
      console.error('ME endpoint error:', error);
      res.status(401).json({ error: 'Authentication failed' });
    }
  },

  async logout(req, res) {
    try {
      res.clearCookie('session', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
      });
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Logout failed' });
    }
  },

  async getAllUsers(req, res) {
    try {
      const sql = `
        SELECT username, email, firstname, lastname
        FROM users
        ORDER BY username ASC;
      `;

      const [rows] = await pool.execute(sql);

      res.status(200).json(rows);
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Called after Google OAuth (popup or redirect) to sync the Firebase user into MySQL.
  async handleToken(req, res) {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        return res.status(400).json({ error: 'No ID token provided' });
      }

      const decodedToken = await admin.auth().verifyIdToken(idToken);

      const findSql = `SELECT id FROM users WHERE firebase_uid = ?;`;
      const [existingRows] = await pool.execute(findSql, [decodedToken.uid]);

      if (existingRows.length === 0) {
        const username =
          decodedToken.name?.replace(/\s+/g, '_').toLowerCase() ||
          decodedToken.email?.split('@')[0] ||
          `user_${decodedToken.uid.substring(0, 8)}`;

        const insertSql = `
          INSERT INTO users (firebase_uid, username, email, firstname, lastname)
          VALUES (?, ?, ?, ?, ?);
        `;

        await pool.execute(insertSql, [
          decodedToken.uid,
          username,
          decodedToken.email,
          decodedToken.name?.split(' ')[0] || null,
          decodedToken.name?.split(' ').slice(1).join(' ') || null,
        ]);
      }

      res.cookie('session', idToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600 * 1000,
        path: '/',
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Token handling error:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res
          .status(400)
          .json({ error: 'Username already exists, please choose another' });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};

export default authController;
