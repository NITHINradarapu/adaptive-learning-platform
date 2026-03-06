import { Request, Response, NextFunction } from 'express';
import engagementService from '../services/engagementService';
import rlService from '../services/rlService';
import recommendationService from '../services/recommendationService';

/**
 * Analytics Controller
 * Handles engagement tracking, RL interactions, and recommendations
 */

// Track engagement event from video player
export const trackEngagement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { videoId, courseId, moduleId, eventType, timestamp, duration, metadata, sessionId } = req.body;
    const userId = (req as any).user.id;

    const event = await engagementService.trackEvent({
      userId,
      videoId,
      courseId,
      moduleId,
      eventType,
      timestamp: timestamp || 0,
      duration: duration || 0,
      metadata: metadata || {},
      sessionId: sessionId || `session_${Date.now()}`,
    });

    res.status(201).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

// Get engagement score for current user
export const getEngagementScore = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { courseId } = req.query;

    const score = await engagementService.computeEngagementScore(userId, courseId as string);
    const summary = await engagementService.getStudentEngagementSummary(userId);

    res.json({
      success: true,
      data: {
        ...summary,
        engagementScore: score,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get video engagement data (for teacher analytics)
export const getVideoEngagement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { videoId } = req.params;
    const data = await engagementService.getVideoEngagement(videoId);

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// Get RL recommendation for current user
export const getRLRecommendation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { courseId } = req.query;

    const recommendation = await recommendationService.getPersonalizedRecommendation(
      userId,
      courseId as string
    );

    res.json({ success: true, data: recommendation });
  } catch (error) {
    next(error);
  }
};

// Process RL interaction (called after quiz submission, video completion)
export const processRLInteraction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { courseId, quizScore, topicCompleted, previousAction, previousStateHash } = req.body;

    // Get streak info
    const Streak = (await import('../models/Streak')).default;
    const streak = await Streak.findOne({ user: userId });

    // Check for repeated failure
    const CheckpointResponse = (await import('../models/CheckpointResponse')).default;
    const recentResponses = await CheckpointResponse.find({ user: userId })
      .sort({ answeredAt: -1 })
      .limit(5);
    const recentFailures = recentResponses.filter((r: any) => !r.isCorrect).length;

    const result = await rlService.processInteraction(userId, courseId, {
      quizScore,
      topicCompleted,
      streakCount: streak?.currentStreak || 0,
      isDropout: false,
      repeatedFailure: recentFailures >= 3,
      previousAction,
      previousStateHash,
    });

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// Get RL state/stats for current user
export const getRLStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const stats = await rlService.getUserRLStats(userId);

    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};
