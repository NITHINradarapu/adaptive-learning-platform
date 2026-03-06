import User from '../models/User';
import LearningProgress from '../models/LearningProgress';
import Attendance from '../models/Attendance';
import CheckpointResponse from '../models/CheckpointResponse';
import Streak from '../models/Streak';
import engagementService from './engagementService';

/**
 * Risk Detection Module
 * 
 * Flags students as "At Risk" based on:
 * - Low engagement score
 * - Repeated quiz failures
 * - Irregular login/activity patterns
 * - Declining performance trends
 * 
 * Risk Levels:
 * - low: Minor concerns, monitoring recommended
 * - medium: Multiple risk indicators present
 * - high: Immediate intervention suggested
 */

export interface RiskAssessment {
  userId: string;
  riskLevel: 'low' | 'medium' | 'high';
  isAtRisk: boolean;
  riskScore: number; // 0-100
  riskFactors: string[];
  interventionSuggestions: string[];
  details: {
    engagementScore: number;
    failureRate: number;
    loginConsistency: number;
    performanceTrend: 'improving' | 'stable' | 'declining';
    daysSinceLastActivity: number;
    streakBroken: boolean;
  };
}

class RiskDetectionService {
  /**
   * Assess risk for a single student
   */
  async assessStudentRisk(userId: string): Promise<RiskAssessment> {
    const riskFactors: string[] = [];
    const interventionSuggestions: string[] = [];
    let riskScore = 0;

    // 1. Check engagement score
    const engagementScore = await this.getEngagementScore(userId);
    if (engagementScore < 0.3) {
      riskScore += 25;
      riskFactors.push('Very low engagement score');
      interventionSuggestions.push('Send personalized encouragement message');
    } else if (engagementScore < 0.5) {
      riskScore += 15;
      riskFactors.push('Below average engagement');
      interventionSuggestions.push('Recommend easier content to build confidence');
    }

    // 2. Check failure rate
    const failureRate = await this.getFailureRate(userId);
    if (failureRate > 0.6) {
      riskScore += 25;
      riskFactors.push('High quiz failure rate (>60%)');
      interventionSuggestions.push('Provide additional study materials and hints');
    } else if (failureRate > 0.4) {
      riskScore += 15;
      riskFactors.push('Moderate quiz failure rate');
      interventionSuggestions.push('Suggest revision of weak topics');
    }

    // 3. Check login consistency
    const loginConsistency = await this.getLoginConsistency(userId);
    if (loginConsistency < 0.2) {
      riskScore += 25;
      riskFactors.push('Very irregular login pattern');
      interventionSuggestions.push('Send activity reminders and streak incentives');
    } else if (loginConsistency < 0.4) {
      riskScore += 15;
      riskFactors.push('Inconsistent login pattern');
      interventionSuggestions.push('Encourage daily micro-learning sessions');
    }

    // 4. Check performance trend
    const performanceTrend = await this.getPerformanceTrend(userId);
    if (performanceTrend === 'declining') {
      riskScore += 20;
      riskFactors.push('Declining performance trend');
      interventionSuggestions.push('Schedule one-on-one review session');
    }

    // 5. Check days since last activity
    const daysSinceLastActivity = await this.getDaysSinceLastActivity(userId);
    if (daysSinceLastActivity > 14) {
      riskScore += 30;
      riskFactors.push(`No activity in ${daysSinceLastActivity} days`);
      interventionSuggestions.push('Reach out directly — student may have dropped off');
    } else if (daysSinceLastActivity > 7) {
      riskScore += 15;
      riskFactors.push(`No activity in ${daysSinceLastActivity} days`);
      interventionSuggestions.push('Send a "we miss you" reminder');
    }

    // 6. Check streak breaks
    const streakBroken = await this.isStreakBroken(userId);
    if (streakBroken) {
      riskScore += 10;
      riskFactors.push('Learning streak recently broken');
    }

    // Determine risk level
    riskScore = Math.min(100, riskScore);
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    let isAtRisk = false;

    if (riskScore >= 60) {
      riskLevel = 'high';
      isAtRisk = true;
    } else if (riskScore >= 35) {
      riskLevel = 'medium';
      isAtRisk = true;
    }

    // Update user record
    await User.findByIdAndUpdate(userId, {
      isAtRisk,
      riskLevel,
      lastRiskAssessment: new Date(),
    });

    return {
      userId,
      riskLevel,
      isAtRisk,
      riskScore,
      riskFactors,
      interventionSuggestions,
      details: {
        engagementScore,
        failureRate,
        loginConsistency,
        performanceTrend,
        daysSinceLastActivity,
        streakBroken,
      },
    };
  }

  /**
   * Batch assess all students in a course
   */
  async assessCourseStudents(courseId: string): Promise<RiskAssessment[]> {
    const enrollments = await LearningProgress.find({ course: courseId }).select('user');
    const assessments: RiskAssessment[] = [];

    for (const enrollment of enrollments) {
      try {
        const assessment = await this.assessStudentRisk(enrollment.user.toString());
        assessments.push(assessment);
      } catch (error) {
        console.error(`Risk assessment failed for user ${enrollment.user}:`, error);
      }
    }

    return assessments.sort((a, b) => b.riskScore - a.riskScore);
  }

  /**
   * Get all at-risk students for a teacher across all their courses
   */
  async getAtRiskStudentsForTeacher(teacherId: string) {
    // Find courses taught by this teacher
    const Course = (await import('../models/Course')).default;
    const courses = await Course.find({ instructor: teacherId }).select('_id title');

    const allAtRisk: Array<RiskAssessment & { courseName: string; courseId: string }> = [];

    for (const course of courses) {
      const assessments = await this.assessCourseStudents(course._id.toString());
      const atRiskStudents = assessments.filter(a => a.isAtRisk);

      for (const assessment of atRiskStudents) {
        allAtRisk.push({
          ...assessment,
          courseName: course.title,
          courseId: course._id.toString(),
        });
      }
    }

    return allAtRisk.sort((a, b) => b.riskScore - a.riskScore);
  }

  // ---- Private helper methods ----

  private async getEngagementScore(userId: string): Promise<number> {
    const user = await User.findById(userId);
    if (user?.engagementScore !== undefined) return user.engagementScore;
    return await engagementService.computeEngagementScore(userId);
  }

  private async getFailureRate(userId: string): Promise<number> {
    const responses = await CheckpointResponse.find({ user: userId });
    if (responses.length === 0) return 0;
    const failures = responses.filter((r: any) => !r.isCorrect).length;
    return failures / responses.length;
  }

  private async getLoginConsistency(userId: string): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeDays = await Attendance.countDocuments({
      user: userId,
      date: { $gte: thirtyDaysAgo },
      isMarked: true,
    });

    return activeDays / 30;
  }

  private async getPerformanceTrend(userId: string): Promise<'improving' | 'stable' | 'declining'> {
    const responses = await CheckpointResponse.find({ user: userId })
      .sort({ answeredAt: -1 })
      .limit(20);

    if (responses.length < 6) return 'stable';

    // Split into two halves and compare accuracy
    const half = Math.floor(responses.length / 2);
    const recent = responses.slice(0, half);
    const older = responses.slice(half);

    const recentAccuracy = recent.filter((r: any) => r.isCorrect).length / recent.length;
    const olderAccuracy = older.filter((r: any) => r.isCorrect).length / older.length;

    const diff = recentAccuracy - olderAccuracy;
    if (diff > 0.1) return 'improving';
    if (diff < -0.1) return 'declining';
    return 'stable';
  }

  private async getDaysSinceLastActivity(userId: string): Promise<number> {
    const lastAttendance = await Attendance.findOne({ user: userId, isMarked: true })
      .sort({ date: -1 });

    if (!lastAttendance) return 999;

    const diffMs = Date.now() - new Date(lastAttendance.date).getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  private async isStreakBroken(userId: string): Promise<boolean> {
    const streak = await Streak.findOne({ user: userId });
    if (!streak) return false;

    if (streak.lastActivityDate && streak.longestStreak > 0) {
      const daysSince = Math.floor(
        (Date.now() - new Date(streak.lastActivityDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSince > 1 && streak.currentStreak === 0;
    }

    return false;
  }
}

export default new RiskDetectionService();
