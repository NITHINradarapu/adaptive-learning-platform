import { Router } from 'express';
import {
  trackEngagement,
  getEngagementScore,
  getVideoEngagement,
  getRLRecommendation,
  processRLInteraction,
  getRLStats,
} from '../controllers/analyticsController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Engagement tracking
router.post('/engagement/track', trackEngagement);
router.get('/engagement/score', getEngagementScore);
router.get('/engagement/video/:videoId', getVideoEngagement);

// RL-powered recommendations
router.get('/recommendations', getRLRecommendation);
router.post('/rl/interaction', processRLInteraction);
router.get('/rl/stats', getRLStats);

export default router;
