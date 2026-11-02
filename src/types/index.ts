/* ──────────────────────────────────────────────────────────────
   ComfortLoop — Type definitions
   ────────────────────────────────────────────────────────────── */

/** Discrete fan speed levels 0 (OFF) through 5. */
export type FanLevel = 0 | 1 | 2 | 3 | 4 | 5;

/** Navigation tab identifiers. */
export type TabId = 'dashboard' | 'experiment' | 'circuit' | 'firmware' | 'cad';

/** Controller operating states. */
export type ControlState = 'ACTIVE' | 'AWAY' | 'SLEEP' | 'FAULT';

/** Comfort band classification. */
export type ComfortStatus = 'cold' | 'cool' | 'comfortable' | 'warm' | 'hot';

/** Connected-device action requests. */
export type DeviceAction = 'none' | 'exhaust_on' | 'exhaust_off' | 'ac_lower' | 'ac_raise';

/** Fan control mode. */
export type ControlMode = 'auto' | 'manual';

/* ── PWM mapping ──────────────────────────────────────────── */

/** Default PWM values per level (simulation settings, NOT calibrated). */
export const DEFAULT_PWM_MAP: Record<FanLevel, number> = {
  0: 0,
  1: 80,
  2: 120,
  3: 160,
  4: 210,
  5: 255,
};

/** Default assumed airflow (m/s) per fan level.
 *  UNCALIBRATED SIMULATION ASSUMPTION — values must be validated
 *  against physical hardware before use.                         */
export const DEFAULT_AIRFLOW_MAP: Record<FanLevel, number> = {
  0: 0.0,
  1: 0.3,
  2: 0.7,
  3: 1.2,
  4: 1.8,
  5: 2.5,
};

/** Default assumed power draw (W) per fan level.
 *  SIMULATED ESTIMATE — not measured hardware data.              */
export const DEFAULT_POWER_MAP: Record<FanLevel, number> = {
  0: 0.0,
  1: 1.8,
  2: 3.2,
  3: 5.5,
  4: 8.4,
  5: 12.0,
};

/* ── Sensor readings ──────────────────────────────────────── */

export interface SensorReadings {
  temperature: number;       // °C
  humidity: number;          // % RH
  occupied: boolean;
  timestamp: number;         // ms epoch (simulation clock)
}

/* ── Configuration ────────────────────────────────────────── */

export interface ComfortConfig {
  targetTemp: number;          // °C — default 26
  hysteresis: number;          // °C — default 0.5
  vacancyDelayMs: number;      // ms — default 300 000 (5 min)
  demoVacancyDelayMs: number;  // ms — default 5 000
  useDemoTimer: boolean;
  sleepEnabled: boolean;
  sleepStartHour: number;      // 0–23 — default 22
  sleepEndHour: number;        // 0–23 — default 6
  sleepMaxLevel: FanLevel;     // default 2
  minSpeedChangeIntervalMs: number; // ms — default 5 000
  pwmMap: Record<FanLevel, number>;
  airflowMap: Record<FanLevel, number>;
  powerMap: Record<FanLevel, number>;
  faultFallbackLevel: FanLevel; // default 2
  baselineLevel: FanLevel;      // for energy comparison — default 3
  simulationSpeedX: number;     // clock multiplier — default 60
}

export const DEFAULT_CONFIG: ComfortConfig = {
  targetTemp: 26,
  hysteresis: 0.5,
  vacancyDelayMs: 5 * 60 * 1000,
  demoVacancyDelayMs: 5000,
  useDemoTimer: false,
  sleepEnabled: false,
  sleepStartHour: 22,
  sleepEndHour: 6,
  sleepMaxLevel: 2,
  minSpeedChangeIntervalMs: 5000,
  pwmMap: { ...DEFAULT_PWM_MAP },
  airflowMap: { ...DEFAULT_AIRFLOW_MAP },
  powerMap: { ...DEFAULT_POWER_MAP },
  faultFallbackLevel: 2,
  baselineLevel: 3,
  simulationSpeedX: 60,
};

/* ── Controller output ────────────────────────────────────── */

export interface ControllerOutput {
  state: ControlState;
  fanLevel: FanLevel;
  pwm: number;
  apparentTemp: number;
  comfortStatus: ComfortStatus;
  vacancyRemainingMs: number;
  speedChangeCount: number;
  faultReason: string;
}

/* ── Power snapshot ───────────────────────────────────────── */

export interface PowerSnapshot {
  voltage: number;   // V  (simulated ~12 V)
  current: number;   // A
  power: number;     // W
  energyWh: number;  // cumulative Wh
}

/* ── Event log ────────────────────────────────────────────── */

export interface LogEntry {
  simTimeMs: number;
  wallTime: number;
  event: string;
  detail: string;
}

/* ── Energy experiment ────────────────────────────────────── */

export interface EnergyExperimentSnapshot {
  simTimeMs: number;
  temperature: number;
  humidity: number;
  occupied: boolean;
  comfortLoopLevel: FanLevel;
  comfortLoopPowerW: number;
  comfortLoopEnergyWh: number;
  baselineLevel: FanLevel;
  baselinePowerW: number;
  baselineEnergyWh: number;
  inComfortBand: boolean;
}

export interface EnergyExperimentResult {
  snapshots: EnergyExperimentSnapshot[];
  totalSimTimeMs: number;
  comfortLoopEnergyWh: number;
  baselineEnergyWh: number;
  savingsPercent: number;
  comfortLoopRunTimeMs: number;
  baselineRunTimeMs: number;
  comfortBandTimeMs: number;
  status: 'idle' | 'running' | 'paused' | 'complete';
  activeRunTimeMs: number;
  awayRunTimeMs: number;
  sleepRunTimeMs: number;
  faultRunTimeMs: number;
}

/* ── Connected-device event ───────────────────────────────── */

export interface ConnectedDeviceEvent {
  timestamp: number;
  topic: string;
  payload: Record<string, unknown>;
  action: DeviceAction;
}

/* ── Simulation state (full snapshot) ─────────────────────── */

export interface SimulationState {
  running: boolean;
  simClockMs: number;
  simClockDate: Date;
  sensors: SensorReadings;
  controller: ControllerOutput;
  power: PowerSnapshot;
  config: ComfortConfig;
  controlMode: ControlMode;
  manualLevel: FanLevel;
  faultInjected: boolean;
  log: LogEntry[];
  connectedDeviceEvents: ConnectedDeviceEvent[];
  energyExperiment: EnergyExperimentResult;
  guidedDemoActive: boolean;
  guidedDemoStep: number;
}
