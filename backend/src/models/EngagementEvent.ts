import mongoose, { Document, Schema } from 'mongoose';

export interface IEngagementEvent extends Document {
  user: mongoose.Types.ObjectId;
  video: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  module: mongoose.Types.ObjectId;
  eventType: 'play' | 'pause' | 'seek' | 'replay' | 'speed_change' | 'tab_switch' | 'idle' | 'drop_off' | 'complete';
  timestamp: number; // seconds into video where event occurred
  duration: number; // duration of the event (e.g., pause duration)
  metadata: {
    replaySegmentStart?: number;
    replaySegmentEnd?: number;
    seekFrom?: number;
    seekTo?: number;
    playbackSpeed?: number;
    idleDuration?: number;
    dropOffTimestamp?: number;
  };
  sessionId: string;
  createdAt: Date;
}

const EngagementEventSchema = new Schema<IEngagementEvent>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: 'Video',
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
    eventType: {
      type: String,
      enum: ['play', 'pause', 'seek', 'replay', 'speed_change', 'tab_switch', 'idle', 'drop_off', 'complete'],
      required: true,
    },
    timestamp: {
      type: Number,
      required: true,
      min: 0,
    },
    duration: {
      type: Number,
      default: 0,
      min: 0,
    },
    metadata: {
      replaySegmentStart: Number,
      replaySegmentEnd: Number,
      seekFrom: Number,
      seekTo: Number,
      playbackSpeed: Number,
      idleDuration: Number,
      dropOffTimestamp: Number,
    },
    sessionId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
EngagementEventSchema.index({ user: 1, video: 1, createdAt: -1 });
EngagementEventSchema.index({ user: 1, course: 1, createdAt: -1 });
EngagementEventSchema.index({ video: 1, eventType: 1 });
EngagementEventSchema.index({ sessionId: 1 });

export default mongoose.model<IEngagementEvent>('EngagementEvent', EngagementEventSchema);
