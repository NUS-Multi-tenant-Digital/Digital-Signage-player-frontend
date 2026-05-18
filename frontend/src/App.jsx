import { useEffect, useMemo, useState } from 'react';
import ControlPanel from './components/ControlPanel';
import PlayerApplicationScreen from './components/PlayerApplicationScreen';
import StatusPanel from './components/StatusPanel';
import { manifestSyncSteps, playlistItems, scheduleSlots } from './data/playerRuntime';
import { usePlayerEngine } from './hooks/usePlayerEngine';

export default function App() {
  const player = usePlayerEngine();
  const [deviceBound, setDeviceBound] = useState(true);
  const [bootStepIndex, setBootStepIndex] = useState(0);
  const [appBooting, setAppBooting] = useState(true);
  const [manifestVersion, setManifestVersion] = useState(12);
  const [playlistIndex, setPlaylistIndex] = useState(0);
  const [mediaProgress, setMediaProgress] = useState(0);
  const [simulatedMinutes, setSimulatedMinutes] = useState(10 * 60 + 59);
  const [safeMode, setSafeMode] = useState(false);
  const [fallbackReason, setFallbackReason] = useState('');
  const [syncState, setSyncState] = useState({ active: false, title: '', stepIndex: 0 });
  const [runtimeLogs, setRuntimeLogs] = useState([]);

  const currentMedia = playlistItems[playlistIndex];
  const nextMedia = playlistItems[(playlistIndex + 1) % playlistItems.length];
  const activeSchedule = useMemo(() => {
    if (simulatedMinutes >= 14 * 60) return scheduleSlots[2];
    if (simulatedMinutes >= 11 * 60) return scheduleSlots[1];
    return scheduleSlots[0];
  }, [simulatedMinutes]);
  const activeLayout = activeSchedule.layoutId;

  const addRuntimeLog = (message) => {
    setRuntimeLogs((items) => [
      { id: `${Date.now()}_${Math.random()}`, time: new Date().toLocaleTimeString(), message },
      ...items,
    ].slice(0, 8));
  };

  const advancePlaylist = () => {
    setPlaylistIndex((index) => (index + 1) % playlistItems.length);
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
      addRuntimeLog('Online. Local state and cloud state are consistent.');
    });
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
    if (appBooting || safeMode || !deviceBound) return;
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
  }, [appBooting, currentMedia.durationSec, deviceBound, safeMode]);

  const combinedLogs = [...runtimeLogs, ...player.logs].slice(0, 10);
  const runtimeStatus = {
    activeLayout,
    activeSchedule,
    currentMedia,
    fallbackReason,
    manifestVersion,
    mediaProgress,
    nextMedia,
    safeMode,
    simulatedTime: `${String(Math.floor(simulatedMinutes / 60)).padStart(2, '0')}:${String(simulatedMinutes % 60).padStart(2, '0')}`,
  };

  return (
    <div className="app-shell">
      <div className="top-bar">
        <div>
          <span className="eyebrow">Digital Signage Player Application</span>
          <h1>真实可用的边缘播放器演示</h1>
        </div>
        <p>
          Managed Device · Manifest-driven Layout · Playlist · Schedule · Offline Reliability · Safe Mode
        </p>
      </div>

      <div className="workspace">
        <div className="preview-area">
          <PlayerApplicationScreen
            activeLayout={activeLayout}
            activeSchedule={activeSchedule}
            booting={appBooting}
            bootStepIndex={bootStepIndex}
            currentMedia={currentMedia}
            deviceBound={deviceBound}
            effectiveOnline={player.effectiveOnline}
            fallbackReason={fallbackReason}
            manifestVersion={manifestVersion}
            mediaProgress={mediaProgress}
            nextMedia={nextMedia}
            onMediaEnded={advancePlaylist}
            safeMode={safeMode}
            syncState={syncState}
          />
          <ControlPanel
            appBooting={appBooting}
            deviceBound={deviceBound}
            effectiveOnline={player.effectiveOnline}
            fastForwardSchedule={fastForwardSchedule}
            forcedOffline={player.forcedOffline}
            publishNewManifest={publishNewManifest}
            reconnectAndSync={reconnectAndSync}
            recoverFromSafeMode={recoverFromSafeMode}
            setForcedOffline={player.setForcedOffline}
            setDeviceBound={setDeviceBound}
            simulateDownloadFailure={simulateDownloadFailure}
            simulateRemoteCommand={player.simulateRemoteCommand}
            syncManifest={player.syncManifest}
            triggerSafeMode={triggerSafeMode}
          />
        </div>

        <StatusPanel
          cacheIndex={player.cacheIndex}
          device={player.device}
          effectiveOnline={player.effectiveOnline}
          emergencyActive={player.emergencyActive}
          health={player.health}
          lastCommand={player.lastCommand}
          lastHeartbeatAt={player.lastHeartbeatAt}
          lastSyncAt={player.lastSyncAt}
          logs={combinedLogs}
          manifest={{ ...(player.manifest || {}), version: manifestVersion }}
          runtimeStatus={runtimeStatus}
        />
      </div>
    </div>
  );
}
