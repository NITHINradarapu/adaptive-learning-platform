import mongoose, { Document, Schema } from 'mongoose';

export interface IAnalytics extends Document {
  user: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  module: mongoose.Types.ObjectId;
  video?: mongoose.Types.ObjectId;
  date: Date;
  // Video engagement metrics
  watchTime: number;           // total seconds watched
  pauseCount: number;
  replayCount: number;
  dropOffTime: number;         // seconds into video where dropped off
  completionRate: number;      // 0-1
  // Quiz metrics
  quizAccuracy: number;        // 0-1
  questionsAttempted: number;
  questionsCorrect: number;
  avgResponseTime: number;     // seconds
  // Computed engagement score
  engagementScore: number;     // 0-1 using weighted formula
  // Session metrics
  sessionDuration: number;     // minutes
  participationFrequency: number; // sessions per week
  consistencyRate: number;     // 0-1
  replayBehavior: number;      // 0-1 normalized replay metric
}

const AnalyticsSchema = new Schema<IAnalytics>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    module: {
      type: Schema.Types.ObjectId,
      ref: 'Module',
      required: true,
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: 'Video',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    watchTime: { type: Number, default: 0 },
    pauseCount: { type: Number, default: 0 },
    replayCount: { type: Number, default: 0 },
    dropOffTime: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0, min: 0, max: 1 },
    quizAccuracy: { type: Number, default: 0, min: 0, max: 1 },
    questionsAttempted: { type: Number, default: 0 },
    questionsCorrect: { type: Number, default: 0 },
    avgResponseTime: { type: Number, default: 0 },
    engagementScore: { type: Number, default: 0, min: 0, max: 1 },
    sessionDuration: { type: Number, default: 0 },
    participationFrequency: { type: Number, default: 0 },
    consistencyRate: { type: Number, default: 0, min: 0, max: 1 },
    replayBehavior: { type: Number, default: 0, min: 0, max: 1 },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient teacher analytics queries
AnalyticsSchema.index({ user: 1, course: 1, date: -1 });
AnalyticsSchema.index({ course: 1, module: 1, date: -1 });
AnalyticsSchema.index({ user: 1, date: -1 });
AnalyticsSchema.index({ course: 1, date: -1 });

export default mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);
