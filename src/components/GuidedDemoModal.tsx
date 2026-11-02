import React from 'react';
import { Sparkles, ArrowRight, ArrowLeft, Check, X, ShieldAlert } from 'lucide-react';

export interface DemoStep {
  title: string;
  subtitle: string;
  description: string;
  actionSummary: string;
}

export const DEMO_STEPS: DemoStep[] = [
  {
    title: 'Step 1: Introduction & Problem Statement',
    subtitle: 'atomQUEST 2026 | Track 1: Fan',
    description:
      'Conventional fans run continuously at fixed manual speeds, wasting electricity in empty rooms and failing to maintain thermal comfort as ambient humidity and temperature swing. ComfortLoop adds closed-loop apparent-temperature comfort modeling and mmWave occupancy awareness.',
    actionSummary: 'ComfortLoop System Ready | Mode = AUTO | Closed-Loop Control',
  },
  {
    title: 'Step 2: Comfortable Occupied Room',
    subtitle: 'Thermal Equilibrium State',
    description:
      'The room is occupied with ambient temperature at 25.0°C and 45% relative humidity (near 26°C target). The calculated apparent temperature is in the comfortable band. The controller runs the fan at Level 0 or 1, avoiding excessive airflow or acoustic noise.',
    actionSummary: 'Occupied = TRUE | Temp = 25.0°C | RH = 45% | Fan = Level 0-1',
  },
  {
    title: 'Step 3: Ambient Temperature & Humidity Rise',
    subtitle: 'Thermal Discomfort Detection',
    description:
      'The simulated room warms up to 33.5°C with 65% humidity. The apparent temperature equation (AT = T + 0.33·e − 0.70·ws − 4.00) calculates an apparent temperature of ~35.1°C (HOT), exceeding the target band + hysteresis.',
    actionSummary: 'Occupied = TRUE | Temp = 33.5°C | RH = 65% | AT = 35.1°C (HOT)',
  },
  {
    title: 'Step 4: Fan Speed Automatically Increases',
    subtitle: 'Closed-Loop Convective Cooling',
    description:
      'The state machine modulates PWM output upward to Level 4 (PWM 210, ~1.8 m/s airflow) to increase convective cooling. Simultaneously, the auxiliary relay triggers for high-humidity exhaust.',
    actionSummary: 'Fan = Level 4 (PWM 210) | State = ACTIVE | Relay = CLOSED',
  },
  {
    title: 'Step 5: Occupant Departs (Vacancy Detected)',
    subtitle: 'LD2410 mmWave Radar Absence Trigger',
    description:
      'The occupant leaves the room. The simulated LD2410 sensor transitions to UNOCCUPIED. To prevent annoying toggling from momentary departures, the controller enters a grace countdown.',
    actionSummary: 'Occupied = FALSE | Vacancy Grace Timer Armed',
  },
  {
    title: 'Step 6: Accelerated 5-Second Vacancy Countdown',
    subtitle: 'Configurable Vacancy Delay',
    description:
      'The vacancy countdown runs (accelerated to 5 seconds for live judging; 5 minutes in production). If the occupant returns before expiration, the countdown immediately aborts without turning off.',
    actionSummary: 'Countdown Active (5s Demo Mode) | Fan Still Spinning',
  },
  {
    title: 'Step 7: Fan Stops After Timeout (AWAY Mode)',
    subtitle: 'Zero Standby Motor Power',
    description:
      'The vacancy countdown reaches zero. The controller transitions to AWAY state, commanding PWM to 0 (0 RPM). Power draw drops to 0.0 W, eliminating wasteful cooling of an empty room.',
    actionSummary: 'Fan = Level 0 (0 RPM) | Power = 0.0 W | State = AWAY',
  },
  {
    title: 'Step 8: Sleep Mode & Fault Protection',
    subtitle: 'Nighttime Acoustic Cap & Failsafe Recovery',
    description:
      'ComfortLoop features scheduled Sleep Mode (capping speed at Level 2 with gradual transitions) and Sensor Fault Failsafe (fallback to Level 2 if BME280 telemetry is interrupted).',
    actionSummary: 'Sleep Mode Cap = Level 2 | Failsafe = Level 2 Active',
  },
  {
    title: 'Step 9: Run 8-Hour Energy Comparison',
    subtitle: 'Deterministic Daily Profile Execution',
    description:
      'We fast-forward through a complete 8-hour daily simulation profile (morning occupied, afternoon vacant, evening heat peak). The baseline fan runs continuously at fixed Level 3 (5.5 W).',
    actionSummary: '8-Hour Profile Executing (480 min in 5-min intervals)',
  },
  {
    title: 'Step 10: Calculated Results & Simulation Assumptions',
    subtitle: 'Defensible Real-Time Metrics',
    description:
      'Calculated baseline energy is 44.00 Wh. ComfortLoop energy and savings are computed directly from the modeled power curve and operating state residence times. All metrics are honestly labeled as simulated estimates.',
    actionSummary: 'Baseline: 44.0 Wh | Model: Deterministic Simulated Estimates',
  },
];

interface GuidedDemoModalProps {
  currentStep: number;
  isOpen: boolean;
  onNextStep: () => void;
  onPrevStep: () => void;
  onClose: () => void;
}

export const GuidedDemoModal: React.FC<GuidedDemoModalProps> = ({
  currentStep,
  isOpen,
  onNextStep,
  onPrevStep,
  onClose,
}) => {
  if (!isOpen) return null;

  const step = DEMO_STEPS[currentStep] || DEMO_STEPS[0];
  const isFirst = currentStep === 0;
  const isLast = currentStep === DEMO_STEPS.length - 1;

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      right: '1.5rem',
      maxWidth: '460px',
      width: 'calc(100vw - 3rem)',
      zIndex: 100,
      background: 'var(--bg-card)',
      backdropFilter: 'blur(16px)',
      border: '2px solid #b45309',
      borderRadius: '12px',
      padding: '1.25rem',
      boxShadow: '0 10px 40px rgba(41, 37, 36, 0.2), 0 0 20px rgba(180, 83, 9, 0.15)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <img src="/logo.png" alt="ComfortLoop" style={{ width: '22px', height: '22px', borderRadius: '4px' }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#b45309', letterSpacing: '0.04em' }}>
            ATOMQUEST 2026 GUIDED DEMO
          </span>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          title="Close demo guide"
        >
          <X size={16} />
        </button>
      </div>

      {/* Progress Dots */}
      <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.85rem' }}>
        {DEMO_STEPS.map((_, idx) => (
          <div
            key={idx}
            style={{
              flex: 1,
              height: '4px',
              borderRadius: '2px',
              background: idx === currentStep ? '#b45309' : (idx < currentStep ? '#059669' : 'var(--border-subtle)'),
              transition: 'background 0.2s',
            }}
          />
        ))}
      </div>

      {/* Step Info */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.725rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase' }}>
          {step.subtitle} • Step {currentStep + 1} of {DEMO_STEPS.length}
        </div>
        <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.2rem 0 0.5rem 0' }}>
          {step.title}
        </h4>
        <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '0.65rem' }}>
          {step.description}
        </p>

        {/* Action Summary Pill */}
        <div className="font-mono" style={{ background: 'var(--bg-secondary)', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid var(--border-subtle)', fontSize: '0.7rem', color: '#047857' }}>
          <strong>Executed:</strong> {step.actionSummary}
        </div>
      </div>

      {/* Footer Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={onPrevStep}
          disabled={isFirst}
          className="btn btn-secondary"
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', opacity: isFirst ? 0.4 : 1 }}
        >
          <ArrowLeft size={13} /> Previous
        </button>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {!isLast ? (
            <button
              onClick={onNextStep}
              className="btn btn-primary"
              style={{ padding: '0.35rem 0.95rem', fontSize: '0.75rem' }}
            >
              Next Step <ArrowRight size={13} />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="btn btn-success"
              style={{ padding: '0.35rem 0.95rem', fontSize: '0.75rem' }}
            >
              <Check size={13} /> Finish Demo
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)', fontSize: '0.65rem', marginTop: '0.65rem' }}>
        <ShieldAlert size={11} color="#78716c" />
        <span>Virtual prototype demonstration. All values are simulated.</span>
      </div>
    </div>
  );
};

