import { KeyRound, Link2, MonitorUp, PlayCircle, ShieldCheck } from 'lucide-react';

const launchedSteps = [
  { label: 'Player App Launch', detail: 'Runtime initialized', icon: PlayCircle },
  { label: 'Device ID detected', detail: 'SCREEN-001 found in local state', icon: MonitorUp },
  { label: 'Authenticate with device token', detail: 'Token accepted by mock API', icon: ShieldCheck },
  { label: 'Fetch assigned manifest', detail: 'manifest_lobby_sg_001', icon: Link2 },
  { label: 'Start playback', detail: 'Loop schedule is now active', icon: PlayCircle },
];

const firstBootSteps = [
  { label: 'No device bound', detail: 'This screen is not linked to a tenant yet' },
  { label: 'Show Activation Code', detail: 'A7K9Q2' },
  { label: 'Waiting for screen binding', detail: 'Admin binds code in control panel' },
];

export default function StartupCaseScreen({ booting, device, effectiveOnline, manifest }) {
  return (
    <section className="startup-case-screen">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <div className="startup-hero">
        <span className="eyebrow">Managed Screen Device</span>
        <h2>Player 不是普通网页，而是被后台管理的独立屏幕设备</h2>
        <p>
          Demo 展示 Player 打开后如何识别设备身份、完成鉴权、拉取 assigned manifest，并进入播放状态。
        </p>
      </div>

      <div className="startup-grid">
        <div className="device-card glass-panel">
          <div className="device-visual">
            <div className="device-screen">
              <span className={effectiveOnline ? 'dot online' : 'dot offline'} />
              <strong>{booting ? 'Connecting...' : 'Playback Ready'}</strong>
            </div>
          </div>
          <div className="device-facts">
            <div>
              <span>Device ID</span>
              <strong>SCREEN-001</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>{booting ? 'Connecting...' : effectiveOnline ? 'Authenticated' : 'Offline cached'}</strong>
            </div>
            <div>
              <span>Activation Code</span>
              <strong>A7K9Q2</strong>
            </div>
            <div>
              <span>Assigned Manifest</span>
              <strong>{manifest?.manifest_id || 'Waiting...'}</strong>
            </div>
          </div>
        </div>

        <div className="startup-timeline glass-panel">
          <div className="section-title">
            <span>Known Device Flow</span>
            <small>{device?.device_id || 'local mock identity'}</small>
          </div>
          {launchedSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div className="timeline-item" key={step.label}>
                <span className="timeline-index">{index + 1}</span>
                <Icon size={18} />
                <div>
                  <strong>{step.label}</strong>
                  <p>{step.detail}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="activation-card glass-panel">
          <div className="section-title">
            <span>First Launch Flow</span>
            <KeyRound size={17} />
          </div>
          {firstBootSteps.map((step) => (
            <div className="activation-step" key={step.label}>
              <strong>{step.label}</strong>
              <p>{step.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
