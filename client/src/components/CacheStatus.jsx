import { useState } from 'react';
import { cacheApi } from '../services/api';

const CacheStatus = ({ data, onRefresh }) => {
  const [clearing, setClearing] = useState(false);
  const [msg, setMsg] = useState(null);

  const handleClear = async () => {
    setClearing(true);
    setMsg(null);
    try {
      const res = await cacheApi.clear();
      setMsg({ type: 'success', text: res.message });
      onRefresh?.();
    } catch (e) {
      setMsg({ type: 'error', text: e.message });
    } finally {
      setClearing(false);
    }
  };

  const hitRate = data?.hitRate ?? 0;
  const connected = data?.redis?.connected ?? false;

  return (
    <div className="card-custom">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-lightning-charge" style={{ color: 'var(--warning)', fontSize: '1.1rem' }}></i>
          <span style={{ fontWeight: 600 }}>Redis Cache</span>
        </div>
        <span className={`pulse-dot ${connected ? 'green' : 'red'}`}></span>
      </div>

      {!connected ? (
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Redis not connected
        </div>
      ) : (
        <>
          {/* Hit rate meter */}
          <div className="mb-3">
            <div className="d-flex justify-content-between mb-1">
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hit Rate</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: hitRate > 50 ? 'var(--success)' : 'var(--warning)' }}>
                {hitRate}%
              </span>
            </div>
            <div className="progress-custom">
              <div
                className="progress-bar-custom"
                style={{
                  width: `${hitRate}%`,
                  background: hitRate > 50 ? 'var(--success)' : 'var(--warning)',
                }}
              ></div>
            </div>
          </div>

          <div className="row g-2 mb-3">
            {[
              { label: 'Hits',   val: data?.hits ?? 0,   color: 'var(--success)' },
              { label: 'Misses', val: data?.misses ?? 0, color: 'var(--danger)' },
              { label: 'Keys',   val: data?.redis?.cacheKeys ?? 0, color: 'var(--info)' },
            ].map((item) => (
              <div key={item.label} className="col-4">
                <div style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: '0.5rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: item.color }}>{item.val}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{item.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="d-flex gap-2">
            <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={onRefresh}>
              <i className="bi bi-arrow-clockwise"></i> Refresh
            </button>
            <button className="btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={handleClear} disabled={clearing}>
              {clearing ? <span className="loading-spinner"></span> : <i className="bi bi-trash"></i>}
              {clearing ? 'Clearing…' : 'Clear'}
            </button>
          </div>

          {msg && (
            <div className={`alert-custom alert-${msg.type === 'success' ? 'success' : 'error'} mt-2`}>
              {msg.text}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CacheStatus;
