import express from 'express';
import { updateUserProfile, getUserProfile, getUserPosts, getUserComments } from '../controllers/userController';
import { authenticateToken } from '../middlewares/auth';
import { get } from 'http';

const router = express.Router();

router.put('/', authenticateToken, updateUserProfile);
router.get('/:id', authenticateToken, getUserProfile);
router.get('/:id/posts', authenticateToken, getUserPosts);
router.get('/:id/comments', authenticateToken, getUserComments);



export default router;