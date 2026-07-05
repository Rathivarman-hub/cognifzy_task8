import { Link } from 'react-router-dom';

const features = [
  { icon: 'bi-list-task', title: 'Bull Job Queue', desc: 'Email & report queues with retry, delay, and progress tracking via Redis + Bull.', color: 'var(--accent)' },
  { icon: 'bi-lightning-charge', title: 'Redis Caching', desc: 'GET response caching with TTL, hit/miss stats, and manual invalidation.', color: 'var(--warning)' },
  { icon: 'bi-file-text', title: 'Request Logging', desc: 'Every HTTP request logged to MongoDB with level, timing, and status.', color: 'var(--info)' },
  { icon: 'bi-shield-check', title: 'Middleware Stack', desc: 'Helmet, CORS, Morgan, compression, rate limiting out of the box.', color: 'var(--success)' },
  { icon: 'bi-graph-up', title: 'Live Dashboard', desc: 'Real-time queue status, cache stats, and server health at a glance.', color: 'var(--danger)' },
  { icon: 'bi-moon-stars', title: 'Night / Light Mode', desc: 'Smooth theme toggle saved to localStorage, applied across all pages.', color: '#a78bfa' },
];

const stack = [
  { label: 'React 18', icon: 'bi-filetype-jsx' },
  { label: 'Vite', icon: 'bi-lightning' },
  { label: 'Bootstrap 5', icon: 'bi-bootstrap' },
  { label: 'Node.js', icon: 'bi-server' },
  { label: 'Express', icon: 'bi-braces' },
  { label: 'MongoDB', icon: 'bi-database' },
  { label: 'Redis', icon: 'bi-memory' },
  { label: 'Bull', icon: 'bi-stack' },
];

const Home = () => {
  return (
    <div className="p-4">
      {/* Hero */}
      <div className="card-custom mb-4" style={{
        background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -60, right: -60,
          width: 250, height: 250, borderRadius: '50%',
          background: 'var(--accent-light)',
          filter: 'blur(40px)',
        }}></div>
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{
              width: 48, height: 48, background: 'var(--accent)',
              borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <i className="bi bi-lightning-charge-fill text-white" style={{ fontSize: '1.4rem' }}></i>
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 2 }}>Cognifyz Advanced</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
                MERN Stack · Bull Queue · Redis · MVC · Middleware
              </p>
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 600, marginBottom: 24, lineHeight: 1.7 }}>
            A production-grade full-stack project demonstrating advanced backend patterns — 
            background job processing, response caching, structured request logging, 
            rate limiting, and a real-time monitoring dashboard.
          </p>
          <div className="d-flex flex-wrap gap-2">
            <Link to="/dashboard" className="btn-accent">
              <i className="bi bi-grid"></i> Open Dashboard
            </Link>
            <Link to="/jobs" className="btn-ghost">
              <i className="bi bi-list-task"></i> View Jobs
            </Link>
            <a
              href="http://localhost:5000/admin/queues"
              target="_blank"
              rel="noreferrer"
              className="btn-ghost"
            >
              <i className="bi bi-layout-text-sidebar"></i> Bull Board
            </a>
          </div>
        </div>
      </div>

      {/* Features */}
      <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16, color: 'var(--text-secondary)' }}>
        Key Features
      </h2>
      <div className="row g-3 mb-4">
        {features.map((f) => (
          <div key={f.title} className="col-md-4 col-sm-6">
            <div className="card-custom h-100">
              <div
                style={{
                  width: 40, height: 40,
                  borderRadius: 10,
                  background: `${f.color}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 12,
                }}
              >
                <i className={`bi ${f.icon}`} style={{ color: f.color, fontSize: '1.1rem' }}></i>
              </div>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 6 }}>{f.title}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tech stack */}
      <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16, color: 'var(--text-secondary)' }}>
        Tech Stack
      </h2>
      <div className="d-flex flex-wrap gap-2">
        {stack.map((t) => (
          <div key={t.label}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '0.5rem 0.875rem',
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: '0.8rem', fontWeight: 500,
            }}
          >
            <i className={`bi ${t.icon}`} style={{ color: 'var(--accent)' }}></i>
            {t.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
