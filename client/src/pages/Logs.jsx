import { useState, useEffect, useCallback } from 'react';
import { logsApi } from '../services/api';

const levelColor = { info: 'var(--info)', warn: 'var(--warning)', error: 'var(--danger)' };
const methodColor = {
  GET: 'var(--success)', POST: 'var(--info)',
  PUT: 'var(--warning)', DELETE: 'var(--danger)', PATCH: '#a78bfa',
};

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({});
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [filter, setFilter] = useState({ level: '', method: '' });
  const [page, setPage] = useState(1);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 25 };
      if (filter.level) params.level = filter.level;
      if (filter.method) params.method = filter.method;
      const res = await logsApi.getAll(params);
      setLogs(res.data || []);
      setStats(res.stats || {});
      setPagination(res.pagination || {});
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => {
    fetchLogs();
    const id = setInterval(fetchLogs, 20000);
    return () => clearInterval(id);
  }, [fetchLogs]);

  const handleClear = async () => {
    if (!window.confirm('Clear all logs? This cannot be undone.')) return;
    setClearing(true);
    try {
      await logsApi.clear();
      fetchLogs();
    } catch (e) {
      console.error(e);
    } finally {
      setClearing(false);
    }
  };


  return (
    <div className="p-4">
      <div className="d-flex align-items-center justify-content-between mb-4 logs-header">
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 4 }}>Request Logs</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
            {pagination.total ?? 0} total entries · Page {pagination.page}/{pagination.pages || 1}
          </p>
        </div>
        <div className="d-flex gap-2 logs-actions">
          <button className="btn-ghost" onClick={fetchLogs}>
            <i className="bi bi-arrow-clockwise"></i>
          </button>
          <button className="btn-danger" onClick={handleClear} disabled={clearing}>
            {clearing ? <span className="loading-spinner"></span> : <i className="bi bi-trash"></i>}
            Clear
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="row g-3 mb-4 logs-stats">
        {[
          { key: 'info',  label: 'Info',   icon: 'bi-info-circle', color: 'var(--info)' },
          { key: 'warn',  label: 'Warn',   icon: 'bi-exclamation-triangle', color: 'var(--warning)' },
          { key: 'error', label: 'Errors', icon: 'bi-x-circle', color: 'var(--danger)' },
        ].map((item) => (
          <div key={item.key} className="col-4">
            <div className="stat-card" style={{ '--accent': item.color, padding: '1rem 0.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: item.color }}>
                {stats[item.key]?.count ?? 0}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                avg {stats[item.key]?.avgResponseTime ?? 0}ms
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card-custom mb-4">
        <div className="row g-3">
          <div className="col-sm-4">
            <label className="form-label-custom">Filter by Level</label>
            <select
              className="form-control-custom"
              value={filter.level}
              onChange={(e) => { setFilter((p) => ({ ...p, level: e.target.value })); setPage(1); }}
            >
              <option value="" style={{ background: 'var(--bg-secondary)' }}>All Levels</option>
              {['info', 'warn', 'error'].map((l) => (
                <option key={l} value={l} style={{ background: 'var(--bg-secondary)' }}>{l.toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div className="col-sm-4">
            <label className="form-label-custom">Filter by Method</label>
            <select
              className="form-control-custom"
              value={filter.method}
              onChange={(e) => { setFilter((p) => ({ ...p, method: e.target.value })); setPage(1); }}
            >
              <option value="" style={{ background: 'var(--bg-secondary)' }}>All Methods</option>
              {['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map((m) => (
                <option key={m} value={m} style={{ background: 'var(--bg-secondary)' }}>{m}</option>
              ))}
            </select>
          </div>
          <div className="col-sm-4 d-flex align-items-end">
            <button
              className="btn-ghost w-100"
              onClick={() => { setFilter({ level: '', method: '' }); setPage(1); }}
            >
              <i className="bi bi-x-circle"></i> Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card-custom mb-4">
        {loading ? (
          <div className="text-center py-5">
            <div className="loading-spinner"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-journal-text" style={{ fontSize: '3rem', color: 'var(--text-muted)', display: 'block', marginBottom: 12 }}></i>
            <p style={{ color: 'var(--text-muted)' }}>No logs found for the current filter.</p>
          </div>
        ) : (
          <div className="table-responsive-custom">
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Method</th>
                  <th>URL</th>
                  <th>Status</th>
                  <th>ms</th>
                  <th>Level</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td className="mono" style={{ whiteSpace: 'nowrap', fontSize: '0.75rem' }}>
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </td>
                    <td>
                      <span
                        className="mono"
                        style={{
                          color: methodColor[log.method] || 'var(--text-secondary)',
                          fontWeight: 600, fontSize: '0.75rem',
                        }}
                      >
                        {log.method}
                      </span>
                    </td>
                    <td
                      className="mono"
                      style={{
                        maxWidth: 220, overflow: 'hidden',
                        textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        fontSize: '0.75rem',
                      }}
                      title={log.url}
                    >
                      {log.url}
                    </td>
                    <td>
                      <span
                        style={{
                          color: log.statusCode >= 500 ? 'var(--danger)'
                            : log.statusCode >= 400 ? 'var(--warning)'
                            : 'var(--success)',
                          fontWeight: 600, fontSize: '0.8rem',
                        }}
                      >
                        {log.statusCode}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>{log.responseTime}</td>
                    <td>
                      <span
                        className="badge-status"
                        style={{
                          background: `${levelColor[log.level]}20`,
                          color: levelColor[log.level],
                        }}
                      >
                        {log.level}
                      </span>
                    </td>
                    <td className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {log.ip || '–'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="d-flex justify-content-center gap-2 mt-4">
          <button
            className="btn-ghost"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            style={{ padding: '0.4rem 0.875rem' }}
          >
            <i className="bi bi-chevron-left"></i>
          </button>
          <span style={{ padding: '0.4rem 1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            {page} / {pagination.pages}
          </span>
          <button
            className="btn-ghost"
            disabled={page >= pagination.pages}
            onClick={() => setPage((p) => p + 1)}
            style={{ padding: '0.4rem 0.875rem' }}
          >
            <i className="bi bi-chevron-right"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default Logs;

