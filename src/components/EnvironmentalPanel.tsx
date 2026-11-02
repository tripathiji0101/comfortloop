import React from 'react';
import { Thermometer, Droplets, Wind, Info, Target, Compass } from 'lucide-react';
import type { ComfortConfig, ControllerOutput, SensorReadings } from '../types';

interface EnvironmentalPanelProps {
  sensors: SensorReadings;
  controller: ControllerOutput;
  config: ComfortConfig;
  onUpdateTemp: (temp: number) => void;
  onUpdateHumidity: (humidity: number) => void;
  onUpdateTargetTemp: (target: number) => void;
  onUpdateHysteresis: (hyst: number) => void;
}

export const EnvironmentalPanel: React.FC<EnvironmentalPanelProps> = ({
  sensors,
  controller,
  config,
  onUpdateTemp,
  onUpdateHumidity,
  onUpdateTargetTemp,
  onUpdateHysteresis,
}) => {
  // Comfort status coloring
  const getComfortBadge = (status: string) => {
    switch (status) {
      case 'cold':
        return <span className="badge" style={{ background: 'rgba(120, 113, 108, 0.2)', color: '#57534e', border: '1px solid rgba(120, 113, 108, 0.4)' }}>COLD</span>;
      case 'cool':
        return <span className="badge" style={{ background: 'rgba(180, 83, 9, 0.15)', color: '#b45309', border: '1px solid rgba(180, 83, 9, 0.35)' }}>COOL</span>;
      case 'comfortable':
        return <span className="badge" style={{ background: 'rgba(5, 150, 105, 0.15)', color: '#047857', border: '1px solid rgba(5, 150, 105, 0.35)' }}>COMFORTABLE</span>;
      case 'warm':
        return <span className="badge" style={{ background: 'rgba(217, 119, 6, 0.15)', color: '#b45309', border: '1px solid rgba(217, 119, 6, 0.35)' }}>WARM</span>;
      case 'hot':
        return <span className="badge" style={{ background: 'rgba(225, 29, 72, 0.15)', color: '#be123c', border: '1px solid rgba(225, 29, 72, 0.35)' }}>HOT</span>;
      default:
        return <span className="badge badge-away">{status}</span>;
    }
  };

  // Input validation handlers
  const handleTempChange = (valStr: string) => {
    const val = parseFloat(valStr);
    if (!isNaN(val)) {
      onUpdateTemp(Math.min(45, Math.max(10, val)));
    }
  };

  const handleHumidityChange = (valStr: string) => {
    const val = parseFloat(valStr);
    if (!isNaN(val)) {
      onUpdateHumidity(Math.min(100, Math.max(10, val)));
    }
  };

  const handleTargetChange = (valStr: string) => {
    const val = parseFloat(valStr);
    if (!isNaN(val)) {
      onUpdateTargetTemp(Math.min(32, Math.max(18, val)));
    }
  };

  const handleHysteresisChange = (valStr: string) => {
    const val = parseFloat(valStr);
    if (!isNaN(val)) {
      onUpdateHysteresis(Math.min(3.0, Math.max(0.1, val)));
    }
  };

  const assumedAirflow = config.airflowMap[controller.fanLevel];

  return (
    <div className="eng-card">
      <div className="eng-card-header">
        <div className="eng-card-title">
          <Thermometer size={16} color="#b45309" />
          Environmental Monitoring & Comfort Model
        </div>
        <span className="badge badge-sim">Simulated BME280 Telemetry</span>
      </div>

      {/* Primary KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {/* Dry Bulb Temperature */}
        <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Thermometer size={13} color="#e11d48" /> Dry-Bulb Temp (T)
          </div>
          <div className="font-mono" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0.2rem 0' }}>
            {sensors.temperature.toFixed(1)} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>°C</span>
          </div>
          <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>BME280 Ambient Sensor</div>
        </div>

        {/* Relative Humidity */}
        <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Droplets size={13} color="#b45309" /> Relative Humidity (RH)
          </div>
          <div className="font-mono" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0.2rem 0' }}>
            {sensors.humidity.toFixed(0)} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>%</span>
          </div>
          <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>Water Vapour Saturation</div>
        </div>

        {/* Apparent Temperature */}
        <div style={{ background: 'rgba(180, 83, 9, 0.08)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(180, 83, 9, 0.25)' }}>
          <div style={{ fontSize: '0.725rem', color: '#b45309', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Compass size={13} color="#b45309" /> Apparent Temp (AT)
          </div>
          <div className="font-mono" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#b45309', margin: '0.2rem 0' }}>
            {controller.apparentTemp.toFixed(1)} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>°C</span>
          </div>
          <div style={{ fontSize: '0.675rem', color: 'var(--text-secondary)' }}>
            Wind-chill corrected (ws: {assumedAirflow} m/s)
          </div>
        </div>

        {/* Comfort Status */}
        <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Target size={13} color="#059669" /> Comfort Status
          </div>
          <div style={{ margin: '0.45rem 0 0.2rem 0' }}>
            {getComfortBadge(controller.comfortStatus)}
          </div>
          <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>
            Target: {config.targetTemp}°C (±{config.hysteresis}°C)
          </div>
        </div>
      </div>

      {/* Interactive Input Sliders */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
        {/* Temperature Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <label style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Thermometer size={14} color="#e11d48" /> Manual Ambient Temperature:
            </label>
            <span className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 700 }}>
              {sensors.temperature.toFixed(1)} °C
            </span>
          </div>
          <input
            type="range"
            min={15}
            max={40}
            step={0.5}
            value={sensors.temperature}
            onChange={(e) => handleTempChange(e.target.value)}
            style={{ width: '100%' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.675rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            <span>15°C (Cool)</span>
            <span>26°C (Target)</span>
            <span>40°C (Extreme Heat)</span>
          </div>
        </div>

        {/* Humidity Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <label style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Droplets size={14} color="#b45309" /> Manual Relative Humidity:
            </label>
            <span className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 700 }}>
              {sensors.humidity.toFixed(0)} %
            </span>
          </div>
          <input
            type="range"
            min={20}
            max={90}
            step={1}
            value={sensors.humidity}
            onChange={(e) => handleHumidityChange(e.target.value)}
            style={{ width: '100%' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.675rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            <span>20% (Arid)</span>
            <span>55% (Moderate)</span>
            <span>90% (Tropical)</span>
          </div>
        </div>
      </div>

      {/* Target & Hysteresis Tuning Row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.85rem', gap: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.775rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Target Comfort Temp:</span>
            <input
              type="number"
              min={20}
              max={30}
              step={0.5}
              value={config.targetTemp}
              onChange={(e) => handleTargetChange(e.target.value)}
              className="font-mono"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                width: '65px',
                fontSize: '0.8rem'
              }}
            />
            <span style={{ color: 'var(--text-muted)' }}>°C</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Hysteresis Deadband:</span>
            <input
              type="number"
              min={0.2}
              max={2.0}
              step={0.1}
              value={config.hysteresis}
              onChange={(e) => handleHysteresisChange(e.target.value)}
              className="font-mono"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                width: '65px',
                fontSize: '0.8rem'
              }}
            />
            <span style={{ color: 'var(--text-muted)' }}>±°C (prevents hunting)</span>
          </div>
        </div>

        {/* Engineering Equation Disclaimer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
          <Info size={13} color="#78716c" />
          <span>Formula: AT = T + 0.33·e − 0.70·ws − 4.00 (Approximation model)</span>
        </div>
      </div>
    </div>
  );
};

