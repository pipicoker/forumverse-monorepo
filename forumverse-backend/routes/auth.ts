import express from 'express';
import { createUser, getCurrentUser, login, logout } from '../controllers/authController';
import { verifyEmail } from '../controllers/authController';
import { resendVerificaionEmail } from '../controllers/authController';
import { authenticateToken } from '../middlewares/auth';



const router = express.Router();

router.post('/signup', createUser);
router.post('/login', login);
router.delete('/logout', logout);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificaionEmail);
router.get('/current-user', authenticateToken, getCurrentUser )

export default router;
