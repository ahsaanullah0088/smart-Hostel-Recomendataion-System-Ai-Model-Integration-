import express from 'express';
import { signup, login } from '../controllers/userController.js';
import { protect, isUser } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// ─── Public ───────────────────────────────────────────────────────────────────
router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);

// ─── Protected ────────────────────────────────────────────────────────────────
router.get('/dashboard', protect, isUser, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to user dashboard',
    user: req.user,
  });
});

export default router;
