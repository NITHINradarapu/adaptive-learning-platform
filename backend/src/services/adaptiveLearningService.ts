import User, { LearnerBackground, CareerGoal } from '../models/User';
import Course, { DifficultyLevel } from '../models/Course';
import Module from '../models/Module';
import LearningProgress, { ProgressStatus } from '../models/LearningProgress';
import CheckpointResponse from '../models/CheckpointResponse';

/**
 * Adaptive Learning Service
 * 
 * This service implements the core adaptive learning logic:
 * 1. Analyzes learner profile (background, career goals)
 * 2. Tracks performance metrics (quiz scores, time spent, mistakes)
 * 3. Adjusts learning path dynamically
 * 4. Recommends appropriate content and pacing
 */
class AdaptiveLearningService {
  
  /**
   * Generate personalized learning path for a user in a course
   */
  async generateAdaptivePath(userId: string, courseId: string) {
    // Get user profile
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Get course details
    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }
    
    // Get user's progress
    const progress = await LearningProgress.findOne({
      user: userId,
      course: courseId
    });
    
    // Get all modules in course
    const modules = await Module.find({ course: courseId }).sort({ order: 1 });
    
    // Determine starting point based on learner background
    const startingModuleIndex = this.determineStartingPoint(
      user.learnerBackground!,
      course.difficultyLevel,
      modules
    );
    
    // Determine recommended pace
    const recommendedPace = this.determineRecommendedPace(
      user.learnerBackground!,
      progress?.performanceLevel || 'average'
    );
    
    // Filter and order modules based on adaptive logic
    const adaptiveModules = this.filterModulesForLearner(
      modules,
      startingModuleIndex,
      user.learnerBackground!,
      progress
    );
    
    // Add career-specific recommendations
    const careerRecommendations = this.getCareerSpecificContent(
      user.careerGoal!,
      modules
    );
    
    return {
      user: {
        background: user.learnerBackground,
        careerGoal: user.careerGoal,
        performanceLevel: progress?.performanceLevel || 'average'
      },
      course: {
        id: course._id,
        title: course.title,
        difficulty: course.difficultyLevel
      },
      adaptivePath: {
        startingModule: startingModuleIndex,
        recommendedPace,
        totalModules: adaptiveModules.length,
        modules: adaptiveModules.map((module, index) => ({
          id: module._id,
          title: module.title,
          order: module.order,
          difficulty: module.difficultyLevel,
          isUnlocked: this.isModuleUnlocked(module, progress, index),
          isRecommended: index < 3, // Recommend first 3 unlocked modules
          estimatedTime: this.adjustEstimatedTime(
            module.estimatedTime,
            recommendedPace
          )
        })),
        careerRecommendations
      },
      recommendations: this.generateRecommendations(
        user,
        progress,
        recommendedPace
      )
    };
  }
  
  /**
   * Determine where learner should start based on background
   */
  private determineStartingPoint(
    background: LearnerBackground,
    courseDifficulty: DifficultyLevel,
    modules: any[]
  ): number {
    // Beginners always start from the beginning
    if (background === LearnerBackground.BEGINNER) {
      return 0;
    }
    
    // Intermediate learners skip intro modules in beginner courses
    if (background === LearnerBackground.INTERMEDIATE) {
      if (courseDifficulty === DifficultyLevel.BEGINNER) {
        // Skip first 25% of modules
        return Math.floor(modules.length * 0.25);
      }
      return 0;
    }
    
    // Advanced learners skip intro and basic modules
    if (background === LearnerBackground.ADVANCED) {
      if (courseDifficulty === DifficultyLevel.BEGINNER) {
        // Skip first 50% of modules
        return Math.floor(modules.length * 0.5);
      }
      if (courseDifficulty === DifficultyLevel.INTERMEDIATE) {
        // Skip first 25% of modules
        return Math.floor(modules.length * 0.25);
      }
      return 0;
    }
    
    return 0;
  }
  
  /**
   * Determine recommended learning pace
   */
  private determineRecommendedPace(
    background: LearnerBackground,
    performanceLevel: string
  ): string {
    // Struggling learners need slower pace
    if (performanceLevel === 'struggling') {
      return 'slow';
    }
    
    // Excellent performers can go faster
    if (performanceLevel === 'excellent') {
      return 'fast';
    }
    
    // Beginners start slow
    if (background === LearnerBackground.BEGINNER) {
      return 'slow';
    }
    
    // Advanced learners can go faster
    if (background === LearnerBackground.ADVANCED) {
      return 'fast';
    }
    
    return 'normal';
  }
  
  /**
   * Filter modules based on learner profile
   */
  private filterModulesForLearner(
    modules: any[],
    startIndex: number,
    background: LearnerBackground,
    progress: any
  ): any[] {
    // For beginners, include all modules from start index
    if (background === LearnerBackground.BEGINNER) {
      return modules.slice(startIndex);
    }
    
    // For intermediate/advanced, filter out very basic modules
    return modules.filter((module, index) => {
      if (index < startIndex) return false;
      
      // Always include modules they've started
      if (progress) {
        const moduleProgress = progress.modulesProgress.find(
          (mp: any) => mp.module.toString() === module._id.toString()
        );
        if (moduleProgress && moduleProgress.status !== ProgressStatus.NOT_STARTED) {
          return true;
        }
      }
      
      // Filter by difficulty
      if (background === LearnerBackground.ADVANCED) {
        return module.difficultyLevel !== 'beginner';
      }
      
      return true;
    });
  }
  
  /**
   * Get career-specific content recommendations
   */
  private getCareerSpecificContent(careerGoal: CareerGoal, modules: any[]): any[] {
    const careerKeywords: { [key: string]: string[] } = {
      [CareerGoal.SOFTWARE_DEVELOPER]: ['algorithm', 'data structure', 'design pattern', 'architecture'],
      [CareerGoal.DATA_ANALYST]: ['data', 'analysis', 'visualization', 'statistics'],
      [CareerGoal.TEACHER]: ['pedagogy', 'instruction', 'assessment', 'curriculum'],
      [CareerGoal.WEB_DEVELOPER]: ['html', 'css', 'javascript', 'responsive', 'frontend'],
      [CareerGoal.ML_ENGINEER]: ['machine learning', 'neural network', 'ai', 'model']
    };
    
    const keywords = careerKeywords[careerGoal] || [];
    
    return modules
      .filter(module => {
        const titleLower = module.title.toLowerCase();
        const descLower = module.description.toLowerCase();
        return keywords.some(keyword => 
          titleLower.includes(keyword) || descLower.includes(keyword)
        );
      })
      .slice(0, 5) // Top 5 career-relevant modules
      .map(module => ({
        id: module._id,
        title: module.title,
        relevance: 'High'
      }));
  }
  
  /**
   * Check if module is unlocked for user
   */
  private isModuleUnlocked(module: any, progress: any, index: number): boolean {
    // First module is always unlocked
    if (index === 0) return true;
    
    // If no progress, only first module unlocked
    if (!progress) return false;
    
    // Check if prerequisites are met
    if (module.prerequisites && module.prerequisites.length > 0) {
      return module.prerequisites.every((prereqId: any) => {
        const prereqProgress = progress.modulesProgress.find(
          (mp: any) => mp.module.toString() === prereqId.toString()
        );
        return prereqProgress?.status === ProgressStatus.COMPLETED;
      });
    }
    
    // Otherwise, check if previous module is completed
    const moduleProgress = progress.modulesProgress.find(
      (mp: any) => mp.module.toString() === module._id.toString()
    );
    
    return moduleProgress?.status !== ProgressStatus.NOT_STARTED || index === 0;
  }
  
  /**
   * Adjust estimated time based on pace
   */
  private adjustEstimatedTime(baseTime: number, pace: string): number {
    const multipliers: { [key: string]: number } = {
      slow: 1.5,
      normal: 1.0,
      fast: 0.7
    };
    
    return Math.round(baseTime * (multipliers[pace] || 1.0));
  }
  
  /**
   * Generate personalized recommendations
   */
  private generateRecommendations(user: any, progress: any, pace: string): string[] {
    const recommendations: string[] = [];
    
    // Background-based recommendations
    if (user.learnerBackground === LearnerBackground.BEGINNER) {
      recommendations.push('Take your time with fundamentals - they are crucial for long-term success');
      recommendations.push('Practice with examples before moving to next topics');
    } else if (user.learnerBackground === LearnerBackground.ADVANCED) {
      recommendations.push('Focus on advanced concepts and real-world applications');
      recommendations.push('Challenge yourself with complex projects');
    }
    
    // Performance-based recommendations
    if (progress?.performanceLevel === 'struggling') {
      recommendations.push('Review previous modules before continuing');
      recommendations.push('Consider slowing down and spending more time on practice');
      recommendations.push('Use hints and explanations in checkpoint questions');
    } else if (progress?.performanceLevel === 'excellent') {
      recommendations.push('You are doing great! Consider exploring advanced topics');
      recommendations.push('Try completing bonus challenges');
    }
    
    // Pace-based recommendations
    if (pace === 'slow') {
      recommendations.push('Recommended: 2-3 modules per week');
    } else if (pace === 'fast') {
      recommendations.push('Recommended: 5-7 modules per week');
    } else {
      recommendations.push('Recommended: 3-5 modules per week');
    }
    
    return recommendations;
  }
  
  /**
   * Analyze learner performance and update metrics
   */
  async analyzePerformance(userId: string, courseId: string): Promise<void> {
    const progress = await LearningProgress.findOne({
      user: userId,
      course: courseId
    });
    
    if (!progress) return;
    
    // Get recent checkpoint responses
    const recentResponses = await CheckpointResponse.find({
      user: userId
    }).sort({ answeredAt: -1 }).limit(20);
    
    if (recentResponses.length === 0) return;
    
    // Calculate success rate
    const correctAnswers = recentResponses.filter(r => r.isCorrect).length;
    const successRate = (correctAnswers / recentResponses.length) * 100;
    
    // Calculate average time per question
    const avgTime = recentResponses.reduce((sum, r) => sum + r.timeSpent, 0) / recentResponses.length;
    
    // Determine performance level
    let performanceLevel = 'average';
    if (successRate >= 85 && avgTime < 45) {
      performanceLevel = 'excellent';
    } else if (successRate < 60 || avgTime > 90) {
      performanceLevel = 'struggling';
    }
    
    // Update progress record
    progress.performanceLevel = performanceLevel;
    
    // Update recommended pace
    if (performanceLevel === 'excellent') {
      progress.recommendedPace = 'fast';
    } else if (performanceLevel === 'struggling') {
      progress.recommendedPace = 'slow';
    } else {
      progress.recommendedPace = 'normal';
    }
    
    // Identify weak areas (questions answered incorrectly multiple times)
    const weakQuestions = await CheckpointResponse.aggregate([
      { $match: { user: userId, isCorrect: false } },
      { $group: { _id: '$question', count: { $sum: 1 } } },
      { $match: { count: { $gte: 2 } } },
      { $limit: 5 }
    ]);
    
    // Update weak areas in progress
    // (In production, you'd map question IDs to topics)
    progress.weakAreas = weakQuestions.map(wq => wq._id.toString());
    
    await progress.save();
    
    // Update user's overall metrics
    const user = await User.findById(userId);
    if (user) {
      user.averageQuizScore = successRate;
      await user.save();
    }
  }
  
  /**
   * Get recommended courses for user
   */
  async getRecommendedCourses(userId: string): Promise<any> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Build query based on user profile
    const query: any = { isPublished: true };
    
    // Match difficulty to user background
    if (user.learnerBackground === LearnerBackground.BEGINNER) {
      query.difficultyLevel = DifficultyLevel.BEGINNER;
    } else if (user.learnerBackground === LearnerBackground.ADVANCED) {
      query.difficultyLevel = { $in: [DifficultyLevel.INTERMEDIATE, DifficultyLevel.ADVANCED] };
    }
    
    // Match career goals
    if (user.careerGoal && user.careerGoal !== CareerGoal.OTHER) {
      query.careerGoals = user.careerGoal;
    }
    
    // Get courses user is NOT enrolled in
    const enrolledCourses = await LearningProgress.find({ user: userId })
      .select('course');
    const enrolledCourseIds = enrolledCourses.map(ec => ec.course);
    
    query._id = { $nin: enrolledCourseIds };
    
    const recommendedCourses = await Course.find(query)
      .populate('instructor', 'name')
      .limit(10)
      .sort({ averageRating: -1, enrolledStudents: -1 });
    
    return {
      recommendationBasis: {
        background: user.learnerBackground,
        careerGoal: user.careerGoal
      },
      courses: recommendedCourses
    };
  }
}

export const adaptiveLearningService = new AdaptiveLearningService();
