import express from 'express';
import { createComment, getCommentsForPost, getSingleComment, deleteComment , voteComment} from '../controllers/commentController';
import { authenticateToken } from '../middlewares/auth';

const router = express.Router();

router.post('/', authenticateToken, createComment);
router.post('/:id/vote', authenticateToken, voteComment); 
router.get('/:id', authenticateToken, getCommentsForPost);
router.get('/:id', authenticateToken, getSingleComment);

router.delete('/:id', authenticateToken, deleteComment);



export default router;
