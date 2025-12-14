import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendance extends Document {
  user: mongoose.Types.ObjectId;
  date: Date;
  checkpointsCompleted: number;
  videosWatched: number;
  totalTimeSpent: number; // in minutes
  coursesAccessed: mongoose.Types.ObjectId[];
  isMarked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  checkpointsCompleted: {
    type: Number,
    default: 0
  },
  videosWatched: {
    type: Number,
    default: 0
  },
  totalTimeSpent: {
    type: Number,
    default: 0
  },
  coursesAccessed: [{
    type: Schema.Types.ObjectId,
    ref: 'Course'
  }],
  isMarked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index to ensure one attendance record per user per day
attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model<IAttendance>('Attendance', attendanceSchema);
