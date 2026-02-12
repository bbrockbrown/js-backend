# Setup Guide: Firebase Auth + MySQL (Amazon RDS)

This backend uses Firebase Authentication for auth and MySQL on Amazon RDS for data persistence, with raw SQL queries via the `mysql2` package.

## Architecture

### Authentication
- **Firebase Authentication** - Email/password and Google OAuth

### Database
- **MySQL on Amazon RDS** - User profile storage
- **Raw SQL** - Parameterized queries via `mysql2/promise`
- **Config** - RDS credentials stored in `.ini` file

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable **Email/Password**
   - Enable **Google** (optional, for OAuth)
4. Generate Service Account Key:
   - Go to **Project Settings** > **Service Accounts**
   - Click **Generate New Private Key**
   - Download the JSON file

### 3. Set Up Amazon RDS

1. Go to the AWS RDS Console
2. Create a MySQL database instance
3. Note the endpoint, port, username, password, and database name
4. Make sure your security group allows inbound connections on port 3306

### 4. Configure Environment Variables

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Paste your entire Firebase service account JSON
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"your-project",...}'

# Server config
PORT=5050
FRONTEND_URL=http://localhost:3001
API_URL=http://localhost:5050
FRONTEND_URL_DEV=http://localhost:3001
NODE_ENV=development
```

### 5. Configure RDS Connection

```bash
cp rds-config.ini.example rds-config.ini
```

Edit `rds-config.ini`:

```ini
[rds]
endpoint = your-rds-endpoint.region.rds.amazonaws.com
port_number = 3306
region_name = us-east-2
user_name = your_username
user_pwd = your_password
db_name = your_database_name
```

### 6. Create Database Tables

Run the SQL schema against your RDS instance:

```bash
mysql -h <endpoint> -u <user> -p <dbname> < sql/create_tables.sql
```

Or paste the contents of `sql/create_tables.sql` into MySQL Workbench.

### 7. Start the Server

```bash
npm run dev
```

Server runs on `http://localhost:5050`

## Database Schema

The `users` table:

```sql
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  firebase_uid  VARCHAR(128) NOT NULL,
  username      VARCHAR(50)  NOT NULL,
  email         VARCHAR(255) NOT NULL,
  firstname     VARCHAR(100) DEFAULT NULL,
  lastname      VARCHAR(100) DEFAULT NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY idx_firebase_uid (firebase_uid),
  UNIQUE KEY idx_username     (username),
  UNIQUE KEY idx_email        (email)
);
```

## API Endpoints

### Authentication

#### Sign Up
```bash
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "username": "johndoe",
  "firstname": "John",
  "lastname": "Doe"
}
```

**Process:**
1. Creates user in Firebase Auth
2. Stores profile in MySQL via raw SQL

#### Login
```bash
POST /auth/login
Content-Type: application/json

{
  "idToken": "firebase-id-token-from-frontend"
}
```

**Frontend Example** (using Firebase SDK):
```javascript
import { signInWithEmailAndPassword } from 'firebase/auth';

const userCredential = await signInWithEmailAndPassword(auth, email, password);
const idToken = await userCredential.user.getIdToken();

await fetch('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ idToken })
});
```

#### Google OAuth
```bash
GET /auth/google
```

**Note**: Google OAuth is handled client-side with Firebase SDK.

**Frontend Example**:
```javascript
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const provider = new GoogleAuthProvider();
const result = await signInWithPopup(auth, provider);
const idToken = await result.user.getIdToken();

await fetch('/auth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ idToken })
});
```

#### Get Current User
```bash
GET /auth/me
Authorization: Bearer <firebase-id-token>
```

#### Get All Users (Protected)
```bash
GET /auth/users
Authorization: Bearer <firebase-id-token>
```

#### Logout
```bash
POST /auth/logout
```

## Project Structure

```
js-backend/
├── sql/
│   └── create_tables.sql      # MySQL DDL
├── src/
│   ├── config/
│   │   ├── firebase.js        # Firebase Admin SDK
│   │   └── database.js        # MySQL connection helper (get_dbConn)
│   ├── controllers/
│   │   └── authController.js  # Auth logic (raw SQL queries)
│   ├── middleware/
│   │   └── authMiddleware.js  # Firebase token verification
│   ├── routes/
│   │   └── authRoutes.js      # API routes
│   └── server.js              # Express server
├── .env.example               # Environment template
├── rds-config.ini.example     # RDS config template
├── package.json
└── SETUP_GUIDE.md
```

## Troubleshooting

### Connection refused to RDS
- Check your RDS security group allows inbound on port 3306
- Verify the endpoint and credentials in `rds-config.ini`
- Make sure the RDS instance is running and publicly accessible (or you're on the same VPC)

### Duplicate entry errors
- `ER_DUP_ENTRY` means a unique constraint was violated (email, username, or firebase_uid already exists)

### Firebase errors
- `auth/email-already-exists` - Email is already registered in Firebase
- Verify `FIREBASE_SERVICE_ACCOUNT_KEY` in `.env` is valid JSON

## Notes

- Each request opens a new database connection and closes it when done
- All queries use parameterized placeholders (`?`) to prevent SQL injection
- Firebase handles authentication; MySQL stores user profiles
- The `.ini` config file is gitignored to protect credentials
