const QueueStatus = ({ name, stats, icon }) => {
  if (!stats) {
    return (
      <div className="card-custom">
        <div className="d-flex align-items-center gap-2 mb-3">
          <i className={`bi ${icon}`} style={{ color: 'var(--accent)', fontSize: '1.1rem' }}></i>
          <span style={{ fontWeight: 600 }}>{name}</span>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          <span className="pulse-dot red me-2"></span> Queue unavailable (Redis offline)
        </div>
      </div>
    );
  }

  const items = [
    { label: 'Waiting', count: stats.waiting, color: 'var(--text-secondary)' },
    { label: 'Active',  count: stats.active,  color: 'var(--info)' },
    { label: 'Done',    count: stats.completed, color: 'var(--success)' },
    { label: 'Failed',  count: stats.failed,   color: 'var(--danger)' },
    { label: 'Delayed', count: stats.delayed,  color: 'var(--warning)' },
  ];

  return (
    <div className="card-custom">
      <div className="d-flex align-items-center gap-2 mb-3">
        <i className={`bi ${icon}`} style={{ color: 'var(--accent)', fontSize: '1.1rem' }}></i>
        <span style={{ fontWeight: 600 }}>{name}</span>
        <span className="pulse-dot green ms-auto"></span>
      </div>
      <div className="d-flex gap-2" style={{ overflowX: 'auto', paddingBottom: '4px', margin: '0 -4px', padding: '0 4px' }}>
        {items.map((item) => (
          <div key={item.label} style={{ flex: '1 0 65px' }}>
            <div
              style={{
                background: 'var(--bg-primary)',
                borderRadius: 8,
                padding: '0.5rem 0.25rem',
                textAlign: 'center',
                height: '100%',
              }}
            >
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: item.color }}>
                {item.count ?? 0}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {item.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QueueStatus;
