import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Zap,
  TrendingDown,
  Clock,
  ShieldCheck,
  Table as TableIcon,
  BarChart2,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import type { EnergyExperimentResult, SimulationState } from '../types';
import { experimentToCSV } from '../logic/simulator';

interface EnergyChartsProps {
  simState: SimulationState;
  onStartExperiment: () => void;
  onPauseExperiment: () => void;
  onResumeExperiment: () => void;
  onResetExperiment: () => void;
  onRunFullExperimentQuickly: () => void;
}

export const EnergyCharts: React.FC<EnergyChartsProps> = ({
  simState,
  onStartExperiment,
  onPauseExperiment,
  onResumeExperiment,
  onResetExperiment,
  onRunFullExperimentQuickly,
}) => {
  const [showDataTable, setShowDataTable] = useState(false);
  const exp = simState.energyExperiment;

  const totalSimHours = exp.totalSimTimeMs / 3_600_000;
  const progressPct = Math.min(100, (exp.totalSimTimeMs / (8 * 3600 * 1000)) * 100);

  // Format data for Recharts
  const chartData = exp.snapshots.map((s) => ({
    timeMin: Math.round(s.simTimeMs / 60000),
    timeLabel: `${(s.simTimeMs / 3600000).toFixed(1)}h`,
    temp: s.temperature,
    clLevel: s.comfortLoopLevel,
    blLevel: s.baselineLevel,
    clPower: s.comfortLoopPowerW,
    blPower: s.baselinePowerW,
    clEnergy: s.comfortLoopEnergyWh,
    blEnergy: s.baselineEnergyWh,
    occupied: s.occupied ? 1 : 0,
    targetTemp: simState.config.targetTemp,
  }));

  const handleDownloadCSV = () => {
    const csvContent = experimentToCSV(exp);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'comfortloop-8hr-energy-experiment.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clHours = (exp.comfortLoopRunTimeMs / 3600000).toFixed(1);
  const blHours = (exp.baselineRunTimeMs / 3600000).toFixed(1);
  const comfortHours = (exp.comfortBandTimeMs / 3600000).toFixed(1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Experiment Header & Controls Card */}
      <div className="eng-card">
        <div className="eng-card-header">
          <div>
            <div className="eng-card-title">
              <Zap size={18} color="#b45309" />
              8-Hour Energy Comparison Experiment (Baseline vs. ComfortLoop)
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Compares a fixed-speed fan (Level {simState.config.baselineLevel} continuous) against ComfortLoop's dynamic comfort- and occupancy-aware modulation.
            </div>
          </div>
          <span className="badge badge-sim">
            SIMULATED RESULTS — NOT MEASURED HARDWARE DATA
          </span>
        </div>

        {/* Experiment Progress Bar */}
        <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={14} color="#b45309" /> Experiment Timeline Progress: {totalSimHours.toFixed(2)} / 8.00 Simulated Hours
            </span>
            <span className="font-mono" style={{ fontSize: '0.8rem', color: exp.status === 'complete' ? '#059669' : '#b45309', fontWeight: 700 }}>
              {exp.status.toUpperCase()} ({progressPct.toFixed(1)}%)
            </span>
          </div>

          <div style={{ width: '100%', height: '10px', background: 'var(--border-subtle)', borderRadius: '5px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${progressPct}%`,
                height: '100%',
                background: exp.status === 'complete'
                  ? 'linear-gradient(90deg, #059669, #10b981)'
                  : 'linear-gradient(90deg, #9a3412, #b45309)',
                transition: 'width 0.2s ease',
              }}
            />
          </div>
        </div>

        {/* Controls Bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {exp.status === 'idle' && (
              <button onClick={onStartExperiment} className="btn btn-primary">
                <Play size={15} /> Start 8-Hour Experiment
              </button>
            )}

            {exp.status === 'running' && (
              <button onClick={onPauseExperiment} className="btn btn-secondary">
                <Pause size={15} /> Pause Experiment
              </button>
            )}

            {exp.status === 'paused' && (
              <button onClick={onResumeExperiment} className="btn btn-primary">
                <Play size={15} /> Resume Experiment
              </button>
            )}

            <button onClick={onResetExperiment} className="btn btn-secondary" title="Reset all accumulated test data">
              <RotateCcw size={15} /> Reset
            </button>

            <button
              onClick={onRunFullExperimentQuickly}
              className="btn btn-outline-accent"
              title="Execute full 8-hour deterministic profile in 1 second"
            >
              ⚡ Fast-Forward 8-Hour Profile
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              onClick={() => setShowDataTable(!showDataTable)}
              className="btn btn-secondary"
              style={{ fontSize: '0.775rem' }}
            >
              <TableIcon size={14} />
              {showDataTable ? 'Hide Data Table' : 'Inspect Raw Data'}
            </button>

            <button
              onClick={handleDownloadCSV}
              disabled={exp.snapshots.length === 0}
              className="btn btn-secondary"
              style={{ fontSize: '0.775rem', opacity: exp.snapshots.length === 0 ? 0.5 : 1 }}
            >
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* KPI Comparison Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {/* Baseline Energy */}
        <div className="eng-card">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Baseline Energy (Fixed L{simState.config.baselineLevel})</div>
          <div className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-secondary)', margin: '0.35rem 0' }}>
            {exp.baselineEnergyWh.toFixed(2)} <span style={{ fontSize: '0.9rem' }}>Wh</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Operating Duration: {blHours}h continuous
          </div>
        </div>

        {/* ComfortLoop Energy */}
        <div className="eng-card" style={{ background: 'rgba(180, 83, 9, 0.08)', borderColor: 'rgba(180, 83, 9, 0.3)' }}>
          <div style={{ fontSize: '0.75rem', color: '#b45309' }}>ComfortLoop Energy (Adaptive)</div>
          <div className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#b45309', margin: '0.35rem 0' }}>
            {exp.comfortLoopEnergyWh.toFixed(2)} <span style={{ fontSize: '0.9rem' }}>Wh</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
            Motor Active Duration: {clHours}h (Shutoff when absent)
          </div>
        </div>

        {/* Difference / Savings Percentage */}
        <div className="eng-card" style={{ background: 'rgba(5, 150, 105, 0.08)', borderColor: 'rgba(5, 150, 105, 0.35)' }}>
          <div style={{ fontSize: '0.75rem', color: '#047857', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <TrendingDown size={14} /> Calculated Energy Reduction
          </div>
          <div className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#047857', margin: '0.35rem 0' }}>
            {(exp.baselineEnergyWh - exp.comfortLoopEnergyWh).toFixed(2)} <span style={{ fontSize: '0.85rem' }}>Wh</span> ({exp.savingsPercent.toFixed(1)}%)
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
            Absolute: Δ{(exp.baselineEnergyWh - exp.comfortLoopEnergyWh).toFixed(2)} Wh • Formula: (E_base - E_cl) / E_base × 100
          </div>
        </div>

        {/* Operating States Breakdown */}
        <div className="eng-card">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Clock size={14} color="#b45309" /> Operating State Breakdown
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', margin: '0.5rem 0' }}>
            <span className="badge badge-active" style={{ fontSize: '0.675rem' }}>
              ACTIVE: {((exp.activeRunTimeMs || 0) / 3600000).toFixed(1)}h
            </span>
            <span className="badge badge-away" style={{ fontSize: '0.675rem' }}>
              AWAY: {((exp.awayRunTimeMs || 0) / 3600000).toFixed(1)}h
            </span>
            <span className="badge badge-sleep" style={{ fontSize: '0.675rem' }}>
              SLEEP: {((exp.sleepRunTimeMs || 0) / 3600000).toFixed(1)}h
            </span>
            {exp.faultRunTimeMs ? (
              <span className="badge badge-fault" style={{ fontSize: '0.675rem' }}>
                FAULT: {(exp.faultRunTimeMs / 3600000).toFixed(1)}h
              </span>
            ) : null}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Simulated state residence across {totalSimHours.toFixed(1)}h
          </div>
        </div>

        {/* Comfort Band Time */}
        <div className="eng-card">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <ShieldCheck size={14} color="#059669" /> Comfort Maintained
          </div>
          <div className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.35rem 0' }}>
            {comfortHours} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>/ {totalSimHours.toFixed(1)}h</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Within target band (±{simState.config.hysteresis}°C)
          </div>
        </div>
      </div>

      {/* Raw Data Table Inspector */}
      {showDataTable && (
        <div className="eng-card">
          <div className="eng-card-header">
            <div className="eng-card-title">
              <TableIcon size={16} color="#b45309" />
              Raw Telemetry Samples ({exp.snapshots.length} datapoints)
            </div>
          </div>
          <div style={{ overflowX: 'auto', maxHeight: '250px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.45rem' }}>Sim Time</th>
                  <th style={{ padding: '0.45rem' }}>Temp (°C)</th>
                  <th style={{ padding: '0.45rem' }}>RH (%)</th>
                  <th style={{ padding: '0.45rem' }}>Occupied</th>
                  <th style={{ padding: '0.45rem' }}>CL Level</th>
                  <th style={{ padding: '0.45rem' }}>CL Power (W)</th>
                  <th style={{ padding: '0.45rem' }}>CL Energy (Wh)</th>
                  <th style={{ padding: '0.45rem' }}>Base Energy (Wh)</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {exp.snapshots.slice(-20).map((s, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                    <td style={{ padding: '0.45rem' }}>{(s.simTimeMs / 60000).toFixed(0)} min</td>
                    <td style={{ padding: '0.45rem' }}>{s.temperature.toFixed(1)}</td>
                    <td style={{ padding: '0.45rem' }}>{s.humidity.toFixed(0)}</td>
                    <td style={{ padding: '0.45rem', color: s.occupied ? '#059669' : '#78716c' }}>{s.occupied ? 'YES' : 'NO'}</td>
                    <td style={{ padding: '0.45rem', color: '#b45309' }}>L{s.comfortLoopLevel}</td>
                    <td style={{ padding: '0.45rem' }}>{s.comfortLoopPowerW.toFixed(2)}</td>
                    <td style={{ padding: '0.45rem', color: '#059669' }}>{s.comfortLoopEnergyWh.toFixed(3)}</td>
                    <td style={{ padding: '0.45rem', color: '#78716c' }}>{s.baselineEnergyWh.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4 Interactive Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.25rem' }}>
        {/* Chart 1: Fan Speed Levels over Time */}
        <div className="eng-card">
          <div className="eng-card-header">
            <div className="eng-card-title">
              <BarChart2 size={16} color="#b45309" />
              1. Fan Speed Level vs. Baseline
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Levels 0 to 5</span>
          </div>
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ede6da" />
                <XAxis dataKey="timeLabel" stroke="#78716c" fontSize={11} />
                <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} stroke="#78716c" fontSize={11} />
                <Tooltip contentStyle={{ background: '#f5efe7', border: '1px solid #ede6da', color: '#1c1917', fontSize: '11px', borderRadius: '6px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="stepAfter" dataKey="clLevel" name="ComfortLoop Level" stroke="#b45309" strokeWidth={2.5} dot={false} />
                <Line type="stepAfter" dataKey="blLevel" name="Baseline (Fixed L3)" stroke="#78716c" strokeDasharray="4 4" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Temperature & Target Profile */}
        <div className="eng-card">
          <div className="eng-card-header">
            <div className="eng-card-title">
              <BarChart2 size={16} color="#e11d48" />
              2. Simulated Room Temp & Target (°C)
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Target: {simState.config.targetTemp}°C</span>
          </div>
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ede6da" />
                <XAxis dataKey="timeLabel" stroke="#78716c" fontSize={11} />
                <YAxis domain={[20, 38]} stroke="#78716c" fontSize={11} />
                <Tooltip contentStyle={{ background: '#f5efe7', border: '1px solid #ede6da', color: '#1c1917', fontSize: '11px', borderRadius: '6px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="temp" name="Room Temp (°C)" stroke="#e11d48" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="targetTemp" name="Target Comfort (°C)" stroke="#059669" strokeDasharray="5 5" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Power Consumption Over Time */}
        <div className="eng-card">
          <div className="eng-card-header">
            <div className="eng-card-title">
              <Zap size={16} color="#d97706" />
              3. Instantaneous Power Draw (Watts)
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>INA219 Simulated Model</span>
          </div>
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ede6da" />
                <XAxis dataKey="timeLabel" stroke="#78716c" fontSize={11} />
                <YAxis domain={[0, 14]} stroke="#78716c" fontSize={11} />
                <Tooltip contentStyle={{ background: '#f5efe7', border: '1px solid #ede6da', color: '#1c1917', fontSize: '11px', borderRadius: '6px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area type="stepAfter" dataKey="clPower" name="ComfortLoop Power (W)" stroke="#b45309" fill="rgba(180, 83, 9, 0.15)" strokeWidth={2} />
                <Line type="stepAfter" dataKey="blPower" name="Baseline Power (W)" stroke="#78716c" strokeDasharray="4 4" strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Cumulative Energy Consumption */}
        <div className="eng-card">
          <div className="eng-card-header">
            <div className="eng-card-title">
              <TrendingDown size={16} color="#059669" />
              4. Cumulative Energy Consumption (Wh)
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Baseline vs. ComfortLoop</span>
          </div>
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ede6da" />
                <XAxis dataKey="timeLabel" stroke="#78716c" fontSize={11} />
                <YAxis stroke="#78716c" fontSize={11} />
                <Tooltip contentStyle={{ background: '#f5efe7', border: '1px solid #ede6da', color: '#1c1917', fontSize: '11px', borderRadius: '6px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="clEnergy" name="ComfortLoop (Wh)" stroke="#059669" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="blEnergy" name="Baseline (Wh)" stroke="#d97706" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.725rem', padding: '0.5rem' }}>
        <Info size={14} color="#78716c" />
        <span>Academic Honesty Note: The ~25% energy saving mentioned in the abstract is a design target. The values displayed above are computed in real time from the simulated power curve and actual simulated runtime profile.</span>
      </div>
    </div>
  );
};

