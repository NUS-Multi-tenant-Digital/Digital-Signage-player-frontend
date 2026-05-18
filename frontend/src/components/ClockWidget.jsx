import { useEffect, useMemo, useState } from 'react';

export default function ClockWidget({
  timezone = 'Asia/Singapore',
  mode = 'digital',
  hour12 = false,
  showDate = true,
  theme = 'dark',
}) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const time = useMemo(
    () =>
      new Intl.DateTimeFormat('en-SG', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12,
        timeZone: timezone,
      }).format(now),
    [hour12, now, timezone],
  );

  const date = useMemo(
    () =>
      new Intl.DateTimeFormat('en-SG', {
        weekday: 'short',
        month: 'short',
        day: '2-digit',
        timeZone: timezone,
      }).format(now),
    [now, timezone],
  );

  const seconds = now.getSeconds();
  const minutes = now.getMinutes();
  const hours = now.getHours() % 12;

  if (mode === 'analog') {
    return (
      <div className={`clock analog ${theme}`}>
        <div className="analog-face">
          <span className="hand hour" style={{ transform: `rotate(${hours * 30 + minutes / 2}deg)` }} />
          <span className="hand minute" style={{ transform: `rotate(${minutes * 6}deg)` }} />
          <span className="hand second" style={{ transform: `rotate(${seconds * 6}deg)` }} />
        </div>
        {showDate && <div className="clock-date">{date}</div>}
      </div>
    );
  }

  return (
    <div className={`clock digital ${theme}`}>
      <div className="clock-time">{time}</div>
      {showDate && <div className="clock-date">{date}</div>}
    </div>
  );
}
