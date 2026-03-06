import { Router } from 'express';
import {
  getDueReviews,
  getAllSchedules,
  getReviewSummary,
  getReviewQuestions,
  submitReview,
  initializeModule,
} from '../controllers/spacedRepetitionController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get reviews due now
router.get('/due', getDueReviews);

// Get all schedules
router.get('/schedules', getAllSchedules);

// Get review summary (for dashboard)
router.get('/summary', getReviewSummary);

// Get review questions for a module
router.get('/module/:moduleId/questions', getReviewQuestions);

// Submit review result
router.post('/module/:moduleId/submit', submitReview);

// Initialize spaced repetition for a module
router.post('/module/:moduleId/init', initializeModule);

export default router;
