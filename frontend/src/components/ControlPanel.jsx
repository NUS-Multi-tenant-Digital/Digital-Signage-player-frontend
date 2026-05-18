import {
  AlertTriangle,
  Clock3,
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
  fastForwardSchedule,
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
      <button className={!deviceBound ? 'control-button active' : 'control-button'} type="button" onClick={() => setDeviceBound(!deviceBound)}>
        <KeyRound size={17} />
        {deviceBound ? '模拟首次未绑定' : '绑定设备 SCREEN-001'}
      </button>
      <button className="control-button" type="button" disabled={appBooting} onClick={() => syncManifest('manual')}>
        <RotateCcw size={17} />
        拉取 Manifest
      </button>
      <button className="control-button" type="button" onClick={fastForwardSchedule}>
        <Clock3 size={17} />
        快进到 11:00
      </button>
      <button className="control-button" type="button" onClick={publishNewManifest}>
        <DownloadCloud size={17} />
        发布新 Manifest
      </button>
      <button className={forcedOffline ? 'control-button danger active' : 'control-button'} type="button" onClick={() => setForcedOffline(!forcedOffline)}>
        {effectiveOnline ? <Wifi size={17} /> : <WifiOff size={17} />}
        {forcedOffline ? '恢复在线' : '模拟离线'}
      </button>
      <button className="control-button" type="button" onClick={reconnectAndSync}>
        <Wifi size={17} />
        恢复联网并同步
      </button>
      <button className="control-button" type="button" onClick={() => simulateRemoteCommand('COMMAND_SYNC_NOW')}>
        <Satellite size={17} />
        模拟远程 SYNC_NOW
      </button>
      <button className="control-button" type="button" onClick={() => simulateRemoteCommand('COMMAND_CLEAR_CACHE')}>
        <Trash2 size={17} />
        清理缓存
      </button>
      <button className="control-button danger" type="button" onClick={simulateDownloadFailure}>
        <AlertTriangle size={17} />
        模拟下载失败
      </button>
      <button className="control-button danger" type="button" onClick={triggerSafeMode}>
        <ShieldCheck size={17} />
        触发 Safe Mode
      </button>
      <button className="control-button" type="button" onClick={recoverFromSafeMode}>
        <ShieldCheck size={17} />
        恢复正常播放
      </button>
      <button className="control-button emergency" type="button" onClick={() => simulateRemoteCommand('COMMAND_EMERGENCY_OVERRIDE')}>
        <Siren size={17} />
        紧急覆盖推送
      </button>
    </div>
  );
}
