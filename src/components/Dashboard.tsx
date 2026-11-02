import React from 'react';
import { EnvironmentalPanel } from './EnvironmentalPanel';
import { OccupancyControls } from './OccupancyControls';
import { FanVisualization } from './FanVisualization';
import { ControlStatePanel } from './ControlStatePanel';
import { PowerPanel } from './PowerPanel';
import { ConnectedDevicePanel } from './ConnectedDevicePanel';
import { EventLog } from './EventLog';
import type { ComfortConfig, ControlMode, FanLevel, SimulationState } from '../types';

interface DashboardProps {
  simState: SimulationState;
  onUpdateTemp: (temp: number) => void;
  onUpdateHumidity: (humidity: number) => void;
  onUpdateTargetTemp: (target: number) => void;
  onUpdateHysteresis: (hyst: number) => void;
  onToggleOccupancy: () => void;
  onToggleDemoTimer: (useDemo: boolean) => void;
  onToggleControlMode: () => void;
  onSetManualLevel: (level: FanLevel) => void;
  onUpdateAirflow: (level: FanLevel, val: number) => void;
  onToggleSleepMode: () => void;
  onInjectFault: (reason: string) => void;
  onClearFault: () => void;
  onUpdateSleepMaxLevel: (level: FanLevel) => void;
  onUpdateFallbackLevel: (level: FanLevel) => void;
  onUpdatePowerMap: (level: FanLevel, watts: number) => void;
  onClearLogs: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  simState,
  onUpdateTemp,
  onUpdateHumidity,
  onUpdateTargetTemp,
  onUpdateHysteresis,
  onToggleOccupancy,
  onToggleDemoTimer,
  onToggleControlMode,
  onSetManualLevel,
  onUpdateAirflow,
  onToggleSleepMode,
  onInjectFault,
  onClearFault,
  onUpdateSleepMaxLevel,
  onUpdateFallbackLevel,
  onUpdatePowerMap,
  onClearLogs,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Row: Environmental Monitoring & Virtual Fan */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '1.25rem' }}>
        <EnvironmentalPanel
          sensors={simState.sensors}
          controller={simState.controller}
          config={simState.config}
          onUpdateTemp={onUpdateTemp}
          onUpdateHumidity={onUpdateHumidity}
          onUpdateTargetTemp={onUpdateTargetTemp}
          onUpdateHysteresis={onUpdateHysteresis}
        />

        <FanVisualization
          controller={simState.controller}
          config={simState.config}
          controlMode={simState.controlMode}
          manualLevel={simState.manualLevel}
          onToggleControlMode={onToggleControlMode}
          onSetManualLevel={onSetManualLevel}
          onUpdateAirflow={onUpdateAirflow}
        />
      </div>

      {/* Middle Row: Occupancy & State Machine */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '1.25rem' }}>
        <OccupancyControls
          sensors={simState.sensors}
          controller={simState.controller}
          config={simState.config}
          onToggleOccupancy={onToggleOccupancy}
          onToggleDemoTimer={onToggleDemoTimer}
        />

        <ControlStatePanel
          controller={simState.controller}
          config={simState.config}
          faultInjected={simState.faultInjected}
          onToggleSleepMode={onToggleSleepMode}
          onInjectFault={onInjectFault}
          onClearFault={onClearFault}
          onUpdateSleepMaxLevel={onUpdateSleepMaxLevel}
          onUpdateFallbackLevel={onUpdateFallbackLevel}
        />
      </div>

      {/* Third Row: Power Telemetry, Connected Devices & Event Log */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
        <PowerPanel
          power={simState.power}
          config={simState.config}
          onUpdatePowerMap={onUpdatePowerMap}
        />

        <ConnectedDevicePanel
          sensors={simState.sensors}
          controller={simState.controller}
          events={simState.connectedDeviceEvents}
        />

        <EventLog
          logs={simState.log}
          onClearLogs={onClearLogs}
        />
      </div>
    </div>
  );
};

