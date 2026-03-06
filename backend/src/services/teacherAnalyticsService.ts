import Course from '../models/Course';
import LearningProgress from '../models/LearningProgress';
import CheckpointResponse from '../models/CheckpointResponse';
import Analytics from '../models/Analytics';
import EngagementEvent from '../models/EngagementEvent';
import Module from '../models/Module';
import Video from '../models/Video';
import InteractiveQuestion from '../models/InteractiveQuestion';
import User from '../models/User';
import riskDetectionService from './riskDetectionService';
import mongoose from 'mongoose';

/**
 * Teacher Analytics Service
 * 
 * Provides comprehensive analytics for teachers:
 * - Topic-wise performance heatmap
 * - Class average mastery
 * - Drop-off timestamps
 * - Common failed questions
 * - Engagement distribution
 * - Risk-level students
 * - AI-generated insights
 */
class TeacherAnalyticsService {
  /**
   * Get comprehensive dashboard data for a teacher's course
   */
  async getCourseDashboard(courseId: string, teacherId: string) {
    // Verify ownership
    const course = await Course.findOne({ _id: courseId, instructor: teacherId });
    if (!course) throw new Error('Course not found or unauthorized');

    const [
      enrollmentStats,
      modulePerformance,
      questionAnalysis,
      engagementDistribution,
      riskStudents,
    ] = await Promise.all([
      this.getEnrollmentStats(courseId),
      this.getModulePerformance(courseId),
      this.getQuestionAnalysis(courseId),
      this.getEngagementDistribution(courseId),
      riskDetectionService.assessCourseStudents(courseId),
    ]);

    const insights = this.generateInsights(
      modulePerformance,
      questionAnalysis,
      engagementDistribution,
      riskStudents
    );

    return {
      course: {
        id: course._id,
        title: course.title,
        enrolledStudents: course.enrolledStudents,
        isPublished: course.isPublished,
      },
      enrollmentStats,
      modulePerformance,
      questionAnalysis,
      engagementDistribution,
      riskStudents: riskStudents.filter(s => s.isAtRisk),
      insights,
    };
  }

  /**
   * Enrollment and completion statistics
   */
  private async getEnrollmentStats(courseId: string) {
    const enrollments = await LearningProgress.find({ course: courseId });

    const statusCounts = {
      'not-started': 0,
      'in-progress': 0,
      'completed': 0,
      'needs-revision': 0,
    };

    let totalProgress = 0;
    let totalQuizScore = 0;
    let totalTimeSpent = 0;

    for (const enrollment of enrollments) {
      statusCounts[enrollment.status as keyof typeof statusCounts]++;
      totalProgress += enrollment.overallProgress || 0;
      totalQuizScore += enrollment.averageQuizScore || 0;
      totalTimeSpent += enrollment.totalTimeSpent || 0;
    }

    const total = enrollments.length || 1;

    return {
      totalEnrolled: enrollments.length,
      statusDistribution: statusCounts,
      averageProgress: Math.round(totalProgress / total),
      averageQuizScore: Math.round(totalQuizScore / total),
      averageTimeSpent: Math.round(totalTimeSpent / total), // minutes
      completionRate: Math.round((statusCounts.completed / total) * 100),
    };
  }

  /**
   * Performance breakdown by module (topic-wise heatmap data)
   */
  private async getModulePerformance(courseId: string) {
    const modules = await Module.find({ course: courseId }).sort({ order: 1 });
    const enrollments = await LearningProgress.find({ course: courseId });

    const moduleStats = [];

    for (const mod of modules) {
      const moduleScores: number[] = [];
      const completions: number[] = [];

      for (const enrollment of enrollments) {
        const moduleProg = (enrollment as any).modulesProgress?.find(
          (mp: any) => mp.module?.toString() === mod._id.toString()
        );
        if (moduleProg) {
          if (moduleProg.quizScore !== undefined) moduleScores.push(moduleProg.quizScore);
          completions.push(moduleProg.status === 'completed' ? 1 : 0);
        }
      }

      // Get video drop-off data
      const videos = await Video.find({ module: mod._id });
      const videoDropOffs = [];
      for (const video of videos) {
        const dropOffs = await EngagementEvent.find({
          video: video._id,
          eventType: 'drop_off',
        });
        if (dropOffs.length > 0) {
          const avgDropOff = dropOffs.reduce((sum, d) => sum + d.timestamp, 0) / dropOffs.length;
          videoDropOffs.push({
            videoId: video._id,
            videoTitle: video.title,
            avgDropOffTimestamp: Math.round(avgDropOff),
            dropOffCount: dropOffs.length,
            videoDuration: video.duration,
          });
        }
      }

      moduleStats.push({
        moduleId: mod._id,
        moduleTitle: mod.title,
        order: mod.order,
        difficulty: mod.difficultyLevel,
        avgScore: moduleScores.length > 0
          ? Math.round(moduleScores.reduce((a, b) => a + b, 0) / moduleScores.length)
          : null,
        completionRate: completions.length > 0
          ? Math.round((completions.reduce((a, b) => a + b, 0) / completions.length) * 100)
          : 0,
        studentsAttempted: moduleScores.length,
        videoDropOffs,
      });
    }

    return moduleStats;
  }

  /**
   * Question-level analysis (item analysis)
   */
  private async getQuestionAnalysis(courseId: string) {
    const videos = await Video.find({ course: courseId });
    const videoIds = videos.map(v => v._id);

    const questions = await InteractiveQuestion.find({ video: { $in: videoIds } });

    const questionStats = [];

    for (const question of questions) {
      const responses = await CheckpointResponse.find({ question: question._id });

      if (responses.length === 0) continue;

      const correct = responses.filter((r: any) => r.isCorrect).length;
      const totalAttempts = responses.length;
      const avgTimeSpent = responses.reduce((sum: number, r: any) => sum + (r.timeSpent || 0), 0) / totalAttempts;
      const hintsUsed = responses.filter((r: any) => r.hintUsed).length;

      questionStats.push({
        questionId: question._id,
        questionText: question.question.substring(0, 100),
        questionType: question.questionType,
        difficultyLevel: (question as any).difficultyLevel || 'medium',
        bloomsLevel: (question as any).bloomsLevel || 'remember',
        successRate: Math.round((correct / totalAttempts) * 100),
        totalAttempts,
        avgTimeSpent: Math.round(avgTimeSpent),
        hintUsageRate: Math.round((hintsUsed / totalAttempts) * 100),
        // Flag as problematic if low success rate
        isProblematic: correct / totalAttempts < 0.4,
      });
    }

    return questionStats.sort((a, b) => a.successRate - b.successRate);
  }

  /**
   * Engagement score distribution across students
   */
  private async getEngagementDistribution(courseId: string) {
    const enrollments = await LearningProgress.find({ course: courseId }).select('user');
    const userIds = enrollments.map(e => e.user);

    const users = await User.find({ _id: { $in: userIds } }).select('engagementScore name');

    const distribution = {
      veryLow: 0,  // 0 - 0.2
      low: 0,      // 0.2 - 0.4
      medium: 0,   // 0.4 - 0.6
      high: 0,     // 0.6 - 0.8
      veryHigh: 0, // 0.8 - 1.0
    };

    for (const user of users) {
      const score = user.engagementScore || 0;
      if (score < 0.2) distribution.veryLow++;
      else if (score < 0.4) distribution.low++;
      else if (score < 0.6) distribution.medium++;
      else if (score < 0.8) distribution.high++;
      else distribution.veryHigh++;
    }

    return distribution;
  }

  /**
   * Auto-generate AI insights based on analytics data
   */
  private generateInsights(
    modulePerformance: any[],
    questionAnalysis: any[],
    engagementDistribution: any,
    riskStudents: any[]
  ): string[] {
    const insights: string[] = [];

    // Module performance insights
    const lowPerformanceModules = modulePerformance.filter(m => m.avgScore !== null && m.avgScore < 50);
    for (const mod of lowPerformanceModules) {
      insights.push(`High failure rate in "${mod.moduleTitle}" — average score is ${mod.avgScore}%. Consider adding review material.`);
    }

    // Drop-off insights
    for (const mod of modulePerformance) {
      for (const dropOff of mod.videoDropOffs || []) {
        if (dropOff.dropOffCount > 3) {
          const minutes = Math.floor(dropOff.avgDropOffTimestamp / 60);
          const seconds = dropOff.avgDropOffTimestamp % 60;
          insights.push(
            `Replay/drop-off spike in "${dropOff.videoTitle}" at ${minutes}:${seconds.toString().padStart(2, '0')}. Consider revising this segment.`
          );
        }
      }
    }

    // Question insights
    const problematicQuestions = questionAnalysis.filter(q => q.isProblematic);
    if (problematicQuestions.length > 0) {
      const bloomsIssues = problematicQuestions.reduce((acc: any, q) => {
        acc[q.bloomsLevel] = (acc[q.bloomsLevel] || 0) + 1;
        return acc;
      }, {});

      for (const [level, count] of Object.entries(bloomsIssues)) {
        insights.push(`Low performance in ${level}-level questions (${count} questions below 40% success rate).`);
      }
    }

    // Engagement insight
    const totalStudents: number = (Object.values(engagementDistribution) as number[]).reduce((a, b) => a + b, 0);
    const lowEngagement = engagementDistribution.veryLow + engagementDistribution.low;
    if (totalStudents > 0 && lowEngagement / totalStudents > 0.3) {
      insights.push(`${Math.round((lowEngagement / totalStudents) * 100)}% of students have low engagement. Consider adding interactive elements.`);
    }

    // Risk insight
    const highRisk = riskStudents.filter(s => s.riskLevel === 'high');
    if (highRisk.length > 0) {
      insights.push(`${highRisk.length} student(s) flagged as high-risk. Immediate intervention recommended.`);
    }

    if (insights.length === 0) {
      insights.push('All metrics look healthy! Students are progressing well.');
    }

    return insights;
  }

  /**
   * Get per-student performance data for a course
   */
  async getStudentPerformance(courseId: string, teacherId: string) {
    const course = await Course.findOne({ _id: courseId, instructor: teacherId });
    if (!course) throw new Error('Course not found or unauthorized');

    const enrollments = await LearningProgress.find({ course: courseId })
      .populate('user', 'name email engagementScore isAtRisk riskLevel');

    return enrollments.map((enrollment: any) => ({
      studentId: enrollment.user?._id,
      studentName: enrollment.user?.name,
      studentEmail: enrollment.user?.email,
      progress: enrollment.overallProgress,
      status: enrollment.status,
      quizScore: enrollment.averageQuizScore,
      timeSpent: enrollment.totalTimeSpent,
      performanceLevel: enrollment.performanceLevel,
      engagementScore: enrollment.user?.engagementScore || 0,
      isAtRisk: enrollment.user?.isAtRisk || false,
      riskLevel: enrollment.user?.riskLevel || 'low',
      lastActivity: enrollment.lastActivityDate,
    }));
  }
}

export default new TeacherAnalyticsService();
