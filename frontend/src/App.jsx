import { useEffect, useMemo, useState } from 'react';
import MonitoringDashboard from './components/MonitoringDashboard';
import PlayerApplicationScreen from './components/PlayerApplicationScreen';
import { layoutTemplates, manifestSyncSteps, playlistItems, scheduleSlots } from './data/playerRuntime';
import { usePlayerEngine } from './hooks/usePlayerEngine';
import { API_MODE } from './services/playerApi';
import { readJson, STORAGE_PREFIX, writeJson } from './utils/storage';

// 把后端 manifest 的 playback_plan.scenes 派生成播放器可渲染的媒体项。
// 与本地 playlistItems 结构对齐，因此 PlayerApplicationScreen 无需区分数据来源。
function buildManifestPlaylist(manifest, cacheIndex) {
  const scenes = [...(manifest?.playback_plan?.scenes || [])].sort((a, b) => a.order - b.order);
  const assetsById = new Map((manifest?.assets || []).map((asset) => [asset.asset_id, asset]));
  const cacheById = new Map((cacheIndex || []).map((item) => [item.asset_id, item]));

  return scenes
    .map((scene) => {
      const bindings = scene.slot_bindings || [];
      const mediaBinding = bindings.find((b) => b.content_type === 'CONTENT_ASSET' && b.asset_id);
      const textBinding = bindings.find((b) => b.content_type === 'CONTENT_TEXT' && b.text);
      const assetId = mediaBinding?.asset_id;
      if (!assetId) return null;

      const asset = assetsById.get(assetId);
      const cached = cacheById.get(assetId);
      const url = cached?.local_path || asset?.file_url || '';
      const isVideo = String(asset?.asset_type || '').toUpperCase().includes('VIDEO');
      const durationSec = Math.max(
        1,
        Math.round((scene.duration_ms || asset?.duration_ms || 10000) / 1000),
      );

      return {
        id: scene.scene_id,
        assetId,
        fileName: asset?.file_name || scene.scene_name,
        type: isVideo ? 'video' : 'image',
        videoUrl: isVideo ? url : undefined,
        imageUrl: isVideo ? undefined : url,
        durationSec,
        title: scene.scene_name,
        marquee: textBinding?.text || '',
        layoutId: 'hero-fullscreen',
      };
    })
    .filter(Boolean);
}

const DEVICE_BOUND_KEY = 'device_bound';
const DEVICE_BOUND_EVENT = 'digital-signage-device-bound-changed';

export default function App() {
  const player = usePlayerEngine();
  const getPageFromPath = () => (window.location.pathname.includes('device-status') ? 'monitoring' : 'player');
  const initialDeviceBound = readJson(DEVICE_BOUND_KEY, true);
  const [activePage, setActivePage] = useState(getPageFromPath);
  const [deviceBound, setDeviceBoundState] = useState(initialDeviceBound);
  const [activationStage, setActivationStage] = useState('welcome');
  const [bootStepIndex, setBootStepIndex] = useState(0);
  const [appBooting, setAppBooting] = useState(initialDeviceBound);
  const [manifestVersion, setManifestVersion] = useState(12);
  const [playlistIndex, setPlaylistIndex] = useState(0);
  const [mediaProgress, setMediaProgress] = useState(0);
  const [simulatedMinutes, setSimulatedMinutes] = useState(10 * 60 + 59);
  const [safeMode, setSafeMode] = useState(false);
  const [fallbackReason, setFallbackReason] = useState('');
  const [syncState, setSyncState] = useState({ active: false, title: '', stepIndex: 0 });
  const [runtimeLogs, setRuntimeLogs] = useState([]);

  const isRealBackend = API_MODE === 'real';
  const cachedAssetIds = useMemo(() => new Set(player.cacheIndex.map((asset) => asset.asset_id)), [player.cacheIndex]);
  const manifestPlaylist = useMemo(
    () => buildManifestPlaylist(player.manifest, player.cacheIndex),
    [player.manifest, player.cacheIndex],
  );
  const sourceItems = isRealBackend ? manifestPlaylist : playlistItems;
  const playableItems = useMemo(
    () => sourceItems.filter((item) => cachedAssetIds.has(item.assetId)),
    [sourceItems, cachedAssetIds],
  );
  const hasCachedMedia = playableItems.length > 0;
  const currentMedia = hasCachedMedia ? playableItems[playlistIndex % playableItems.length] : null;
  const nextMedia = hasCachedMedia ? playableItems[(playlistIndex + 1) % playableItems.length] : null;
  const activeSchedule = useMemo(() => {
    if (simulatedMinutes >= 14 * 60) return scheduleSlots[2];
    if (simulatedMinutes >= 11 * 60) return scheduleSlots[1];
    return scheduleSlots[0];
  }, [simulatedMinutes]);
  const activeLayout = currentMedia?.layoutId || activeSchedule.layoutId;
  const activeLayoutName = layoutTemplates[activeLayout]?.name || activeLayout;
  const displayManifestVersion = isRealBackend ? (player.manifest?.version ?? manifestVersion) : manifestVersion;

  const openPage = (page, newWindow = false) => {
    const nextPath = page === 'monitoring' ? '/device-status' : '/live-preview';
    if (newWindow) {
      window.open(nextPath, page === 'monitoring' ? 'device-status' : 'live-preview', 'noopener,noreferrer');
      return;
    }
    window.history.pushState({}, '', nextPath);
    setActivePage(page);
  };

  const addRuntimeLog = (message) => {
    setRuntimeLogs((items) => [
      { id: `${Date.now()}_${Math.random()}`, time: new Date().toLocaleTimeString(), message },
      ...items,
    ].slice(0, 8));
  };

  const applyDeviceBound = (nextBound, shouldLog = true) => {
    if (nextBound) {
      setDeviceBoundState(true);
      setActivationStage('welcome');
      setBootStepIndex(0);
      setAppBooting(true);
      if (shouldLog) addRuntimeLog('Device SCREEN-001 bound. Restarting player launch flow.');
      return;
    }

    setDeviceBoundState(false);
    setActivationStage('welcome');
    setAppBooting(false);
    if (shouldLog) addRuntimeLog('No device bound. Showing first-launch welcome screen.');
  };

  const setDeviceBound = (nextBound) => {
    writeJson(DEVICE_BOUND_KEY, Boolean(nextBound));
    applyDeviceBound(Boolean(nextBound));
    window.dispatchEvent(new Event(DEVICE_BOUND_EVENT));
  };

  const advancePlaylist = () => {
    setPlaylistIndex((index) => (hasCachedMedia ? (index + 1) % playableItems.length : 0));
    setMediaProgress(0);
  };

  const runManifestPipeline = (title, onComplete) => {
    setSyncState({ active: true, title, stepIndex: 0 });
    manifestSyncSteps.forEach((_, index) => {
      window.setTimeout(() => {
        setSyncState({ active: true, title, stepIndex: index });
      }, index * 650);
    });
    window.setTimeout(() => {
      setSyncState({ active: false, title: '', stepIndex: 0 });
      onComplete?.();
    }, manifestSyncSteps.length * 650 + 300);
  };

  const publishNewManifest = () => {
    if (isRealBackend) {
      addRuntimeLog('Checking server for a newer manifest...');
      runManifestPipeline('Pulling latest manifest from server...', () => {
        player.syncManifest('publish');
        setSafeMode(false);
        addRuntimeLog('Manifest sync triggered. New version applies if published on the server.');
      });
      return;
    }
    addRuntimeLog('New Manifest Available: v12 -> v13');
    runManifestPipeline('Downloading new assets... Verifying checksum... Safe switch...', () => {
      setManifestVersion((version) => version + 1);
      setSafeMode(false);
      addRuntimeLog('Manifest v13 verified. Switching to new layout safely.');
    });
  };

  const fastForwardSchedule = () => {
    setSimulatedMinutes(11 * 60);
    addRuntimeLog('Current Time: 10:59 -> 11:00. Player switched to Lunch Layout automatically.');
  };

  const simulateDownloadFailure = () => {
    setSyncState({ active: true, title: 'New video download failed. Keeping current manifest.', stepIndex: 2 });
    addRuntimeLog(`Download failed. Keeping current manifest v${manifestVersion}. Retry scheduled in 60 seconds.`);
    window.setTimeout(() => setSyncState({ active: false, title: '', stepIndex: 0 }), 2400);
  };

  const triggerSafeMode = () => {
    setSafeMode(true);
    setFallbackReason('Invalid layout detected -> Load fallback layout.');
    addRuntimeLog('Invalid layout detected. Fallback Layout / Safe Mode loaded.');
  };

  const recoverFromSafeMode = () => {
    setSafeMode(false);
    setFallbackReason('');
    addRuntimeLog('Recovered from Safe Mode. Normal playback resumed.');
  };

  const reconnectAndSync = () => {
    player.setForcedOffline(false);
    addRuntimeLog('Network restored. Upload queued playback logs and sync latest content.');
    runManifestPipeline('Network restored. Checking latest manifest...', () => {
      player.syncManifest('reconnect');
      addRuntimeLog('Online. Local state and cloud state are consistent.');
    });
  };

  const simulateOfflinePlayback = () => {
    const nextOffline = !player.forcedOffline;
    player.setForcedOffline(nextOffline);
    addRuntimeLog(
      nextOffline
        ? 'Offline mode enabled.'
        : 'Online mode enabled. Player is ready to resume cloud sync.',
    );
  };

  useEffect(() => {
    if (!deviceBound) return;
    const timer = window.setInterval(() => {
      setBootStepIndex((index) => {
        const next = Math.min(index + 1, 4);
        if (next === 4) {
          window.setTimeout(() => setAppBooting(false), 500);
        }
        return next;
      });
    }, 700);
    return () => window.clearInterval(timer);
  }, [deviceBound]);

  useEffect(() => {
    const onPopState = () => setActivePage(getPageFromPath());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const refreshDeviceBinding = () => {
      applyDeviceBound(readJson(DEVICE_BOUND_KEY, true), false);
    };
    const onStorage = (event) => {
      if (!event.key || event.key === `${STORAGE_PREFIX}:${DEVICE_BOUND_KEY}`) {
        refreshDeviceBinding();
      }
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener(DEVICE_BOUND_EVENT, refreshDeviceBinding);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(DEVICE_BOUND_EVENT, refreshDeviceBinding);
    };
  }, []);

  useEffect(() => {
    if (deviceBound || activationStage !== 'welcome') return;
    const timer = window.setTimeout(() => {
      setActivationStage('activation');
      addRuntimeLog('Activation Code A7K9Q2 displayed. Waiting for screen binding.');
    }, 1800);
    return () => window.clearTimeout(timer);
  }, [activationStage, deviceBound]);

  useEffect(() => {
    if (appBooting || safeMode || !deviceBound || !currentMedia) return;
    const timer = window.setInterval(() => {
      setMediaProgress((progress) => {
        if (progress + 1 >= currentMedia.durationSec) {
          advancePlaylist();
          return 0;
        }
        return progress + 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [appBooting, currentMedia, deviceBound, safeMode]);

  useEffect(() => {
    if (!hasCachedMedia) {
      setMediaProgress(0);
      setPlaylistIndex(0);
    }
  }, [hasCachedMedia]);

  const combinedLogs = [...runtimeLogs, ...player.logs].slice(0, 10);
  const runtimeStatus = {
    activeLayout,
    activeLayoutName,
    activeSchedule,
    currentMedia,
    fallbackReason,
    manifestVersion: displayManifestVersion,
    mediaProgress,
    nextMedia,
    safeMode,
    simulatedTime: `${String(Math.floor(simulatedMinutes / 60)).padStart(2, '0')}:${String(simulatedMinutes % 60).padStart(2, '0')}`,
    syncState,
  };

  return (
    <div className={activePage === 'player' ? 'app-shell player-shell' : 'app-shell monitoring-shell'}>
      <div className={activePage === 'player' ? 'top-bar runtime-top-bar' : 'top-bar'}>
        <div>
          {activePage === 'player' ? (
            <>
              <span className="eyebrow">Player Runtime</span>
              <h1>Gucci Singapore · Window-Display-001</h1>
              <p className="top-bar-subtitle">ION Orchard · Live playback · Managed by manifest schedule</p>
            </>
          ) : (
            <>
              <span className="eyebrow">Digital Signage Platform</span>
              <h1>Device Status & Operations</h1>
              <p className="top-bar-subtitle">Tenant, screen, manifest, heartbeat, logs, and remote commands.</p>
            </>
          )}
        </div>
        <div className="page-tabs" aria-label="Application views">
          <button className={activePage === 'player' ? 'active' : ''} type="button" onClick={() => openPage('player')}>
            Live Preview
          </button>
          <button className={activePage === 'monitoring' ? 'active' : ''} type="button" onClick={() => openPage('monitoring', true)}>
            Device Status
          </button>
        </div>
      </div>

      {activePage === 'player' ? (
        <main className="player-page">
          <PlayerApplicationScreen
            activationStage={activationStage}
            activeSchedule={activeSchedule}
            booting={appBooting}
            bootStepIndex={bootStepIndex}
            currentMedia={currentMedia}
            deviceBound={deviceBound}
            fallbackReason={fallbackReason}
            hasCachedMedia={hasCachedMedia}
            manifestVersion={displayManifestVersion}
            onMediaEnded={advancePlaylist}
            safeMode={safeMode}
            syncState={syncState}
          />
        </main>
      ) : (
        <MonitoringDashboard
          actions={{
            appBooting,
            deviceBound,
            effectiveOnline: player.effectiveOnline,
            forcedOffline: player.forcedOffline,
            publishNewManifest,
            reconnectAndSync,
            recoverFromSafeMode,
            setForcedOffline: simulateOfflinePlayback,
            setDeviceBound,
            simulateDownloadFailure,
            simulateRemoteCommand: player.simulateRemoteCommand,
            syncManifest: player.syncManifest,
            triggerSafeMode,
          }}
          cacheIndex={player.cacheIndex}
          device={player.device}
          effectiveOnline={player.effectiveOnline}
          emergencyActive={player.emergencyActive}
          health={player.health}
          lastCommand={player.lastCommand}
          lastHeartbeatAt={player.lastHeartbeatAt}
          lastSyncAt={player.lastSyncAt}
          logs={combinedLogs}
          manifest={{ ...(player.manifest || {}), version: displayManifestVersion }}
          onOpenLivePreview={() => openPage('player', true)}
          onPushToScreen={publishNewManifest}
          runtimeStatus={runtimeStatus}
        />
      )}
    </div>
  );
}
