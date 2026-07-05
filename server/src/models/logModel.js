import mongoose from 'mongoose';

const logSchema = new mongoose.Schema(
  {
    method: { type: String, required: true },
    url: { type: String, required: true },
    statusCode: { type: Number },
    responseTime: { type: Number },
    ip: { type: String },
    userAgent: { type: String },
    body: { type: mongoose.Schema.Types.Mixed },
    query: { type: mongoose.Schema.Types.Mixed },
    error: { type: String },
    level: {
      type: String,
      enum: ['info', 'warn', 'error'],
      default: 'info',
    },
  },
  { timestamps: true }
);

logSchema.index({ createdAt: -1 });
logSchema.index({ statusCode: 1 });
logSchema.index({ level: 1 });

const Log = mongoose.model('Log', logSchema);
export default Log;
