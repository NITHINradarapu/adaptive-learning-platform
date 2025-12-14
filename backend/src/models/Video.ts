import mongoose, { Document, Schema } from 'mongoose';

export interface IVideo extends Document {
  module: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number; // in seconds
  order: number; // Video sequence in module
  hasInteractiveQuestions: boolean;
  requiredCheckpoints: number; // Number of checkpoints that must be completed
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const videoSchema = new Schema<IVideo>({
  module: {
    type: Schema.Types.ObjectId,
    ref: 'Module',
    required: true
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a video title'],
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  videoUrl: {
    type: String,
    required: [true, 'Please provide a video URL']
  },
  thumbnailUrl: {
    type: String
  },
  duration: {
    type: Number,
    required: true,
    min: 0
  },
  order: {
    type: Number,
    required: true
  },
  hasInteractiveQuestions: {
    type: Boolean,
    default: false
  },
  requiredCheckpoints: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index for ordering
videoSchema.index({ module: 1, order: 1 }, { unique: true });

export default mongoose.model<IVideo>('Video', videoSchema);
