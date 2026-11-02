import React, { useState } from 'react';
import { Zap, Gauge, BatteryCharging, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import type { ComfortConfig, FanLevel, PowerSnapshot } from '../types';

interface PowerPanelProps {
  power: PowerSnapshot;
  config: ComfortConfig;
  onUpdatePowerMap: (level: FanLevel, watts: number) => void;
}

export const PowerPanel: React.FC<PowerPanelProps> = ({
  power,
  config,
  onUpdatePowerMap,
}) => {
  const [showConfig, setShowConfig] = useState(false);

  return (
    <div className="eng-card">
      <div className="eng-card-header">
        <div className="eng-card-title">
          <Zap size={16} color="#b45309" />
          Simulated Power Monitoring (INA219 Model)
        </div>
        <span className="badge badge-sim">Simulated Estimates — Not Hardware Data</span>
      </div>

      {/* 4 Metric KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>Bus Voltage</div>
          <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0.2rem 0' }}>
            {power.voltage.toFixed(1)} <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>V</span>
          </div>
          <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>12V DC Rail</div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>Shunt Current</div>
          <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 700, color: '#b45309', margin: '0.2rem 0' }}>
            {power.current.toFixed(3)} <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>A</span>
          </div>
          <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>0.1Ω Shunt Resistor</div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>Instantaneous Power</div>
          <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 700, color: '#d97706', margin: '0.2rem 0' }}>
            {power.power.toFixed(2)} <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>W</span>
          </div>
          <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>P = V × I</div>
        </div>

        <div style={{ background: 'rgba(5, 150, 105, 0.08)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(5, 150, 105, 0.25)' }}>
          <div style={{ fontSize: '0.725rem', color: '#047857' }}>Cumulative Energy</div>
          <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 700, color: '#047857', margin: '0.2rem 0' }}>
            {power.energyWh.toFixed(3)} <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Wh</span>
          </div>
          <div style={{ fontSize: '0.675rem', color: 'var(--text-secondary)' }}>Trapezoidal Integration</div>
        </div>
      </div>

      {/* Toggle Assumed Power Curve */}
      <div>
        <button
          onClick={() => setShowConfig(!showConfig)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#b45309',
            fontSize: '0.75rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.2rem 0'
          }}
        >
          {showConfig ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {showConfig ? 'Hide Assumed Fan Power Model' : 'Inspect / Tune Assumed 12V Fan Power Curve (Watts per Level)'}
        </button>

        {showConfig && (
          <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              Configure assumed power consumption for each speed level (Watts):
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.5rem' }}>
              {([0, 1, 2, 3, 4, 5] as FanLevel[]).map((lvl) => (
                <div key={lvl} style={{ textAlign: 'center', background: 'var(--bg-tertiary)', padding: '0.45rem', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.675rem', color: 'var(--text-secondary)' }}>L{lvl}</div>
                  <input
                    type="number"
                    step={0.1}
                    min={0}
                    max={30}
                    value={config.powerMap[lvl]}
                    onChange={(e) => onUpdatePowerMap(lvl, parseFloat(e.target.value) || 0)}
                    className="font-mono"
                    style={{
                      width: '100%',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      color: '#d97706',
                      textAlign: 'center',
                      padding: '0.2rem',
                      fontSize: '0.75rem',
                      borderRadius: '4px',
                      marginTop: '0.2rem'
                    }}
                  />
                  <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>W</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.675rem', marginTop: '0.5rem' }}>
              <AlertCircle size={12} color="#78716c" />
              <span>Model Reference: Typical 12V 120mm brushless DC fan power curve.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

