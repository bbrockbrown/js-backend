import express from 'express';

import authController from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', authController.getMe);
router.get('/users', authMiddleware, authController.getAllUsers);
router.get('/google', authController.googleAuth);
router.post('/callback', authController.handleOAuthCallback);
router.post('/token', authController.handleToken);

export default router;
