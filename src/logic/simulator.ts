/* ──────────────────────────────────────────────────────────────
   ComfortLoop — Simulation engine
   
   Manages the simulation clock, orchestrates ticks of the
   controller, accumulates energy, and drives the energy
   comparison experiment.
   ────────────────────────────────────────────────────────────── */

import type {
  ComfortConfig,
  ConnectedDeviceEvent,
  ControlMode,
  DeviceAction,
  EnergyExperimentResult,
  EnergyExperimentSnapshot,
  FanLevel,
  LogEntry,
  PowerSnapshot,
  SensorReadings,
  SimulationState,
} from '../types';
import { DEFAULT_CONFIG } from '../types';
import {
  controllerTick,
  clearFault,
  injectFault,
  initialControllerState,
  type ControllerState,
} from './controller';
import { instantaneousPower, powerSnapshot, zeroPowerSnapshot } from './powerModel';

/* ── Initial experiment result ───────────────────────────── */

function emptyExperiment(): EnergyExperimentResult {
  return {
    snapshots: [],
    totalSimTimeMs: 0,
    comfortLoopEnergyWh: 0,
    baselineEnergyWh: 0,
    savingsPercent: 0,
    comfortLoopRunTimeMs: 0,
    baselineRunTimeMs: 0,
    comfortBandTimeMs: 0,
    status: 'idle',
    activeRunTimeMs: 0,
    awayRunTimeMs: 0,
    sleepRunTimeMs: 0,
    faultRunTimeMs: 0,
  };
}

/* ── Initial simulation state ────────────────────────────── */

export function initialSimState(): SimulationState {
  const cfg = { ...DEFAULT_CONFIG };
  const sensors: SensorReadings = {
    temperature: 28,
    humidity: 55,
    occupied: true,
    timestamp: 0,
  };
  const cs = initialControllerState();
  const { output } = controllerTick(cs, sensors, cfg, 0, new Date());

  return {
    running: false,
    simClockMs: 0,
    simClockDate: new Date(),
    sensors,
    controller: output,
    power: zeroPowerSnapshot(),
    config: cfg,
    controlMode: 'auto',
    manualLevel: 0 as FanLevel,
    faultInjected: false,
    log: [],
    connectedDeviceEvents: [],
    energyExperiment: emptyExperiment(),
    guidedDemoActive: false,
    guidedDemoStep: 0,
  };
}

/* ── Simulation tick ─────────────────────────────────────── */

export function tick(
  prev: SimulationState,
  realDeltaMs: number,
): SimulationState {
  if (!prev.running) return prev;

  const simDelta = realDeltaMs * prev.config.simulationSpeedX;
  const simClockMs = prev.simClockMs + simDelta;

  // Advance simulated date from a base of "today 8 AM"
  const baseDate = new Date();
  baseDate.setHours(8, 0, 0, 0);
  const simClockDate = new Date(baseDate.getTime() + simClockMs);

  const sensors: SensorReadings = {
    ...prev.sensors,
    timestamp: simClockMs,
  };

  // Controller state is mutable — clone for immutability
  const cs: ControllerState = {
    currentState: prev.controller.state,
    currentLevel: prev.controlMode === 'manual' ? prev.manualLevel : prev.controller.fanLevel,
    lastSpeedChangeMs: (prev as unknown as { _lastSpeedChangeMs?: number })._lastSpeedChangeMs ?? -Infinity,
    speedChangeCount: prev.controller.speedChangeCount,
    vacancyStartMs: (prev as unknown as { _vacancyStartMs?: number })._vacancyStartMs ?? -1,
    faultActive: prev.faultInjected,
    faultReason: prev.controller.faultReason,
  };

  let newLogs: LogEntry[] = [];
  let controllerOutput = prev.controller;

  if (prev.controlMode === 'auto') {
    const result = controllerTick(cs, sensors, prev.config, simClockMs, simClockDate);
    controllerOutput = result.output;
    newLogs = result.logs;
  } else {
    // Manual mode — just keep current manual level
    controllerOutput = {
      ...prev.controller,
      fanLevel: prev.manualLevel,
      pwm: prev.config.pwmMap[prev.manualLevel],
      state: prev.faultInjected ? 'FAULT' : prev.controller.state,
    };
  }

  // Power
  const power = powerSnapshot(
    controllerOutput.fanLevel,
    prev.config,
    prev.power,
    simDelta,
  );

  // Connected device events
  const connectedDeviceEvents = [...prev.connectedDeviceEvents];
  const deviceAction = evaluateConnectedDevice(sensors, controllerOutput.comfortStatus);
  if (deviceAction !== 'none') {
    const lastEvent = connectedDeviceEvents[connectedDeviceEvents.length - 1];
    if (!lastEvent || lastEvent.action !== deviceAction || simClockMs - lastEvent.timestamp > 30000) {
      connectedDeviceEvents.push({
        timestamp: simClockMs,
        topic: 'comfortloop/room1/state',
        payload: {
          occupancy: sensors.occupied ? 'occupied' : 'unoccupied',
          temperature: sensors.temperature,
          humidity: sensors.humidity,
          comfort_state: controllerOutput.comfortStatus,
          fan_level: controllerOutput.fanLevel,
          connected_device_request: deviceAction,
        },
        action: deviceAction,
      });
    }
  }

  // Energy experiment
  let energyExperiment = prev.energyExperiment;
  if (energyExperiment.status === 'running') {
    energyExperiment = tickExperiment(energyExperiment, prev.config, controllerOutput, sensors, simDelta);
  }

  // Trim logs to last 200
  const log = [...prev.log, ...newLogs].slice(-200);

  return {
    ...prev,
    running: true,
    simClockMs,
    simClockDate,
    sensors,
    controller: controllerOutput,
    power,
    log,
    connectedDeviceEvents: connectedDeviceEvents.slice(-50),
    energyExperiment,
    _lastSpeedChangeMs: cs.lastSpeedChangeMs,
    _vacancyStartMs: cs.vacancyStartMs,
  } as SimulationState;
}

/* ── Connected-device logic ──────────────────────────────── */

function evaluateConnectedDevice(
  sensors: SensorReadings,
  comfortStatus: string,
): DeviceAction {
  if (!sensors.occupied) return 'none';
  if (comfortStatus === 'hot' && sensors.humidity > 60) return 'exhaust_on';
  if (comfortStatus === 'hot') return 'ac_lower';
  if (comfortStatus === 'cold') return 'ac_raise';
  return 'none';
}

/* ── Energy experiment ───────────────────────────────────── */

export const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000;

export function tickExperiment(
  exp: EnergyExperimentResult,
  cfg: ComfortConfig,
  controllerOut: { fanLevel: FanLevel; comfortStatus: string; state?: string },
  sensors: SensorReadings,
  simDeltaMs: number,
): EnergyExperimentResult {
  if (exp.totalSimTimeMs >= EIGHT_HOURS_MS) {
    return finalizeExperiment({ ...exp, totalSimTimeMs: EIGHT_HOURS_MS });
  }

  // Clamp simDeltaMs if it would overshoot EIGHT_HOURS_MS
  const effectiveDeltaMs = Math.min(simDeltaMs, EIGHT_HOURS_MS - exp.totalSimTimeMs);
  const newTotal = exp.totalSimTimeMs + effectiveDeltaMs;
  const deltaHours = effectiveDeltaMs / 3_600_000;

  const clPower = cfg.powerMap[controllerOut.fanLevel];
  const blPower = cfg.powerMap[cfg.baselineLevel];

  const clEnergy = exp.comfortLoopEnergyWh + clPower * deltaHours;
  const blEnergy = exp.baselineEnergyWh + blPower * deltaHours;

  const clRunTime = controllerOut.fanLevel > 0
    ? exp.comfortLoopRunTimeMs + effectiveDeltaMs
    : exp.comfortLoopRunTimeMs;

  const inBand = controllerOut.comfortStatus === 'comfortable' ||
    controllerOut.comfortStatus === 'cool';
  const comfortBandTime = inBand
    ? exp.comfortBandTimeMs + effectiveDeltaMs
    : exp.comfortBandTimeMs;

  // Track operating state breakdown
  const st = controllerOut.state ?? (controllerOut.fanLevel > 0 ? 'ACTIVE' : 'AWAY');
  let activeRun = exp.activeRunTimeMs || 0;
  let awayRun = exp.awayRunTimeMs || 0;
  let sleepRun = exp.sleepRunTimeMs || 0;
  let faultRun = exp.faultRunTimeMs || 0;

  if (st === 'ACTIVE') activeRun += effectiveDeltaMs;
  else if (st === 'AWAY') awayRun += effectiveDeltaMs;
  else if (st === 'SLEEP') sleepRun += effectiveDeltaMs;
  else if (st === 'FAULT') faultRun += effectiveDeltaMs;

  // Record snapshot every simulated minute or at the very end
  const snapshots = [...exp.snapshots];
  const lastSnap = snapshots[snapshots.length - 1];
  if (!lastSnap || newTotal - lastSnap.simTimeMs >= 60000 || newTotal >= EIGHT_HOURS_MS) {
    snapshots.push({
      simTimeMs: newTotal,
      temperature: sensors.temperature,
      humidity: sensors.humidity,
      occupied: sensors.occupied,
      comfortLoopLevel: controllerOut.fanLevel,
      comfortLoopPowerW: clPower,
      comfortLoopEnergyWh: Math.round(clEnergy * 10000) / 10000,
      baselineLevel: cfg.baselineLevel,
      baselinePowerW: blPower,
      baselineEnergyWh: Math.round(blEnergy * 10000) / 10000,
      inComfortBand: inBand,
    });
  }

  const updated: EnergyExperimentResult = {
    ...exp,
    snapshots,
    totalSimTimeMs: newTotal,
    comfortLoopEnergyWh: clEnergy,
    baselineEnergyWh: blEnergy,
    comfortLoopRunTimeMs: clRunTime,
    baselineRunTimeMs: exp.baselineRunTimeMs + effectiveDeltaMs,
    comfortBandTimeMs: comfortBandTime,
    activeRunTimeMs: activeRun,
    awayRunTimeMs: awayRun,
    sleepRunTimeMs: sleepRun,
    faultRunTimeMs: faultRun,
    status: newTotal >= EIGHT_HOURS_MS ? 'complete' : 'running',
  };

  if (newTotal >= EIGHT_HOURS_MS) {
    return finalizeExperiment(updated);
  }

  return updated;
}

export function finalizeExperiment(exp: EnergyExperimentResult): EnergyExperimentResult {
  const savings = (exp.baselineEnergyWh > 0 && Number.isFinite(exp.baselineEnergyWh) && Number.isFinite(exp.comfortLoopEnergyWh))
    ? ((exp.baselineEnergyWh - exp.comfortLoopEnergyWh) / exp.baselineEnergyWh) * 100
    : 0;
  return {
    ...exp,
    savingsPercent: Math.round(savings * 100) / 100,
    status: 'complete',
  };
}

export function startExperiment(state: SimulationState): SimulationState {
  return { ...state, energyExperiment: { ...emptyExperiment(), status: 'running' } };
}

export function pauseExperiment(state: SimulationState): SimulationState {
  if (state.energyExperiment.status !== 'running') return state;
  return {
    ...state,
    energyExperiment: { ...state.energyExperiment, status: 'paused' },
  };
}

export function resumeExperiment(state: SimulationState): SimulationState {
  if (state.energyExperiment.status !== 'paused') return state;
  return {
    ...state,
    energyExperiment: { ...state.energyExperiment, status: 'running' },
  };
}

export function resetExperiment(state: SimulationState): SimulationState {
  return { ...state, energyExperiment: emptyExperiment() };
}

/**
 * Execute a complete 8-hour deterministic simulation profile in one go.
 * Simulates realistic daily occupancy and ambient temperature variations:
 * - 0h-2h: Occupied morning (26.5°C, 50% RH)
 * - 2h-4h: Room unoccupied / vacant (28.0°C, 55% RH) -> fan shuts off
 * - 4h-6h: Occupied hot afternoon (33.5°C, 65% RH) -> fan speeds up
 * - 6h-8h: Occupied evening (27.0°C, 50% RH) -> moderate comfort
 */
export function runFullExperimentProfile(state: SimulationState): SimulationState {
  let exp: EnergyExperimentResult = { ...emptyExperiment(), status: 'running' };
  const cs = initialControllerState();
  const cfg = state.config;
  
  // 480 minutes in 5-minute increments (96 discrete steps)
  const stepMs = 5 * 60 * 1000;
  const totalSteps = EIGHT_HOURS_MS / stepMs;
  let simTime = 0;

  for (let i = 0; i < totalSteps; i++) {
    simTime = i * stepMs;
    const hours = simTime / 3_600_000;

    let temp = 26.5;
    let rh = 50;
    let occupied = true;

    if (hours < 2) {
      temp = 26.5 + (hours / 2) * 1.5;
      rh = 50;
      occupied = true;
    } else if (hours < 4) {
      temp = 28.0 + ((hours - 2) / 2) * 2.0;
      rh = 55;
      occupied = false; // Absent: fan will shut off
    } else if (hours < 6) {
      temp = 32.0 + Math.sin(((hours - 4) / 2) * Math.PI) * 2.5;
      rh = 65;
      occupied = true; // Peak heat: fan speeds up to level 4/5
    } else {
      temp = 29.0 - ((hours - 6) / 2) * 2.5;
      rh = 52;
      occupied = true;
    }

    const sensors: SensorReadings = {
      temperature: Math.round(temp * 10) / 10,
      humidity: Math.round(rh),
      occupied,
      timestamp: simTime,
    };

    const baseDate = new Date(2026, 9, 29, 8, 0, 0);
    const simDate = new Date(baseDate.getTime() + simTime);

    const { output } = controllerTick(cs, sensors, cfg, simTime, simDate);
    exp = tickExperiment(exp, cfg, output, sensors, stepMs);
  }

  const finalized = finalizeExperiment(exp);
  return {
    ...state,
    energyExperiment: finalized,
  };
}

/* ── Fault helpers ───────────────────────────────────────── */

export function setFault(state: SimulationState, reason: string): SimulationState {
  return {
    ...state,
    faultInjected: true,
    controller: {
      ...state.controller,
      faultReason: reason,
      state: 'FAULT',
    },
  };
}

export function removeFault(state: SimulationState): SimulationState {
  return {
    ...state,
    faultInjected: false,
    controller: {
      ...state.controller,
      faultReason: '',
      state: 'ACTIVE',
    },
  };
}

/* ── CSV export ──────────────────────────────────────────── */

export function experimentToCSV(exp: EnergyExperimentResult): string {
  const headers = [
    'sim_time_min', 'temperature_C', 'humidity_pct', 'occupied',
    'comfortloop_level', 'comfortloop_power_W', 'comfortloop_energy_Wh',
    'baseline_level', 'baseline_power_W', 'baseline_energy_Wh',
    'in_comfort_band',
  ];
  const rows = exp.snapshots.map(s => [
    (s.simTimeMs / 60000).toFixed(1),
    s.temperature.toFixed(1),
    s.humidity.toFixed(0),
    s.occupied ? '1' : '0',
    s.comfortLoopLevel,
    s.comfortLoopPowerW.toFixed(2),
    s.comfortLoopEnergyWh.toFixed(4),
    s.baselineLevel,
    s.baselinePowerW.toFixed(2),
    s.baselineEnergyWh.toFixed(4),
    s.inComfortBand ? '1' : '0',
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}
