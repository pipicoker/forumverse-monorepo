import express from 'express';
import { updateUserProfile, getUserProfile } from '../controllers/userController';
import { authenticateToken } from '../middlewares/auth';
import { get } from 'http';

const router = express.Router();

router.put('/', authenticateToken, updateUserProfile);
router.get('/:id', authenticateToken, getUserProfile);



export default router;