import { describe, it, expect, beforeEach } from 'vitest';
import {
  initialControllerState,
  controllerTick,
  injectFault,
  clearFault,
  type ControllerState,
} from '../src/logic/controller';
import {
  apparentTemperature,
  classifyComfort,
  desiredFanLevel,
  vapourPressure,
} from '../src/logic/comfortModel';
import {
  instantaneousPower,
  accumulateEnergy,
  powerSnapshot,
  zeroPowerSnapshot,
} from '../src/logic/powerModel';
import {
  initialSimState,
  tick,
  startExperiment,
  resetExperiment,
  runFullExperimentProfile,
  finalizeExperiment,
  experimentToCSV,
} from '../src/logic/simulator';
import { DEFAULT_CONFIG, type ComfortConfig, type SensorReadings } from '../src/types';

describe('ComfortLoop Controller & Model Tests (Section 15 Verification)', () => {
  let cfg: ComfortConfig;
  let cs: ControllerState;
  const baseDate = new Date(2026, 9, 29, 14, 0, 0); // 2:00 PM (daytime)
  const sleepDate = new Date(2026, 9, 29, 23, 0, 0); // 11:00 PM (nighttime)

  beforeEach(() => {
    cfg = { ...DEFAULT_CONFIG, minSpeedChangeIntervalMs: 0 }; // 0 interval for direct transition testing
    cs = initialControllerState();
  });

  // Test 1: Occupied + comfortable room → appropriate low fan speed (or off if around target)
  it('Test 1: Occupied + comfortable room produces low/appropriate fan speed', () => {
    // Target is 26°C. At 26°C and 50% RH, ws=0:
    // e = 0.5 * 6.105 * exp(17.27 * 26 / 263.7) ~ 16.8 hPa
    // AT = 26 + 0.33 * 16.8 - 4.0 = ~27.5°C -> slight warm diff (+1.5) -> Level 1
    const sensors: SensorReadings = {
      temperature: 25.0,
      humidity: 45,
      occupied: true,
      timestamp: 1000,
    };
    const { output } = controllerTick(cs, sensors, cfg, 1000, baseDate);
    expect(output.state).toBe('ACTIVE');
    expect(output.comfortStatus).toMatch(/comfortable|cool|cold/);
    expect(output.fanLevel).toBeLessThanOrEqual(1);
  });

  // Test 2: Occupied + hot room → fan speed increases
  it('Test 2: Occupied + hot room increases fan speed to high levels', () => {
    const sensors: SensorReadings = {
      temperature: 34.0,
      humidity: 70,
      occupied: true,
      timestamp: 1000,
    };
    const { output } = controllerTick(cs, sensors, cfg, 1000, baseDate);
    expect(output.state).toBe('ACTIVE');
    expect(output.comfortStatus).toBe('hot');
    expect(output.fanLevel).toBeGreaterThanOrEqual(4);
    expect(output.pwm).toBeGreaterThanOrEqual(210);
  });

  // Test 3: Unoccupied for less than the timeout → vacancy countdown continues
  it('Test 3: Unoccupied for less than timeout maintains ACTIVE state with active countdown', () => {
    cfg.vacancyDelayMs = 300000; // 5 minutes
    cfg.useDemoTimer = false;

    // Start with fan running in hot room
    const sensorsOccupied: SensorReadings = {
      temperature: 32.0,
      humidity: 60,
      occupied: true,
      timestamp: 0,
    };
    controllerTick(cs, sensorsOccupied, cfg, 0, baseDate);

    // Person leaves at t = 10,000 ms
    const sensorsVacant: SensorReadings = {
      temperature: 32.0,
      humidity: 60,
      occupied: false,
      timestamp: 10000,
    };
    const { output: out1 } = controllerTick(cs, sensorsVacant, cfg, 10000, baseDate);
    expect(out1.state).toBe('ACTIVE');
    expect(out1.vacancyRemainingMs).toBe(300000);

    // Halfway through timeout at t = 160,000 ms (150s elapsed)
    const { output: out2 } = controllerTick(cs, sensorsVacant, cfg, 160000, baseDate);
    expect(out2.state).toBe('ACTIVE');
    expect(out2.vacancyRemainingMs).toBe(150000);
    expect(out2.fanLevel).toBeGreaterThan(0); // Fan still running during grace period
  });

  // Test 4: Unoccupied for the full timeout → fan switches off
  it('Test 4: Unoccupied for full timeout enters AWAY state and turns fan OFF (level 0)', () => {
    cfg.vacancyDelayMs = 5000; // 5s timeout
    cfg.useDemoTimer = false;

    // Person leaves at t = 0
    const sensorsVacant: SensorReadings = {
      temperature: 32.0,
      humidity: 60,
      occupied: false,
      timestamp: 0,
    };
    controllerTick(cs, sensorsVacant, cfg, 0, baseDate);

    // Advance to t = 5000 ms (full timeout)
    const { output } = controllerTick(cs, sensorsVacant, cfg, 5000, baseDate);
    expect(output.state).toBe('AWAY');
    expect(output.fanLevel).toBe(0);
    expect(output.pwm).toBe(0);
    expect(output.vacancyRemainingMs).toBe(0);
  });

  // Test 5: Occupancy returns during countdown → countdown resets
  it('Test 5: Occupancy returns during countdown resets vacancy timer', () => {
    cfg.vacancyDelayMs = 10000;
    cfg.useDemoTimer = false;

    // Person leaves at t = 0
    const vacant: SensorReadings = { temperature: 30, humidity: 50, occupied: false, timestamp: 0 };
    controllerTick(cs, vacant, cfg, 0, baseDate);

    // t = 5000: halfway
    const halfway = controllerTick(cs, vacant, cfg, 5000, baseDate);
    expect(halfway.output.vacancyRemainingMs).toBe(5000);

    // Person returns at t = 6000
    const occupied: SensorReadings = { temperature: 30, humidity: 50, occupied: true, timestamp: 6000 };
    const returned = controllerTick(cs, occupied, cfg, 6000, baseDate);
    expect(returned.output.state).toBe('ACTIVE');
    expect(returned.output.vacancyRemainingMs).toBe(0);
    expect(cs.vacancyStartMs).toBe(-1);
  });

  // Test 6: Sleep mode enabled → maximum speed limit is enforced
  it('Test 6: Sleep mode enforces maximum speed limit and gradual transitions', () => {
    cfg.sleepEnabled = true;
    cfg.sleepStartHour = 22; // 10 PM
    cfg.sleepEndHour = 6;    // 6 AM
    cfg.sleepMaxLevel = 2;   // max level 2 in sleep

    // Very hot room that would normally trigger level 5
    const sensors: SensorReadings = {
      temperature: 36.0,
      humidity: 80,
      occupied: true,
      timestamp: 1000,
    };

    // Daytime tick from 0 -> reaches high level
    const dayOut = controllerTick(cs, sensors, cfg, 1000, baseDate);
    expect(dayOut.output.fanLevel).toBeGreaterThan(2);

    // If starting fresh at nighttime, fan should never exceed sleepMaxLevel
    const csNight = initialControllerState();
    let tickTime = 1000;
    let nightOut = controllerTick(csNight, sensors, cfg, tickTime, sleepDate);
    expect(nightOut.output.state).toBe('SLEEP');
    // Ramps up gradually 0 -> 1 -> 2, but capped at 2
    for (let i = 0; i < 5; i++) {
      tickTime += 1000;
      nightOut = controllerTick(csNight, sensors, cfg, tickTime, sleepDate);
      expect(nightOut.output.state).toBe('SLEEP');
      expect(nightOut.output.fanLevel).toBeLessThanOrEqual(cfg.sleepMaxLevel);
    }
    expect(nightOut.output.fanLevel).toBe(cfg.sleepMaxLevel);

    // From high daytime level (e.g. 5), sleep mode ramps down monotonically
    expect(cs.currentLevel).toBeGreaterThan(cfg.sleepMaxLevel);
    let rampDownState = cs;
    let lastLevel = rampDownState.currentLevel;
    for (let i = 0; i < 6; i++) {
      tickTime += 1000;
      const step = controllerTick(rampDownState, sensors, cfg, tickTime, sleepDate);
      expect(step.output.fanLevel).toBeLessThanOrEqual(lastLevel);
      lastLevel = step.output.fanLevel;
    }
    expect(lastLevel).toBeLessThanOrEqual(cfg.sleepMaxLevel);
  });

  // Test 7: Fault activated → configured fallback state is applied
  it('Test 7: Fault activation applies configured fallback state', () => {
    cfg.faultFallbackLevel = 2;

    injectFault(cs, 'SIMULATED_BME280_I2C_DISCONNECT');
    const sensors: SensorReadings = { temperature: 35, humidity: 60, occupied: true, timestamp: 1000 };
    const { output } = controllerTick(cs, sensors, cfg, 1000, baseDate);

    expect(output.state).toBe('FAULT');
    expect(output.fanLevel).toBe(cfg.faultFallbackLevel);
    expect(output.faultReason).toContain('SIMULATED_BME280_I2C_DISCONNECT');

    // Clear fault restores active
    clearFault(cs);
    const cleared = controllerTick(cs, sensors, cfg, 2000, baseDate);
    expect(cleared.output.state).toBe('ACTIVE');
  });

  // Test 8: Temperature fluctuates inside the hysteresis band → unnecessary speed changes avoided
  it('Test 8: Fluctuations inside hysteresis band prevent speed hunting', () => {
    cfg.minSpeedChangeIntervalMs = 0;
    cfg.targetTemp = 26.0;
    cfg.hysteresis = 0.5;

    // Set initial state at level 2
    cs.currentLevel = 2;

    // Test a temperature that falls inside the hysteresis band
    // Desired level logic maintains current level when inside target ± hysteresis
    const levelStay = desiredFanLevel(26.2, 26.0, 0.5, 2);
    expect(levelStay).toBe(2);

    const levelStayLower = desiredFanLevel(25.8, 26.0, 0.5, 2);
    expect(levelStayLower).toBe(2);

    // Below lower boundary 25.5 -> switches to 0
    const levelOff = desiredFanLevel(25.4, 26.0, 0.5, 2);
    expect(levelOff).toBe(0);
  });

  // Test 9: Energy experiment → energy values calculated from power model
  it('Test 9: Energy values are calculated accurately from configured power model', () => {
    const p1 = instantaneousPower(3, cfg);
    expect(p1.power).toBe(cfg.powerMap[3]);
    expect(p1.voltage).toBe(12.0);
    expect(p1.current).toBeCloseTo(cfg.powerMap[3] / 12.0, 2);

    const prev = zeroPowerSnapshot();
    // 1 hour at 10W should be 10Wh
    const energy = accumulateEnergy(prev, 10, 3600000);
    expect(energy).toBe(5); // (0 + 10)/2 * 1 hr = 5 Wh trapezoidal from 0W to 10W
    const steady = accumulateEnergy({ ...prev, power: 10 }, 10, 3600000);
    expect(steady).toBe(10); // 10W sustained for 1hr = 10 Wh
  });

  // Test 10: Reset experiment → clears simulation results
  it('Test 10: Reset experiment clears prior results completely', () => {
    let state = initialSimState();
    state = startExperiment(state);
    expect(state.energyExperiment.status).toBe('running');

    // Run a tick to accumulate some data
    state.running = true;
    state = tick(state, 1000);

    // Reset experiment
    state = resetExperiment(state);
    expect(state.energyExperiment.status).toBe('idle');
    expect(state.energyExperiment.snapshots.length).toBe(0);
    expect(state.energyExperiment.comfortLoopEnergyWh).toBe(0);
    expect(state.energyExperiment.baselineEnergyWh).toBe(0);
  });

  // Test 11: The energy experiment produces valid, deterministic results
  it('Test 11: The energy experiment produces valid, deterministic results', () => {
    const s1 = initialSimState();
    const r1 = runFullExperimentProfile(s1);
    const exp1 = r1.energyExperiment;

    expect(exp1.status).toBe('complete');
    expect(exp1.totalSimTimeMs).toBe(8 * 3600 * 1000); // 8.0 hours
    // Baseline at Level 3 (5.5W) for 8.0h is 44.0 Wh
    expect(exp1.baselineEnergyWh).toBeCloseTo(44.0, 1);
    expect(exp1.comfortLoopEnergyWh).toBeGreaterThan(0);
    expect(exp1.comfortLoopEnergyWh).toBeLessThan(exp1.baselineEnergyWh);
    expect(exp1.savingsPercent).toBeGreaterThan(0);
    expect(exp1.savingsPercent).toBeLessThan(100);

    // Determinism: a second run produces identical numbers
    const s2 = initialSimState();
    const r2 = runFullExperimentProfile(s2);
    const exp2 = r2.energyExperiment;
    expect(exp2.comfortLoopEnergyWh).toBe(exp1.comfortLoopEnergyWh);
    expect(exp2.baselineEnergyWh).toBe(exp1.baselineEnergyWh);
    expect(exp2.savingsPercent).toBe(exp1.savingsPercent);
    expect(exp2.snapshots.length).toBe(exp1.snapshots.length);
  });

  // Test 12: Savings calculations handle invalid or zero baseline energy safely
  it('Test 12: Savings calculations handle invalid or zero baseline energy safely', () => {
    const expZero = {
      snapshots: [],
      totalSimTimeMs: 1000,
      comfortLoopEnergyWh: 5.0,
      baselineEnergyWh: 0,
      savingsPercent: 0,
      comfortLoopRunTimeMs: 1000,
      baselineRunTimeMs: 1000,
      comfortBandTimeMs: 1000,
      status: 'running' as const,
      activeRunTimeMs: 1000,
      awayRunTimeMs: 0,
      sleepRunTimeMs: 0,
      faultRunTimeMs: 0,
    };
    const finalZero = finalizeExperiment(expZero);
    expect(finalZero.savingsPercent).toBe(0);
    expect(Number.isNaN(finalZero.savingsPercent)).toBe(false);

    // Negative baseline energy safety
    const expNegative = { ...expZero, baselineEnergyWh: -10 };
    const finalNeg = finalizeExperiment(expNegative);
    expect(finalNeg.savingsPercent).toBe(0);
    expect(Number.isNaN(finalNeg.savingsPercent)).toBe(false);

    // NaN baseline energy safety
    const expNaN = { ...expZero, baselineEnergyWh: NaN };
    const finalNaN = finalizeExperiment(expNaN);
    expect(finalNaN.savingsPercent).toBe(0);
    expect(Number.isNaN(finalNaN.savingsPercent)).toBe(false);
  });

  // Test 13: CSV exports agree with the experiment results
  it('Test 13: CSV exports agree with the experiment results', () => {
    const s = initialSimState();
    const r = runFullExperimentProfile(s);
    const exp = r.energyExperiment;
    const csv = experimentToCSV(exp);

    const lines = csv.trim().split('\n');
    expect(lines.length).toBe(exp.snapshots.length + 1); // Header + snapshots

    const header = lines[0].split(',');
    expect(header).toContain('sim_time_min');
    expect(header).toContain('comfortloop_energy_Wh');
    expect(header).toContain('baseline_energy_Wh');

    // Last row agreement with final cumulative Wh
    const lastRow = lines[lines.length - 1].split(',');
    const clEnergyCSV = parseFloat(lastRow[header.indexOf('comfortloop_energy_Wh')]);
    const blEnergyCSV = parseFloat(lastRow[header.indexOf('baseline_energy_Wh')]);

    expect(clEnergyCSV).toBeCloseTo(exp.comfortLoopEnergyWh, 2);
    expect(blEnergyCSV).toBeCloseTo(exp.baselineEnergyWh, 2);
  });

  // Test 14: Sensor failure and recovery behave correctly
  it('Test 14: Sensor failure and recovery behave correctly', () => {
    // Normal active operation
    const validSensors: SensorReadings = { temperature: 28, humidity: 55, occupied: true, timestamp: 1000 };
    const norm = controllerTick(cs, validSensors, cfg, 1000, baseDate);
    expect(norm.output.state).toBe('ACTIVE');

    // Inject fault -> enters FAULT state with fallback level
    injectFault(cs, 'BME280_COMM_TIMEOUT');
    const faulted = controllerTick(cs, validSensors, cfg, 2000, baseDate);
    expect(faulted.output.state).toBe('FAULT');
    expect(faulted.output.fanLevel).toBe(cfg.faultFallbackLevel);

    // Recover from fault -> restores ACTIVE
    clearFault(cs);
    const recovered = controllerTick(cs, validSensors, cfg, 3000, baseDate);
    expect(recovered.output.state).toBe('ACTIVE');
    expect(recovered.output.faultReason).toBe('');
  });
});
