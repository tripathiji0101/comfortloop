import React from 'react';
import {
  ShieldAlert,
  Moon,
  Activity,
  UserX,
  AlertTriangle,
  CheckCircle,
  Sliders,
  Info,
} from 'lucide-react';
import type { ComfortConfig, ControlState, ControllerOutput, FanLevel } from '../types';

interface ControlStatePanelProps {
  controller: ControllerOutput;
  config: ComfortConfig;
  faultInjected: boolean;
  onToggleSleepMode: () => void;
  onInjectFault: (reason: string) => void;
  onClearFault: () => void;
  onUpdateSleepMaxLevel: (level: FanLevel) => void;
  onUpdateFallbackLevel: (level: FanLevel) => void;
}

export const ControlStatePanel: React.FC<ControlStatePanelProps> = ({
  controller,
  config,
  faultInjected,
  onToggleSleepMode,
  onInjectFault,
  onClearFault,
  onUpdateSleepMaxLevel,
  onUpdateFallbackLevel,
}) => {
  const currentState = controller.state;

  const statesConfig: Record<
    ControlState,
    { title: string; desc: string; icon: React.ReactNode; color: string; badgeClass: string }
  > = {
    ACTIVE: {
      title: 'ACTIVE',
      desc: 'Occupant present. Control algorithm dynamically modulates fan speed based on apparent-temperature comfort formula.',
      icon: <Activity size={18} color="#059669" />,
      color: '#059669',
      badgeClass: 'badge-active',
    },
    AWAY: {
      title: 'AWAY',
      desc: 'Vacancy countdown has elapsed without detected presence. Fan actuator is commanded completely OFF (0 RPM / 0% PWM).',
      icon: <UserX size={18} color="#57534e" />,
      color: '#57534e',
      badgeClass: 'badge-away',
    },
    SLEEP: {
      title: 'SLEEP',
      desc: 'Nighttime schedule active (10:00 PM – 6:00 AM) with room occupied. Maximum speed capped at Level 2 with gradual ±1 step speed shifts.',
      icon: <Moon size={18} color="#7c3aed" />,
      color: '#7c3aed',
      badgeClass: 'badge-sleep',
    },
    FAULT: {
      title: 'FAULT',
      desc: 'Sensor telemetry failure or watchdog violation. Fallback failsafe speed (Level 2) enforced to guarantee minimum ventilation.',
      icon: <AlertTriangle size={18} color="#e11d48" />,
      color: '#e11d48',
      badgeClass: 'badge-fault',
    },
  };

  return (
    <div className="eng-card">
      <div className="eng-card-header">
        <div className="eng-card-title">
          <Activity size={16} color="#b45309" />
          Controller Operating State Machine
        </div>
        <div>
          <span className={`badge ${statesConfig[currentState].badgeClass}`}>
            <span className={`dot ${currentState === 'ACTIVE' ? 'dot-green' : currentState === 'SLEEP' ? 'dot-purple' : currentState === 'FAULT' ? 'dot-red' : 'dot-amber'}`} />
            CURRENT: {currentState}
          </span>
        </div>
      </div>

      {/* State Machine Overview Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {(['ACTIVE', 'AWAY', 'SLEEP', 'FAULT'] as ControlState[]).map((st) => {
          const cfg = statesConfig[st];
          const isSelected = currentState === st;

          return (
            <div
              key={st}
              style={{
                background: isSelected ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                borderRadius: '8px',
                padding: '0.85rem',
                border: isSelected ? `2px solid ${cfg.color}` : '1px solid var(--border-subtle)',
                boxShadow: isSelected ? `0 2px 10px ${cfg.color}25` : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, fontSize: '0.85rem', color: isSelected ? cfg.color : 'var(--text-secondary)' }}>
                  {cfg.icon}
                  {cfg.title}
                </div>
                {isSelected && (
                  <span className="dot dot-green" style={{ background: cfg.color, boxShadow: `0 0 8px ${cfg.color}` }} />
                )}
              </div>
              <p style={{ fontSize: '0.725rem', color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)', lineHeight: 1.4 }}>
                {cfg.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Sleep Mode & Fault Controls Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
        {/* Sleep Mode Controller */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Moon size={14} color="#7c3aed" /> Nighttime Sleep Mode Schedule
            </span>
            <button
              onClick={onToggleSleepMode}
              className={`btn ${config.sleepEnabled ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                padding: '0.3rem 0.65rem',
                fontSize: '0.725rem',
                background: config.sleepEnabled ? '#7c3aed' : undefined,
                borderColor: config.sleepEnabled ? '#7c3aed' : undefined,
                color: config.sleepEnabled ? '#ffffff' : undefined,
              }}
            >
              {config.sleepEnabled ? 'SLEEP ACTIVE' : 'ENABLE SLEEP'}
            </button>
          </div>
          <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            Schedule: {config.sleepStartHour}:00 to 0{config.sleepEndHour}:00 (Max Speed Cap: Level {config.sleepMaxLevel})
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.725rem', color: 'var(--text-muted)' }}>
            <span>Cap Fan Speed to:</span>
            {([1, 2, 3] as FanLevel[]).map((lvl) => (
              <button
                key={lvl}
                onClick={() => onUpdateSleepMaxLevel(lvl)}
                style={{
                  background: config.sleepMaxLevel === lvl ? '#7c3aed' : 'var(--bg-tertiary)',
                  color: config.sleepMaxLevel === lvl ? '#ffffff' : 'var(--text-primary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '4px',
                  padding: '0.15rem 0.45rem',
                  fontSize: '0.7rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Level {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Fault Injection Panel */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <ShieldAlert size={14} color="#e11d48" /> Hardware Fault Injection
            </span>
            {faultInjected ? (
              <button
                onClick={onClearFault}
                className="btn btn-success"
                style={{ padding: '0.3rem 0.65rem', fontSize: '0.725rem' }}
              >
                <CheckCircle size={13} /> Clear Fault
              </button>
            ) : (
              <button
                onClick={() => onInjectFault('BME280_I2C_BUS_TIMEOUT_0x76')}
                className="btn btn-danger"
                style={{ padding: '0.3rem 0.65rem', fontSize: '0.725rem' }}
              >
                <AlertTriangle size={13} /> Inject I2C Fault
              </button>
            )}
          </div>

          {faultInjected ? (
            <div style={{ background: 'rgba(225, 29, 72, 0.08)', border: '1px solid rgba(225, 29, 72, 0.3)', padding: '0.5rem', borderRadius: '6px', fontSize: '0.725rem', color: '#be123c' }}>
              <strong>ACTIVE FAULT:</strong> {controller.faultReason || 'Injected test anomaly'}
              <div style={{ marginTop: '0.2rem', color: '#9f1239' }}>
                Failsafe Active: Fan commanded to fallback Level {config.faultFallbackLevel}
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>
              All sensors healthy. Watchdog nominal. Failsafe level configured to Level {config.faultFallbackLevel}.
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            <span>Failsafe Fallback Level:</span>
            {([1, 2, 3] as FanLevel[]).map((lvl) => (
              <button
                key={lvl}
                onClick={() => onUpdateFallbackLevel(lvl)}
                style={{
                  background: config.faultFallbackLevel === lvl ? '#b45309' : 'var(--bg-tertiary)',
                  color: config.faultFallbackLevel === lvl ? '#ffffff' : 'var(--text-primary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '4px',
                  padding: '0.15rem 0.45rem',
                  fontSize: '0.7rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                L{lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Safety Notice */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.675rem', marginTop: '0.75rem' }}>
        <Info size={12} color="#78716c" />
        <span>Physical Verification Disclaimer: This software simulation model demonstrates algorithmic control logic and does not replace hardware fault-tolerance verification.</span>
      </div>
    </div>
  );
};

