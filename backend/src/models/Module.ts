import mongoose, { Document, Schema } from 'mongoose';

export interface IModule extends Document {
  course: mongoose.Types.ObjectId;
  title: string;
  description: string;
  order: number; // Module sequence in course
  difficultyLevel: string;
  isLocked: boolean; // Locked until prerequisites are met
  prerequisites: mongoose.Types.ObjectId[]; // Previous modules that must be completed
  estimatedTime: number; // in minutes
  createdAt: Date;
  updatedAt: Date;
}

const moduleSchema = new Schema<IModule>({
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a module title'],
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    required: true
  },
  difficultyLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  isLocked: {
    type: Boolean,
    default: true
  },
  prerequisites: [{
    type: Schema.Types.ObjectId,
    ref: 'Module'
  }],
  estimatedTime: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index to ensure order uniqueness per course
moduleSchema.index({ course: 1, order: 1 }, { unique: true });

export default mongoose.model<IModule>('Module', moduleSchema);
