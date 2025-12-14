import express from 'express';
import {
  getDashboard,
  getAdaptivePath,
  updateVideoProgress,
  getCourseProgress
} from '../controllers/progressController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/dashboard', authenticate, getDashboard);
router.get('/adaptive-path/:courseId', authenticate, getAdaptivePath);
router.get('/course/:courseId', authenticate, getCourseProgress);
router.post('/video/:videoId', authenticate, updateVideoProgress);

export default router;
