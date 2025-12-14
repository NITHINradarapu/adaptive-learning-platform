import { Request, Response } from 'express';
import Video from '../models/Video';
import InteractiveQuestion from '../models/InteractiveQuestion';
import CheckpointResponse from '../models/CheckpointResponse';
import LearningProgress from '../models/LearningProgress';

/**
 * @desc    Get video details
 * @route   GET /api/videos/:id
 * @access  Private
 */
export const getVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('module', 'title')
      .populate('course', 'title');
    
    if (!video) {
      res.status(404).json({
        success: false,
        message: 'Video not found'
      });
      return;
    }
    
    // Increment view count
    video.viewCount += 1;
    await video.save();
    
    res.status(200).json({
      success: true,
      data: video
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching video'
    });
  }
};

/**
 * @desc    Get interactive questions for a video
 * @route   GET /api/videos/:id/questions
 * @access  Private
 */
export const getVideoQuestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const questions = await InteractiveQuestion.find({ video: req.params.id })
      .sort({ timestamp: 1 });
    
    // Don't send correct answers to client for security
    const questionsWithoutAnswers = questions.map(q => ({
      _id: q._id,
      questionType: q.questionType,
      question: q.question,
      timestamp: q.timestamp,
      options: q.options?.map(opt => ({ text: opt.text })), // Remove isCorrect
      timeLimit: q.timeLimit,
      maxRetries: q.maxRetries,
      isRequired: q.isRequired,
      points: q.points,
      order: q.order
    }));
    
    res.status(200).json({
      success: true,
      count: questions.length,
      data: questionsWithoutAnswers
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching questions'
    });
  }
};

/**
 * @desc    Submit checkpoint answer
 * @route   POST /api/videos/:videoId/checkpoints/:questionId
 * @access  Private
 */
export const submitCheckpoint = async (req: Request, res: Response): Promise<void> => {
  try {
    const { videoId, questionId } = req.params;
    const { userAnswer, timeSpent, hintUsed } = req.body;
    const userId = req.user?.id;
    
    // Get the question
    const question = await InteractiveQuestion.findById(questionId);
    if (!question) {
      res.status(404).json({
        success: false,
        message: 'Question not found'
      });
      return;
    }
    
    // Check how many attempts user has made
    const previousAttempts = await CheckpointResponse.countDocuments({
      user: userId,
      question: questionId
    });
    
    if (previousAttempts >= question.maxRetries) {
      res.status(400).json({
        success: false,
        message: 'Maximum retry attempts reached'
      });
      return;
    }
    
    // Check if answer is correct
    let isCorrect = false;
    
    if (question.questionType === 'mcq') {
      // For MCQ, check if selected option is correct
      const selectedOption = question.options?.find(opt => opt.text === userAnswer);
      isCorrect = selectedOption?.isCorrect || false;
    } else {
      // For fill-in-blank and short-answer
      const normalizedAnswer = userAnswer.toLowerCase().trim();
      const normalizedCorrect = question.correctAnswer.toLowerCase().trim();
      
      isCorrect = normalizedAnswer === normalizedCorrect;
      
      // Check acceptable answers if available
      if (!isCorrect && question.acceptableAnswers) {
        isCorrect = question.acceptableAnswers.some(
          ans => ans.toLowerCase().trim() === normalizedAnswer
        );
      }
    }
    
    // Calculate points earned
    let pointsEarned = 0;
    if (isCorrect) {
      // Reduce points for retries and hint usage
      pointsEarned = question.points;
      if (previousAttempts > 0) {
        pointsEarned = Math.floor(pointsEarned * 0.7); // 30% reduction for retries
      }
      if (hintUsed) {
        pointsEarned = Math.floor(pointsEarned * 0.8); // 20% reduction for hint
      }
    }
    
    // Save response
    const response = await CheckpointResponse.create({
      user: userId,
      video: videoId,
      question: questionId,
      userAnswer,
      isCorrect,
      attemptNumber: previousAttempts + 1,
      timeSpent,
      hintUsed: hintUsed || false,
      pointsEarned
    });
    
    // Update learning progress if correct
    if (isCorrect) {
      const progress = await LearningProgress.findOne({
        user: userId,
        'videosProgress.video': videoId
      });
      
      if (progress) {
        const videoProgress = progress.videosProgress.find(
          vp => vp.video.toString() === videoId
        );
        
        if (videoProgress) {
          videoProgress.checkpointsCompleted += 1;
          
          // Mark video as completed if all checkpoints done
          if (videoProgress.checkpointsCompleted >= videoProgress.totalCheckpoints) {
            videoProgress.completed = true;
          }
          
          progress.totalCheckpointsCompleted += 1;
          await progress.save();
        }
      }
    }
    
    res.status(200).json({
      success: true,
      data: {
        isCorrect,
        pointsEarned,
        attemptsRemaining: question.maxRetries - (previousAttempts + 1),
        explanation: isCorrect ? question.explanation : undefined,
        hint: !isCorrect && !hintUsed ? question.hint : undefined
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error submitting checkpoint'
    });
  }
};

/**
 * @desc    Create interactive question (Instructor only)
 * @route   POST /api/videos/:id/questions
 * @access  Private (Instructor)
 */
export const createQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const videoId = req.params.id;
    
    // Verify video exists
    const video = await Video.findById(videoId);
    if (!video) {
      res.status(404).json({
        success: false,
        message: 'Video not found'
      });
      return;
    }
    
    const questionData = {
      ...req.body,
      video: videoId
    };
    
    const question = await InteractiveQuestion.create(questionData);
    
    // Update video metadata
    video.hasInteractiveQuestions = true;
    if (question.isRequired) {
      video.requiredCheckpoints += 1;
    }
    await video.save();
    
    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      data: question
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating question'
    });
  }
};
