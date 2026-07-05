import {
  AlertTriangle,
  DownloadCloud,
  KeyRound,
  RotateCcw,
  Satellite,
  ShieldCheck,
  Siren,
  Trash2,
  Wifi,
  WifiOff,
} from 'lucide-react';

export default function ControlPanel({
  appBooting,
  deviceBound,
  effectiveOnline,
  forcedOffline,
  publishNewManifest,
  reconnectAndSync,
  recoverFromSafeMode,
  setForcedOffline,
  setDeviceBound,
  simulateDownloadFailure,
  simulateRemoteCommand,
  syncManifest,
  triggerSafeMode,
}) {
  return (
    <div className="control-panel player-console">
      <div className="action-group primary-action">
        <span>Primary Action</span>
        <button className="control-button primary" type="button" onClick={publishNewManifest}>
          <DownloadCloud size={17} />
          Push to Screen
        </button>
      </div>

      <div className="action-group">
        <span>Maintenance</span>
        <button className="control-button" type="button" disabled={appBooting} onClick={() => syncManifest('manual')}>
          <RotateCcw size={17} />
          Pull Manifest
        </button>
        <button className="control-button" type="button" onClick={() => simulateRemoteCommand('COMMAND_SYNC_NOW')}>
          <Satellite size={17} />
          Sync Now
        </button>
        <button className="control-button" type="button" onClick={reconnectAndSync}>
          <Wifi size={17} />
          Reconnect and Sync
        </button>
        <button className="control-button" type="button" onClick={() => simulateRemoteCommand('COMMAND_CLEAR_CACHE')}>
          <Trash2 size={17} />
          Clear Cache
        </button>
      </div>

      <div className="action-group demo-action">
        <span>Service State</span>
        <button className={!deviceBound ? 'control-button active' : 'control-button'} type="button" onClick={() => setDeviceBound(!deviceBound)}>
          <KeyRound size={17} />
          {deviceBound ? 'Unbound Service' : 'Bound Service'}
        </button>
        <button className={forcedOffline ? 'control-button danger active' : 'control-button'} type="button" onClick={() => setForcedOffline(!forcedOffline)}>
          {effectiveOnline ? <Wifi size={17} /> : <WifiOff size={17} />}
          {forcedOffline ? 'Online Mode' : 'Offline Mode'}
        </button>
        <button className="control-button danger" type="button" onClick={simulateDownloadFailure}>
          <AlertTriangle size={17} />
          Download Failure
        </button>
      </div>

      <div className="action-group danger-zone">
        <span>Danger Zone</span>
        <button className="control-button danger" type="button" onClick={triggerSafeMode}>
          <ShieldCheck size={17} />
          Trigger Safe Mode
        </button>
        <button className="control-button" type="button" onClick={recoverFromSafeMode}>
          <ShieldCheck size={17} />
          Recover Playback
        </button>
        <button className="control-button emergency" type="button" onClick={() => simulateRemoteCommand('COMMAND_EMERGENCY_OVERRIDE')}>
          <Siren size={17} />
          Emergency Override
        </button>
      </div>
    </div>
  );
}
