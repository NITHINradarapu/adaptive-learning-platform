import { Request, Response, NextFunction } from 'express';
import spacedRepetitionService from '../services/spacedRepetitionService';

/**
 * Spaced Repetition Controller
 */

// Get due reviews for current user
export const getDueReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const dueReviews = await spacedRepetitionService.getDueReviews(userId);

    res.json({ success: true, data: dueReviews });
  } catch (error) {
    next(error);
  }
};

// Get all schedules for current user
export const getAllSchedules = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const schedules = await spacedRepetitionService.getAllSchedules(userId);

    res.json({ success: true, data: schedules });
  } catch (error) {
    next(error);
  }
};

// Get review summary
export const getReviewSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const summary = await spacedRepetitionService.getReviewSummary(userId);

    res.json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
};

// Get review questions for a module
export const getReviewQuestions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { moduleId } = req.params;
    const count = parseInt(req.query.count as string) || 5;

    const questions = await spacedRepetitionService.getReviewQuestions(moduleId, count);

    res.json({ success: true, data: questions });
  } catch (error) {
    next(error);
  }
};

// Submit a review result
export const submitReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { moduleId } = req.params;
    const { score, responseTime } = req.body;

    // Convert percentage score to SM-2 quality (0-5)
    const quality = (await import('../services/spacedRepetitionService')).default.constructor
      ? Math.min(5, Math.max(0, Math.round((score / 100) * 5)))
      : Math.min(5, Math.max(0, Math.round((score / 100) * 5)));

    const result = await spacedRepetitionService.processReview(
      userId,
      moduleId,
      quality,
      responseTime || 0
    );

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// Initialize spaced repetition for a module
export const initializeModule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { moduleId } = req.params;
    const { courseId } = req.body;

    const schedule = await spacedRepetitionService.initializeForModule(userId, moduleId, courseId);

    res.json({ success: true, data: schedule });
  } catch (error) {
    next(error);
  }
};
