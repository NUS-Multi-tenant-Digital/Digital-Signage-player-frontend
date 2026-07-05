import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { emergencyScene } from '../data/mockManifest';
import {
  BatchGetAssetUrl,
  CommandAck,
  Heartbeat,
  PullManifest,
  RegisterPlayer,
  ReportPlayerEvents,
} from '../services/playerApi';
import { readJson, removeJson, STORAGE_PREFIX, writeJson } from '../utils/storage';

const APP_VERSION = '1.0.0-mvp';
const MANIFEST_KEY = 'last_good_manifest';
const STATE_KEY = 'local_player_state';
const CACHE_KEY = 'cached_assets';
const EVENTS_KEY = 'offline_events';
const OFFLINE_KEY = 'forced_offline';
const STORAGE_CHANGED_EVENT = 'digital-signage-storage-changed';

function createEvent(event_type, manifest, scene, extra = {}) {
  return {
    event_id: `evt_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    event_type,
    timestamp: Date.now(),
    manifest_id: manifest?.manifest_id || '',
    manifest_version: manifest?.version || 0,
    scene_id: scene?.scene_id || '',
    slot_id: extra.slot_id || '',
    asset_id: extra.asset_id || '',
    error_code: extra.error_code || '',
    error_message: extra.error_message || '',
    extra_json: JSON.stringify(extra),
  };
}

function getResolution() {
  return `${window.screen.width}x${window.screen.height}`;
}

export function usePlayerEngine() {
  const [booting, setBooting] = useState(true);
  const [device, setDevice] = useState(() => readJson(STATE_KEY));
  const [manifest, setManifest] = useState(() => readJson(MANIFEST_KEY));
  const [cacheIndex, setCacheIndex] = useState(() => readJson(CACHE_KEY, []));
  const [online, setOnline] = useState(() => navigator.onLine);
  const [forcedOfflineState, setForcedOfflineState] = useState(() => readJson(OFFLINE_KEY, false));
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState(() => readJson(STATE_KEY)?.last_success_sync_at || 0);
  const [lastHeartbeatAt, setLastHeartbeatAt] = useState(0);
  const [lastCommand, setLastCommand] = useState(null);
  const [logs, setLogs] = useState([]);
  const [health, setHealth] = useState({
    used_cache_mb: 0,
    cached_asset_count: 0,
    missing_required_asset_count: 0,
    failed_request_count: 0,
  });
  const startedAtRef = useRef(Date.now());
  const forcedOffline = forcedOfflineState;
  const effectiveOnline = online && !forcedOffline;

  const setForcedOffline = useCallback((nextValue) => {
    const nextOffline = typeof nextValue === 'function' ? nextValue(readJson(OFFLINE_KEY, false)) : nextValue;
    writeJson(OFFLINE_KEY, Boolean(nextOffline));
    setForcedOfflineState(Boolean(nextOffline));
    window.dispatchEvent(new Event(STORAGE_CHANGED_EVENT));
  }, []);

  const scenes = useMemo(() => {
    const scheduledScenes = [...(manifest?.playback_plan?.scenes || [])].sort((a, b) => a.order - b.order);
    return emergencyActive ? [emergencyScene] : scheduledScenes;
  }, [emergencyActive, manifest]);

  const currentScene = scenes[currentSceneIndex % Math.max(scenes.length, 1)] || null;

  const addLog = useCallback((message) => {
    setLogs((items) => [
      { id: `${Date.now()}_${Math.random()}`, time: new Date().toLocaleTimeString(), message },
      ...items,
    ].slice(0, 8));
  }, []);

  const queueOrSendEvents = useCallback(
    async (events) => {
      if (!device?.device_id || events.length === 0) return;

      if (!effectiveOnline) {
        const queued = readJson(EVENTS_KEY, []);
        writeJson(EVENTS_KEY, [...queued, ...events]);
        addLog(`${events.length} playback events queued while device is offline`);
        return;
      }

      const queued = readJson(EVENTS_KEY, []);
      const allEvents = [...queued, ...events];
      const resp = await ReportPlayerEvents({ device_id: device.device_id, events: allEvents });
      if (resp.base_resp.code === 0) {
        removeJson(EVENTS_KEY);
        if (queued.length) addLog(`${queued.length} queued events flushed after network recovery`);
      }
    },
    [addLog, device?.device_id, effectiveOnline],
  );

  const cacheManifestAssets = useCallback(
    async (nextManifest, deviceId) => {
      const requiredAssetIds = nextManifest.assets.filter((asset) => asset.required).map((asset) => asset.asset_id);
      const cachedIds = new Set(readJson(CACHE_KEY, []).map((asset) => asset.asset_id));
      const missingIds = requiredAssetIds.filter((assetId) => !cachedIds.has(assetId));

      if (!missingIds.length) {
        addLog('Required media assets verified in local cache');
        return readJson(CACHE_KEY, []);
      }

      const resp = await BatchGetAssetUrl({
        device_id: deviceId,
        manifest_id: nextManifest.manifest_id,
        manifest_version: nextManifest.version,
        asset_ids: missingIds,
      });

      const downloaded = resp.data.assets.map((asset) => ({
        asset_id: asset.asset_id,
        local_path: asset.download_url,
        sha256: asset.sha256,
        size_bytes: asset.size_bytes,
        downloaded_at: Date.now(),
        last_used_at: Date.now(),
        verified: true,
        manifest_id: nextManifest.manifest_id,
      }));

      const nextCache = [...readJson(CACHE_KEY, []), ...downloaded];
      writeJson(CACHE_KEY, nextCache);
      setCacheIndex(nextCache);
      window.dispatchEvent(new Event(STORAGE_CHANGED_EVENT));
      addLog(`${downloaded.length} media assets downloaded and verified`);
      return nextCache;
    },
    [addLog],
  );

  const syncManifest = useCallback(
    async (reason = 'poll') => {
      if (!device?.device_id || !effectiveOnline) {
        addLog(cacheIndex.length ? 'Network disconnected, switched to cached playback' : 'Network disconnected, media sync pending');
        return;
      }

      addLog(`Manifest sync started (${reason})`);
      await queueOrSendEvents([createEvent('EVENT_MANIFEST_SYNC_STARTED', manifest, currentScene, { reason })]);

      try {
        const resp = await PullManifest({
          device_id: device.device_id,
          tenant_id: device.tenant_id,
          location_id: device.location_id,
          current_manifest_id: manifest?.manifest_id || '',
          current_manifest_version: manifest?.version || 0,
          app_version: APP_VERSION,
          platform: 'PLATFORM_ANDROID_TV',
          screen_resolution: getResolution(),
          last_success_sync_at: lastSyncAt,
        });

        if (resp.data.update_type !== 'MANIFEST_NO_UPDATE' && resp.data.manifest) {
          const nextManifest = resp.data.manifest;
          await cacheManifestAssets(nextManifest, device.device_id);
          writeJson(MANIFEST_KEY, nextManifest);
          setManifest(nextManifest);
          setCurrentSceneIndex(0);
          addLog(`Manifest v${nextManifest.version} synced successfully`);
        } else {
          if (manifest) {
            await cacheManifestAssets(manifest, device.device_id);
          }
          addLog('Manifest already up to date');
        }

        const syncedAt = Date.now();
        setLastSyncAt(syncedAt);
        writeJson(STATE_KEY, {
          ...device,
          current_manifest_id: resp.data.manifest?.manifest_id || manifest?.manifest_id || '',
          current_manifest_version: resp.data.manifest?.version || manifest?.version || 0,
          last_good_manifest_id: resp.data.manifest?.manifest_id || manifest?.manifest_id || '',
          last_success_sync_at: syncedAt,
          offline_mode: false,
        });
        await queueOrSendEvents([createEvent('EVENT_MANIFEST_SYNC_SUCCESS', resp.data.manifest || manifest, currentScene, { reason })]);
      } catch (error) {
        addLog(`Manifest sync failed: ${error.message}`);
        await queueOrSendEvents([
          createEvent('EVENT_MANIFEST_SYNC_FAILED', manifest, currentScene, {
            reason,
            error_message: error.message,
          }),
        ]);
      }
    },
    [
      addLog,
      cacheManifestAssets,
      currentScene,
      device,
      effectiveOnline,
      lastSyncAt,
      manifest,
      queueOrSendEvents,
      cacheIndex.length,
    ],
  );

  const simulateRemoteCommand = useCallback(
    async (type) => {
      if (!device?.device_id) return;

      const command = {
        command_id: `cmd_${Date.now()}`,
        type,
        issued_at: Date.now(),
        expire_at: Date.now() + 60_000,
        payload_json: type === 'COMMAND_EMERGENCY_OVERRIDE' ? JSON.stringify({ duration_ms: 15000 }) : '{}',
      };

      setLastCommand(command);
      addLog(`Remote device command received: ${type}`);

      if (type === 'COMMAND_SYNC_NOW') {
        await syncManifest('remote-command');
      }

      if (type === 'COMMAND_CLEAR_CACHE') {
        writeJson(CACHE_KEY, []);
        setCacheIndex([]);
        window.dispatchEvent(new Event(STORAGE_CHANGED_EVENT));
        addLog('Local media cache cleared');
      }

      if (type === 'COMMAND_EMERGENCY_OVERRIDE') {
        setEmergencyActive(true);
        setCurrentSceneIndex(0);
        window.setTimeout(() => {
          setEmergencyActive(false);
          setCurrentSceneIndex(0);
        }, 15000);
      }

      await CommandAck({
        device_id: device.device_id,
        command_id: command.command_id,
        type: command.type,
        success: true,
        error_code: '',
        error_message: '',
        executed_at: Date.now(),
      });
      await queueOrSendEvents([createEvent('EVENT_COMMAND_EXECUTED', manifest, currentScene, { command_type: type })]);
    },
    [addLog, currentScene, device?.device_id, manifest, queueOrSendEvents, syncManifest],
  );

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    const refreshSharedState = () => {
      setCacheIndex(readJson(CACHE_KEY, []));
      setForcedOfflineState(readJson(OFFLINE_KEY, false));
    };
    const onStorage = (event) => {
      if (!event.key || event.key.startsWith(`${STORAGE_PREFIX}:`)) {
        refreshSharedState();
      }
    };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    window.addEventListener('storage', onStorage);
    window.addEventListener(STORAGE_CHANGED_EVENT, refreshSharedState);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(STORAGE_CHANGED_EVENT, refreshSharedState);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      setBooting(true);
      try {
        const registerResp = await RegisterPlayer({
          device_sn: 'LOCAL-DEMO-SN-001',
          activation_code: 'DEMO-2026',
          device_name: 'Lobby-TV-01',
          platform: 'PLATFORM_ANDROID_TV',
          app_version: APP_VERSION,
          os_version: navigator.userAgent,
          screen_resolution: getResolution(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          ip_address: '127.0.0.1',
          capabilities: {
            support_video: true,
            support_image: true,
            support_text: true,
            support_local_cache: true,
            max_cache_size_mb: 512,
          },
        });

        if (cancelled) return;

        if (registerResp.base_resp.code !== 0 || !registerResp.data?.device_id) {
          addLog(`Player registration failed: ${registerResp.base_resp.message}`);
          setBooting(false);
          return;
        }

        const localState = {
          ...registerResp.data,
          current_manifest_id: manifest?.manifest_id || '',
          current_manifest_version: manifest?.version || 0,
          last_good_manifest_id: manifest?.manifest_id || '',
          last_boot_at: Date.now(),
          offline_mode: !effectiveOnline,
        };
        setDevice(localState);
        writeJson(STATE_KEY, localState);
        addLog('Player registered and runtime started');
        setBooting(false);
      } catch (error) {
        if (cancelled) return;
        addLog(`Player registration error: ${error.message}`);
        setBooting(false);
      }
    }

    boot();
    return () => {
      cancelled = true;
    };
    // Boot should run once; later network changes are handled by sync effects.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!device?.device_id) return;
    syncManifest('startup');
    const interval = window.setInterval(() => syncManifest('poll'), device.config?.manifest_sync_interval_sec * 1000 || 18000);
    return () => window.clearInterval(interval);
  }, [device?.device_id, device?.config?.manifest_sync_interval_sec, syncManifest]);

  useEffect(() => {
    if (!currentScene || scenes.length <= 1) return;
    const timer = window.setTimeout(() => {
      setCurrentSceneIndex((index) => (index + 1) % scenes.length);
    }, currentScene.duration_ms);
    return () => window.clearTimeout(timer);
  }, [currentScene, scenes.length]);

  useEffect(() => {
    if (!device?.device_id || !manifest) return;

    async function sendHeartbeat() {
      const missingRequired = manifest.assets.filter(
        (asset) => asset.required && !cacheIndex.some((cached) => cached.asset_id === asset.asset_id),
      ).length;

      const usedCacheMb = Math.round(cacheIndex.reduce((sum, asset) => sum + asset.size_bytes, 0) / 1024 / 1024);
      const snapshot = {
        used_cache_mb: usedCacheMb,
        cached_asset_count: cacheIndex.length,
        missing_required_asset_count: missingRequired,
        failed_request_count: effectiveOnline ? 0 : 1,
      };
      setHealth(snapshot);

      if (!effectiveOnline) {
        setLastHeartbeatAt(Date.now());
        return;
      }

      await Heartbeat({
        device_id: device.device_id,
        app_version: APP_VERSION,
        manifest_id: manifest.manifest_id,
        manifest_version: manifest.version,
        timestamp: Date.now(),
        playback: {
          state: emergencyActive ? 'PLAYBACK_PLAYING' : 'PLAYBACK_PLAYING',
          current_scene_id: currentScene?.scene_id || '',
          current_slot_id: 'main_carousel',
          current_asset_id: currentScene?.slot_bindings?.find((item) => item.asset_id)?.asset_id || '',
          position_ms: 0,
          duration_ms: currentScene?.duration_ms || 0,
          last_error_code: '',
          last_error_message: '',
        },
        health: {
          uptime_sec: Math.floor((Date.now() - startedAtRef.current) / 1000),
          memory_usage_mb: 128 + Math.floor(Math.random() * 36),
          storage_free_mb: 12400,
          storage_total_mb: 32000,
          app_foreground: true,
        },
        cache: {
          used_cache_mb: usedCacheMb,
          max_cache_mb: manifest.cache_policy.max_cache_size_mb,
          cached_asset_count: cacheIndex.length,
          missing_required_asset_count: missingRequired,
          last_cache_cleanup_at: 0,
        },
        network: {
          online: effectiveOnline,
          connection_type: 'wifi',
          failed_request_count: effectiveOnline ? 0 : 1,
          last_online_at: effectiveOnline ? Date.now() : 0,
          last_offline_at: effectiveOnline ? 0 : Date.now(),
        },
      });
      setLastHeartbeatAt(Date.now());
    }

    sendHeartbeat();
    const interval = window.setInterval(sendHeartbeat, device.config?.heartbeat_interval_sec * 1000 || 8000);
    return () => window.clearInterval(interval);
  }, [cacheIndex, currentScene, device, effectiveOnline, emergencyActive, manifest]);

  useEffect(() => {
    if (effectiveOnline && readJson(EVENTS_KEY, []).length) {
      queueOrSendEvents([]);
    }
  }, [effectiveOnline, queueOrSendEvents]);

  return {
    booting,
    cacheIndex,
    currentScene,
    device,
    effectiveOnline,
    emergencyActive,
    health,
    lastCommand,
    lastHeartbeatAt,
    lastSyncAt,
    logs,
    manifest,
    scenes,
    setForcedOffline,
    simulateRemoteCommand,
    syncManifest,
    forcedOffline,
  };
}
