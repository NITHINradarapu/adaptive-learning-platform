import mongoose, { Document, Schema } from 'mongoose';

export interface ICheckpointResponse extends Document {
  user: mongoose.Types.ObjectId;
  video: mongoose.Types.ObjectId;
  question: mongoose.Types.ObjectId;
  userAnswer: string;
  isCorrect: boolean;
  attemptNumber: number;
  timeSpent: number; // seconds taken to answer
  hintUsed: boolean;
  pointsEarned: number;
  answeredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const checkpointResponseSchema = new Schema<ICheckpointResponse>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  video: {
    type: Schema.Types.ObjectId,
    ref: 'Video',
    required: true
  },
  question: {
    type: Schema.Types.ObjectId,
    ref: 'InteractiveQuestion',
    required: true
  },
  userAnswer: {
    type: String,
    required: true
  },
  isCorrect: {
    type: Boolean,
    required: true
  },
  attemptNumber: {
    type: Number,
    default: 1
  },
  timeSpent: {
    type: Number,
    required: true
  },
  hintUsed: {
    type: Boolean,
    default: false
  },
  pointsEarned: {
    type: Number,
    default: 0
  },
  answeredAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
checkpointResponseSchema.index({ user: 1, video: 1, question: 1 });

export default mongoose.model<ICheckpointResponse>('CheckpointResponse', checkpointResponseSchema);
