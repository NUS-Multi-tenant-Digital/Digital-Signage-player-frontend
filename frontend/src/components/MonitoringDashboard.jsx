import { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cloud,
  Database,
  FileJson2,
  HardDrive,
  HeartPulse,
  MonitorPlay,
  PlayCircle,
  WifiOff,
} from 'lucide-react';
import { playlistItems } from '../data/playerRuntime';
import { API_MODE } from '../services/playerApi';
import ControlPanel from './ControlPanel';

function formatTime(value) {
  return value ? new Date(value).toLocaleTimeString() : '--';
}

function formatAge(value) {
  if (!value) return '--';
  return `${Math.max(1, Math.round((Date.now() - value) / 1000))}s ago`;
}

function formatBytes(bytes = 0) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function StatusBadge({ online }) {
  return (
    <span className={online ? 'md-badge md-badge-success' : 'md-badge md-badge-warning'}>
      {online ? <Cloud size={14} /> : <WifiOff size={14} />}
      {online ? 'Online' : 'Offline'}
    </span>
  );
}

function SummaryItem({ icon: Icon, label, value, tone = 'neutral' }) {
  return (
    <div className={`md-summary-item ${tone}`}>
      <Icon size={18} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="md-detail-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function normalizeLogEvent(message) {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('simulate offline') || lowerMessage.includes('network disconnected') || lowerMessage.includes('last good manifest')) {
    return 'Network disconnected, switched to cached playback';
  }

  if (lowerMessage.includes('network restored') || lowerMessage.includes('network recovery')) {
    return 'Network restored, cloud sync resumed';
  }

  if (lowerMessage.includes('manifest') && (lowerMessage.includes('synced') || lowerMessage.includes('verified') || lowerMessage.includes('up to date'))) {
    return 'Manifest synced successfully';
  }

  if (lowerMessage.includes('cache') || lowerMessage.includes('media assets')) {
    return 'Media assets verified in local cache';
  }

  if (lowerMessage.includes('download failed') || lowerMessage.includes('failed')) {
    return 'Media download failed, retained previous manifest';
  }

  if (lowerMessage.includes('safe mode') || lowerMessage.includes('fallback')) {
    return 'Fallback playback mode activated';
  }

  if (lowerMessage.includes('command')) {
    return 'Remote device command acknowledged';
  }

  return message;
}

function getLogLevel(message) {
  const lowerMessage = message.toLowerCase();
  return lowerMessage.includes('warning') ||
    lowerMessage.includes('failed') ||
    lowerMessage.includes('disconnected') ||
    lowerMessage.includes('offline') ||
    lowerMessage.includes('safe mode')
    ? 'Warning'
    : 'Info';
}

function StatusModule({ children, icon: Icon, label, status, tone = 'good' }) {
  return (
    <article className={`md-status-module ${tone}`}>
      <div className="md-status-heading">
        <div>
          <Icon size={18} />
          <span>{label}</span>
        </div>
        <strong>{status}</strong>
      </div>
      {children}
    </article>
  );
}

export default function MonitoringDashboard({
  actions,
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
  onOpenLivePreview,
  onPushToScreen,
  runtimeStatus,
}) {
  const [previewAsset, setPreviewAsset] = useState(null);
  const maxCacheMb = manifest?.cache_policy?.max_cache_size_mb || 512;
  const playbackRunning = Boolean(runtimeStatus?.currentMedia) && !runtimeStatus?.safeMode;
  const playlist = [...(manifest?.playback_plan?.scenes || [])].sort((a, b) => a.order - b.order);
  const cacheByAssetId = new Map((cacheIndex || []).map((item) => [item.asset_id, item]));
  const mediaAssets = API_MODE === 'real'
    ? (manifest?.assets || []).map((asset) => {
        const isVideo = String(asset.asset_type || '').toUpperCase().includes('VIDEO');
        const cached = cacheByAssetId.get(asset.asset_id);
        const url = cached?.local_path || asset.file_url || '';
        return {
          asset_id: asset.asset_id,
          cache_key: asset.asset_id,
          file_name: asset.file_name,
          asset_type: isVideo ? 'VIDEO' : 'IMAGE',
          size_bytes: asset.size_bytes || 0,
          url,
          thumbnail_url: isVideo ? '' : url,
          scene_name: asset.file_name,
        };
      })
    : playlistItems.map((item) => ({
        asset_id: item.id,
        cache_key: item.assetId,
        file_name: item.fileName,
        asset_type: item.type === 'video' ? 'VIDEO' : 'IMAGE',
        size_bytes: item.type === 'video' ? 18 * 1024 * 1024 : 420 * 1024,
        url: `${import.meta.env.BASE_URL}${item.videoUrl || item.imageUrl}`,
        thumbnail_url: `${import.meta.env.BASE_URL}${
          item.imageUrl ||
          item.posterUrl ||
          (item.id === 'gucci_demo'
            ? 'images/gucci-demo-poster.png'
            : item.id === 'beijing_promo'
              ? 'images/beijing-promo-poster.png'
              : 'images/coca-cola-promo.png')
        }`,
        scene_name: item.title,
      }));
  const cachedMediaCount = mediaAssets.filter((asset) => cacheIndex.some((item) => item.asset_id === asset.cache_key)).length;
  const cacheReady = cachedMediaCount > 0 && health.missing_required_asset_count === 0;
  const waitingForCache = !cacheReady || !runtimeStatus?.currentMedia;
  const playbackPercent = runtimeStatus?.currentMedia
    ? Math.min((runtimeStatus.mediaProgress / runtimeStatus.currentMedia.durationSec) * 100, 100)
    : 0;
  const criticalCount = emergencyActive || runtimeStatus?.safeMode ? 1 : 0;
  const warningCount = [
    !effectiveOnline,
    !cacheReady,
    waitingForCache || !playbackRunning,
    health.failed_request_count > 0,
    health.missing_required_asset_count > 0,
  ].filter(Boolean).length;
  const activeAlert = criticalCount
    ? 'Emergency or safe mode requires attention'
    : warningCount
      ? 'Warnings detected on this screen'
      : 'No active alerts';
  const systemLogs = [
    { id: 'system_manifest', time: formatTime(lastSyncAt), level: 'Info', event: `Manifest v${manifest?.version || '--'} synced successfully` },
    { id: 'system_cache', time: formatTime(lastSyncAt), level: cacheReady ? 'Info' : 'Warning', event: cacheReady ? `${cacheIndex.length} media assets verified in local cache` : `${health.missing_required_asset_count} required media assets missing from cache` },
    { id: 'system_playback', time: formatTime(Date.now()), level: playbackRunning ? 'Info' : 'Warning', event: playbackRunning ? `Playback started: ${runtimeStatus?.currentMedia?.fileName || '--'}` : 'Player waiting for media cache' },
    { id: 'system_heartbeat', time: formatTime(lastHeartbeatAt), level: effectiveOnline ? 'Info' : 'Warning', event: effectiveOnline ? 'Heartbeat acknowledged by server' : waitingForCache ? 'Device offline, media sync pending' : 'Heartbeat queued while device is offline' },
    ...logs.map((log) => ({
      id: log.id,
      time: log.time,
      level: getLogLevel(log.message),
      event: normalizeLogEvent(log.message),
    })),
  ].filter((log, index, allLogs) => {
    const eventKey = log.event.replace(/^Manifest v\d+\s/, 'Manifest ');
    return allLogs.findIndex((item) => item.event.replace(/^Manifest v\d+\s/, 'Manifest ') === eventKey) === index;
  }).slice(0, 8);
  const getAssetCacheStatus = (asset) => (cacheIndex.some((item) => item.asset_id === asset.cache_key) ? 'Cache Ready' : 'Pending');

  return (
    <main className="md-page">
      <header className="md-header">
        <div>
          <span className="md-kicker">Digital Signage Monitoring</span>
          <h1>Screen Device Status</h1>
        </div>
        <div className="md-header-actions">
          <button className="md-button" type="button" onClick={onOpenLivePreview}>
            Open Live Preview
          </button>
          <button className="md-button md-button-primary" type="button" onClick={onPushToScreen}>
            Push to Screen
          </button>
        </div>
      </header>

      <section className={criticalCount || warningCount ? 'md-issue-summary has-issues' : 'md-issue-summary'}>
        <div>
          <span className="md-kicker">System Health</span>
          <strong>{activeAlert}</strong>
        </div>
        <div className="md-issue-stats">
          <span className={criticalCount ? 'critical active' : 'critical'}><b>{criticalCount}</b> Critical</span>
          <span className={warningCount ? 'warning active' : 'warning'}><b>{warningCount}</b> Warning</span>
          <span className="active-screen"><b>1</b> Active Screen</span>
          <span className="sync-state">Last Sync <b>{formatAge(lastSyncAt)}</b></span>
        </div>
      </section>

      <section className="md-summary" aria-label="Health Summary">
        <SummaryItem icon={Cloud} label="Connection" value={effectiveOnline ? 'Online' : 'Offline'} tone={effectiveOnline ? 'good' : 'warn'} />
        <SummaryItem icon={HeartPulse} label="Heartbeat" value={formatAge(lastHeartbeatAt)} tone="good" />
        <SummaryItem icon={FileJson2} label="Manifest" value={`v${manifest?.version || '--'}`} tone="good" />
        <SummaryItem icon={Database} label="Cache" value={cacheReady ? `${cachedMediaCount}/${mediaAssets.length} Ready` : 'Incomplete'} tone={cacheReady ? 'good' : 'warn'} />
        <SummaryItem icon={HardDrive} label="Storage" value={`${health.used_cache_mb} MB / ${maxCacheMb} MB`} />
        <SummaryItem icon={PlayCircle} label="Playback" value={playbackRunning ? 'Running' : 'Waiting for Cache'} tone={playbackRunning ? 'good' : 'warn'} />
      </section>

      {!effectiveOnline && (
        <section className="md-alert">
          <WifiOff size={18} />
          <div>
            <strong>{waitingForCache ? 'Offline mode: waiting for media cache' : 'Offline playback is active'}</strong>
            <p>
              {waitingForCache
                ? 'The player is showing the welcome screen because no cached media is available. Reconnect and sync media before playback can resume.'
                : 'The player continues with cached content from the last good manifest. Events will sync after reconnection.'}
            </p>
          </div>
        </section>
      )}

      <section className="md-flow-layout">
        <div className="md-flow-main">
          <StatusModule
            icon={Cloud}
            label="Device Health"
            status={effectiveOnline ? 'Normal' : 'Offline'}
            tone={effectiveOnline ? 'good' : 'warn'}
          >
            <div className="md-flow-details">
              <DetailRow label="Connection" value={effectiveOnline ? 'Online' : 'Offline'} />
              <DetailRow label="Heartbeat" value={formatAge(lastHeartbeatAt)} />
              <DetailRow label="Storage" value={`${health.used_cache_mb} MB / ${maxCacheMb} MB`} />
            </div>
          </StatusModule>

          <StatusModule
            icon={MonitorPlay}
            label="Runtime Playback"
            status={playbackRunning ? 'Running' : 'Waiting for Cache'}
            tone={playbackRunning ? 'good' : 'warn'}
          >
            <div className="md-now-playing">
              <MonitorPlay size={34} />
              <div>
                <strong>{runtimeStatus?.currentMedia?.fileName || '--'}</strong>
                <span>{runtimeStatus?.activeSchedule?.label || '--'} · {runtimeStatus?.activeLayoutName || '--'}</span>
              </div>
            </div>
            <div className="md-progress">
              <span style={{ width: `${playbackPercent}%` }} />
            </div>
            <div className="md-flow-details">
              <DetailRow label="Next Media" value={runtimeStatus?.nextMedia?.fileName || '--'} />
              <DetailRow label="Progress" value={`${Math.round(playbackPercent)}%`} />
              <DetailRow label="Last Sync" value={formatTime(lastSyncAt)} />
            </div>
          </StatusModule>

          <StatusModule icon={FileJson2} label="Manifest" status={`v${manifest?.version || '--'} synced`}>
            <div className="md-manifest-meta">
              <DetailRow label="Layout" value={runtimeStatus?.activeLayoutName || '--'} />
              <DetailRow label="Playlist" value={manifest?.playback_plan?.plan_id || '--'} />
              <DetailRow label="Scenes" value={playlist.length} />
              <DetailRow label="Status" value="Synced" />
            </div>
            <div className="md-list">
              {playlist.map((scene) => (
                <div className="md-list-item" key={scene.scene_id}>
                  <div>
                    <strong>{scene.scene_name}</strong>
                    <span>Duration: {Math.round(scene.duration_ms / 1000)}s · Slots: {scene.slot_bindings.length}</span>
                  </div>
                  <CheckCircle2 size={16} />
                </div>
              ))}
            </div>
          </StatusModule>

          <StatusModule
            icon={Database}
            label="Media Cache"
            status={cacheReady ? 'Ready' : 'Incomplete'}
            tone={cacheReady ? 'good' : 'warn'}
          >
            <div className="md-pipeline">
              <div className="done"><Activity size={16} /><strong>Downloaded</strong><span>{cachedMediaCount} playback assets indexed</span></div>
              <div className={cacheReady ? 'done' : 'warn'}><CheckCircle2 size={16} /><strong>Cache Ready</strong><span>{cacheReady ? 'All media available' : `${health.missing_required_asset_count} missing`}</span></div>
              <div className={playbackRunning ? 'done' : 'warn'}><PlayCircle size={16} /><strong>Playback Started</strong><span>{runtimeStatus?.currentMedia?.fileName || '--'}</span></div>
            </div>
            <div className="md-asset-table" role="table" aria-label="Media cache assets">
              <div className="md-asset-row md-asset-head" role="row">
                <span role="columnheader">Thumbnail</span>
                <span role="columnheader">Asset Name</span>
                <span role="columnheader">Type</span>
                <span role="columnheader">Size</span>
                <span role="columnheader">Status</span>
              </div>
              {mediaAssets.map((asset) => {
                const cacheStatus = getAssetCacheStatus(asset);
                return (
                  <button className="md-asset-row" key={asset.asset_id} type="button" role="row" onClick={() => setPreviewAsset(asset)}>
                    <span className="md-asset-thumb" role="cell">
                      {asset.thumbnail_url ? <img src={asset.thumbnail_url} alt={`${asset.file_name} thumbnail`} /> : <FileJson2 size={18} />}
                    </span>
                    <strong role="cell">{asset.file_name}</strong>
                    <span role="cell">{asset.asset_type}</span>
                    <span role="cell">{formatBytes(asset.size_bytes)}</span>
                    <em className={cacheStatus === 'Cache Ready' ? 'ready' : 'pending'} role="cell">{cacheStatus}</em>
                  </button>
                );
              })}
            </div>
          </StatusModule>

          <StatusModule icon={Activity} label="Playback Logs" status={`${logs.length} recent events`}>
            <div className="md-log-table" role="table" aria-label="Playback event logs">
              <div className="md-log-row md-log-head" role="row">
                <span role="columnheader">Time</span>
                <span role="columnheader">Level</span>
                <span role="columnheader">Event</span>
              </div>
              {systemLogs.map((log) => (
                <div className="md-log-row" role="row" key={log.id}>
                  <time role="cell">{log.time}</time>
                  <span className={log.level === 'Warning' ? 'md-log-level warning' : 'md-log-level'} role="cell">
                    {log.level}
                  </span>
                  <p role="cell">{log.event}</p>
                </div>
              ))}
            </div>
          </StatusModule>
        </div>

        <aside className="md-flow-sidebar">
          <article className={criticalCount || warningCount ? 'md-card md-alerts-card has-issues' : 'md-card md-alerts-card'}>
            <div className="md-card-title">
              <span>Alerts</span>
              <small>{criticalCount || warningCount ? 'Needs review' : 'All clear'}</small>
            </div>
            <div className="md-alert-state">
              <AlertTriangle size={18} />
              <div>
                <strong>{activeAlert}</strong>
                <p>{criticalCount || warningCount ? 'Review the affected status modules below.' : 'No active alerts for this screen.'}</p>
              </div>
            </div>
          </article>

          <article className="md-card md-device-card">
            <div className="md-card-title">
              <span>Screen Context</span>
              <StatusBadge online={effectiveOnline} />
            </div>
            <h2>{device?.device_name || 'Lobby-TV-01'}</h2>
            <p>Android TV · {device?.location_id || 'orchard_lobby'}</p>
            <div className="md-detail-list">
              <DetailRow label="Screen Group" value="Lobby Screens" />
              <DetailRow label="IP Address" value="192.168.10.24" />
              <DetailRow label="App Version" value="1.2.0" />
              <DetailRow label="Last Seen" value={formatAge(lastHeartbeatAt)} />
              <DetailRow label="Safe Mode" value={runtimeStatus?.safeMode ? 'Active' : 'Standby'} />
              <DetailRow label="Last Command" value={lastCommand?.type?.replace('COMMAND_', '') || '--'} />
            </div>
            {(emergencyActive || runtimeStatus?.fallbackReason) && (
              <div className="md-warning-note">
                <AlertTriangle size={15} />
                {emergencyActive ? 'Emergency override is active.' : runtimeStatus.fallbackReason}
              </div>
            )}
          </article>

          <article className="md-card md-actions-card">
            <div className="md-card-title">
              <span>Device Actions</span>
              <small>Grouped by risk</small>
            </div>
            <ControlPanel {...actions} />
          </article>
        </aside>
      </section>

      {previewAsset && (
        <div className="md-preview-backdrop" role="presentation" onClick={() => setPreviewAsset(null)}>
          <section className="md-preview-dialog" role="dialog" aria-modal="true" aria-label="Asset Preview" onClick={(event) => event.stopPropagation()}>
            <div className="md-card-title">
              <span>Asset Preview</span>
              <button type="button" onClick={() => setPreviewAsset(null)}>Close</button>
            </div>
            <div className="md-preview-image">
              {previewAsset.asset_type === 'VIDEO' ? (
                <video src={previewAsset.url} poster={previewAsset.thumbnail_url} controls muted playsInline />
              ) : previewAsset.url ? (
                <img src={previewAsset.url} alt={previewAsset.file_name} />
              ) : (
                <FileJson2 size={34} />
              )}
            </div>
            <div className="md-detail-list">
              <DetailRow label="File Name" value={previewAsset.file_name} />
              <DetailRow label="Size" value={formatBytes(previewAsset.size_bytes)} />
              <DetailRow label="Cache Status" value={getAssetCacheStatus(previewAsset)} />
              <DetailRow label="Used In Scene" value={previewAsset.scene_name} />
              <DetailRow label="Download Status" value={getAssetCacheStatus(previewAsset) === 'Cache Ready' ? 'Verified' : 'Pending download'} />
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
