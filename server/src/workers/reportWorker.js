import Job from '../models/jobModel.js';
import { getReportQueue } from '../queues/reportQueue.js';

const processReportJob = async (bullJob) => {
  const { reportType, filters, format, jobId } = bullJob.data;

  await bullJob.progress(5);

  if (jobId) {
    await Job.findByIdAndUpdate(jobId, {
      status: 'active',
      progress: 5,
      attempts: bullJob.attemptsMade + 1,
      processedAt: new Date(),
      bullJobId: String(bullJob.id),
    });
  }

  // Simulate data gathering
  await bullJob.progress(20);
  await new Promise((r) => setTimeout(r, 600));

  // Simulate data processing
  await bullJob.progress(50);
  await new Promise((r) => setTimeout(r, 1000));

  // Simulate report generation
  await bullJob.progress(80);
  await new Promise((r) => setTimeout(r, 700));

  await bullJob.progress(95);
  await new Promise((r) => setTimeout(r, 200));

  await bullJob.progress(100);

  const result = {
    reportType,
    format: format || 'pdf',
    generatedAt: new Date(),
    rowCount: Math.floor(Math.random() * 1000) + 100,
    fileSize: `${(Math.random() * 2 + 0.5).toFixed(2)}MB`,
    downloadUrl: `/reports/${Date.now()}.${format || 'pdf'}`,
  };

  if (jobId) {
    await Job.findByIdAndUpdate(jobId, {
      status: 'completed',
      progress: 100,
      result,
      finishedAt: new Date(),
    });
  }

  return result;
};

export const startReportWorker = () => {
  const queue = getReportQueue();
  if (!queue) {
    console.warn('⚠️  Report queue not available, worker not started');
    return;
  }

  queue.process(async (job) => {
    try {
      return await processReportJob(job);
    } catch (error) {
      if (job.data.jobId) {
        await Job.findByIdAndUpdate(job.data.jobId, {
          status: job.attemptsMade >= 2 ? 'failed' : 'waiting',
          error: error.message,
          attempts: job.attemptsMade + 1,
        });
      }
      throw error;
    }
  });

  console.log('✅ Report worker started');
};

export default startReportWorker;
