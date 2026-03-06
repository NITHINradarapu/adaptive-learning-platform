import mongoose, { Document, Schema } from 'mongoose';

export interface ISpacedRepetition extends Document {
  user: mongoose.Types.ObjectId;
  module: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  easinessFactor: number;       // SM-2: starts at 2.5
  interval: number;            // days until next review
  repetitions: number;         // consecutive correct count
  nextReviewDate: Date;
  lastReviewDate: Date;
  lastScore: number;           // 0-5 (SM-2 quality rating)
  totalReviews: number;
  status: 'new' | 'learning' | 'review' | 'mastered';
  reviewHistory: Array<{
    date: Date;
    score: number;
    responseTime: number;      // seconds
  }>;
}

const SpacedRepetitionSchema = new Schema<ISpacedRepetition>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    module: {
      type: Schema.Types.ObjectId,
      ref: 'Module',
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    easinessFactor: {
      type: Number,
      default: 2.5,
      min: 1.3,
    },
    interval: {
      type: Number,
      default: 1,
      min: 1,
    },
    repetitions: {
      type: Number,
      default: 0,
    },
    nextReviewDate: {
      type: Date,
      default: Date.now,
    },
    lastReviewDate: {
      type: Date,
    },
    lastScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['new', 'learning', 'review', 'mastered'],
      default: 'new',
    },
    reviewHistory: [
      {
        date: { type: Date, default: Date.now },
        score: { type: Number, min: 0, max: 5 },
        responseTime: { type: Number },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
SpacedRepetitionSchema.index({ user: 1, module: 1 }, { unique: true });
SpacedRepetitionSchema.index({ user: 1, nextReviewDate: 1 });
SpacedRepetitionSchema.index({ user: 1, status: 1 });

export default mongoose.model<ISpacedRepetition>('SpacedRepetition', SpacedRepetitionSchema);
