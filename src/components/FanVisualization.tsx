import React, { useState } from 'react';
import { Fan, Sliders, RefreshCw, Zap, ShieldAlert, Cpu } from 'lucide-react';
import type { ComfortConfig, ControlMode, ControllerOutput, FanLevel } from '../types';

interface FanVisualizationProps {
  controller: ControllerOutput;
  config: ComfortConfig;
  controlMode: ControlMode;
  manualLevel: FanLevel;
  onToggleControlMode: () => void;
  onSetManualLevel: (level: FanLevel) => void;
  onUpdateAirflow: (level: FanLevel, val: number) => void;
}

export const FanVisualization: React.FC<FanVisualizationProps> = ({
  controller,
  config,
  controlMode,
  manualLevel,
  onToggleControlMode,
  onSetManualLevel,
  onUpdateAirflow,
}) => {
  const [showAirflowEditor, setShowAirflowEditor] = useState(false);

  const activeLevel = controlMode === 'auto' ? controller.fanLevel : manualLevel;
  const isFanOn = activeLevel > 0;
  const pwm = config.pwmMap[activeLevel];
  const dutyPct = Math.round((pwm / 255) * 100);
  const assumedAirflow = config.airflowMap[activeLevel];

  // Estimated RPM for realistic visual feedback (assuming max ~2200 RPM for 12V 120mm PWM fan)
  const estimatedRpm = activeLevel === 0 ? 0 : Math.round(500 + (pwm / 255) * 1700);

  return (
    <div className="eng-card">
      <div className="eng-card-header">
        <div className="eng-card-title">
          <Fan size={16} color="#b45309" />
          Virtual 12V 4-Pin PWM Fan Actuator
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isFanOn ? (
            <span className="badge badge-active">
              <span className="dot dot-green" /> RUNNING
            </span>
          ) : (
            <span className="badge badge-away">
              <span className="dot" style={{ background: '#78716c' }} /> STOPPED (0 RPM)
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 220px) 1fr', gap: '1.25rem', alignItems: 'center' }}>
        {/* Rendered Animated Fan SVG */}
        <div style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(circle, var(--bg-card) 0%, var(--bg-secondary) 100%)',
          borderRadius: '16px',
          padding: '1.25rem',
          border: '1px solid var(--border-subtle)',
          boxShadow: isFanOn ? 'inset 0 0 20px rgba(180, 83, 9, 0.12)' : 'none'
        }}>
          {/* Fan Frame SVG */}
          <svg width="170" height="170" viewBox="0 0 200 200" style={{ overflow: 'visible' }}>
            <defs>
              {/* Radial gradient for fan hub */}
              <radialGradient id="hubGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#d97706" />
                <stop offset="60%" stopColor="#b45309" />
                <stop offset="100%" stopColor="#78350f" />
              </radialGradient>
              {/* Linear gradient for blades */}
              <linearGradient id="bladeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ede6da" />
                <stop offset="50%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
            </defs>

            {/* Outer Fan Shroud / Housing */}
            <rect x="10" y="10" width="180" height="180" rx="16" fill="#ede6da" stroke="#d6ccbe" strokeWidth="3" />
            {/* Corner mounting screw holes */}
            <circle cx="25" cy="25" r="5" fill="#a89f91" />
            <circle cx="175" cy="25" r="5" fill="#a89f91" />
            <circle cx="25" cy="175" r="5" fill="#a89f91" />
            <circle cx="175" cy="175" r="5" fill="#a89f91" />

            {/* Circular Vent Opening */}
            <circle cx="100" cy="100" r="82" fill="var(--bg-primary)" stroke={isFanOn ? '#b45309' : '#d6ccbe'} strokeWidth="2" />

            {/* Rotating Fan Blades Group */}
            <g className={`fan-blades speed-${activeLevel}`}>
              {/* 7 Aerodynamic Fan Blades */}
              {[0, 51.4, 102.8, 154.2, 205.7, 257.1, 308.5].map((angle, idx) => (
                <path
                  key={idx}
                  d="M 100 100 C 120 70, 155 65, 175 75 C 165 95, 135 110, 100 100 Z"
                  fill="url(#bladeGrad)"
                  stroke="#b45309"
                  strokeWidth="0.8"
                  opacity={isFanOn ? 0.95 : 0.65}
                  transform={`rotate(${angle} 100 100)`}
                />
              ))}

              {/* Center Motor Hub */}
              <circle cx="100" cy="100" r="28" fill="url(#hubGradient)" stroke="#b45309" strokeWidth="2" />
              <circle cx="100" cy="100" r="14" fill="#78350f" />
              <circle cx="100" cy="100" r="6" fill="#f59e0b" />
            </g>

            {/* Intel 25kHz Label watermark */}
            <text x="100" y="185" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="'Encode Sans Expanded', sans-serif">
              25 kHz PWM • 12V 4-PIN
            </text>
          </svg>

          {/* RPM & Airflow readout badge below SVG */}
          <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
            <div className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: isFanOn ? '#b45309' : 'var(--text-muted)' }}>
              {estimatedRpm} <span style={{ fontSize: '0.75rem' }}>RPM</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              Estimated RPM (Simulated — No physical tachometer)
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
              Assumed Airflow: {assumedAirflow} m/s
            </div>
          </div>
        </div>

        {/* Fan Status & Telemetry Details */}
        <div>
          {/* Top Mode Override Switch */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-secondary)',
            padding: '0.65rem 0.85rem',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)',
            marginBottom: '0.85rem'
          }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>Control Mode</div>
              <div style={{ fontSize: '0.675rem', color: 'var(--text-secondary)' }}>
                {controlMode === 'auto' ? 'Dynamic algorithm manages speed' : 'Manual operator override active'}
              </div>
            </div>

            <button
              onClick={onToggleControlMode}
              className={`btn ${controlMode === 'auto' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.775rem' }}
            >
              <Sliders size={13} />
              {controlMode === 'auto' ? 'AUTO CONTROL' : 'MANUAL OVERRIDE'}
            </button>
          </div>

          {/* Manual Level Selector (when in Manual Mode) */}
          {controlMode === 'manual' && (
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '0.75rem', borderRadius: '8px', marginBottom: '0.85rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 600, marginBottom: '0.4rem' }}>
                Manual Speed Selection:
              </div>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                {([0, 1, 2, 3, 4, 5] as FanLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => onSetManualLevel(lvl)}
                    style={{
                      flex: 1,
                      padding: '0.35rem',
                      borderRadius: '4px',
                      border: manualLevel === lvl ? '2px solid #b45309' : '1px solid var(--border-subtle)',
                      background: manualLevel === lvl ? '#b45309' : 'var(--bg-secondary)',
                      color: manualLevel === lvl ? '#ffffff' : 'var(--text-secondary)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                    }}
                  >
                    {lvl === 0 ? 'OFF' : `L${lvl}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Key Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem', marginBottom: '0.85rem' }}>
            <div style={{ background: 'var(--bg-secondary)', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.675rem', color: 'var(--text-secondary)' }}>Speed Level</div>
              <div className="font-mono" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {activeLevel} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ 5</span>
              </div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.675rem', color: 'var(--text-secondary)' }}>PWM Output</div>
              <div className="font-mono" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#b45309' }}>
                {pwm} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ 255</span>
              </div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.675rem', color: 'var(--text-secondary)' }}>Duty Cycle</div>
              <div className="font-mono" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#059669' }}>
                {dutyPct}%
              </div>
            </div>
          </div>

          {/* Speed Change Counter & Anti-Hunting Interval */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.725rem', color: 'var(--text-secondary)', padding: '0.35rem 0.5rem', background: 'var(--bg-secondary)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <RefreshCw size={12} color="var(--text-muted)" />
              <span>Speed Shifts: <strong style={{ color: 'var(--text-primary)' }}>{controller.speedChangeCount}</strong></span>
            </div>
            <div>
              <span>Min Interval: <strong style={{ color: '#b45309' }}>{config.minSpeedChangeIntervalMs / 1000}s</strong></span>
            </div>
          </div>

          {/* Lookup Table Toggle */}
          <div style={{ marginTop: '0.65rem' }}>
            <button
              onClick={() => setShowAirflowEditor(!showAirflowEditor)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#b45309',
                fontSize: '0.725rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.2rem 0',
                textDecoration: 'underline'
              }}
            >
              <Cpu size={12} />
              {showAirflowEditor ? 'Hide Assumed Airflow Model' : 'Inspect / Edit Assumed Airflow Model (ws)'}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Airflow Lookup Table Editor */}
      {showAirflowEditor && (
        <div style={{ marginTop: '1rem', padding: '0.85rem', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <ShieldAlert size={14} color="#d97706" />
            Configurable Airflow Mapping (Uncalibrated Simulation Assumption)
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Note: Airspeed (ws) is an approximation model. Values must be verified with physical anemometry before hardware deployment.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.5rem' }}>
            {([0, 1, 2, 3, 4, 5] as FanLevel[]).map((lvl) => (
              <div key={lvl} style={{ textAlign: 'center', background: 'var(--bg-secondary)', padding: '0.45rem', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.675rem', color: 'var(--text-secondary)' }}>L{lvl} (PWM {config.pwmMap[lvl]})</div>
                <input
                  type="number"
                  step={0.1}
                  min={0}
                  max={5.0}
                  value={config.airflowMap[lvl]}
                  onChange={(e) => onUpdateAirflow(lvl, parseFloat(e.target.value) || 0)}
                  className="font-mono"
                  style={{
                    width: '100%',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    color: '#b45309',
                    textAlign: 'center',
                    padding: '0.2rem',
                    fontSize: '0.75rem',
                    borderRadius: '4px',
                    marginTop: '0.2rem'
                  }}
                />
                <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>m/s</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

