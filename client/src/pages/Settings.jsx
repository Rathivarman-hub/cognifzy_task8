import { useTheme } from '../context/ThemeContext';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();

  const envInfo = [
    { label: 'API URL', value: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' },
    { label: 'Environment', value: import.meta.env.MODE || 'development' },
    { label: 'React Version', value: '18.x' },
    { label: 'Vite Version', value: '5.x' },
  ];

  const serverInfo = [
    { label: 'Server Port', value: '5000' },
    { label: 'DB', value: 'MongoDB (Mongoose)' },
    { label: 'Cache', value: 'Redis (ioredis)' },
    { label: 'Queue', value: 'Bull + Bull Board' },
  ];

  return (
    <div className="p-4">
      <div className="mb-4">
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 4 }}>Settings</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
          Application preferences and environment info
        </p>
      </div>

      {/* Appearance */}
      <div className="card-custom mb-4">
        <h2 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 16 }}>
          <i className="bi bi-palette me-2 text-accent"></i>Appearance
        </h2>
        <div className="d-flex align-items-center justify-content-between p-3 settings-theme-row"
          style={{ background: 'var(--bg-primary)', borderRadius: 8, border: '1px solid var(--border)' }}
        >
          <div>
            <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>Theme</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Currently using <strong style={{ color: 'var(--accent)' }}>{theme}</strong> mode
            </div>
          </div>
          <button className="btn-accent" onClick={toggleTheme}>
            <i className={`bi ${theme === 'dark' ? 'bi-sun' : 'bi-moon'}`}></i>
            Switch to {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>

        <div className="row g-3 mt-1">
          {[
            { name: 'Dark Mode', bg: '#0f172a', card: '#1e293b', accent: '#6366f1' },
            { name: 'Light Mode', bg: '#f8fafc', card: '#ffffff', accent: '#4f46e5' },
          ].map((t) => (
            <div key={t.name} className="col-sm-6">
              <div style={{
                background: t.bg, borderRadius: 10, padding: '0.875rem',
                border: `2px solid ${theme === (t.name.includes('Dark') ? 'dark' : 'light') ? 'var(--accent)' : 'transparent'}`,
              }}>
                <div style={{ background: t.card, borderRadius: 6, padding: '0.5rem', marginBottom: 6 }}>
                  <div style={{ height: 6, width: '60%', background: t.accent, borderRadius: 3, marginBottom: 4 }}></div>
                  <div style={{ height: 4, width: '80%', background: t.accent + '40', borderRadius: 2 }}></div>
                </div>
                <div style={{ fontSize: '0.75rem', color: t.name.includes('Dark') ? '#94a3b8' : '#475569', textAlign: 'center' }}>
                  {t.name}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="card-custom mb-4">
        <h2 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 16 }}>
          <i className="bi bi-link-45deg me-2 text-accent"></i>Quick Links
        </h2>
        <div className="d-flex flex-wrap gap-2 settings-links">
          {[
            { label: 'Bull Board', url: 'http://localhost:5000/admin/queues', icon: 'bi-layout-text-sidebar' },
            { label: 'API Health', url: 'http://localhost:5000/health', icon: 'bi-heart-pulse' },
            { label: 'Jobs API', url: 'http://localhost:5000/api/jobs', icon: 'bi-braces' },
            { label: 'Logs API', url: 'http://localhost:5000/api/logs', icon: 'bi-file-text' },
            { label: 'Cache Stats', url: 'http://localhost:5000/api/cache/stats', icon: 'bi-lightning-charge' },
          ].map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost"
              style={{ textDecoration: 'none' }}
            >
              <i className={`bi ${link.icon}`}></i>
              {link.label}
              <i className="bi bi-box-arrow-up-right" style={{ fontSize: '0.65rem' }}></i>
            </a>
          ))}
        </div>
      </div>

      {/* Environment info */}
      <div className="row g-3">
        <div className="col-md-6">
          <div className="card-custom">
            <h2 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 16 }}>
              <i className="bi bi-display me-2 text-accent"></i>Client Info
            </h2>
            {envInfo.map((item) => (
              <div key={item.label} className="d-flex justify-content-between py-2"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.label}</span>
                <span className="mono" style={{ fontSize: '0.8rem' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="col-md-6">
          <div className="card-custom">
            <h2 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 16 }}>
              <i className="bi bi-server me-2 text-accent"></i>Server Info
            </h2>
            {serverInfo.map((item) => (
              <div key={item.label} className="d-flex justify-content-between py-2"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.label}</span>
                <span className="mono" style={{ fontSize: '0.8rem' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
