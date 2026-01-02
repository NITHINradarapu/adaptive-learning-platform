import express from 'express';
import {
  getModuleVideos,
  getVideo,
  getVideoQuestions,
  createVideo,
  updateVideo,
  deleteVideo,
  submitCheckpoint,
  createQuestion
} from '../controllers/videoController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = express.Router();

router.get('/:id', authenticate, getVideo);
router.put('/:id', authenticate, authorize(UserRole.INSTRUCTOR, UserRole.ADMIN), updateVideo);
router.delete('/:id', authenticate, authorize(UserRole.INSTRUCTOR, UserRole.ADMIN), deleteVideo);
router.get('/:id/questions', authenticate, getVideoQuestions);
router.post('/:id/questions', authenticate, authorize(UserRole.INSTRUCTOR, UserRole.ADMIN), createQuestion);
router.post('/:videoId/checkpoints/:questionId', authenticate, submitCheckpoint);

export default router;
