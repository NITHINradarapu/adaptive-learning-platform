import { Request, Response, NextFunction } from 'express';
import teacherAnalyticsService from '../services/teacherAnalyticsService';
import riskDetectionService from '../services/riskDetectionService';

/**
 * Teacher Analytics Controller
 * Handles teacher dashboard analytics, risk detection, and insights
 */

// Get full course analytics dashboard
export const getCourseDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { courseId } = req.params;
    const teacherId = (req as any).user.id;

    const dashboard = await teacherAnalyticsService.getCourseDashboard(courseId, teacherId);

    res.json({ success: true, data: dashboard });
  } catch (error) {
    next(error);
  }
};

// Get per-student performance data
export const getStudentPerformance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { courseId } = req.params;
    const teacherId = (req as any).user.id;

    const students = await teacherAnalyticsService.getStudentPerformance(courseId, teacherId);

    res.json({ success: true, data: students });
  } catch (error) {
    next(error);
  }
};

// Get at-risk students across all teacher's courses
export const getAtRiskStudents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const teacherId = (req as any).user.id;
    const atRiskStudents = await riskDetectionService.getAtRiskStudentsForTeacher(teacherId);

    res.json({ success: true, data: atRiskStudents });
  } catch (error) {
    next(error);
  }
};

// Assess risk for a specific student
export const assessStudentRisk = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { studentId } = req.params;
    const assessment = await riskDetectionService.assessStudentRisk(studentId);

    res.json({ success: true, data: assessment });
  } catch (error) {
    next(error);
  }
};
