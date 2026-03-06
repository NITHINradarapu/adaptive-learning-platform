import mongoose, { Document, Schema } from 'mongoose';

export interface IRLQTable extends Document {
  user: mongoose.Types.ObjectId;
  stateHash: string;
  state: {
    avgQuizScore: number;      // 0-100
    engagementScore: number;   // 0-1
    masteryLevel: number;      // 0-1
    retryFrequency: number;    // 0-1
    completionRate: number;    // 0-1
    streakCount: number;       // raw count
  };
  actions: {
    recommend_next_topic: number;
    recommend_revision: number;
    recommend_easy_content: number;
    recommend_advanced_challenge: number;
    suggest_break: number;
    switch_learning_format: number;
  };
  totalVisits: number;
  lastUpdated: Date;
}

const RLQTableSchema = new Schema<IRLQTable>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    stateHash: {
      type: String,
      required: true,
    },
    state: {
      avgQuizScore: { type: Number, default: 0, min: 0, max: 100 },
      engagementScore: { type: Number, default: 0, min: 0, max: 1 },
      masteryLevel: { type: Number, default: 0, min: 0, max: 1 },
      retryFrequency: { type: Number, default: 0, min: 0, max: 1 },
      completionRate: { type: Number, default: 0, min: 0, max: 1 },
      streakCount: { type: Number, default: 0 },
    },
    actions: {
      recommend_next_topic: { type: Number, default: 0 },
      recommend_revision: { type: Number, default: 0 },
      recommend_easy_content: { type: Number, default: 0 },
      recommend_advanced_challenge: { type: Number, default: 0 },
      suggest_break: { type: Number, default: 0 },
      switch_learning_format: { type: Number, default: 0 },
    },
    totalVisits: {
      type: Number,
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
RLQTableSchema.index({ user: 1, stateHash: 1 }, { unique: true });
RLQTableSchema.index({ user: 1, lastUpdated: -1 });

export default mongoose.model<IRLQTable>('RLQTable', RLQTableSchema);
