import { Activity, Cloud, Database, HeartPulse, Radio, ShieldAlert, WifiOff } from 'lucide-react';

function formatTime(value) {
  return value ? new Date(value).toLocaleTimeString() : '--';
}

export default function StatusPanel({
  cacheIndex,
  device,
  effectiveOnline,
  emergencyActive,
  health,
  lastCommand,
  lastHeartbeatAt,
  lastSyncAt,
  logs,
  manifest,
  runtimeStatus,
}) {
  return (
    <aside className="status-panel">
      <div className="panel-card identity-card">
        <div>
          <span className="eyebrow">Edge Device</span>
          <h2>{device?.device_name || 'Lobby-TV-01'}</h2>
          <p>{device?.location_id || 'orchard_lobby'} · Android TV Mock</p>
        </div>
        <div className={effectiveOnline ? 'status-pill online' : 'status-pill offline'}>
          {effectiveOnline ? <Cloud size={16} /> : <WifiOff size={16} />}
          {effectiveOnline ? 'Online' : 'Offline'}
        </div>
      </div>

      <div className="metric-grid">
        <div className="metric-card">
          <HeartPulse size={18} />
          <span>Heartbeat</span>
          <strong>{formatTime(lastHeartbeatAt)}</strong>
        </div>
        <div className="metric-card">
          <Radio size={18} />
          <span>Manifest</span>
          <strong>{manifest ? `v${manifest.version}` : '--'}</strong>
        </div>
        <div className="metric-card">
          <Database size={18} />
          <span>Cached</span>
          <strong>{cacheIndex.length} assets</strong>
        </div>
        <div className="metric-card">
          <Activity size={18} />
          <span>Last Sync</span>
          <strong>{formatTime(lastSyncAt)}</strong>
        </div>
      </div>

      <div className="panel-card">
        <div className="section-title">
          <span>Runtime Playback</span>
          <small>{runtimeStatus?.simulatedTime || '--'}</small>
        </div>
        <div className="health-row">
          <span>Schedule</span>
          <strong>{runtimeStatus?.activeSchedule?.label || '--'}</strong>
        </div>
        <div className="health-row">
          <span>Layout</span>
          <strong>{runtimeStatus?.activeLayout || '--'}</strong>
        </div>
        <div className="health-row">
          <span>Current Media</span>
          <strong>{runtimeStatus?.currentMedia?.fileName || '--'}</strong>
        </div>
        <div className="health-row">
          <span>Next Media</span>
          <strong>{runtimeStatus?.nextMedia?.fileName || '--'}</strong>
        </div>
        <div className="progress-bar">
          <span
            style={{
              width: runtimeStatus?.currentMedia
                ? `${Math.min((runtimeStatus.mediaProgress / runtimeStatus.currentMedia.durationSec) * 100, 100)}%`
                : '0%',
            }}
          />
        </div>
      </div>

      <div className="panel-card">
        <div className="section-title">
          <span>Reliability</span>
          {emergencyActive && (
            <strong className="alert-label">
              <ShieldAlert size={14} /> Emergency
            </strong>
          )}
        </div>
        <div className="health-row">
          <span>Cache Usage</span>
          <strong>{health.used_cache_mb} MB / {manifest?.cache_policy?.max_cache_size_mb || 512} MB</strong>
        </div>
        <div className="progress-bar">
          <span style={{ width: `${Math.min((health.used_cache_mb / (manifest?.cache_policy?.max_cache_size_mb || 512)) * 100, 100)}%` }} />
        </div>
        <div className="health-row">
          <span>Missing Required Assets</span>
          <strong>{health.missing_required_asset_count}</strong>
        </div>
        <div className="health-row">
          <span>Last Remote Command</span>
          <strong>{lastCommand?.type?.replace('COMMAND_', '') || '--'}</strong>
        </div>
        <div className="health-row">
          <span>Safe Mode</span>
          <strong>{runtimeStatus?.safeMode ? 'Active' : 'Standby'}</strong>
        </div>
        {runtimeStatus?.fallbackReason && (
          <div className="safe-note">
            {runtimeStatus.fallbackReason}
          </div>
        )}
      </div>

      <div className="panel-card">
        <div className="section-title">
          <span>Player Events</span>
          <small>local + mock API</small>
        </div>
        <div className="event-log">
          {logs.map((log) => (
            <div className="event-item" key={log.id}>
              <span>{log.time}</span>
              <p>{log.message}</p>
            </div>
          ))}
          {!logs.length && <p className="empty-log">Waiting for player events...</p>}
        </div>
      </div>
    </aside>
  );
}
