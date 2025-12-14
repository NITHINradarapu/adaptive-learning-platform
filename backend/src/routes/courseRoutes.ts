import express from 'express';
import {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollCourse,
  getRecommendedCourses
} from '../controllers/courseController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = express.Router();

router.get('/recommended', authenticate, getRecommendedCourses);
router.get('/', authenticate, getCourses);
router.get('/:id', authenticate, getCourse);
router.post('/', authenticate, createCourse); // Temporarily allow all authenticated users
router.put('/:id', authenticate, updateCourse);
router.delete('/:id', authenticate, deleteCourse);
router.post('/:id/enroll', authenticate, enrollCourse);

export default router;
