import mongoose, { Document, Schema } from 'mongoose';

export enum ProgressStatus {
  NOT_STARTED = 'not-started',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  NEEDS_REVISION = 'needs-revision'
}

export interface IVideoProgress {
  video: mongoose.Types.ObjectId;
  watchedDuration: number; // seconds watched
  totalDuration: number;
  completed: boolean;
  checkpointsCompleted: number;
  totalCheckpoints: number;
  lastWatchedAt: Date;
}

export interface IModuleProgress {
  module: mongoose.Types.ObjectId;
  status: ProgressStatus;
  videosCompleted: number;
  totalVideos: number;
  quizScore?: number;
  completedAt?: Date;
}

export interface ILearningProgress extends Document {
  user: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  enrolledAt: Date;
  status: ProgressStatus;
  
  // Overall progress
  overallProgress: number; // percentage 0-100
  modulesProgress: IModuleProgress[];
  videosProgress: IVideoProgress[];
  
  // Performance metrics
  totalQuizzesTaken: number;
  averageQuizScore: number;
  totalTimeSpent: number; // in minutes
  totalCheckpointsCompleted: number;
  
  // Adaptive learning data
  performanceLevel: string; // 'struggling', 'average', 'excellent'
  recommendedPace: string; // 'slow', 'normal', 'fast'
  weakAreas: string[]; // Topics where user is struggling
  strongAreas: string[]; // Topics where user excels
  
  // Attendance
  lastActivityDate: Date;
  totalDaysActive: number;
  
  createdAt: Date;
  updatedAt: Date;
}

const learningProgressSchema = new Schema<ILearningProgress>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: Object.values(ProgressStatus),
    default: ProgressStatus.NOT_STARTED
  },
  overallProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  modulesProgress: [{
    module: {
      type: Schema.Types.ObjectId,
      ref: 'Module'
    },
    status: {
      type: String,
      enum: Object.values(ProgressStatus),
      default: ProgressStatus.NOT_STARTED
    },
    videosCompleted: {
      type: Number,
      default: 0
    },
    totalVideos: {
      type: Number,
      default: 0
    },
    quizScore: Number,
    completedAt: Date
  }],
  videosProgress: [{
    video: {
      type: Schema.Types.ObjectId,
      ref: 'Video'
    },
    watchedDuration: {
      type: Number,
      default: 0
    },
    totalDuration: {
      type: Number,
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    checkpointsCompleted: {
      type: Number,
      default: 0
    },
    totalCheckpoints: {
      type: Number,
      default: 0
    },
    lastWatchedAt: {
      type: Date,
      default: Date.now
    }
  }],
  totalQuizzesTaken: {
    type: Number,
    default: 0
  },
  averageQuizScore: {
    type: Number,
    default: 0
  },
  totalTimeSpent: {
    type: Number,
    default: 0
  },
  totalCheckpointsCompleted: {
    type: Number,
    default: 0
  },
  performanceLevel: {
    type: String,
    enum: ['struggling', 'average', 'excellent'],
    default: 'average'
  },
  recommendedPace: {
    type: String,
    enum: ['slow', 'normal', 'fast'],
    default: 'normal'
  },
  weakAreas: [{
    type: String
  }],
  strongAreas: [{
    type: String
  }],
  lastActivityDate: {
    type: Date,
    default: Date.now
  },
  totalDaysActive: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index to ensure one progress record per user per course
learningProgressSchema.index({ user: 1, course: 1 }, { unique: true });

export default mongoose.model<ILearningProgress>('LearningProgress', learningProgressSchema);
