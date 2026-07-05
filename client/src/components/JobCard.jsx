const statusMap = {
  waiting:   { cls: 'badge-waiting',   label: 'Waiting' },
  active:    { cls: 'badge-active',    label: 'Active' },
  completed: { cls: 'badge-completed', label: 'Completed' },
  failed:    { cls: 'badge-failed',    label: 'Failed' },
  delayed:   { cls: 'badge-delayed',   label: 'Delayed' },
};

const typeIcon = { email: 'bi-envelope', report: 'bi-file-earmark-bar-graph' };

const JobCard = ({ job }) => {
  const st = statusMap[job.status] || statusMap.waiting;

  return (
    <div className="card-custom mb-3">
      <div className="d-flex align-items-start justify-content-between mb-3">
        <div className="d-flex align-items-center gap-2">
          <div
            style={{
              width: 36, height: 36,
              background: 'var(--accent-light)',
              borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <i className={`bi ${typeIcon[job.type] || 'bi-circle'}`} style={{ color: 'var(--accent)', fontSize: '1rem' }}></i>
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', textTransform: 'capitalize' }}>
              {job.type} Job
            </div>
            <div className="mono" style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
              #{job._id?.slice(-8)}
            </div>
          </div>
        </div>
        <span className={`badge-status ${st.cls}`}>{st.label}</span>
      </div>

      {/* Progress */}
      {['active', 'waiting'].includes(job.status) && (
        <div className="mb-3">
          <div className="d-flex justify-content-between mb-1">
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Progress</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>{job.progress}%</span>
          </div>
          <div className="progress-custom">
            <div className="progress-bar-custom" style={{ width: `${job.progress}%` }}></div>
          </div>
        </div>
      )}

      {/* Data preview */}
      {job.data && (
        <div className="mb-3">
          {job.type === 'email' && job.data.to && (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <i className="bi bi-send me-1"></i> To: {job.data.to}
            </div>
          )}
          {job.type === 'report' && job.data.reportType && (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <i className="bi bi-file-text me-1"></i> {job.data.reportType}
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {job.error && (
        <div className="alert-custom alert-error" style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem' }}>
          <i className="bi bi-exclamation-triangle"></i> {job.error}
        </div>
      )}

      {/* Footer */}
      <div className="d-flex justify-content-between align-items-center" style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          <i className="bi bi-clock me-1"></i>
          {new Date(job.createdAt).toLocaleString()}
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          Attempt {job.attempts}/{job.maxAttempts}
        </div>
      </div>
    </div>
  );
};

export default JobCard;
