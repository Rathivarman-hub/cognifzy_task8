import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import Logs from './pages/Logs';
import Settings from './pages/Settings';
import './index.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter future={{v7_relativeSplatPath:true,v7_startTransition:true}}>
          <div className="app-wrapper">
            {/* Sidebar */}
            <div className={`sidebar ${sidebarOpen ? 'open' : ''}`} id="sidebar">
              <Navbar onMobileClose={() => setSidebarOpen(false)} />
            </div>

            {/* Mobile overlay */}
            {sidebarOpen && (
              <div
                onClick={() => setSidebarOpen(false)}
                style={{
                  position: 'fixed', inset: 0,
                  background: 'rgba(0,0,0,0.5)',
                  zIndex: 99,
                }}
                className="d-md-none"
              />
            )}

            {/* Main */}
            <div className="main-content">
              {/* Top bar */}
              <div className="top-header">
                <button
                  className="mobile-menu-btn btn-ghost"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  style={{ padding: '0.4rem 0.75rem' }}
                >
                  <i className="bi bi-list" style={{ fontSize: '1.2rem' }}></i>
                </button>
                <div className="page-title d-none d-md-block">
                  Cognifyz Advanced Stack
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      background: 'var(--bg-tertiary)',
                      padding: '0.25rem 0.65rem',
                      borderRadius: 999,
                      border: '1px solid var(--border)',
                    }}
                  >
                    <span className="pulse-dot green me-1"></span> v1.0.0
                  </span>
                </div>
              </div>

              {/* Pages */}
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/logs" element={<Logs />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </div>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
