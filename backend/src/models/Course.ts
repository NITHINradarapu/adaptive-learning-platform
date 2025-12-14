import mongoose, { Document, Schema } from 'mongoose';

export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

export interface ICourse extends Document {
  title: string;
  description: string;
  instructor: mongoose.Types.ObjectId;
  difficultyLevel: DifficultyLevel;
  careerGoals: string[]; // Which career goals this course is relevant for
  thumbnailUrl?: string;
  duration: number; // in minutes
  totalModules: number;
  totalVideos: number;
  enrolledStudents: number;
  averageRating: number;
  tags: string[];
  prerequisites: string[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>({
  title: {
    type: String,
    required: [true, 'Please provide a course title'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a course description'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  instructor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  difficultyLevel: {
    type: String,
    enum: Object.values(DifficultyLevel),
    required: true
  },
  careerGoals: [{
    type: String
  }],
  thumbnailUrl: {
    type: String
  },
  duration: {
    type: Number,
    default: 0
  },
  totalModules: {
    type: Number,
    default: 0
  },
  totalVideos: {
    type: Number,
    default: 0
  },
  enrolledStudents: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  tags: [{
    type: String,
    trim: true
  }],
  prerequisites: [{
    type: String
  }],
  isPublished: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for search optimization
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });

export default mongoose.model<ICourse>('Course', courseSchema);
