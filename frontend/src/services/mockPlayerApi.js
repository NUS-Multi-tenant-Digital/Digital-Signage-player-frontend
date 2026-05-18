import { assetLibrary, mockManifest } from '../data/mockManifest';

const delay = (ms = 380) => new Promise((resolve) => setTimeout(resolve, ms));

const success = (data) => ({
  data,
  base_resp: {
    code: 0,
    message: 'success',
  },
});

export async function RegisterPlayer(req) {
  await delay();

  return success({
    device_id: 'player_lobby_tv_01',
    tenant_id: 'tenant_sme_demo',
    location_id: 'orchard_lobby',
    access_token: 'mock_access_token_for_local_demo',
    token_expire_at: Date.now() + 7 * 24 * 60 * 60 * 1000,
    config: {
      device_id: 'player_lobby_tv_01',
      tenant_id: 'tenant_sme_demo',
      location_id: 'orchard_lobby',
      heartbeat_interval_sec: 8,
      manifest_sync_interval_sec: 18,
      event_flush_interval_sec: 15,
      max_cache_size_mb: req.capabilities?.max_cache_size_mb || 512,
      asset_download_concurrency: 3,
      enable_offline_mode: true,
      enable_watchdog: true,
    },
  });
}

export async function PullManifest(req) {
  await delay(520);

  const hasNoUpdate =
    req.current_manifest_id === mockManifest.manifest_id &&
    Number(req.current_manifest_version) >= mockManifest.version;

  return success({
    update_type: hasNoUpdate ? 'MANIFEST_NO_UPDATE' : 'MANIFEST_FULL_UPDATE',
    manifest: hasNoUpdate ? null : mockManifest,
    next_poll_interval_sec: 18,
    server_time: Date.now(),
    message: hasNoUpdate ? 'no update' : 'mock manifest updated',
  });
}

export async function BatchGetAssetUrl(req) {
  await delay(300);

  return success({
    assets: req.asset_ids.map((assetId) => {
      const asset = assetLibrary[assetId];
      return {
        asset_id: assetId,
        download_url: asset?.url || assetLibrary.fallback_brand.url,
        expire_at: Date.now() + 60 * 60 * 1000,
        sha256: `mock-sha-${assetId}`,
        size_bytes: asset?.size_bytes || 0,
      };
    }),
  });
}

export async function Heartbeat(req) {
  await delay(220);

  return success({
    next_interval_sec: 8,
    commands: [],
    echo: {
      manifest_id: req.manifest_id,
      scene_id: req.playback?.current_scene_id,
      online: req.network?.online,
    },
  });
}

export async function ReportPlayerEvents(req) {
  await delay(180);

  return success({
    accepted_count: req.events.length,
    rejected_count: 0,
  });
}

export async function CommandAck(req) {
  await delay(160);

  return success({
    command_id: req.command_id,
    success: req.success,
  });
}
