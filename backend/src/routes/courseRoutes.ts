import express from 'express';
import {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollCourse,
  unenrollCourse,
  getRecommendedCourses
} from '../controllers/courseController';
import { getCourseModules, createModule } from '../controllers/moduleController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = express.Router();

// Public/Student routes (authenticated)
router.get('/recommended', authenticate, getRecommendedCourses);
router.get('/', authenticate, getCourses);
router.get('/:id', authenticate, getCourse);
router.post('/:id/enroll', authenticate, enrollCourse);
router.delete('/:id/enroll', authenticate, unenrollCourse);

// Module routes for courses
router.get('/:courseId/modules', authenticate, getCourseModules);
router.post('/:courseId/modules', authenticate, authorize(UserRole.INSTRUCTOR, UserRole.ADMIN), createModule);

// Instructor/Admin routes (role-based authorization)
router.post('/', authenticate, authorize(UserRole.INSTRUCTOR, UserRole.ADMIN), createCourse);
router.put('/:id', authenticate, authorize(UserRole.INSTRUCTOR, UserRole.ADMIN), updateCourse);
router.delete('/:id', authenticate, authorize(UserRole.INSTRUCTOR, UserRole.ADMIN), deleteCourse);

export default router;
