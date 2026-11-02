import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { EnergyCharts } from './components/EnergyCharts';
import { CircuitView } from './components/CircuitView';
import { FirmwareView } from './components/FirmwareView';
import { CadViewer } from './components/CadViewer';
import { GuidedDemoModal } from './components/GuidedDemoModal';
import {
  initialSimState,
  tick,
  startExperiment,
  pauseExperiment,
  resumeExperiment,
  resetExperiment,
  runFullExperimentProfile,
  setFault,
  removeFault,
} from './logic/simulator';
import type { FanLevel, SimulationState, TabId } from './types';
import './styles/globals.css';

export const App: React.FC = () => {
  const [simState, setSimState] = useState<SimulationState>(() => {
    const saved = localStorage.getItem('comfortloop_config');
    const initial = initialSimState();
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...initial, config: { ...initial.config, ...parsed } };
      } catch {
        return initial;
      }
    }
    return initial;
  });

  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [guidedDemoOpen, setGuidedDemoOpen] = useState(false);
  const [guidedDemoStep, setGuidedDemoStep] = useState(0);

  const lastTickTimeRef = useRef<number>(Date.now());

  // Save config changes to localStorage
  useEffect(() => {
    localStorage.setItem('comfortloop_config', JSON.stringify(simState.config));
  }, [simState.config]);

  // Simulation tick loop (runs at ~20 Hz / 50ms)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const delta = now - lastTickTimeRef.current;
      lastTickTimeRef.current = now;

      setSimState((prev) => {
        if (!prev.running) return prev;
        return tick(prev, Math.min(delta, 200));
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Handlers
  const handleToggleRunning = () => {
    lastTickTimeRef.current = Date.now();
    setSimState((prev) => ({ ...prev, running: !prev.running }));
  };

  const handleReset = () => {
    localStorage.removeItem('comfortloop_config');
    setSimState(initialSimState());
    setGuidedDemoOpen(false);
    setGuidedDemoStep(0);
  };

  const handleChangeSpeed = (multiplier: number) => {
    setSimState((prev) => ({
      ...prev,
      config: { ...prev.config, simulationSpeedX: multiplier },
    }));
  };

  const handleUpdateTemp = (temp: number) => {
    setSimState((prev) => {
      const nextSensors = { ...prev.sensors, temperature: temp };
      return { ...prev, sensors: nextSensors };
    });
  };

  const handleUpdateHumidity = (humidity: number) => {
    setSimState((prev) => {
      const nextSensors = { ...prev.sensors, humidity };
      return { ...prev, sensors: nextSensors };
    });
  };

  const handleUpdateTargetTemp = (target: number) => {
    setSimState((prev) => ({
      ...prev,
      config: { ...prev.config, targetTemp: target },
    }));
  };

  const handleUpdateHysteresis = (hyst: number) => {
    setSimState((prev) => ({
      ...prev,
      config: { ...prev.config, hysteresis: hyst },
    }));
  };

  const handleToggleOccupancy = () => {
    setSimState((prev) => {
      const nextOccupied = !prev.sensors.occupied;
      return {
        ...prev,
        sensors: { ...prev.sensors, occupied: nextOccupied },
      };
    });
  };

  const handleToggleDemoTimer = (useDemo: boolean) => {
    setSimState((prev) => ({
      ...prev,
      config: { ...prev.config, useDemoTimer: useDemo },
    }));
  };

  const handleToggleControlMode = () => {
    setSimState((prev) => ({
      ...prev,
      controlMode: prev.controlMode === 'auto' ? 'manual' : 'auto',
      manualLevel: prev.controller.fanLevel,
    }));
  };

  const handleSetManualLevel = (level: FanLevel) => {
    setSimState((prev) => ({
      ...prev,
      manualLevel: level,
    }));
  };

  const handleUpdateAirflow = (level: FanLevel, val: number) => {
    setSimState((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        airflowMap: { ...prev.config.airflowMap, [level]: val },
      },
    }));
  };

  const handleToggleSleepMode = () => {
    setSimState((prev) => ({
      ...prev,
      config: { ...prev.config, sleepEnabled: !prev.config.sleepEnabled },
    }));
  };

  const handleInjectFault = (reason: string) => {
    setSimState((prev) => setFault(prev, reason));
  };

  const handleClearFault = () => {
    setSimState((prev) => removeFault(prev));
  };

  const handleUpdateSleepMaxLevel = (level: FanLevel) => {
    setSimState((prev) => ({
      ...prev,
      config: { ...prev.config, sleepMaxLevel: level },
    }));
  };

  const handleUpdateFallbackLevel = (level: FanLevel) => {
    setSimState((prev) => ({
      ...prev,
      config: { ...prev.config, faultFallbackLevel: level },
    }));
  };

  const handleUpdatePowerMap = (level: FanLevel, watts: number) => {
    setSimState((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        powerMap: { ...prev.config.powerMap, [level]: watts },
      },
    }));
  };

  const handleClearLogs = () => {
    setSimState((prev) => ({ ...prev, log: [] }));
  };

  // Experiment controls
  const handleStartExperiment = () => setSimState(startExperiment);
  const handlePauseExperiment = () => setSimState(pauseExperiment);
  const handleResumeExperiment = () => setSimState(resumeExperiment);
  const handleResetExperiment = () => setSimState(resetExperiment);
  const handleRunFullExperimentQuickly = () => setSimState(runFullExperimentProfile);

  // Guided Demo Workflow Steps (10-Step atomQUEST Judge-Ready Presentation)
  const applyGuidedDemoStep = (stepIdx: number) => {
    setGuidedDemoStep(stepIdx);

    setSimState((prev) => {
      let next = { ...prev, running: true };

      switch (stepIdx) {
        case 0: // Step 1: Introduction & Problem Statement
          setActiveTab('dashboard');
          next.sensors = { ...next.sensors, temperature: 25.0, humidity: 45, occupied: true };
          next.controlMode = 'auto';
          next.config.sleepEnabled = false;
          next = removeFault(next);
          break;

        case 1: // Step 2: Comfortable Occupied Room
          setActiveTab('dashboard');
          next.sensors = { ...next.sensors, temperature: 25.0, humidity: 45, occupied: true };
          next.controlMode = 'auto';
          next.config.sleepEnabled = false;
          next = removeFault(next);
          break;

        case 2: // Step 3: Ambient Temperature & Humidity Rise
          setActiveTab('dashboard');
          next.sensors = { ...next.sensors, temperature: 33.5, humidity: 65, occupied: true };
          next = removeFault(next);
          break;

        case 3: // Step 4: Fan Speed Automatically Increases
          setActiveTab('dashboard');
          next.sensors = { ...next.sensors, temperature: 34.0, humidity: 65, occupied: true };
          next = removeFault(next);
          break;

        case 4: // Step 5: Occupant Departs (Vacancy Detected)
          setActiveTab('dashboard');
          next.config.useDemoTimer = true; // Use 5s demo timer
          next.sensors = { ...next.sensors, occupied: false };
          break;

        case 5: // Step 6: Accelerated 5-Second Vacancy Countdown
          setActiveTab('dashboard');
          next.config.useDemoTimer = true;
          next.sensors = { ...next.sensors, occupied: false };
          break;

        case 6: // Step 7: Fan Stops After Timeout (AWAY mode)
          setActiveTab('dashboard');
          (next as unknown as { _vacancyStartMs?: number })._vacancyStartMs = next.simClockMs - 6000;
          next.sensors = { ...next.sensors, occupied: false };
          break;

        case 7: // Step 8: Sleep Mode & Fault Protection
          setActiveTab('dashboard');
          next.sensors = { ...next.sensors, temperature: 32.0, humidity: 60, occupied: true };
          next.config.sleepEnabled = true;
          next.config.sleepMaxLevel = 2;
          next = removeFault(next);
          break;

        case 8: // Step 9: Run 8-Hour Energy Comparison Profile
          next = runFullExperimentProfile(next);
          setActiveTab('experiment');
          break;

        case 9: // Step 10: Calculated Results & Simulation Assumptions
          setActiveTab('experiment');
          if (next.energyExperiment.status !== 'complete') {
            next = runFullExperimentProfile(next);
          }
          break;

        default:
          break;
      }

      return tick(next, 50);
    });
  };

  const handleStartGuidedDemo = () => {
    setGuidedDemoOpen(true);
    applyGuidedDemoStep(0);
  };

  const handleNextDemoStep = () => {
    if (guidedDemoStep < 9) {
      applyGuidedDemoStep(guidedDemoStep + 1);
    }
  };

  const handlePrevDemoStep = () => {
    if (guidedDemoStep > 0) {
      applyGuidedDemoStep(guidedDemoStep - 1);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        simState={simState}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onToggleRunning={handleToggleRunning}
        onReset={handleReset}
        onStartGuidedDemo={handleStartGuidedDemo}
        onChangeSpeed={handleChangeSpeed}
      />

      <main style={{ flex: 1, padding: '1.5rem', maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
        {activeTab === 'dashboard' && (
          <Dashboard
            simState={simState}
            onUpdateTemp={handleUpdateTemp}
            onUpdateHumidity={handleUpdateHumidity}
            onUpdateTargetTemp={handleUpdateTargetTemp}
            onUpdateHysteresis={handleUpdateHysteresis}
            onToggleOccupancy={handleToggleOccupancy}
            onToggleDemoTimer={handleToggleDemoTimer}
            onToggleControlMode={handleToggleControlMode}
            onSetManualLevel={handleSetManualLevel}
            onUpdateAirflow={handleUpdateAirflow}
            onToggleSleepMode={handleToggleSleepMode}
            onInjectFault={handleInjectFault}
            onClearFault={handleClearFault}
            onUpdateSleepMaxLevel={handleUpdateSleepMaxLevel}
            onUpdateFallbackLevel={handleUpdateFallbackLevel}
            onUpdatePowerMap={handleUpdatePowerMap}
            onClearLogs={handleClearLogs}
          />
        )}

        {activeTab === 'experiment' && (
          <EnergyCharts
            simState={simState}
            onStartExperiment={handleStartExperiment}
            onPauseExperiment={handlePauseExperiment}
            onResumeExperiment={handleResumeExperiment}
            onResetExperiment={handleResetExperiment}
            onRunFullExperimentQuickly={handleRunFullExperimentQuickly}
          />
        )}

        {activeTab === 'circuit' && <CircuitView />}

        {activeTab === 'firmware' && <FirmwareView />}

        {activeTab === 'cad' && <CadViewer />}
      </main>

      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '1.25rem 1.5rem', background: 'var(--bg-secondary)', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <img src="/logo.png" alt="ComfortLoop" style={{ width: '22px', height: '22px', borderRadius: '5px' }} />
          <strong>ComfortLoop — atomQUEST 2026 | Track 1: Fan</strong> • Virtual Prototype & Embedded Control Loop
        </div>
        <div style={{ marginTop: '0.25rem', color: 'var(--text-secondary)' }}>
          Simulation Environment for Testing Apparent Temperature Logic, mmWave Vacancy Management, and INA219 Power Modeling.
        </div>
      </footer>

      {/* Guided Demo Walkthrough Overlay */}
      <GuidedDemoModal
        currentStep={guidedDemoStep}
        isOpen={guidedDemoOpen}
        onNextStep={handleNextDemoStep}
        onPrevStep={handlePrevDemoStep}
        onClose={() => setGuidedDemoOpen(false)}
      />
    </div>
  );
};

