
import { Router } from 'express';
import { authController } from '../controllers/auth';
import { authenticateToken } from '../middleware/auth';

const express = require('express');
const router = express.Router();

router.post('/login', authController.login);
router.get('/refresh', authController.refresh);

// Protected routes
router.post('/logout', authenticateToken, authController.logout);
router.post('/logout-all', authenticateToken, authController.logoutAllSessions);
router.delete('/sessions/:sessionId', authenticateToken, authController.logoutSession);

export { router as authRoutes };