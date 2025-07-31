import express from 'express';
import { createReport, getAllReports, getSingleReport } from '../controllers/reportController';
import { authenticateToken } from '../middlewares/auth';
import { get } from 'http';

const router = express.Router();

router.post('/', authenticateToken, createReport);
router.get('/', authenticateToken, getAllReports);
router.post('/:id', authenticateToken, getSingleReport);




export default router;