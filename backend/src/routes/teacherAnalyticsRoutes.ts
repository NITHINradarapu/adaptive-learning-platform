import { Router } from 'express';
import {
  getCourseDashboard,
  getStudentPerformance,
  getAtRiskStudents,
  assessStudentRisk,
} from '../controllers/teacherAnalyticsController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication and instructor/admin role
router.use(authenticate);
router.use(authorize('instructor', 'admin'));

// Course analytics dashboard
router.get('/course/:courseId/dashboard', getCourseDashboard);

// Per-student performance
router.get('/course/:courseId/students', getStudentPerformance);

// At-risk students (across all courses)
router.get('/at-risk', getAtRiskStudents);

// Individual student risk assessment
router.get('/student/:studentId/risk', assessStudentRisk);

export default router;
