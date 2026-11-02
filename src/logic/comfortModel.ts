/* ──────────────────────────────────────────────────────────────
   ComfortLoop — Comfort & apparent-temperature model
   
   Equation from the project abstract:
     AT = T + 0.33·e − 0.70·ws − 4.00
   where
     e = (RH / 100) × 6.105 × exp(17.27·T / (237.7 + T))
   
   Variables:
     T   = dry-bulb temperature (°C)
     RH  = relative humidity (%)
     ws  = wind speed (m/s)  — here approximated from the fan level
     e   = water-vapour pressure (hPa)
   
   LIMITATIONS (must be communicated to users):
   • The fan airspeed is NOT directly measured by this virtual prototype.
   • The airflow lookup table is an UNCALIBRATED SIMULATION ASSUMPTION.
   • The model does NOT account for radiant temperature, clothing
     insulation (clo), metabolic activity (met), room geometry,
     furniture, or individual physiological variation.
   • Apparent temperature is an APPROXIMATION for demonstration purposes.
   ────────────────────────────────────────────────────────────── */

import type { ComfortStatus, FanLevel } from '../types';

/**
 * Calculate water-vapour pressure e (hPa).
 *   e = (RH / 100) × 6.105 × exp(17.27 × T / (237.7 + T))
 */
export function vapourPressure(tempC: number, rh: number): number {
  return (rh / 100) * 6.105 * Math.exp((17.27 * tempC) / (237.7 + tempC));
}

/**
 * Calculate apparent temperature (°C).
 *   AT = T + 0.33·e − 0.70·ws − 4.00
 *
 * @param tempC  Dry-bulb temperature in °C
 * @param rh     Relative humidity in %
 * @param ws     Assumed airspeed in m/s (from the lookup table)
 */
export function apparentTemperature(tempC: number, rh: number, ws: number): number {
  const e = vapourPressure(tempC, rh);
  return tempC + 0.33 * e - 0.70 * ws - 4.0;
}

/**
 * Classify comfort status from apparent temperature relative to target.
 */
export function classifyComfort(
  apparentTemp: number,
  target: number,
  hysteresis: number,
): ComfortStatus {
  const diff = apparentTemp - target;
  if (diff < -(hysteresis + 3)) return 'cold';
  if (diff < -hysteresis)        return 'cool';
  if (diff <=  hysteresis)       return 'comfortable';
  if (diff <=  hysteresis + 3)   return 'warm';
  return 'hot';
}

/**
 * Select the desired fan level based on how far the apparent temperature
 * deviates from the target, respecting hysteresis.
 *
 * Returns the ideal level WITHOUT considering rate-limiting, sleep caps,
 * or mode — those are applied by the controller.
 */
export function desiredFanLevel(
  apparentTemp: number,
  target: number,
  hysteresis: number,
  currentLevel: FanLevel,
): FanLevel {
  const diff = apparentTemp - target;

  // Below lower hysteresis boundary → OFF
  if (diff < -hysteresis) return 0;

  // Inside hysteresis band → maintain current level (avoid oscillation)
  if (diff >= -hysteresis && diff <= hysteresis) return currentLevel;

  // Above hysteresis — graduated steps
  if (diff <= 1.5) return 1;
  if (diff <= 3.0) return 2;
  if (diff <= 4.5) return 3;
  if (diff <= 6.0) return 4;
  return 5;
}
