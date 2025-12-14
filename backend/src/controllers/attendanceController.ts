import { Request, Response } from 'express';
import Attendance from '../models/Attendance';
import Streak from '../models/Streak';
import User from '../models/User';
import LearningProgress from '../models/LearningProgress';

/**
 * @desc    Get attendance status for user
 * @route   GET /api/attendance/status
 * @access  Private
 */
export const getAttendanceStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { startDate, endDate } = req.query;
    
    const query: any = { user: userId };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }
    
    const attendanceRecords = await Attendance.find(query)
      .sort({ date: -1 })
      .limit(30);
    
    // Calculate statistics
    const totalDays = attendanceRecords.length;
    const markedDays = attendanceRecords.filter(a => a.isMarked).length;
    const totalCheckpoints = attendanceRecords.reduce((sum, a) => sum + a.checkpointsCompleted, 0);
    const totalVideos = attendanceRecords.reduce((sum, a) => sum + a.videosWatched, 0);
    const totalTime = attendanceRecords.reduce((sum, a) => sum + a.totalTimeSpent, 0);
    
    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalDays,
          markedDays,
          attendanceRate: totalDays > 0 ? (markedDays / totalDays) * 100 : 0,
          totalCheckpoints,
          totalVideos,
          totalTimeSpent: totalTime
        },
        records: attendanceRecords
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching attendance'
    });
  }
};

/**
 * @desc    Mark attendance for today
 * @route   POST /api/attendance/mark
 * @access  Private
 */
export const markAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { checkpointsCompleted, videosWatched, timeSpent, courseId } = req.body;
    
    // Get today's date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find or create today's attendance record
    let attendance = await Attendance.findOne({
      user: userId,
      date: today
    });
    
    if (!attendance) {
      attendance = new Attendance({
        user: userId,
        date: today,
        checkpointsCompleted: 0,
        videosWatched: 0,
        totalTimeSpent: 0,
        coursesAccessed: [],
        isMarked: false
      });
    }
    
    // Update attendance
    attendance.checkpointsCompleted += checkpointsCompleted || 0;
    attendance.videosWatched += videosWatched || 0;
    attendance.totalTimeSpent += timeSpent || 0;
    
    if (courseId && !attendance.coursesAccessed.includes(courseId)) {
      attendance.coursesAccessed.push(courseId);
    }
    
    // Mark as attended if minimum criteria met
    // Criteria: At least 1 checkpoint completed OR 10+ minutes of watch time
    if (attendance.checkpointsCompleted >= 1 || attendance.totalTimeSpent >= 10) {
      attendance.isMarked = true;
    }
    
    await attendance.save();
    
    // Update streak if attendance is marked
    if (attendance.isMarked) {
      await updateStreak(userId!);
    }
    
    res.status(200).json({
      success: true,
      message: attendance.isMarked ? 'Attendance marked successfully' : 'Progress recorded',
      data: {
        attendance,
        isMarked: attendance.isMarked
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error marking attendance'
    });
  }
};

/**
 * @desc    Get current streak
 * @route   GET /api/streaks/current
 * @access  Private
 */
export const getCurrentStreak = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    let streak = await Streak.findOne({ user: userId });
    
    if (!streak) {
      // Create new streak record
      streak = new Streak({
        user: userId,
        currentStreak: 0,
        longestStreak: 0,
        totalActiveDays: 0
      });
      await streak.save();
    }
    
    res.status(200).json({
      success: true,
      data: streak
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching streak'
    });
  }
};

/**
 * Helper function to update user streak
 */
async function updateStreak(userId: string): Promise<void> {
  try {
    // Get or create streak record
    let streak = await Streak.findOne({ user: userId });
    
    if (!streak) {
      streak = new Streak({
        user: userId,
        currentStreak: 0,
        longestStreak: 0,
        totalActiveDays: 0
      });
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastActivity = streak.lastActivityDate;
    
    if (!lastActivity) {
      // First activity
      streak.currentStreak = 1;
      streak.longestStreak = 1;
      streak.totalActiveDays = 1;
      streak.lastActivityDate = today;
      streak.streakStartDate = today;
    } else {
      const lastActivityDate = new Date(lastActivity);
      lastActivityDate.setHours(0, 0, 0, 0);
      
      const daysDifference = Math.floor((today.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDifference === 0) {
        // Same day, no change to streak
        return;
      } else if (daysDifference === 1) {
        // Consecutive day
        streak.currentStreak += 1;
        streak.totalActiveDays += 1;
        streak.lastActivityDate = today;
        
        // Update longest streak if necessary
        if (streak.currentStreak > streak.longestStreak) {
          streak.longestStreak = streak.currentStreak;
        }
      } else {
        // Streak broken
        // Save old streak to history if it was significant
        if (streak.currentStreak >= 3) {
          streak.streakHistory.push({
            startDate: streak.streakStartDate!,
            endDate: lastActivityDate,
            length: streak.currentStreak
          });
        }
        
        // Reset streak
        streak.currentStreak = 1;
        streak.totalActiveDays += 1;
        streak.lastActivityDate = today;
        streak.streakStartDate = today;
      }
    }
    
    await streak.save();
    
    // Update user model
    const user = await User.findById(userId);
    if (user) {
      user.currentStreak = streak.currentStreak;
      user.longestStreak = streak.longestStreak;
      await user.save();
    }
  } catch (error) {
    console.error('Error updating streak:', error);
  }
}

/**
 * @desc    Get attendance calendar (for visualization)
 * @route   GET /api/attendance/calendar
 * @access  Private
 */
export const getAttendanceCalendar = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { year, month } = req.query;
    
    // Default to current month
    const currentDate = new Date();
    const targetYear = year ? parseInt(year as string) : currentDate.getFullYear();
    const targetMonth = month ? parseInt(month as string) : currentDate.getMonth();
    
    // Get first and last day of month
    const firstDay = new Date(targetYear, targetMonth, 1);
    const lastDay = new Date(targetYear, targetMonth + 1, 0);
    
    const attendanceRecords = await Attendance.find({
      user: userId,
      date: { $gte: firstDay, $lte: lastDay }
    });
    
    // Create calendar grid
    const calendar = [];
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(targetYear, targetMonth, day);
      const record = attendanceRecords.find(
        a => new Date(a.date).getDate() === day
      );
      
      calendar.push({
        date: date.toISOString().split('T')[0],
        isMarked: record?.isMarked || false,
        checkpointsCompleted: record?.checkpointsCompleted || 0,
        videosWatched: record?.videosWatched || 0,
        timeSpent: record?.totalTimeSpent || 0
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        year: targetYear,
        month: targetMonth,
        calendar
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching calendar'
    });
  }
};
