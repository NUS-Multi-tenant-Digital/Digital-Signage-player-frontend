export default function Marquee({
  text,
  direction = 'left',
  speed = 28,
  font = 'Inter, system-ui, sans-serif',
  background = 'rgba(15, 23, 42, 0.82)',
}) {
  const vertical = direction === 'up';

  return (
    <div className={`marquee marquee-${direction}`} style={{ background, fontFamily: font, '--marquee-speed': `${speed}s` }}>
      <div className="marquee-label">Live Notice</div>
      <div className={vertical ? 'marquee-track vertical' : 'marquee-track'}>
        <span>{text}</span>
        <span aria-hidden="true">{text}</span>
      </div>
    </div>
  );
}
