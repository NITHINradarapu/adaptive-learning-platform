import express from 'express';
import {
  getAttendanceStatus,
  markAttendance,
  getCurrentStreak,
  getAttendanceCalendar
} from '../controllers/attendanceController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Attendance routes
router.get('/status', authenticate, getAttendanceStatus);
router.post('/mark', authenticate, markAttendance);
router.get('/calendar', authenticate, getAttendanceCalendar);

// Streak routes
router.get('/streaks/current', authenticate, getCurrentStreak);

export default router;
