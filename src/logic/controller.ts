/* ──────────────────────────────────────────────────────────────
   ComfortLoop — Deterministic state-machine controller
   
   This module is the core control loop.  It is intentionally
   free of side-effects and UI coupling so it can be tested
   independently and later ported to embedded C++.
   ────────────────────────────────────────────────────────────── */

import type {
  ComfortConfig,
  ControllerOutput,
  ControlState,
  FanLevel,
  LogEntry,
  SensorReadings,
} from '../types';
import {
  apparentTemperature,
  classifyComfort,
  desiredFanLevel,
} from './comfortModel';

/* ── Internal mutable state ──────────────────────────────── */

export interface ControllerState {
  currentState: ControlState;
  currentLevel: FanLevel;
  lastSpeedChangeMs: number;
  speedChangeCount: number;
  vacancyStartMs: number;       // -1 when occupied
  faultActive: boolean;
  faultReason: string;
}

export function initialControllerState(): ControllerState {
  return {
    currentState: 'ACTIVE',
    currentLevel: 0,
    lastSpeedChangeMs: -Infinity,
    speedChangeCount: 0,
    vacancyStartMs: -1,
    faultActive: false,
    faultReason: '',
  };
}

/* ── Helpers ─────────────────────────────────────────────── */

function isSleepTime(simDate: Date, cfg: ComfortConfig): boolean {
  if (!cfg.sleepEnabled) return false;
  const h = simDate.getHours();
  if (cfg.sleepStartHour > cfg.sleepEndHour) {
    // crosses midnight, e.g. 22–6
    return h >= cfg.sleepStartHour || h < cfg.sleepEndHour;
  }
  return h >= cfg.sleepStartHour && h < cfg.sleepEndHour;
}

function clampLevel(level: FanLevel, max: FanLevel): FanLevel {
  return (level > max ? max : level) as FanLevel;
}

/* ── Main tick function ──────────────────────────────────── */

/**
 * Pure(-ish) tick:  given current internal state, sensor readings,
 * configuration and simulation clock, compute the next controller
 * output.  Mutates `cs` in place for performance, but is otherwise
 * deterministic — same inputs → same outputs.
 *
 * Returns the output AND any new log entries.
 */
export function controllerTick(
  cs: ControllerState,
  sensors: SensorReadings,
  cfg: ComfortConfig,
  simClockMs: number,
  simDate: Date,
): { output: ControllerOutput; logs: LogEntry[] } {
  const logs: LogEntry[] = [];

  const addLog = (event: string, detail: string) => {
    logs.push({ simTimeMs: simClockMs, wallTime: Date.now(), event, detail });
  };

  // ── 1. Validate inputs ───────────────────────────────────
  const tempValid  = sensors.temperature >= -40 && sensors.temperature <= 80;
  const humValid   = sensors.humidity >= 0 && sensors.humidity <= 100;

  if (!tempValid || !humValid) {
    if (!cs.faultActive) {
      cs.faultActive = true;
      cs.faultReason = `Sensor out of range: T=${sensors.temperature}°C, RH=${sensors.humidity}%`;
      addLog('FAULT', cs.faultReason);
    }
  }

  // ── 2. Handle fault ──────────────────────────────────────
  if (cs.faultActive) {
    const prevState = cs.currentState;
    cs.currentState = 'FAULT';
    if (prevState !== 'FAULT') addLog('STATE_CHANGE', `${prevState} → FAULT`);

    const fallback = cfg.faultFallbackLevel;
    if (cs.currentLevel !== fallback) {
      cs.currentLevel = fallback;
      cs.speedChangeCount++;
      cs.lastSpeedChangeMs = simClockMs;
      addLog('FAN_SPEED', `Fallback level ${fallback}`);
    }

    return {
      output: buildOutput(cs, sensors, cfg, simClockMs),
      logs,
    };
  }

  // ── 3. Occupancy & vacancy timer ─────────────────────────
  const vacancyDelay = cfg.useDemoTimer
    ? cfg.demoVacancyDelayMs
    : cfg.vacancyDelayMs;

  if (sensors.occupied) {
    if (cs.vacancyStartMs !== -1) {
      addLog('OCCUPANCY', 'Presence detected — vacancy timer reset');
      cs.vacancyStartMs = -1;
    }
  } else {
    if (cs.vacancyStartMs === -1) {
      cs.vacancyStartMs = simClockMs;
      addLog('OCCUPANCY', 'Vacancy detected — timer started');
    }
  }

  const vacancyElapsed = cs.vacancyStartMs === -1
    ? 0
    : simClockMs - cs.vacancyStartMs;
  const isAway = !sensors.occupied && vacancyElapsed >= vacancyDelay;

  // ── 4. Determine state ───────────────────────────────────
  let nextState: ControlState;
  if (isAway) {
    nextState = 'AWAY';
  } else if (isSleepTime(simDate, cfg) && sensors.occupied) {
    nextState = 'SLEEP';
  } else if (sensors.occupied) {
    nextState = 'ACTIVE';
  } else {
    // vacancy countdown still in progress — remain ACTIVE
    nextState = cs.currentState === 'SLEEP' ? 'SLEEP' : 'ACTIVE';
  }

  if (nextState !== cs.currentState) {
    addLog('STATE_CHANGE', `${cs.currentState} → ${nextState}`);
    cs.currentState = nextState;
  }

  // ── 5. Compute comfort & desired level ───────────────────
  const airflow = cfg.airflowMap[cs.currentLevel];
  const at = apparentTemperature(sensors.temperature, sensors.humidity, airflow);
  let wanted = desiredFanLevel(at, cfg.targetTemp, cfg.hysteresis, cs.currentLevel);

  // ── 6. Apply state-specific constraints ──────────────────
  if (cs.currentState === 'AWAY') {
    wanted = 0;
  } else if (cs.currentState === 'SLEEP') {
    wanted = clampLevel(wanted, cfg.sleepMaxLevel);
  }

  // ── 7. Rate-limit speed changes ──────────────────────────
  const timeSinceLastChange = simClockMs - cs.lastSpeedChangeMs;
  if (
    wanted !== cs.currentLevel &&
    timeSinceLastChange >= cfg.minSpeedChangeIntervalMs
  ) {
    // For SLEEP mode, only change by ±1 step at a time
    if (cs.currentState === 'SLEEP') {
      if (wanted > cs.currentLevel) {
        wanted = (cs.currentLevel + 1) as FanLevel;
      } else if (wanted < cs.currentLevel) {
        wanted = (cs.currentLevel - 1) as FanLevel;
      }
    }

    addLog('FAN_SPEED', `Level ${cs.currentLevel} → ${wanted}`);
    cs.currentLevel = wanted;
    cs.speedChangeCount++;
    cs.lastSpeedChangeMs = simClockMs;
  }

  return {
    output: buildOutput(cs, sensors, cfg, simClockMs),
    logs,
  };
}

/* ── Build output object ─────────────────────────────────── */

function buildOutput(
  cs: ControllerState,
  sensors: SensorReadings,
  cfg: ComfortConfig,
  simClockMs: number,
): ControllerOutput {
  const airflow = cfg.airflowMap[cs.currentLevel];
  const at = apparentTemperature(sensors.temperature, sensors.humidity, airflow);
  const comfort = classifyComfort(at, cfg.targetTemp, cfg.hysteresis);

  const vacancyDelay = cfg.useDemoTimer
    ? cfg.demoVacancyDelayMs
    : cfg.vacancyDelayMs;

  let vacancyRemainingMs = 0;
  if (!sensors.occupied && cs.vacancyStartMs !== -1) {
    const elapsed = simClockMs - cs.vacancyStartMs;
    vacancyRemainingMs = Math.max(0, vacancyDelay - elapsed);
  }

  return {
    state: cs.currentState,
    fanLevel: cs.currentLevel,
    pwm: cfg.pwmMap[cs.currentLevel],
    apparentTemp: Math.round(at * 100) / 100,
    comfortStatus: comfort,
    vacancyRemainingMs,
    speedChangeCount: cs.speedChangeCount,
    faultReason: cs.faultReason,
  };
}

/* ── Fault injection / clearing ──────────────────────────── */

export function injectFault(cs: ControllerState, reason: string): void {
  cs.faultActive = true;
  cs.faultReason = reason;
}

export function clearFault(cs: ControllerState): void {
  cs.faultActive = false;
  cs.faultReason = '';
  cs.currentState = 'ACTIVE';
}
