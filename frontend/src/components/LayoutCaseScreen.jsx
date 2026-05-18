import { useState } from 'react';
import { assetLibrary } from '../data/mockManifest';
import { layoutPresets } from '../data/useCases';
import Carousel from './Carousel';
import ClockWidget from './ClockWidget';
import Marquee from './Marquee';

function RegionTopbar() {
  return (
    <div className="layout-topbar">
      <div className="layout-brand">
        <span className="logo-mark">DS</span>
        <strong>SignageOS</strong>
      </div>
      <ClockWidget hour12={false} mode="digital" showDate={false} theme="dark" timezone="Asia/Singapore" />
    </div>
  );
}

function QrPromotion() {
  return (
    <div className="qr-promo">
      <span className="eyebrow">Side Region</span>
      <h3>Scan for Coupons</h3>
      <div className="qr-code" aria-label="Mock QR code">
        {Array.from({ length: 49 }).map((_, index) => (
          <span key={index} className={(index * 7 + index) % 5 < 2 ? 'filled' : ''} />
        ))}
      </div>
      <p>QR Code / Promotion component rendered by Layout JSON.</p>
    </div>
  );
}

function RegionContent({ cacheIndex, region }) {
  if (region.component === 'topbar') return <RegionTopbar />;

  if (region.component === 'marquee') {
    return <Marquee background="rgba(2, 6, 23, 0.78)" direction="left" speed={22} text={region.text} />;
  }

  if (region.component === 'qrPromotion') return <QrPromotion />;

  if (region.component === 'carousel') {
    return (
      <Carousel
        cacheIndex={cacheIndex}
        duration={3600}
        fallback="Layout media unavailable"
        items={region.assetIds.map((assetId) => ({
          ...assetLibrary[assetId],
          asset_id: assetId,
          content_type: 'CONTENT_ASSET',
        }))}
        transition="fade"
      />
    );
  }

  return <div className="layout-empty">Unknown component</div>;
}

export default function LayoutCaseScreen({ cacheIndex }) {
  const [activeLayoutId, setActiveLayoutId] = useState('layout_b');
  const layout = layoutPresets.find((item) => item.id === activeLayoutId) || layoutPresets[0];

  return (
    <section className="layout-case-screen">
      <div className="layout-toolbar">
        <div>
          <span className="eyebrow">Layout Engine</span>
          <h2>{layout.name}</h2>
        </div>
        <div className="layout-toggle">
          {layoutPresets.map((item) => (
            <button
              className={item.id === activeLayoutId ? 'active' : ''}
              key={item.id}
              type="button"
              onClick={() => setActiveLayoutId(item.id)}
            >
              {item.id === 'layout_a' ? 'Layout A' : 'Layout B'}
            </button>
          ))}
        </div>
      </div>

      <div className="layout-demo-grid">
        <div className="layout-canvas">
          {layout.regions.map((region) => (
            <div
              className={`layout-region region-${region.component}`}
              key={region.id}
              style={{
                left: `${(region.x / layout.design_width) * 100}%`,
                top: `${(region.y / layout.design_height) * 100}%`,
                width: `${(region.width / layout.design_width) * 100}%`,
                height: `${(region.height / layout.design_height) * 100}%`,
              }}
            >
              <span className="region-label">{region.name}</span>
              <RegionContent cacheIndex={cacheIndex} region={region} />
            </div>
          ))}
        </div>

        <div className="layout-json glass-panel">
          <div className="section-title">
            <span>Layout JSON Regions</span>
            <small>x / y / width / height</small>
          </div>
          <pre>{JSON.stringify(layout.regions.map(({ id, x, y, width, height, component }) => ({ id, x, y, width, height, component })), null, 2)}</pre>
        </div>
      </div>
    </section>
  );
}
