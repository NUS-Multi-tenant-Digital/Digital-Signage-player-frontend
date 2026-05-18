export default function LogoBlock({ clickable = false, position = 'top-left' }) {
  const content = (
    <>
      <span className="logo-mark">DS</span>
      <span>
        <strong>SignageOS</strong>
        <small>Edge Player</small>
      </span>
    </>
  );

  if (clickable) {
    return (
      <button className={`logo-block ${position}`} type="button" onClick={() => window.alert('Logo touch action')}>
        {content}
      </button>
    );
  }

  return <div className={`logo-block ${position}`}>{content}</div>;
}
