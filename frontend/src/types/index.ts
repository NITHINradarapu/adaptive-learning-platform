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
