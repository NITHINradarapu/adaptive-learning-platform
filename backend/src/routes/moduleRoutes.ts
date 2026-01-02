import express from 'express';
import {
  getCourseModules,
  getModule,
  createModule,
  updateModule,
  deleteModule
} from '../controllers/moduleController';
import { getModuleVideos, createVideo } from '../controllers/videoController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = express.Router();

// Module routes
router.get('/:id', authenticate, getModule);
router.put('/:id', authenticate, authorize(UserRole.INSTRUCTOR, UserRole.ADMIN), updateModule);
router.delete('/:id', authenticate, authorize(UserRole.INSTRUCTOR, UserRole.ADMIN), deleteModule);

// Video routes for modules
router.get('/:moduleId/videos', authenticate, getModuleVideos);
router.post('/:moduleId/videos', authenticate, authorize(UserRole.INSTRUCTOR, UserRole.ADMIN), createVideo);

export default router;
