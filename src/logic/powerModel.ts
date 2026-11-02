/* ──────────────────────────────────────────────────────────────
   ComfortLoop — Simulated power model (INA219 equivalent)
   
   SIMULATED ESTIMATES — NOT MEASURED HARDWARE DATA
   
   This module models a 12 V DC fan's power draw at each speed
   level using a configurable lookup table.  The values are
   engineering estimates for demonstration purposes only.
   ────────────────────────────────────────────────────────────── */

import type { ComfortConfig, FanLevel, PowerSnapshot } from '../types';

const NOMINAL_VOLTAGE = 12.0; // V

/**
 * Calculate instantaneous power metrics for a given fan level.
 */
export function instantaneousPower(
  level: FanLevel,
  cfg: ComfortConfig,
): { voltage: number; current: number; power: number } {
  const power = cfg.powerMap[level];
  const voltage = NOMINAL_VOLTAGE;
  const current = voltage > 0 ? power / voltage : 0;
  return { voltage, current: Math.round(current * 1000) / 1000, power };
}

/**
 * Accumulate energy from two consecutive ticks.
 *
 * Uses trapezoidal integration:
 *   ΔE = (P₁ + P₂) / 2 × Δt
 */
export function accumulateEnergy(
  prevSnapshot: PowerSnapshot,
  currentPowerW: number,
  deltaMs: number,
): number {
  const avgPower = (prevSnapshot.power + currentPowerW) / 2;
  const deltaHours = deltaMs / 3_600_000;
  return prevSnapshot.energyWh + avgPower * deltaHours;
}

/**
 * Build a full PowerSnapshot.
 */
export function powerSnapshot(
  level: FanLevel,
  cfg: ComfortConfig,
  prevSnapshot: PowerSnapshot,
  deltaMs: number,
): PowerSnapshot {
  const { voltage, current, power } = instantaneousPower(level, cfg);
  const energyWh = accumulateEnergy(prevSnapshot, power, deltaMs);
  return {
    voltage,
    current,
    power,
    energyWh: Math.round(energyWh * 10000) / 10000,
  };
}

export function zeroPowerSnapshot(): PowerSnapshot {
  return { voltage: 12.0, current: 0, power: 0, energyWh: 0 };
}
