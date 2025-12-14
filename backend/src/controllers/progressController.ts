import { Request, Response } from 'express';
import LearningProgress, { ProgressStatus } from '../models/LearningProgress';
import User from '../models/User';
import Course from '../models/Course';
import Module from '../models/Module';
import Video from '../models/Video';
import { adaptiveLearningService } from '../services/adaptiveLearningService';

/**
 * @desc    Get learner dashboard
 * @route   GET /api/progress/dashboard
 * @access  Private
 */
export const getDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }
    
    // Get all enrolled courses with progress
    const enrolledCourses = await LearningProgress.find({ user: userId })
      .populate('course', 'title thumbnailUrl difficultyLevel')
      .sort({ lastActivityDate: -1 });
    
    // Calculate statistics
    const stats = {
      totalCoursesEnrolled: enrolledCourses.length,
      coursesInProgress: enrolledCourses.filter(c => c.status === ProgressStatus.IN_PROGRESS).length,
      coursesCompleted: enrolledCourses.filter(c => c.status === ProgressStatus.COMPLETED).length,
      averageProgress: enrolledCourses.length > 0
        ? enrolledCourses.reduce((sum, c) => sum + c.overallProgress, 0) / enrolledCourses.length
        : 0,
      totalCheckpointsCompleted: enrolledCourses.reduce((sum, c) => sum + c.totalCheckpointsCompleted, 0),
      totalTimeSpent: enrolledCourses.reduce((sum, c) => sum + c.totalTimeSpent, 0),
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      averageQuizScore: user.averageQuizScore
    };
    
    res.status(200).json({
      success: true,
      data: {
        user: {
          name: user.name,
          email: user.email,
          learnerBackground: user.learnerBackground,
          careerGoal: user.careerGoal
        },
        stats,
        enrolledCourses: enrolledCourses.map(ec => ({
          course: ec.course,
          progress: ec.overallProgress,
          status: ec.status,
          lastActivity: ec.lastActivityDate
        }))
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching dashboard'
    });
  }
};

/**
 * @desc    Get adaptive learning path for a course
 * @route   GET /api/progress/adaptive-path/:courseId
 * @access  Private
 */
export const getAdaptivePath = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { courseId } = req.params;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }
    
    const adaptivePath = await adaptiveLearningService.generateAdaptivePath(userId, courseId);
    
    res.status(200).json({
      success: true,
      data: adaptivePath
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating adaptive path'
    });
  }
};

/**
 * @desc    Update video progress
 * @route   POST /api/progress/video/:videoId
 * @access  Private
 */
export const updateVideoProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }
    
    const { videoId } = req.params;
    const { watchedDuration, completed } = req.body;
    
    // Get video details
    const video = await Video.findById(videoId);
    if (!video) {
      res.status(404).json({
        success: false,
        message: 'Video not found'
      });
      return;
    }
    
    // Find or create progress record
    let progress = await LearningProgress.findOne({
      user: userId,
      course: video.course
    });
    
    if (!progress) {
      res.status(404).json({
        success: false,
        message: 'Not enrolled in this course'
      });
      return;
    }
    
    // Find video progress entry
    let videoProgress = progress.videosProgress.find(
      vp => vp.video.toString() === videoId
    );
    
    if (!videoProgress) {
      // Create new video progress entry
      progress.videosProgress.push({
        video: video._id,
        watchedDuration: watchedDuration || 0,
        totalDuration: video.duration,
        completed: completed || false,
        checkpointsCompleted: 0,
        totalCheckpoints: video.requiredCheckpoints,
        lastWatchedAt: new Date()
      });
    } else {
      // Update existing entry
      videoProgress.watchedDuration = watchedDuration || videoProgress.watchedDuration;
      videoProgress.lastWatchedAt = new Date();
      
      if (completed) {
        videoProgress.completed = true;
      }
    }
    
    // Update last activity
    progress.lastActivityDate = new Date();
    
    // Recalculate overall progress
    const totalVideos = progress.videosProgress.length;
    const completedVideos = progress.videosProgress.filter(vp => vp.completed).length;
    progress.overallProgress = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;
    
    // Update status
    if (progress.overallProgress === 100) {
      progress.status = ProgressStatus.COMPLETED;
    } else if (progress.overallProgress > 0) {
      progress.status = ProgressStatus.IN_PROGRESS;
    }
    
    await progress.save();
    
    // Analyze performance and update adaptive recommendations
    await adaptiveLearningService.analyzePerformance(userId, video.course.toString());
    
    res.status(200).json({
      success: true,
      message: 'Progress updated successfully',
      data: {
        overallProgress: progress.overallProgress,
        status: progress.status
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating progress'
    });
  }
};

/**
 * @desc    Get course progress details
 * @route   GET /api/progress/course/:courseId
 * @access  Private
 */
export const getCourseProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { courseId } = req.params;
    
    const progress = await LearningProgress.findOne({
      user: userId,
      course: courseId
    })
      .populate('course', 'title description')
      .populate('modulesProgress.module', 'title order')
      .populate('videosProgress.video', 'title duration');
    
    if (!progress) {
      res.status(404).json({
        success: false,
        message: 'Not enrolled in this course'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: progress
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching course progress'
    });
  }
};
