import RLQTable from '../models/RLQTable';
import LearningProgress from '../models/LearningProgress';
import User from '../models/User';
import Streak from '../models/Streak';
import CheckpointResponse from '../models/CheckpointResponse';
import engagementService from './engagementService';
import crypto from 'crypto';

/**
 * Reinforcement Learning Engine
 * 
 * Uses Q-Learning with Epsilon-Greedy exploration.
 * 
 * State = { avg_quiz_score, engagement_score, mastery_level, retry_frequency, completion_rate, streak_count }
 * Actions = [ recommend_next_topic, recommend_revision, recommend_easy_content, 
 *             recommend_advanced_challenge, suggest_break, switch_learning_format ]
 * 
 * Reward Function:
 *   +2 if score > 85%
 *   +1 if topic completed
 *   +3 if streak >= 5
 *   -2 if dropout
 *   -1 if repeated failure
 * 
 * Q-Update:
 *   Q(s,a) = Q(s,a) + lr * (reward + gamma * max(Q(s')) - Q(s,a))
 */

const ACTIONS = [
  'recommend_next_topic',
  'recommend_revision',
  'recommend_easy_content',
  'recommend_advanced_challenge',
  'suggest_break',
  'switch_learning_format',
] as const;

type Action = typeof ACTIONS[number];

interface RLState {
  avgQuizScore: number;
  engagementScore: number;
  masteryLevel: number;
  retryFrequency: number;
  completionRate: number;
  streakCount: number;
}

// Hyperparameters
const LEARNING_RATE = 0.1;
const DISCOUNT_FACTOR = 0.95; // gamma
const EPSILON = 0.15; // exploration rate (epsilon-greedy)

class RLService {
  /**
   * Get the current state for a user
   */
  async getCurrentState(userId: string, courseId?: string): Promise<RLState> {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // Get quiz score
    const avgQuizScore = user.averageQuizScore || 0;

    // Get engagement score
    const engagementScore = user.engagementScore || 0;

    // Get mastery level from progress
    let masteryLevel = 0;
    if (courseId) {
      const progress = await LearningProgress.findOne({ user: userId, course: courseId });
      if (progress) {
        masteryLevel = (progress.overallProgress || 0) / 100;
      }
    } else {
      const allProgress = await LearningProgress.find({ user: userId });
      if (allProgress.length > 0) {
        const avgProgress = allProgress.reduce((sum, p) => sum + (p.overallProgress || 0), 0) / allProgress.length;
        masteryLevel = avgProgress / 100;
      }
    }

    // Get retry frequency
    const totalResponses = await CheckpointResponse.countDocuments({ user: userId });
    const retryResponses = await CheckpointResponse.countDocuments({ user: userId, attemptNumber: { $gt: 1 } });
    const retryFrequency = totalResponses > 0 ? retryResponses / totalResponses : 0;

    // Get completion rate
    const allProgress = await LearningProgress.find({ user: userId });
    const completedCourses = allProgress.filter((p: any) => p.status === 'completed').length;
    const completionRate = allProgress.length > 0 ? completedCourses / allProgress.length : 0;

    // Get streak count
    const streak = await Streak.findOne({ user: userId });
    const streakCount = streak?.currentStreak || user.currentStreak || 0;

    return {
      avgQuizScore: Math.min(100, Math.max(0, avgQuizScore)),
      engagementScore: Math.min(1, Math.max(0, engagementScore)),
      masteryLevel: Math.min(1, Math.max(0, masteryLevel)),
      retryFrequency: Math.min(1, Math.max(0, retryFrequency)),
      completionRate: Math.min(1, Math.max(0, completionRate)),
      streakCount: Math.max(0, streakCount),
    };
  }

  /**
   * Discretize state into buckets for Q-table lookup
   */
  private discretizeState(state: RLState): RLState {
    return {
      avgQuizScore: Math.round(state.avgQuizScore / 20) * 20, // bins: 0,20,40,60,80,100
      engagementScore: Math.round(state.engagementScore * 4) / 4, // bins: 0, 0.25, 0.5, 0.75, 1
      masteryLevel: Math.round(state.masteryLevel * 4) / 4,
      retryFrequency: Math.round(state.retryFrequency * 4) / 4,
      completionRate: Math.round(state.completionRate * 4) / 4,
      streakCount: Math.min(10, Math.round(state.streakCount / 2) * 2), // bins: 0,2,4,6,8,10
    };
  }

  /**
   * Hash state into a string for Q-table key
   */
  private hashState(state: RLState): string {
    const discretized = this.discretizeState(state);
    const stateString = JSON.stringify(discretized);
    return crypto.createHash('md5').update(stateString).digest('hex').substring(0, 12);
  }

  /**
   * Get or create Q-table entry for a user-state pair
   */
  private async getQEntry(userId: string, state: RLState) {
    const stateHash = this.hashState(state);

    let entry = await RLQTable.findOne({ user: userId, stateHash });
    if (!entry) {
      entry = await RLQTable.create({
        user: userId,
        stateHash,
        state: this.discretizeState(state),
        actions: {
          recommend_next_topic: 0,
          recommend_revision: 0,
          recommend_easy_content: 0,
          recommend_advanced_challenge: 0,
          suggest_break: 0,
          switch_learning_format: 0,
        },
        totalVisits: 0,
      });
    }

    return entry;
  }

  /**
   * Select best action using Epsilon-Greedy policy
   */
  async selectAction(userId: string, courseId?: string): Promise<{ action: Action; state: RLState; stateHash: string }> {
    const state = await this.getCurrentState(userId, courseId);
    const entry = await this.getQEntry(userId, state);

    let selectedAction: Action;

    if (Math.random() < EPSILON) {
      // Exploration: random action
      const randomIndex = Math.floor(Math.random() * ACTIONS.length);
      selectedAction = ACTIONS[randomIndex];
    } else {
      // Exploitation: best Q-value action
      const actions = entry.actions as any;
      let bestAction: Action = ACTIONS[0];
      let bestValue = actions[bestAction] || 0;

      for (const action of ACTIONS) {
        const value = actions[action] || 0;
        if (value > bestValue) {
          bestValue = value;
          bestAction = action;
        }
      }
      selectedAction = bestAction;
    }

    // Update visit count
    entry.totalVisits += 1;
    entry.lastUpdated = new Date();
    await entry.save();

    return {
      action: selectedAction,
      state,
      stateHash: this.hashState(state),
    };
  }

  /**
   * Calculate reward based on the prompt's reward function
   */
  calculateReward(context: {
    quizScore?: number;
    topicCompleted?: boolean;
    streakCount?: number;
    isDropout?: boolean;
    repeatedFailure?: boolean;
  }): number {
    let reward = 0;

    if (context.quizScore !== undefined && context.quizScore > 85) {
      reward += 2;
    }
    if (context.topicCompleted) {
      reward += 1;
    }
    if (context.streakCount !== undefined && context.streakCount >= 5) {
      reward += 3;
    }
    if (context.isDropout) {
      reward -= 2;
    }
    if (context.repeatedFailure) {
      reward -= 1;
    }

    return reward;
  }

  /**
   * Update Q-value using Q-Learning update rule:
   * Q(s,a) = Q(s,a) + lr * (reward + gamma * max(Q(s')) - Q(s,a))
   */
  async updateQValue(
    userId: string,
    stateHash: string,
    action: Action,
    reward: number,
    nextStateHash?: string
  ) {
    const entry = await RLQTable.findOne({ user: userId, stateHash });
    if (!entry) return;

    const currentQ = (entry.actions as any)[action] || 0;

    // Get max Q-value for next state
    let maxNextQ = 0;
    if (nextStateHash) {
      const nextEntry = await RLQTable.findOne({ user: userId, stateHash: nextStateHash });
      if (nextEntry) {
        const nextActions = nextEntry.actions as any;
        maxNextQ = Math.max(...ACTIONS.map(a => nextActions[a] || 0));
      }
    }

    // Q-Learning update
    const newQ = currentQ + LEARNING_RATE * (reward + DISCOUNT_FACTOR * maxNextQ - currentQ);

    // Update the specific action's Q-value
    const updateField: any = {};
    updateField[`actions.${action}`] = newQ;
    updateField.lastUpdated = new Date();

    await RLQTable.findOneAndUpdate(
      { user: userId, stateHash },
      { $set: updateField }
    );
  }

  /**
   * Process an interaction and update the RL model
   * Called after quiz submission, video completion, etc.
   */
  async processInteraction(
    userId: string,
    courseId: string,
    context: {
      quizScore?: number;
      topicCompleted?: boolean;
      streakCount?: number;
      isDropout?: boolean;
      repeatedFailure?: boolean;
      previousAction?: Action;
      previousStateHash?: string;
    }
  ) {
    const reward = this.calculateReward(context);
    const currentState = await this.getCurrentState(userId, courseId);
    const currentStateHash = this.hashState(currentState);

    // If we have a previous state and action, update Q-value
    if (context.previousAction && context.previousStateHash) {
      await this.updateQValue(
        userId,
        context.previousStateHash,
        context.previousAction,
        reward,
        currentStateHash
      );
    }

    // Select next action
    const { action, state, stateHash } = await this.selectAction(userId, courseId);

    return {
      recommendation: action,
      reward,
      state,
      stateHash,
      humanReadable: this.actionToRecommendation(action, state),
    };
  }

  /**
   * Convert action to human-readable recommendation
   */
  private actionToRecommendation(action: Action, state: RLState): string {
    const recommendations: Record<Action, string> = {
      recommend_next_topic: 'You\'re doing great! Move on to the next topic.',
      recommend_revision: 'Let\'s review some previous material to strengthen your understanding.',
      recommend_easy_content: 'Try some foundational content to build confidence.',
      recommend_advanced_challenge: 'You\'re ready for a challenge! Try advanced material.',
      suggest_break: 'Take a short break to rest your mind. Come back refreshed!',
      switch_learning_format: 'Try a different learning format — practice exercises or reading material.',
    };

    return recommendations[action];
  }

  /**
   * Get RL stats for a user (for dashboard display)
   */
  async getUserRLStats(userId: string) {
    const state = await this.getCurrentState(userId);
    const entries = await RLQTable.find({ user: userId }).sort({ lastUpdated: -1 }).limit(10);
    
    return {
      currentState: state,
      recentEntries: entries.length,
      totalInteractions: entries.reduce((sum, e) => sum + e.totalVisits, 0),
    };
  }
}

export default new RLService();
