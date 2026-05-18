import { useEffect, useMemo, useState } from 'react';

function TextSlide({ text, emergency }) {
  return (
    <div className={emergency ? 'text-slide emergency' : 'text-slide'}>
      <span>{emergency ? 'Priority Message' : 'Announcement'}</span>
      <h1>{text}</h1>
    </div>
  );
}

export default function Carousel({ items, cacheIndex, duration = 4500, transition = 'fade', fallback }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const slides = useMemo(() => items.filter(Boolean), [items]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % slides.length);
    }, duration);
    return () => window.clearInterval(timer);
  }, [duration, slides.length]);

  if (!slides.length) {
    return <TextSlide text={fallback || 'Content temporarily unavailable'} />;
  }

  return (
    <div className={`carousel transition-${transition}`}>
      {slides.map((item, index) => {
        const cached = item.asset_id ? cacheIndex.find((asset) => asset.asset_id === item.asset_id) : null;
        const src = cached?.local_path || item.url;
        const isActive = index === activeIndex;

        return (
          <div className={isActive ? 'carousel-slide active' : 'carousel-slide'} key={`${item.asset_id || item.text}-${index}`}>
            {item.content_type === 'CONTENT_TEXT' ? (
              <TextSlide text={item.text} emergency={item.emergency} />
            ) : item.mime_type?.startsWith('video') ? (
              <video src={src} muted={item.muted ?? true} loop={item.loop ?? true} autoPlay playsInline />
            ) : (
              <img src={src} alt={item.file_name || item.asset_id} />
            )}
          </div>
        );
      })}
    </div>
  );
}
