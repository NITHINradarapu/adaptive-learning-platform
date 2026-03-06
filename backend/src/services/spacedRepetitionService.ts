import SpacedRepetition from '../models/SpacedRepetition';
import InteractiveQuestion from '../models/InteractiveQuestion';
import Module from '../models/Module';
import Video from '../models/Video';
import mongoose from 'mongoose';

/**
 * Spaced Repetition Engine
 * 
 * Implements SM-2 algorithm for scheduling reviews:
 * - After each review, quality is rated 0-5
 * - EF (Easiness Factor) = max(1.3, EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02)))
 * - If quality >= 3: interval grows (1, 6, then EF * previous)
 * - If quality < 3: reset to 1 day
 */
class SpacedRepetitionService {
  /**
   * Initialize spaced repetition for a user when they complete a module topic
   */
  async initializeForModule(userId: string, moduleId: string, courseId: string) {
    const existing = await SpacedRepetition.findOne({ user: userId, module: moduleId });
    if (existing) return existing;

    const schedule = await SpacedRepetition.create({
      user: userId,
      module: moduleId,
      course: courseId,
      easinessFactor: 2.5,
      interval: 1,
      repetitions: 0,
      nextReviewDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
      status: 'learning',
    });

    return schedule;
  }

  /**
   * SM-2 algorithm: process a review and update schedule
   * @param quality 0-5 (0=complete blackout, 5=perfect recall)
   */
  async processReview(userId: string, moduleId: string, quality: number, responseTime: number) {
    let schedule = await SpacedRepetition.findOne({ user: userId, module: moduleId });
    if (!schedule) {
      throw new Error('No spaced repetition schedule found');
    }

    quality = Math.min(5, Math.max(0, Math.round(quality)));

    // SM-2 algorithm
    const oldEF = schedule.easinessFactor;
    let newEF = oldEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    newEF = Math.max(1.3, newEF);

    let newInterval: number;
    let newRepetitions: number;

    if (quality >= 3) {
      // Correct response
      if (schedule.repetitions === 0) {
        newInterval = 1;
      } else if (schedule.repetitions === 1) {
        newInterval = 6;
      } else {
        newInterval = Math.round(schedule.interval * newEF);
      }
      newRepetitions = schedule.repetitions + 1;
    } else {
      // Incorrect — reset
      newInterval = 1;
      newRepetitions = 0;
    }

    // Determine status
    let status: 'new' | 'learning' | 'review' | 'mastered' = 'learning';
    if (newRepetitions >= 5 && quality >= 4) {
      status = 'mastered';
    } else if (newRepetitions >= 2) {
      status = 'review';
    }

    // Update schedule
    schedule.easinessFactor = newEF;
    schedule.interval = newInterval;
    schedule.repetitions = newRepetitions;
    schedule.nextReviewDate = new Date(Date.now() + newInterval * 24 * 60 * 60 * 1000);
    schedule.lastReviewDate = new Date();
    schedule.lastScore = quality;
    schedule.totalReviews += 1;
    schedule.status = status;
    schedule.reviewHistory.push({
      date: new Date(),
      score: quality,
      responseTime,
    });

    await schedule.save();

    return {
      nextReviewDate: schedule.nextReviewDate,
      interval: newInterval,
      easinessFactor: newEF,
      status,
      repetitions: newRepetitions,
    };
  }

  /**
   * Get modules due for review for a user
   */
  async getDueReviews(userId: string) {
    const now = new Date();
    const dueItems = await SpacedRepetition.find({
      user: userId,
      nextReviewDate: { $lte: now },
      status: { $ne: 'mastered' },
    })
      .populate('module', 'title description course order')
      .populate('course', 'title')
      .sort({ nextReviewDate: 1 });

    return dueItems;
  }

  /**
   * Get all spaced repetition items for a user
   */
  async getAllSchedules(userId: string) {
    const items = await SpacedRepetition.find({ user: userId })
      .populate('module', 'title description course order')
      .populate('course', 'title')
      .sort({ nextReviewDate: 1 });

    return items;
  }

  /**
   * Get review questions for a module (micro-quiz for spaced repetition)
   */
  async getReviewQuestions(moduleId: string, count: number = 5) {
    // Get videos in this module
    const videos = await Video.find({ module: moduleId }).select('_id');
    const videoIds = videos.map(v => v._id);

    // Get random questions from these videos
    const questions = await InteractiveQuestion.aggregate([
      { $match: { video: { $in: videoIds } } },
      { $sample: { size: count } },
      {
        $project: {
          correctAnswer: 0,
          acceptableAnswers: 0,
          'options.isCorrect': 0,
        },
      },
    ]);

    return questions;
  }

  /**
   * Convert quiz score (0-100) to SM-2 quality (0-5)
   */
  static scoreToQuality(score: number): number {
    if (score >= 90) return 5;
    if (score >= 80) return 4;
    if (score >= 70) return 3;
    if (score >= 50) return 2;
    if (score >= 30) return 1;
    return 0;
  }

  /**
   * Get upcoming reviews summary (for notifications/dashboard)
   */
  async getReviewSummary(userId: string) {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const dueNow = await SpacedRepetition.countDocuments({
      user: userId,
      nextReviewDate: { $lte: now },
      status: { $ne: 'mastered' },
    });

    const dueTomorrow = await SpacedRepetition.countDocuments({
      user: userId,
      nextReviewDate: { $gt: now, $lte: tomorrow },
      status: { $ne: 'mastered' },
    });

    const dueThisWeek = await SpacedRepetition.countDocuments({
      user: userId,
      nextReviewDate: { $gt: now, $lte: nextWeek },
      status: { $ne: 'mastered' },
    });

    const mastered = await SpacedRepetition.countDocuments({
      user: userId,
      status: 'mastered',
    });

    const total = await SpacedRepetition.countDocuments({ user: userId });

    return {
      dueNow,
      dueTomorrow,
      dueThisWeek,
      mastered,
      total,
      masteryPercentage: total > 0 ? Math.round((mastered / total) * 100) : 0,
    };
  }
}

export default new SpacedRepetitionService();
