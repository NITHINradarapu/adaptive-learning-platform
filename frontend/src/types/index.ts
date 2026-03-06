export enum UserRole {
  STUDENT = 'student',
  INSTRUCTOR = 'instructor',
  ADMIN = 'admin'
}

export enum LearnerBackground {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

export enum CareerGoal {
  SOFTWARE_DEVELOPER = 'Software Developer',
  DATA_ANALYST = 'Data Analyst',
  TEACHER = 'Teacher',
  WEB_DEVELOPER = 'Web Developer',
  ML_ENGINEER = 'ML Engineer',
  OTHER = 'Other'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  learnerBackground?: LearnerBackground;
  careerGoal?: CareerGoal;
  averageQuizScore?: number;
  totalCoursesCompleted?: number;
  currentStreak?: number;
  longestStreak?: number;
  engagementScore?: number;
  isAtRisk?: boolean;
  riskLevel?: 'low' | 'medium' | 'high';
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: {
    _id: string;
    name: string;
  };
  difficultyLevel: string;
  careerGoals: string[];
  thumbnailUrl?: string;
  duration: number;
  totalModules: number;
  totalVideos: number;
  enrolledStudents: number;
  averageRating: number;
  tags: string[];
  isPublished: boolean;
  isEnrolled?: boolean;
  progress?: number;
}

export interface Module {
  _id: string;
  course: string;
  title: string;
  description: string;
  order: number;
  difficultyLevel: string;
  isLocked: boolean;
  estimatedTime: number;
}

export interface Video {
  _id: string;
  module: string;
  course: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number;
  order: number;
  hasInteractiveQuestions: boolean;
  requiredCheckpoints: number;
}

export enum QuestionType {
  MCQ = 'mcq',
  FILL_IN_BLANK = 'fill-in-blank',
  SHORT_ANSWER = 'short-answer'
}

export interface QuestionOption {
  text: string;
}

export interface InteractiveQuestion {
  _id: string;
  questionType: QuestionType;
  question: string;
  timestamp: number;
  options?: QuestionOption[];
  timeLimit: number;
  maxRetries: number;
  isRequired: boolean;
  points: number;
  order: number;
  hint?: string;
  difficultyLevel?: 'easy' | 'medium' | 'hard';
  bloomsLevel?: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
}

export interface CheckpointSubmission {
  userAnswer: string;
  timeSpent: number;
  hintUsed: boolean;
}

export interface CheckpointResponse {
  isCorrect: boolean;
  pointsEarned: number;
  attemptsRemaining: number;
  explanation?: string;
  hint?: string;
}

export interface LearningProgress {
  user: string;
  course: string;
  status: string;
  overallProgress: number;
  averageQuizScore: number;
  totalTimeSpent: number;
  totalCheckpointsCompleted: number;
  performanceLevel: string;
  recommendedPace: string;
  lastActivityDate: Date;
}

export interface DashboardStats {
  totalCoursesEnrolled: number;
  coursesInProgress: number;
  coursesCompleted: number;
  averageProgress: number;
  totalCheckpointsCompleted: number;
  totalTimeSpent: number;
  currentStreak: number;
  longestStreak: number;
  averageQuizScore: number;
}

export interface Attendance {
  _id: string;
  date: Date;
  checkpointsCompleted: number;
  videosWatched: number;
  totalTimeSpent: number;
  isMarked: boolean;
}

export interface Streak {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: Date;
  totalActiveDays: number;
}

export interface AdaptivePathModule {
  id: string;
  title: string;
  order: number;
  difficulty: string;
  isUnlocked: boolean;
  isRecommended: boolean;
  estimatedTime: number;
}

export interface AdaptivePath {
  user: {
    background: string;
    careerGoal: string;
    performanceLevel: string;
  };
  course: {
    id: string;
    title: string;
    difficulty: string;
  };
  adaptivePath: {
    startingModule: number;
    recommendedPace: string;
    totalModules: number;
    modules: AdaptivePathModule[];
    careerRecommendations: any[];
  };
  recommendations: string[];
}

// ---- Engagement Analytics Types ----

export interface EngagementEvent {
  videoId: string;
  courseId: string;
  moduleId: string;
  eventType: 'play' | 'pause' | 'seek' | 'replay' | 'speed_change' | 'tab_switch' | 'idle' | 'drop_off' | 'complete';
  timestamp: number;
  duration: number;
  metadata?: Record<string, any>;
  sessionId: string;
}

export interface EngagementSummary {
  engagementScore: number;
  recentEventCounts: Record<string, number>;
  totalEvents: number;
}

// ---- Reinforcement Learning Types ----

export interface RLState {
  avgQuizScore: number;
  engagementScore: number;
  masteryLevel: number;
  retryFrequency: number;
  completionRate: number;
  streakCount: number;
}

export type RLAction = 
  | 'recommend_next_topic'
  | 'recommend_revision'
  | 'recommend_easy_content'
  | 'recommend_advanced_challenge'
  | 'suggest_break'
  | 'switch_learning_format';

export interface RLRecommendation {
  action: RLAction;
  message: string;
  suggestedContent: Array<{
    type: string;
    id: string;
    title: string;
    difficulty?: string;
  }>;
  state: RLState;
}

export interface RLInteractionResult {
  recommendation: RLAction;
  reward: number;
  state: RLState;
  stateHash: string;
  humanReadable: string;
}

// ---- Spaced Repetition Types ----

export interface SpacedRepetitionItem {
  _id: string;
  user: string;
  module: {
    _id: string;
    title: string;
    description: string;
    order: number;
  };
  course: {
    _id: string;
    title: string;
  };
  easinessFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: string;
  lastReviewDate?: string;
  lastScore: number;
  totalReviews: number;
  status: 'new' | 'learning' | 'review' | 'mastered';
}

export interface ReviewSummary {
  dueNow: number;
  dueTomorrow: number;
  dueThisWeek: number;
  mastered: number;
  total: number;
  masteryPercentage: number;
}

// ---- Teacher Analytics Types ----

export interface CourseAnalyticsDashboard {
  course: {
    id: string;
    title: string;
    enrolledStudents: number;
    isPublished: boolean;
  };
  enrollmentStats: {
    totalEnrolled: number;
    statusDistribution: Record<string, number>;
    averageProgress: number;
    averageQuizScore: number;
    averageTimeSpent: number;
    completionRate: number;
  };
  modulePerformance: Array<{
    moduleId: string;
    moduleTitle: string;
    order: number;
    difficulty: string;
    avgScore: number | null;
    completionRate: number;
    studentsAttempted: number;
    videoDropOffs: Array<{
      videoId: string;
      videoTitle: string;
      avgDropOffTimestamp: number;
      dropOffCount: number;
      videoDuration: number;
    }>;
  }>;
  questionAnalysis: Array<{
    questionId: string;
    questionText: string;
    questionType: string;
    difficultyLevel: string;
    bloomsLevel: string;
    successRate: number;
    totalAttempts: number;
    avgTimeSpent: number;
    hintUsageRate: number;
    isProblematic: boolean;
  }>;
  engagementDistribution: {
    veryLow: number;
    low: number;
    medium: number;
    high: number;
    veryHigh: number;
  };
  riskStudents: Array<RiskAssessment>;
  insights: string[];
}

export interface RiskAssessment {
  userId: string;
  riskLevel: 'low' | 'medium' | 'high';
  isAtRisk: boolean;
  riskScore: number;
  riskFactors: string[];
  interventionSuggestions: string[];
  courseName?: string;
  courseId?: string;
  details: {
    engagementScore: number;
    failureRate: number;
    loginConsistency: number;
    performanceTrend: 'improving' | 'stable' | 'declining';
    daysSinceLastActivity: number;
    streakBroken: boolean;
  };
}

export interface StudentPerformance {
  studentId: string;
  studentName: string;
  studentEmail: string;
  progress: number;
  status: string;
  quizScore: number;
  timeSpent: number;
  performanceLevel: string;
  engagementScore: number;
  isAtRisk: boolean;
  riskLevel: string;
  lastActivity: string;
}
