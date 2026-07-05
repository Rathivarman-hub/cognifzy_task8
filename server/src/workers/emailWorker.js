import Job from '../models/jobModel.js';
import { getEmailQueue } from '../queues/emailQueue.js';
import { getGmailClient } from '../config/gmail.js';

/**
 * Encode email in RFC 2822 format for Gmail API
 */
const encodeEmailMessage = (from, to, subject, htmlBody) => {
  const boundary = 'boundary_' + Math.random().toString(36).substr(2, 9);
  const textContent = htmlBody.replace(/<[^>]*>/g, ''); // Strip HTML tags for plain text

  const emailMessage = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    Buffer.from(textContent).toString('base64'),
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    Buffer.from(htmlBody).toString('base64'),
    `--${boundary}--`,
  ].join('\r\n');

  return Buffer.from(emailMessage).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
};

const processEmailJob = async (bullJob) => {
  const { to, subject, body, from, jobId } = bullJob.data;

  // Update progress - starting
  await bullJob.progress(10);

  // Update DB record
  if (jobId) {
    await Job.findByIdAndUpdate(jobId, {
      status: 'active',
      progress: 10,
      attempts: bullJob.attemptsMade + 1,
      processedAt: new Date(),
      bullJobId: String(bullJob.id),
    });
  }

  // Processing steps
  await bullJob.progress(30);
  await new Promise((r) => setTimeout(r, 500));

  await bullJob.progress(60);

  // Send email using Gmail API
  try {
    const gmail = await getGmailClient();
    const userEmail = from || process.env.GMAIL_USER;

    const encodedMessage = encodeEmailMessage(userEmail, to, subject, body);

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    console.log(`📧 Email sent via Gmail API to: ${to}, Subject: ${subject}`);
  } catch (error) {
    // If Gmail API fails, log but don't break the job
    if (error.message.includes('Token not found') || error.message.includes('authorize')) {
      console.warn(`⚠️ Gmail not configured. Simulating email to: ${to}, Subject: ${subject}`);
      await new Promise((r) => setTimeout(r, 800));
    } else {
      throw error;
    }
  }

  await bullJob.progress(90);
  await new Promise((r) => setTimeout(r, 200));
  await bullJob.progress(100);

  // Update DB record as completed
  if (jobId) {
    await Job.findByIdAndUpdate(jobId, {
      status: 'completed',
      progress: 100,
      result: { sentAt: new Date(), to, subject },
      finishedAt: new Date(),
    });
  }

  return { success: true, sentAt: new Date() };
};

export const startEmailWorker = () => {
  const queue = getEmailQueue();
  if (!queue) {
    console.warn('⚠️  Email queue not available, worker not started');
    return;
  }

  queue.process(async (job) => {
    try {
      return await processEmailJob(job);
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

  console.log('✅ Email worker started');
};

export default startEmailWorker;
