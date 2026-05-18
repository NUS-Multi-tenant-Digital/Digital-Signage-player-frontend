import { assetLibrary } from '../data/mockManifest';
import { bootSteps, manifestSyncSteps } from '../data/playerRuntime';
import ClockWidget from './ClockWidget';
import Marquee from './Marquee';

function RuntimeStepList({ steps, activeIndex }) {
  return (
    <div className="runtime-steps">
      {steps.map((step, index) => (
        <div className={index <= activeIndex ? 'runtime-step done' : 'runtime-step'} key={step}>
          <span>{index + 1}</span>
          <strong>{step}</strong>
        </div>
      ))}
    </div>
  );
}

function QrPromotion() {
  return (
    <div className="player-qr">
      <span className="eyebrow">Member Coupon</span>
      <div className="qr-code" aria-label="Mock QR code">
        {Array.from({ length: 49 }).map((_, index) => (
          <span key={index} className={(index * 7 + index) % 5 < 2 ? 'filled' : ''} />
        ))}
      </div>
      <strong>Scan for 20% off</strong>
      <p>Side Region: QR Code / Promotion</p>
    </div>
  );
}

function MediaSurface({ media, onMediaEnded }) {
  const asset = assetLibrary[media?.assetId] || assetLibrary.fallback_brand;
  const mediaSrc = media?.videoUrl ? `${import.meta.env.BASE_URL}${media.videoUrl}` : asset.url;

  return (
    <div className="media-surface">
      {media?.type === 'video' && media?.videoUrl ? (
        <video
          key={media.videoUrl}
          src={mediaSrc}
          muted
          autoPlay
          playsInline
          preload="auto"
          onEnded={onMediaEnded}
        />
      ) : (
        <img src={mediaSrc} alt={media?.fileName || asset.file_name} />
      )}
      <div className="media-tag">
        <span>{media?.type === 'video' ? 'Media Player / Video' : 'Media Player / Image'}</span>
        <strong>{media?.fileName || asset.file_name}</strong>
      </div>
    </div>
  );
}

function FallbackLayout({ reason }) {
  return (
    <div className="fallback-layout">
      <div className="fallback-logo">
        <span className="logo-mark">DS</span>
        <strong>SignageOS</strong>
      </div>
      <h2>Content temporarily unavailable</h2>
      <p>Device is recovering...</p>
      <small>{reason || 'Fallback layout loaded because the current content is unsafe.'}</small>
    </div>
  );
}

export default function PlayerApplicationScreen({
  activeLayout,
  activeSchedule,
  booting,
  bootStepIndex,
  currentMedia,
  deviceBound,
  effectiveOnline,
  fallbackReason,
  manifestVersion,
  mediaProgress,
  nextMedia,
  onMediaEnded,
  safeMode,
  syncState,
}) {
  if (!deviceBound) {
    return (
      <section className="player-app-screen activation-mode">
        <div className="activation-center">
          <span className="eyebrow">First Launch</span>
          <h2>No device bound</h2>
          <p>Show this activation code in the CMS to bind the screen.</p>
          <strong className="activation-code">A7K9Q2</strong>
          <small>Waiting for screen binding...</small>
        </div>
      </section>
    );
  }

  if (booting) {
    return (
      <section className="player-app-screen boot-mode">
        <div className="boot-device-card">
          <div className="loader" />
          <h2>Starting managed player device</h2>
          <p>Device ID: SCREEN-001 · Status: Connecting...</p>
          <RuntimeStepList activeIndex={bootStepIndex} steps={bootSteps} />
        </div>
      </section>
    );
  }

  if (safeMode) {
    return (
      <section className="player-app-screen safe-mode">
        <FallbackLayout reason={fallbackReason} />
      </section>
    );
  }

  const progressWidth = `${Math.min((mediaProgress / currentMedia.durationSec) * 100, 100)}%`;

  return (
    <section className={`player-app-screen layout-${activeLayout}`}>
      <div className="player-region top-region">
        <div className="managed-logo">
          <span className="logo-mark">DS</span>
          <div>
            <strong>SignageOS</strong>
            <small>SCREEN-001 · Manifest v{manifestVersion}</small>
          </div>
        </div>
        <ClockWidget hour12={false} mode="digital" showDate theme="dark" timezone="Asia/Singapore" />
      </div>

      <div className="player-region main-region">
        <MediaSurface media={currentMedia} onMediaEnded={onMediaEnded} />
      </div>

      {activeLayout === 'multi-zone' && (
        <div className="player-region side-region">
          <QrPromotion />
        </div>
      )}

      <div className="player-region bottom-region">
        <Marquee
          background="rgba(2, 6, 23, 0.78)"
          direction="left"
          speed={activeLayout === 'fullscreen' ? 24 : 20}
          text={activeSchedule.marquee}
        />
      </div>

      <div className="runtime-overlay">
        <div className="runtime-status-line">
          <span className={effectiveOnline ? 'dot online' : 'dot offline'} />
          <strong>{effectiveOnline ? 'Online' : 'Offline - Using Last Known Good Manifest'}</strong>
        </div>
        <div className="playlist-readout">
          <span>Current Media: {currentMedia.fileName}</span>
          <span>Next Media: {nextMedia.fileName}</span>
          <span>
            Progress: {mediaProgress} / {currentMedia.durationSec}s
          </span>
        </div>
        <div className="media-progress">
          <span style={{ width: progressWidth }} />
        </div>
      </div>

      {syncState.active && (
        <div className="sync-overlay">
          <strong>{syncState.title}</strong>
          <RuntimeStepList activeIndex={syncState.stepIndex} steps={manifestSyncSteps} />
        </div>
      )}
    </section>
  );
}
