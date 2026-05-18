import { assetLibrary } from '../data/mockManifest';
import Carousel from './Carousel';
import ClockWidget from './ClockWidget';
import LogoBlock from './LogoBlock';
import Marquee from './Marquee';

function bindingFor(scene, slotId) {
  return scene?.slot_bindings?.find((binding) => binding.slot_id === slotId);
}

function assetToSlide(binding, emergency = false) {
  if (!binding) return null;

  if (binding.content_type === 'CONTENT_TEXT') {
    return {
      content_type: 'CONTENT_TEXT',
      text: binding.text,
      emergency,
    };
  }

  const asset = assetLibrary[binding.asset_id];
  return {
    ...asset,
    asset_id: binding.asset_id,
    content_type: binding.content_type,
    muted: binding.display_policy?.muted,
    loop: binding.display_policy?.loop,
  };
}

export default function PlayerScreen({ cacheIndex, currentScene, effectiveOnline, emergencyActive, manifest }) {
  const mainBinding = bindingFor(currentScene, 'main_carousel');
  const sideBinding = bindingFor(currentScene, 'side_panel');
  const marqueeBinding = bindingFor(currentScene, 'bottom_marquee');
  const fallbackText = manifest?.fallback_policy?.fallback_text || 'Content temporarily unavailable';

  return (
    <section className={emergencyActive ? 'player-screen emergency-mode' : 'player-screen'}>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <LogoBlock clickable position="top-left" />
      <div className="screen-badge">
        <span className={effectiveOnline ? 'dot online' : 'dot offline'} />
        {effectiveOnline ? 'Online Sync' : 'Offline Playback'}
      </div>

      <div className="screen-layout">
        <main className="hero-zone glass-panel">
          <Carousel
            cacheIndex={cacheIndex}
            duration={4200}
            fallback={fallbackText}
            items={[assetToSlide(mainBinding, emergencyActive)]}
            transition={emergencyActive ? 'zoom' : 'fade'}
          />
          <div className="scene-caption">
            <span>{currentScene?.scene_name || 'Loading Schedule'}</span>
            <strong>{manifest ? `Manifest v${manifest.version}` : 'Waiting for manifest'}</strong>
          </div>
        </main>

        <aside className="side-zone">
          <div className="side-media glass-panel">
            <Carousel
              cacheIndex={cacheIndex}
              duration={5000}
              fallback={fallbackText}
              items={[assetToSlide(sideBinding, emergencyActive)]}
              transition="slide"
            />
          </div>
          <div className="clock-card glass-panel">
            <ClockWidget hour12={false} mode="digital" showDate theme="dark" timezone="Asia/Singapore" />
          </div>
        </aside>
      </div>

      <Marquee
        background={emergencyActive ? 'rgba(127, 29, 29, 0.9)' : 'rgba(2, 6, 23, 0.82)'}
        direction="left"
        speed={emergencyActive ? 14 : 24}
        text={marqueeBinding?.text || fallbackText}
      />
    </section>
  );
}
