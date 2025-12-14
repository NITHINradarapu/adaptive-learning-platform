import mongoose, { Document, Schema } from 'mongoose';

export enum QuestionType {
  MCQ = 'mcq',
  FILL_IN_BLANK = 'fill-in-blank',
  SHORT_ANSWER = 'short-answer'
}

export interface IOption {
  text: string;
  isCorrect: boolean;
}

export interface IInteractiveQuestion extends Document {
  video: mongoose.Types.ObjectId;
  questionType: QuestionType;
  question: string;
  timestamp: number; // When in video this question appears (in seconds)
  options?: IOption[]; // For MCQ
  correctAnswer: string; // Exact answer for fill-in-blank or short-answer
  acceptableAnswers?: string[]; // Multiple acceptable answers
  hint?: string;
  explanation?: string; // Shown after answering
  timeLimit: number; // Time limit to answer in seconds
  maxRetries: number; // Maximum number of retry attempts
  isRequired: boolean; // If true, blocks video progression
  points: number; // Points awarded for correct answer
  order: number; // Order of question in video
  createdAt: Date;
  updatedAt: Date;
}

const interactiveQuestionSchema = new Schema<IInteractiveQuestion>({
  video: {
    type: Schema.Types.ObjectId,
    ref: 'Video',
    required: true
  },
  questionType: {
    type: String,
    enum: Object.values(QuestionType),
    required: true
  },
  question: {
    type: String,
    required: [true, 'Please provide a question'],
    trim: true
  },
  timestamp: {
    type: Number,
    required: true,
    min: 0
  },
  options: [{
    text: {
      type: String,
      required: true
    },
    isCorrect: {
      type: Boolean,
      required: true
    }
  }],
  correctAnswer: {
    type: String,
    required: true
  },
  acceptableAnswers: [{
    type: String
  }],
  hint: {
    type: String
  },
  explanation: {
    type: String
  },
  timeLimit: {
    type: Number,
    default: 60, // 60 seconds default
    min: 10
  },
  maxRetries: {
    type: Number,
    default: 2
  },
  isRequired: {
    type: Boolean,
    default: true
  },
  points: {
    type: Number,
    default: 10,
    min: 0
  },
  order: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient retrieval by video and timestamp
interactiveQuestionSchema.index({ video: 1, timestamp: 1 });

export default mongoose.model<IInteractiveQuestion>('InteractiveQuestion', interactiveQuestionSchema);
