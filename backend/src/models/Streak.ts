import mongoose, { Document, Schema } from 'mongoose';

export interface IStreak extends Document {
  user: mongoose.Types.ObjectId;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date;
  streakStartDate: Date;
  totalActiveDays: number;
  streakHistory: {
    startDate: Date;
    endDate: Date;
    length: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const streakSchema = new Schema<IStreak>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  lastActivityDate: {
    type: Date
  },
  streakStartDate: {
    type: Date
  },
  totalActiveDays: {
    type: Number,
    default: 0
  },
  streakHistory: [{
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    length: {
      type: Number,
      required: true
    }
  }]
}, {
  timestamps: true
});

export default mongoose.model<IStreak>('Streak', streakSchema);
