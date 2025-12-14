import { Request, Response } from 'express';
import Course from '../models/Course';
import LearningProgress from '../models/LearningProgress';
import { adaptiveLearningService } from '../services/adaptiveLearningService';

/**
 * @desc    Get all courses (with filtering based on user profile)
 * @route   GET /api/courses
 * @access  Private
 */
export const getCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { difficulty, careerGoal, search } = req.query;
    
    // Build query
    const query: any = { isPublished: true };
    
    if (difficulty) {
      query.difficultyLevel = difficulty;
    }
    
    if (careerGoal) {
      query.careerGoals = careerGoal;
    }
    
    if (search) {
      query.$text = { $search: search as string };
    }
    
    const courses = await Course.find(query)
      .populate('instructor', 'name email')
      .sort({ createdAt: -1 });
    
    // Get user's enrolled courses
    const enrolledCourses = await LearningProgress.find({ user: userId })
      .select('course overallProgress');
    
    const enrolledMap = new Map(
      enrolledCourses.map(ep => [ep.course.toString(), ep.overallProgress])
    );
    
    // Add enrollment status to courses
    const coursesWithStatus = courses.map(course => ({
      ...course.toObject(),
      isEnrolled: enrolledMap.has(course._id.toString()),
      progress: enrolledMap.get(course._id.toString()) || 0
    }));
    
    res.status(200).json({
      success: true,
      count: courses.length,
      data: coursesWithStatus
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching courses'
    });
  }
};

/**
 * @desc    Get single course with modules and videos
 * @route   GET /api/courses/:id
 * @access  Private
 */
export const getCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email');
    
    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Course not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching course'
    });
  }
};

/**
 * @desc    Create new course
 * @route   POST /api/courses
 * @access  Private (Instructor only)
 */
export const createCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const courseData = {
      ...req.body,
      instructor: req.user?.id
    };
    
    const course = await Course.create(courseData);
    
    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating course'
    });
  }
};

/**
 * @desc    Update course
 * @route   PUT /api/courses/:id
 * @access  Private (Instructor - own courses only)
 */
export const updateCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Course not found'
      });
      return;
    }
    
    // Check if user is the instructor
    if (course.instructor.toString() !== req.user?.id) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to update this course'
      });
      return;
    }
    
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: updatedCourse
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating course'
    });
  }
};

/**
 * @desc    Enroll in a course
 * @route   POST /api/courses/:id/enroll
 * @access  Private
 */
export const enrollCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const courseId = req.params.id;
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Course not found'
      });
      return;
    }
    
    // Check if already enrolled
    const existingProgress = await LearningProgress.findOne({
      user: userId,
      course: courseId
    });
    
    if (existingProgress) {
      res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      });
      return;
    }
    
    // Create initial progress record
    const progress = await LearningProgress.create({
      user: userId,
      course: courseId,
      enrolledAt: new Date()
    });
    
    // Update course enrollment count
    course.enrolledStudents += 1;
    await course.save();
    
    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in course',
      data: progress
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error enrolling in course'
    });
  }
};

/**
 * @desc    Get recommended courses based on adaptive learning
 * @route   GET /api/courses/recommended
 * @access  Private
 */
export const getRecommendedCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }
    
    const recommendations = await adaptiveLearningService.getRecommendedCourses(userId);
    
    res.status(200).json({
      success: true,
      data: recommendations
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching recommendations'
    });
  }
};

/**
 * @desc    Delete course
 * @route   DELETE /api/courses/:id
 * @access  Private (Instructor - own courses only, or Admin)
 */
export const deleteCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Course not found'
      });
      return;
    }
    
    // Check if user is the instructor or admin
    if (course.instructor.toString() !== req.user?.id && req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Not authorized to delete this course'
      });
      return;
    }
    
    // Delete associated learning progress records
    await LearningProgress.deleteMany({ course: req.params.id });
    
    // Delete the course
    await Course.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting course'
    });
  }
};
