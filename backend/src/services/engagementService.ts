import EngagementEvent from '../models/EngagementEvent';
import Analytics from '../models/Analytics';
import LearningProgress from '../models/LearningProgress';
import CheckpointResponse from '../models/CheckpointResponse';
import Attendance from '../models/Attendance';
import User from '../models/User';
import mongoose from 'mongoose';

/**
 * Engagement Analytics Engine
 * 
 * Computes engagement scores using the weighted formula:
 * engagement_score = (0.3 * quiz_accuracy) + (0.2 * watch_completion) + 
 *                    (0.2 * consistency_rate) + (0.15 * replay_behavior) + 
 *                    (0.15 * participation_frequency)
 */
class EngagementService {
  /**
   * Record an engagement event from the video player
   */
  async trackEvent(data: {
    userId: string;
    videoId: string;
    courseId: string;
    moduleId: string;
    eventType: string;
    timestamp: number;
    duration: number;
    metadata: any;
    sessionId: string;
  }) {
    const event = await EngagementEvent.create({
      user: data.userId,
      video: data.videoId,
      course: data.courseId,
      module: data.moduleId,
      eventType: data.eventType,
      timestamp: data.timestamp,
      duration: data.duration,
      metadata: data.metadata || {},
      sessionId: data.sessionId,
    });
    return event;
  }

  /**
   * Compute engagement score for a user in a course
   * Uses the prompt's formula:
   * engagement_score = (0.3 * quiz_accuracy) + (0.2 * watch_completion) + 
   *                    (0.2 * consistency_rate) + (0.15 * replay_behavior) + 
   *                    (0.15 * participation_frequency)
   */
  async computeEngagementScore(userId: string, courseId?: string): Promise<number> {
    const quizAccuracy = await this.getQuizAccuracy(userId, courseId);
    const watchCompletion = await this.getWatchCompletion(userId, courseId);
    const consistencyRate = await this.getConsistencyRate(userId);
    const replayBehavior = await this.getReplayBehavior(userId, courseId);
    const participationFrequency = await this.getParticipationFrequency(userId);

    const score =
      0.3 * quizAccuracy +
      0.2 * watchCompletion +
      0.2 * consistencyRate +
      0.15 * replayBehavior +
      0.15 * participationFrequency;

    // Update user's engagement score
    await User.findByIdAndUpdate(userId, { engagementScore: Math.min(1, Math.max(0, score)) });

    return Math.min(1, Math.max(0, score));
  }

  /**
   * Quiz accuracy: ratio of correct answers to total attempts
   */
  private async getQuizAccuracy(userId: string, courseId?: string): Promise<number> {
    const filter: any = { user: userId };
    if (courseId) {
      // Get videos in this course
      const progress = await LearningProgress.findOne({ user: userId, course: courseId });
      if (!progress) return 0;
    }

    const responses = await CheckpointResponse.find(filter);
    if (responses.length === 0) return 0;

    const correct = responses.filter((r: any) => r.isCorrect).length;
    return correct / responses.length;
  }

  /**
   * Watch completion: average video completion across all videos
   */
  private async getWatchCompletion(userId: string, courseId?: string): Promise<number> {
    const filter: any = { user: userId };
    if (courseId) filter.course = courseId;

    const progress = await LearningProgress.find(filter);
    if (progress.length === 0) return 0;

    let totalCompletion = 0;
    let videoCount = 0;

    for (const p of progress) {
      for (const vp of (p as any).videosProgress || []) {
        if (vp.totalDuration > 0) {
          totalCompletion += Math.min(1, vp.watchedDuration / vp.totalDuration);
          videoCount++;
        }
      }
    }

    return videoCount > 0 ? totalCompletion / videoCount : 0;
  }

  /**
   * Consistency rate: ratio of active days to total days since enrollment
   */
  private async getConsistencyRate(userId: string): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const attendanceCount = await Attendance.countDocuments({
      user: userId,
      date: { $gte: thirtyDaysAgo },
      isMarked: true,
    });

    return Math.min(1, attendanceCount / 30);
  }

  /**
   * Replay behavior: normalized replay count (more replays = more engagement)
   */
  private async getReplayBehavior(userId: string, courseId?: string): Promise<number> {
    const filter: any = { user: userId, eventType: 'replay' };
    if (courseId) filter.course = courseId;

    const replayCount = await EngagementEvent.countDocuments(filter);
    // Normalize: cap at 20 replays = 1.0
    return Math.min(1, replayCount / 20);
  }

  /**
   * Participation frequency: sessions per week normalized
   */
  private async getParticipationFrequency(userId: string): Promise<number> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const sessions = await EngagementEvent.distinct('sessionId', {
      user: userId,
      createdAt: { $gte: sevenDaysAgo },
    });

    // Normalize: 7 sessions per week = 1.0
    return Math.min(1, sessions.length / 7);
  }

  /**
   * Get video engagement analytics for a specific video (for teacher dashboard)
   */
  async getVideoEngagement(videoId: string) {
    const events = await EngagementEvent.find({ video: videoId });

    const pauseEvents = events.filter(e => e.eventType === 'pause');
    const replayEvents = events.filter(e => e.eventType === 'replay');
    const dropOffEvents = events.filter(e => e.eventType === 'drop_off');

    // Build timestamp heatmap (group by 30s intervals)
    const heatmap: { [key: number]: number } = {};
    for (const event of [...pauseEvents, ...replayEvents]) {
      const bucket = Math.floor(event.timestamp / 30) * 30;
      heatmap[bucket] = (heatmap[bucket] || 0) + 1;
    }

    // Drop-off analysis
    const dropOffs = dropOffEvents.map(e => e.metadata?.dropOffTimestamp || e.timestamp);

    return {
      totalEvents: events.length,
      pauseCount: pauseEvents.length,
      replayCount: replayEvents.length,
      dropOffCount: dropOffEvents.length,
      avgDropOffTimestamp: dropOffs.length > 0
        ? dropOffs.reduce((a, b) => a + b, 0) / dropOffs.length
        : null,
      engagementHeatmap: heatmap,
      replaySegments: replayEvents.map(e => ({
        start: e.metadata?.replaySegmentStart,
        end: e.metadata?.replaySegmentEnd,
      })).filter(s => s.start !== undefined),
    };
  }

  /**
   * Aggregate and store analytics for a user-module combination
   */
  async aggregateAnalytics(userId: string, courseId: string, moduleId: string, videoId?: string) {
    const engagementScore = await this.computeEngagementScore(userId, courseId);
    const quizAccuracy = await this.getQuizAccuracy(userId, courseId);
    const watchCompletion = await this.getWatchCompletion(userId, courseId);
    const consistencyRate = await this.getConsistencyRate(userId);
    const replayBehavior = await this.getReplayBehavior(userId, courseId);
    const participationFrequency = await this.getParticipationFrequency(userId);

    // Count events for this module
    const filter: any = { user: userId, module: moduleId };
    const pauseCount = await EngagementEvent.countDocuments({ ...filter, eventType: 'pause' });
    const replayCount = await EngagementEvent.countDocuments({ ...filter, eventType: 'replay' });

    const analyticsData = {
      user: userId,
      course: courseId,
      module: moduleId,
      video: videoId,
      date: new Date(),
      watchTime: 0,
      pauseCount,
      replayCount,
      dropOffTime: 0,
      completionRate: watchCompletion,
      quizAccuracy,
      engagementScore,
      consistencyRate,
      replayBehavior,
      participationFrequency,
    };

    const analytics = await Analytics.create(analyticsData);
    return analytics;
  }

  /**
   * Get engagement summary for a student
   */
  async getStudentEngagementSummary(userId: string) {
    const engagementScore = await this.computeEngagementScore(userId);
    
    const recentEvents = await EngagementEvent.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(100);

    const eventCounts: { [key: string]: number } = {};
    for (const event of recentEvents) {
      eventCounts[event.eventType] = (eventCounts[event.eventType] || 0) + 1;
    }

    return {
      engagementScore,
      recentEventCounts: eventCounts,
      totalEvents: recentEvents.length,
    };
  }
}

export default new EngagementService();
