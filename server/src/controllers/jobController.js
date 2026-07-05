import Job from '../models/jobModel.js';
import { addEmailJob } from '../queues/emailQueue.js';
import { addReportJob } from '../queues/reportQueue.js';
import { getEmailQueue } from '../queues/emailQueue.js';
import { getReportQueue } from '../queues/reportQueue.js';

// GET /api/jobs - Get all jobs with queue stats
export const getAllJobs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, type } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit)),
      Job.countDocuments(filter),
    ]);

    // Get queue counts if available
    let emailQueueStats = null;
    let reportQueueStats = null;

    const emailQueue = getEmailQueue();
    const reportQueue = getReportQueue();

    if (emailQueue) {
      const [waiting, active, completed, failed, delayed] = await Promise.all([
        emailQueue.getWaitingCount(),
        emailQueue.getActiveCount(),
        emailQueue.getCompletedCount(),
        emailQueue.getFailedCount(),
        emailQueue.getDelayedCount(),
      ]);
      emailQueueStats = { waiting, active, completed, failed, delayed };
    }

    if (reportQueue) {
      const [waiting, active, completed, failed, delayed] = await Promise.all([
        reportQueue.getWaitingCount(),
        reportQueue.getActiveCount(),
        reportQueue.getCompletedCount(),
        reportQueue.getFailedCount(),
        reportQueue.getDelayedCount(),
      ]);
      reportQueueStats = { waiting, active, completed, failed, delayed };
    }

    res.json({
      success: true,
      data: jobs,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
      queueStats: { email: emailQueueStats, report: reportQueueStats },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/jobs/email - Queue an email job
export const queueEmailJob = async (req, res, next) => {
  try {
    const { to, subject, body, from, delay, priority } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({ success: false, message: 'to, subject, and body are required' });
    }

    // Save to MongoDB first to get an ID
    const job = await Job.create({
      type: 'email',
      status: delay ? 'delayed' : 'waiting',
      priority: priority || 0,
      delay: delay || 0,
      data: { to, subject, body, from },
    });

    // Add to Bull queue
    const bullJob = await addEmailJob(
      { to, subject, body, from, jobId: job._id.toString() },
      { priority: priority || 0, delay: delay || 0 }
    );

    await Job.findByIdAndUpdate(job._id, { bullJobId: String(bullJob.id) });

    res.status(201).json({
      success: true,
      message: 'Email job queued successfully',
      data: { ...job.toObject(), bullJobId: String(bullJob.id) },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/jobs/report - Queue a report generation job
export const queueReportJob = async (req, res, next) => {
  try {
    const { reportType, filters, format, delay, priority } = req.body;

    if (!reportType) {
      return res.status(400).json({ success: false, message: 'reportType is required' });
    }

    const job = await Job.create({
      type: 'report',
      status: delay ? 'delayed' : 'waiting',
      priority: priority || 0,
      delay: delay || 0,
      data: { reportType, filters, format },
    });

    const bullJob = await addReportJob(
      { reportType, filters, format, jobId: job._id.toString() },
      { priority: priority || 0, delay: delay || 0 }
    );

    await Job.findByIdAndUpdate(job._id, { bullJobId: String(bullJob.id) });

    res.status(201).json({
      success: true,
      message: 'Report job queued successfully',
      data: { ...job.toObject(), bullJobId: String(bullJob.id) },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/jobs/:id - Get single job
export const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    res.json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};

export default { getAllJobs, queueEmailJob, queueReportJob, getJobById };
