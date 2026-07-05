import { useState, useEffect, useCallback } from 'react';
import { jobsApi, logsApi, cacheApi } from '../services/api';
import QueueStatus from '../components/QueueStatus';
import CacheStatus from '../components/CacheStatus';

const Dashboard = () => {
  const [data, setData] = useState({ jobs: null, logs: null, cache: null, health: null });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      const [jobsRes, logsRes, cacheRes] = await Promise.allSettled([
        jobsApi.getAll({ limit: 5 }),
        logsApi.getAll({ limit: 5 }),
        cacheApi.getStats(),
      ]);

      setData({
        jobs: jobsRes.status === 'fulfilled' ? jobsRes.value : null,
        logs: logsRes.status === 'fulfilled' ? logsRes.value : null,
        cache: cacheRes.status === 'fulfilled' ? cacheRes.value?.data : null,
      });
      setLastUpdated(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 15000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const logStats = data.logs?.stats || {};
  const totalLogs = Object.values(logStats).reduce((a, b) => a + (b.count || 0), 0);

  const statCards = [
    {
      label: 'Total Jobs',
      value: data.jobs?.pagination?.total ?? '–',
      icon: 'bi-list-task',
      cls: '',
      sub: `${data.jobs?.data?.filter(j => j.status === 'active').length ?? 0} active`,
    },
    {
      label: 'Cache Hit Rate',
      value: data.cache ? `${data.cache.hitRate}%` : '–',
      icon: 'bi-lightning-charge',
      cls: 'warning',
      sub: `${data.cache?.hits ?? 0} hits / ${data.cache?.misses ?? 0} misses`,
    },
    {
      label: 'Request Logs',
      value: totalLogs || '–',
      icon: 'bi-file-text',
      cls: 'info',
      sub: `${logStats.error?.count ?? 0} errors`,
    },
    {
      label: 'Cache Keys',
      value: data.cache?.redis?.cacheKeys ?? '–',
      icon: 'bi-memory',
      cls: 'success',
      sub: data.cache?.redis?.connected ? 'Redis online' : 'Redis offline',
    },
  ];

  if (loading) {
    return (
      <div className="p-4 d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <div className="loading-spinner" style={{ width: 36, height: 36, borderWidth: 3 }}></div>
          <div style={{ marginTop: 12, color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading dashboard…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 dashboard-header">
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 4 }}>Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
            {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Loading…'}
            &nbsp;· Auto-refresh every 15s
          </p>
        </div>
        <button className="btn-ghost" onClick={fetchAll}>
          <i className="bi bi-arrow-clockwise"></i> Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="row g-3 mb-4">
        {statCards.map((card) => (
          <div key={card.label} className="col-6 col-xl-3">
            <div className={`stat-card ${card.cls}`}>
              <div className="d-flex align-items-start justify-content-between mb-2">
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {card.label}
                </div>
                <i className={`bi ${card.icon}`} style={{ color: 'var(--text-muted)', fontSize: '1rem' }}></i>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1 }}>{card.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{card.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Queue status + Cache */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <QueueStatus
            name="Email Queue"
            stats={data.jobs?.queueStats?.email}
            icon="bi-envelope"
          />
        </div>
        <div className="col-md-4">
          <QueueStatus
            name="Report Queue"
            stats={data.jobs?.queueStats?.report}
            icon="bi-file-earmark-bar-graph"
          />
        </div>
        <div className="col-md-4">
          <CacheStatus data={data.cache} onRefresh={fetchAll} />
        </div>
      </div>

      {/* Recent jobs */}
      <div className="card-custom mb-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h2 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>Recent Jobs</h2>
          <a href="/jobs" style={{ fontSize: '0.8rem', color: 'var(--accent)', textDecoration: 'none' }}>
            View all <i className="bi bi-arrow-right"></i>
          </a>
        </div>
        {data.jobs?.data?.length > 0 ? (
          <div className="table-responsive-custom">
            <table className="table-custom">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {data.jobs.data.slice(0, 5).map((job) => (
                  <tr key={job._id}>
                    <td className="mono">{job._id.slice(-8)}</td>
                    <td style={{ textTransform: 'capitalize' }}>{job.type}</td>
                    <td><span className={`badge-status badge-${job.status}`}>{job.status}</span></td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="progress-custom" style={{ width: 60 }}>
                          <div className="progress-bar-custom" style={{ width: `${job.progress}%` }}></div>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{job.progress}%</span>
                      </div>
                    </td>
                    <td>{new Date(job.createdAt).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            <i className="bi bi-inbox" style={{ fontSize: '2rem', display: 'block', marginBottom: 8 }}></i>
            No jobs yet. Queue one from the Jobs page.
          </div>
        )}
      </div>

      {/* Recent logs */}
      <div className="card-custom">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h2 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>Recent Requests</h2>
          <a href="/logs" style={{ fontSize: '0.8rem', color: 'var(--accent)', textDecoration: 'none' }}>
            View all <i className="bi bi-arrow-right"></i>
          </a>
        </div>
        {data.logs?.data?.length > 0 ? (
          <div className="table-responsive-custom">
            <table className="table-custom">
              <thead>
                <tr><th>Method</th><th>URL</th><th>Status</th><th>Time (ms)</th><th>Level</th></tr>
              </thead>
              <tbody>
                {data.logs.data.slice(0, 5).map((log) => (
                  <tr key={log._id}>
                    <td><span className="mono">{log.method}</span></td>
                    <td className="mono" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.url}</td>
                    <td><span className={`badge-status badge-${log.level}`}>{log.statusCode}</span></td>
                    <td>{log.responseTime}ms</td>
                    <td><span className={`badge-status badge-${log.level}`}>{log.level}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            <i className="bi bi-journal-text" style={{ fontSize: '2rem', display: 'block', marginBottom: 8 }}></i>
            No logs yet. Make some API calls.
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
