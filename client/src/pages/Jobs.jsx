import { useState, useEffect, useCallback } from 'react';
import { jobsApi } from '../services/api';
import JobCard from '../components/JobCard';
import QueueStatus from '../components/QueueStatus';

const EMAIL_DEFAULTS = { to: '', subject: '', body: '', delay: 0, priority: 0 };
const REPORT_DEFAULTS = { reportType: 'sales', format: 'pdf', delay: 0, priority: 0 };

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [queueStats, setQueueStats] = useState({ email: null, report: null });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list');
  const [emailForm, setEmailForm] = useState(EMAIL_DEFAULTS);
  const [reportForm, setReportForm] = useState(REPORT_DEFAULTS);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchJobs = useCallback(async () => {
    try {
      const params = { limit: 30 };
      if (filter !== 'all') params.status = filter;
      const res = await jobsApi.getAll(params);
      setJobs(res.data || []);
      setQueueStats(res.queueStats || {});
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchJobs();
    const id = setInterval(fetchJobs, 8000);
    return () => clearInterval(id);
  }, [fetchJobs]);

  const handleEmailSubmit = async () => {
    if (!emailForm.to || !emailForm.subject || !emailForm.body) {
      return setFeedback({ type: 'error', text: 'All email fields are required.' });
    }
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await jobsApi.queueEmail(emailForm);
      setFeedback({ type: 'success', text: `Email job queued! ID: ${res.data._id}` });
      setEmailForm(EMAIL_DEFAULTS);
      fetchJobs();
    } catch (e) {
      setFeedback({ type: 'error', text: e.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReportSubmit = async () => {
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await jobsApi.queueReport(reportForm);
      setFeedback({ type: 'success', text: `Report job queued! ID: ${res.data._id}` });
      setReportForm(REPORT_DEFAULTS);
      fetchJobs();
    } catch (e) {
      setFeedback({ type: 'error', text: e.message });
    } finally {
      setSubmitting(false);
    }
  };

  const tabs = ['list', 'email', 'report'];

  return (
    <div className="p-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 4 }}>Job Queue</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
            {jobs.length} jobs · Auto-refresh every 8s
          </p>
        </div>
        <button className="btn-ghost" onClick={fetchJobs}>
          <i className="bi bi-arrow-clockwise"></i>
        </button>
      </div>

      {/* Queue status */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <QueueStatus name="Email Queue" stats={queueStats.email} icon="bi-envelope" />
        </div>
        <div className="col-md-6">
          <QueueStatus name="Report Queue" stats={queueStats.report} icon="bi-file-earmark-bar-graph" />
        </div>
      </div>

      {/* Tabs */}
      <div className="d-flex gap-1 mb-4 jobs-tabs" style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 4, border: '1px solid var(--border)' }}>
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 500,
              textTransform: 'capitalize',
              background: activeTab === t ? 'var(--accent)' : 'transparent',
              color: activeTab === t ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.2s',
            }}
          >
            {t === 'list' ? <><i className="bi bi-list me-1"></i>Jobs</> :
             t === 'email' ? <><i className="bi bi-envelope me-1"></i>Queue Email</> :
             <><i className="bi bi-file-earmark-bar-graph me-1"></i>Queue Report</>}
          </button>
        ))}
      </div>

      {feedback && (
        <div className={`alert-custom alert-${feedback.type === 'success' ? 'success' : 'error'} mb-3`}>
          <i className={`bi ${feedback.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle'}`}></i>
          {feedback.text}
        </div>
      )}

      {/* Jobs list */}
      {activeTab === 'list' && (
        <>
          {/* Filter */}
          <div className="d-flex jobs-filter gap-2 mb-3">
            {['all', 'waiting', 'active', 'completed', 'failed', 'delayed'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={filter === f ? 'btn-accent' : 'btn-ghost'}
                style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem', textTransform: 'capitalize' }}
              >
                {f}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="loading-spinner"></div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="card-custom text-center py-5">
              <i className="bi bi-inbox" style={{ fontSize: '3rem', color: 'var(--text-muted)', display: 'block', marginBottom: 12 }}></i>
              <p style={{ color: 'var(--text-muted)' }}>No jobs found. Queue one using the tabs above.</p>
            </div>
          ) : (
            <div className="row g-3">
              {jobs.map((job) => (
                <div key={job._id} className="col-md-6 col-xl-4">
                  <JobCard job={job} />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Email form */}
      {activeTab === 'email' && (
        <div className="card-custom" style={{ maxWidth: 560 }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 20 }}>
            <i className="bi bi-envelope me-2 text-accent"></i>Queue Email Job
          </h2>
          {[
            { label: 'Recipient Email', key: 'to', type: 'email', placeholder: 'user@example.com' },
            { label: 'Subject', key: 'subject', type: 'text', placeholder: 'Your subject line' },
          ].map(({ label, key, type, placeholder }) => (
            <div className="mb-3" key={key}>
              <label className="form-label-custom">{label}</label>
              <input
                type={type}
                className="form-control-custom"
                placeholder={placeholder}
                value={emailForm[key]}
                onChange={(e) => setEmailForm((p) => ({ ...p, [key]: e.target.value }))}
              />
            </div>
          ))}
          <div className="mb-3">
            <label className="form-label-custom">Body</label>
            <textarea
              className="form-control-custom"
              rows={4}
              placeholder=""
              value={emailForm.body}
              onChange={(e) => setEmailForm((p) => ({ ...p, body: e.target.value }))}
            />
          </div>
          <div className="row g-3 mb-4">
            <div className="col-6">
              <label className="form-label-custom">Delay (ms)</label>
              <input
                type="number"
                className="form-control-custom"
                value={emailForm.delay}
                min={0}
                onChange={(e) => setEmailForm((p) => ({ ...p, delay: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="col-6">
              <label className="form-label-custom">Priority (higher = sooner)</label>
              <input
                type="number"
                className="form-control-custom"
                value={emailForm.priority}
                onChange={(e) => setEmailForm((p) => ({ ...p, priority: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>
          <button className="btn-accent" onClick={handleEmailSubmit} disabled={submitting}>
            {submitting ? <span className="loading-spinner"></span> : <i className="bi bi-send"></i>}
            {submitting ? 'Queueing…' : 'Queue Email Job'}
          </button>
        </div>
      )}

      {/* Report form */}
      {activeTab === 'report' && (
        <div className="card-custom" style={{ maxWidth: 560 }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 20 }}>
            <i className="bi bi-file-earmark-bar-graph me-2 text-accent"></i>Queue Report Job
          </h2>
          <div className="mb-3">
            <label className="form-label-custom">Report Type</label>
            <select
              className="form-control-custom"
              value={reportForm.reportType}
              onChange={(e) => setReportForm((p) => ({ ...p, reportType: e.target.value }))}
            >
              {['sales', 'inventory', 'users', 'analytics', 'finance', 'custom'].map((t) => (
                <option key={t} value={t} style={{ background: 'var(--bg-secondary)' }}>{t.charAt(0).toUpperCase() + t.slice(1)} Report</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label-custom">Output Format</label>
            <select
              className="form-control-custom"
              value={reportForm.format}
              onChange={(e) => setReportForm((p) => ({ ...p, format: e.target.value }))}
            >
              {['pdf', 'csv', 'xlsx', 'json'].map((f) => (
                <option key={f} value={f} style={{ background: 'var(--bg-secondary)' }}>{f.toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div className="row g-3 mb-4">
            <div className="col-6">
              <label className="form-label-custom">Delay (ms)</label>
              <input
                type="number"
                className="form-control-custom"
                value={reportForm.delay}
                min={0}
                onChange={(e) => setReportForm((p) => ({ ...p, delay: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="col-6">
              <label className="form-label-custom">Priority</label>
              <input
                type="number"
                className="form-control-custom"
                value={reportForm.priority}
                onChange={(e) => setReportForm((p) => ({ ...p, priority: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>
          <button className="btn-accent" onClick={handleReportSubmit} disabled={submitting}>
            {submitting ? <span className="loading-spinner"></span> : <i className="bi bi-file-earmark-plus"></i>}
            {submitting ? 'Queueing…' : 'Queue Report Job'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Jobs;
