import express from 'express';
import {
  getVideo,
  getVideoQuestions,
  submitCheckpoint,
  createQuestion
} from '../controllers/videoController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = express.Router();

router.get('/:id', authenticate, getVideo);
router.get('/:id/questions', authenticate, getVideoQuestions);
router.post('/:id/questions', authenticate, authorize(UserRole.INSTRUCTOR, UserRole.ADMIN), createQuestion);
router.post('/:videoId/checkpoints/:questionId', authenticate, submitCheckpoint);

export default router;
