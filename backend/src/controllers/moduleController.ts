import { Request, Response } from 'express';
import Module from '../models/Module';
import Video from '../models/Video';
import Course from '../models/Course';

/**
 * @desc    Get all modules for a course
 * @route   GET /api/courses/:courseId/modules
 * @access  Private
 */
export const getCourseModules = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;

    const modules = await Module.find({ course: courseId })
      .sort({ order: 1 });

    // Get video count for each module
    const modulesWithVideoCount = await Promise.all(
      modules.map(async (module) => {
        const videoCount = await Video.countDocuments({ module: module._id });
        return {
          ...module.toObject(),
          videoCount
        };
      })
    );

    res.status(200).json({
      success: true,
      count: modules.length,
      data: modulesWithVideoCount
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching modules'
    });
  }
};

/**
 * @desc    Get single module
 * @route   GET /api/modules/:id
 * @access  Private
 */
export const getModule = async (req: Request, res: Response): Promise<void> => {
  try {
    const module = await Module.findById(req.params.id)
      .populate('course', 'title instructor');

    if (!module) {
      res.status(404).json({
        success: false,
        message: 'Module not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: module
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching module'
    });
  }
};

/**
 * @desc    Create new module
 * @route   POST /api/courses/:courseId/modules
 * @access  Private (Instructor/Admin only)
 */
export const createModule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;

    // Check if course exists and user is the instructor
    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Course not found'
      });
      return;
    }

    // Check authorization
    if (course.instructor.toString() !== req.user?.id && req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Not authorized to add modules to this course'
      });
      return;
    }

    // Get the next order number
    const maxOrderModule = await Module.findOne({ course: courseId })
      .sort({ order: -1 })
      .select('order');
    
    const nextOrder = maxOrderModule ? maxOrderModule.order + 1 : 1;

    const moduleData = {
      ...req.body,
      course: courseId,
      order: req.body.order || nextOrder
    };

    const module = await Module.create(moduleData);

    // Update course module count
    course.totalModules = (course.totalModules || 0) + 1;
    await course.save();

    res.status(201).json({
      success: true,
      message: 'Module created successfully',
      data: module
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating module'
    });
  }
};

/**
 * @desc    Update module
 * @route   PUT /api/modules/:id
 * @access  Private (Instructor/Admin only)
 */
export const updateModule = async (req: Request, res: Response): Promise<void> => {
  try {
    const module = await Module.findById(req.params.id).populate('course');

    if (!module) {
      res.status(404).json({
        success: false,
        message: 'Module not found'
      });
      return;
    }

    // Check authorization
    const course = await Course.findById(module.course);
    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Associated course not found'
      });
      return;
    }

    if (course.instructor.toString() !== req.user?.id && req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Not authorized to update this module'
      });
      return;
    }

    const updatedModule = await Module.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Module updated successfully',
      data: updatedModule
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating module'
    });
  }
};

/**
 * @desc    Delete module
 * @route   DELETE /api/modules/:id
 * @access  Private (Instructor/Admin only)
 */
export const deleteModule = async (req: Request, res: Response): Promise<void> => {
  try {
    const module = await Module.findById(req.params.id);

    if (!module) {
      res.status(404).json({
        success: false,
        message: 'Module not found'
      });
      return;
    }

    // Check authorization
    const course = await Course.findById(module.course);
    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Associated course not found'
      });
      return;
    }

    if (course.instructor.toString() !== req.user?.id && req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Not authorized to delete this module'
      });
      return;
    }

    // Delete all videos in this module
    const deletedVideos = await Video.deleteMany({ module: req.params.id });

    // Delete the module
    await Module.findByIdAndDelete(req.params.id);

    // Update course counts
    if (course.totalModules > 0) {
      course.totalModules -= 1;
    }
    if (course.totalVideos > deletedVideos.deletedCount) {
      course.totalVideos -= deletedVideos.deletedCount;
    }
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Module and associated videos deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting module'
    });
  }
};
