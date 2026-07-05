import { NavLink } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const navItems = [
  { to: '/', label: 'Home', icon: 'bi-house', exact: true },
  { to: '/dashboard', label: 'Dashboard', icon: 'bi-grid' },
  { to: '/jobs', label: 'Job Queue', icon: 'bi-list-task' },
  { to: '/logs', label: 'Logs', icon: 'bi-file-text' },
  { to: '/settings', label: 'Settings', icon: 'bi-gear' },
];

const Navbar = ({ onMobileClose }) => {
  return (
    <nav className="d-flex flex-column h-100 w-100">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="d-flex align-items-center gap-2 mb-1">
          <div
            style={{
              width: 32, height: 32,
              background: 'var(--accent)',
              borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16,
            }}
          >
            <i className="bi bi-lightning-charge-fill text-white"></i>
          </div>
          <div>
            <div className="brand-name">Cognifyz</div>
            <div className="brand-sub">Advanced Stack</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-grow-1 py-2">
        <div className="nav-section-label">Main</div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) =>
              `sidebar-nav-link ${isActive ? 'active' : ''}`
            }
            onClick={onMobileClose}
          >
            <i className={`bi ${item.icon}`} style={{ fontSize: '1rem', width: 18 }}></i>
            {item.label}
          </NavLink>
        ))}

        <div className="nav-section-label mt-3">External</div>
        <a
          href="http://localhost:5000/admin/queues"
          target="_blank"
          rel="noreferrer"
          className="sidebar-nav-link"
        >
          <i className="bi bi-layout-text-sidebar" style={{ fontSize: '1rem', width: 18 }}></i>
          Bull Board
          <i className="bi bi-box-arrow-up-right ms-auto" style={{ fontSize: '0.65rem' }}></i>
        </a>
        <a
          href="http://localhost:5000/health"
          target="_blank"
          rel="noreferrer"
          className="sidebar-nav-link"
        >
          <i className="bi bi-heart-pulse" style={{ fontSize: '1rem', width: 18 }}></i>
          Health Check
          <i className="bi bi-box-arrow-up-right ms-auto" style={{ fontSize: '0.65rem' }}></i>
        </a>
      </div>

      {/* Footer */}
      <div className="p-3 border-top" style={{ borderColor: 'var(--border)' }}>
        <div className="d-flex align-items-center justify-content-between">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span className="pulse-dot green me-1"></span>
            System Online
          </div>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
