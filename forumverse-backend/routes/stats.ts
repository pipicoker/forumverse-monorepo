import express from 'express';
import { getCommunityStats, getPopularTags, getRecentActivity } from '../controllers/statsController';

const router = express.Router();

// Public routes - no authentication required
router.get('/community', getCommunityStats);
router.get('/popular-tags', getPopularTags);
router.get('/recent-activity', getRecentActivity);

export default router;

