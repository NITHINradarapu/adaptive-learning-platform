import Course from '../models/Course';
import LearningProgress from '../models/LearningProgress';
import Module from '../models/Module';
import User from '../models/User';
import rlService from './rlService';

/**
 * Enhanced Recommendation Engine
 * 
 * Combines:
 * 1. Content-based filtering (difficulty, career goals)
 * 2. RL-driven personalization (Q-learning action selection)
 * 3. Performance-based adjustments
 */
class RecommendationService {
  /**
   * Get personalized recommendation for a student
   * Combines RL action with content matching
   */
  async getPersonalizedRecommendation(userId: string, courseId?: string) {
    // Get RL recommendation
    const rlResult = await rlService.selectAction(userId, courseId);
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    let recommendation: any = {
      action: rlResult.action,
      message: '',
      suggestedContent: [],
      state: rlResult.state,
    };

    switch (rlResult.action) {
      case 'recommend_next_topic':
        recommendation = await this.getNextTopicRecommendation(userId, courseId, recommendation);
        break;
      case 'recommend_revision':
        recommendation = await this.getRevisionRecommendation(userId, courseId, recommendation);
        break;
      case 'recommend_easy_content':
        recommendation = await this.getEasyContentRecommendation(userId, recommendation);
        break;
      case 'recommend_advanced_challenge':
        recommendation = await this.getAdvancedChallengeRecommendation(userId, recommendation);
        break;
      case 'suggest_break':
        recommendation.message = 'You\'ve been studying hard! Take a 10-minute break to recharge.';
        recommendation.suggestedContent = [];
        break;
      case 'switch_learning_format':
        recommendation.message = 'Try a different approach — review written notes or practice exercises.';
        recommendation.suggestedContent = [];
        break;
    }

    return recommendation;
  }

  private async getNextTopicRecommendation(userId: string, courseId: string | undefined, rec: any) {
    if (!courseId) {
      rec.message = 'Continue with your current course to unlock the next topic!';
      return rec;
    }

    const progress = await LearningProgress.findOne({ user: userId, course: courseId });
    const modules = await Module.find({ course: courseId }).sort({ order: 1 });

    if (progress && modules.length > 0) {
      // Find next incomplete module
      const completedModules = ((progress as any).modulesProgress || [])
        .filter((mp: any) => mp.status === 'completed')
        .map((mp: any) => mp.module?.toString());

      const nextModule = modules.find(m => !completedModules.includes(m._id.toString()));

      if (nextModule) {
        rec.message = `Great progress! Move on to "${nextModule.title}".`;
        rec.suggestedContent = [{
          type: 'module',
          id: nextModule._id,
          title: nextModule.title,
          difficulty: nextModule.difficultyLevel,
        }];
      } else {
        rec.message = 'You\'ve completed all modules in this course! Explore new courses.';
      }
    }

    return rec;
  }

  private async getRevisionRecommendation(userId: string, courseId: string | undefined, rec: any) {
    if (!courseId) {
      rec.message = 'Review your weakest topics to strengthen understanding.';
      return rec;
    }

    const progress = await LearningProgress.findOne({ user: userId, course: courseId });
    if (progress) {
      // Find modules with low scores
      const weakModules = ((progress as any).modulesProgress || [])
        .filter((mp: any) => mp.quizScore !== undefined && mp.quizScore < 75)
        .sort((a: any, b: any) => (a.quizScore || 0) - (b.quizScore || 0));

      if (weakModules.length > 0) {
        const moduleIds = weakModules.slice(0, 3).map((mp: any) => mp.module);
        const modules = await Module.find({ _id: { $in: moduleIds } });

        rec.message = 'Let\'s strengthen your understanding of these topics:';
        rec.suggestedContent = modules.map(m => ({
          type: 'revision',
          id: m._id,
          title: m.title,
          difficulty: m.difficultyLevel,
        }));
      }
    }

    return rec;
  }

  private async getEasyContentRecommendation(userId: string, rec: any) {
    const easyCourses = await Course.find({
      difficultyLevel: 'beginner',
      isPublished: true,
    })
      .sort({ averageRating: -1 })
      .limit(3);

    rec.message = 'Build your confidence with these beginner-friendly courses:';
    rec.suggestedContent = easyCourses.map(c => ({
      type: 'course',
      id: c._id,
      title: c.title,
      difficulty: c.difficultyLevel,
    }));

    return rec;
  }

  private async getAdvancedChallengeRecommendation(userId: string, rec: any) {
    const user = await User.findById(userId);
    const advancedCourses = await Course.find({
      difficultyLevel: 'advanced',
      isPublished: true,
      ...(user?.careerGoal ? { careerGoals: user.careerGoal } : {}),
    })
      .sort({ averageRating: -1 })
      .limit(3);

    rec.message = 'Challenge yourself with advanced material:';
    rec.suggestedContent = advancedCourses.map(c => ({
      type: 'course',
      id: c._id,
      title: c.title,
      difficulty: c.difficultyLevel,
    }));

    return rec;
  }
}

export default new RecommendationService();
