import express from 'express';
import { createPost, getAllPosts, getSinglePost, bookmarkPost, deletePost, votePost, unbookmarkPost } from '../controllers/postController';
import { authenticateToken } from '../middlewares/auth';

const router = express.Router();

router.post('/', authenticateToken, createPost);
router.get('/', authenticateToken, getAllPosts);
router.get('/:id', authenticateToken, getSinglePost);
router.delete('/:id', authenticateToken, deletePost);
router.post('/:id/bookmark', authenticateToken, bookmarkPost);
router.delete('/:id/bookmark', authenticateToken, unbookmarkPost);
router.post('/:id/vote', authenticateToken, votePost);


export default router;
