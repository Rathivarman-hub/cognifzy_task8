import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    bullJobId: { type: String },
    type: {
      type: String,
      enum: ['email', 'report'],
      required: true,
    },
    status: {
      type: String,
      enum: ['waiting', 'active', 'completed', 'failed', 'delayed'],
      default: 'waiting',
    },
    priority: { type: Number, default: 0 },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 3 },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    result: { type: mongoose.Schema.Types.Mixed },
    error: { type: String },
    delay: { type: Number, default: 0 },
    processedAt: { type: Date },
    finishedAt: { type: Date },
  },
  { timestamps: true }
);

jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ type: 1 });
jobSchema.index({ bullJobId: 1 });

const Job = mongoose.model('Job', jobSchema);
export default Job;
