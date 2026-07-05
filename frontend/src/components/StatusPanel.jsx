import {
  Activity,
  CheckCircle2,
  Cloud,
  FileJson2,
  HardDrive,
  HeartPulse,
  ListVideo,
  PlayCircle,
  ShieldAlert,
  WifiOff,
} from 'lucide-react';
import { layoutTemplates } from '../data/playerRuntime';

function formatTime(value) {
  return value ? new Date(value).toLocaleTimeString() : '--';
}

function formatAge(value) {
  if (!value) return '--';
  return `${Math.max(1, Math.round((Date.now() - value) / 1000))}s ago`;
}

function formatBytes(bytes = 0) {
  if (!bytes) return '0 KB';
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.ceil(bytes / 1024)} KB`;
}

function getManifestPlaylist(manifest) {
  return [...(manifest?.playback_plan?.scenes || [])].sort((a, b) => a.order - b.order);
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
  const playlist = getManifestPlaylist(manifest);
  const maxCacheMb = manifest?.cache_policy?.max_cache_size_mb || 512;
  const diskUsagePercent = Math.min((health.used_cache_mb / maxCacheMb) * 100, 100);
  const cacheReady = Boolean(cacheIndex.length) && health.missing_required_asset_count === 0;
  const playbackStarted = Boolean(runtimeStatus?.currentMedia) && !runtimeStatus?.safeMode;
  const manifestLayout = runtimeStatus?.activeLayoutName || layoutTemplates[runtimeStatus?.activeLayout]?.name || '--';
  const mediaAssets = manifest?.assets || [];
  const syncActive = runtimeStatus?.syncState?.active;

  return (
    <aside className="status-panel">
      <div className="panel-card identity-card device-card">
        <div>
          <span className="eyebrow">Device Information</span>
          <h2>{device?.device_name || 'Lobby-TV-01'}</h2>
          <p>Android TV · {device?.location_id || 'orchard_lobby'}</p>
          <div className="device-details">
            <div><span>Status</span><strong>{effectiveOnline ? 'Online' : 'Offline'}</strong></div>
            <div><span>Screen Group</span><strong>Lobby Screens</strong></div>
            <div><span>IP Address</span><strong>192.168.10.24</strong></div>
            <div><span>App Version</span><strong>1.2.0</strong></div>
            <div><span>Last Seen</span><strong>{formatAge(lastHeartbeatAt)}</strong></div>
          </div>
        </div>
        <div className={effectiveOnline ? 'status-pill online' : 'status-pill offline'}>
          {effectiveOnline ? <Cloud size={16} /> : <WifiOff size={16} />}
          {effectiveOnline ? 'Online' : 'Offline'}
        </div>
      </div>

      <div className="panel-card health-summary-card">
        <div className="section-title">
          <span>Device Health</span>
          <small>{effectiveOnline && cacheReady && playbackStarted ? 'Normal' : 'Needs attention'}</small>
        </div>
        <div className="health-summary-grid">
          <div><Cloud size={16} /><span>Connection</span><strong>{effectiveOnline ? 'Online' : 'Offline'}</strong></div>
          <div><HeartPulse size={16} /><span>Heartbeat</span><strong>{formatAge(lastHeartbeatAt)}</strong></div>
          <div><FileJson2 size={16} /><span>Manifest</span><strong>{manifest ? `v${manifest.version} synced` : '--'}</strong></div>
          <div><CheckCircle2 size={16} /><span>Media Cache</span><strong>{cacheReady ? '100% ready' : 'Incomplete'}</strong></div>
          <div><HardDrive size={16} /><span>Storage</span><strong>{health.used_cache_mb} MB / {maxCacheMb} MB</strong></div>
          <div><PlayCircle size={16} /><span>Playback</span><strong>{playbackStarted ? 'Running' : 'Paused'}</strong></div>
        </div>
      </div>

      {!effectiveOnline && (
        <div className="panel-card offline-card">
          <div>
            <WifiOff size={18} />
            <strong>Offline Playback Active</strong>
          </div>
          <p>Player continues playing cached content from the last good manifest. Heartbeats and events will be queued locally until reconnection.</p>
        </div>
      )}

      <div className="panel-card manifest-card">
        <div className="section-title">
          <span>Current Manifest</span>
          <small>Configuration and playback plan</small>
        </div>
        <div className="health-row">
          <span>Version</span>
          <strong>{manifest ? `v${manifest.version}` : '--'}</strong>
        </div>
        <div className="health-row">
          <span>Layout</span>
          <strong>{manifestLayout}</strong>
        </div>
        <div className="health-row">
          <span>Playlist</span>
          <strong>{manifest?.playback_plan?.plan_id || '--'}</strong>
        </div>
        <div className="health-row">
          <span>Status</span>
          <strong>Synced</strong>
        </div>
        <div className="manifest-list">
          {playlist.map((scene) => (
            <div className="manifest-scene" key={scene.scene_id}>
              <div>
                <ListVideo size={15} />
                <strong>{scene.scene_name}</strong>
              </div>
              <span>Duration: {Math.round(scene.duration_ms / 1000)}s · Slots: {scene.slot_bindings.length}</span>
            </div>
          ))}
          {!playlist.length && <p className="empty-log">Waiting for manifest...</p>}
        </div>
      </div>

      <div className="panel-card cache-card">
        <div className="section-title">
          <span>Media Download & Cache Status</span>
          <small>Media Sync Pipeline</small>
        </div>
        <div className="cache-flow">
          <div className={syncActive ? 'cache-step active' : 'cache-step done'}>
            <Activity size={16} />
            <strong>1. Downloaded</strong>
            <span>{syncActive ? runtimeStatus.syncState.title : `${cacheIndex.length} assets indexed`}</span>
          </div>
          <div className={cacheReady ? 'cache-step done' : 'cache-step'}>
            <CheckCircle2 size={16} />
            <strong>2. Cache Ready</strong>
            <span>{cacheReady ? 'All required media available' : `${health.missing_required_asset_count} required missing`}</span>
          </div>
          <div className={playbackStarted ? 'cache-step done' : 'cache-step'}>
            <PlayCircle size={16} />
            <strong>3. Playback Started</strong>
            <span>{runtimeStatus?.currentMedia?.fileName || '--'}</span>
          </div>
        </div>
        <div className="media-cache-list">
          {mediaAssets.map((asset) => {
            const cached = cacheIndex.find((item) => item.asset_id === asset.asset_id);
            return (
              <div className="media-cache-item" key={asset.asset_id}>
                <div>
                  <FileJson2 size={15} />
                  <strong>{asset.file_name}</strong>
                  <span>{asset.asset_type.replace('ASSET_', '')} · {formatBytes(asset.size_bytes)}</span>
                </div>
                <em className={cached ? 'ready' : asset.required ? 'pending' : 'optional'}>
                  {cached ? 'Cache ready' : asset.required ? 'Pending download' : 'Optional'}
                </em>
              </div>
            );
          })}
        </div>
      </div>

      <div className="panel-card runtime-card">
        <div className="section-title">
          <span>Runtime Playback</span>
          <small>{runtimeStatus?.simulatedTime || '--'} · Last sync {formatTime(lastSyncAt)}</small>
        </div>
        <div className="health-row">
          <span>Schedule</span>
          <strong>{runtimeStatus?.activeSchedule?.label || '--'}</strong>
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

      <div className="panel-card reliability-card">
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
          <strong>{health.used_cache_mb} MB / {maxCacheMb} MB</strong>
        </div>
        <div className="progress-bar">
          <span style={{ width: `${diskUsagePercent}%` }} />
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

      <div className="panel-card events-card">
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
