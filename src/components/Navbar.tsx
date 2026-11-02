import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Cpu,
  Zap,
  Code2,
  Clock,
  Layers,
  Box,
} from 'lucide-react';
import type { SimulationState, TabId } from '../types';

interface NavbarProps {
  simState: SimulationState;
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  onToggleRunning: () => void;
  onReset: () => void;
  onStartGuidedDemo: () => void;
  onChangeSpeed: (multiplier: number) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  simState,
  activeTab,
  setActiveTab,
  onToggleRunning,
  onReset,
  onStartGuidedDemo,
  onChangeSpeed,
}) => {
  const clockFormatted = simState.simClockDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <header style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-card)', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(8px)' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
        {/* Left Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img
            src="/logo.png"
            alt="ComfortLoop Logo"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              objectFit: 'contain',
              boxShadow: '0 2px 10px rgba(180, 83, 9, 0.25)',
              border: '1px solid var(--border-subtle)',
              background: '#f7f2ea'
            }}
          />

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.04em', color: 'var(--text-primary)' }}>
                COMFORTLOOP
              </h1>
              <span className="badge badge-sim">
                VIRTUAL PROTOTYPE — SIMULATED DATA
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
              <span>Occupancy- and Comfort-Aware Fan Controller</span>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <span style={{ color: '#b45309', fontWeight: 600 }}>atomQUEST 2026 | Track 1: Fan</span>
            </div>
          </div>
        </div>

        {/* Center / Right Simulation Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* Simulation Clock & Running Status */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'var(--bg-secondary)',
            padding: '0.35rem 0.85rem',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.8rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className={`dot ${simState.running ? 'dot-green' : 'dot-amber'}`} />
              <span style={{ fontWeight: 600, color: simState.running ? '#059669' : '#d97706' }}>
                {simState.running ? 'SIM RUNNING' : 'SIM PAUSED'}
              </span>
            </div>
            <span style={{ color: 'var(--border-subtle)' }}>|</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)' }} className="font-mono">
              <Clock size={14} color="#b45309" />
              <span>{clockFormatted}</span>
            </div>
          </div>

          {/* Speed Multiplier */}
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
            {[1, 10, 60, 120].map((speed) => (
              <button
                key={speed}
                onClick={() => onChangeSpeed(speed)}
                style={{
                  background: simState.config.simulationSpeedX === speed ? '#b45309' : 'transparent',
                  color: simState.config.simulationSpeedX === speed ? '#ffffff' : 'var(--text-secondary)',
                  border: 'none',
                  padding: '0.35rem 0.55rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
                title={`Simulation runs at ${speed}x real-world speed`}
              >
                {speed}x
              </button>
            ))}
          </div>

          {/* Play/Pause Button */}
          <button
            onClick={onToggleRunning}
            className={`btn ${simState.running ? 'btn-secondary' : 'btn-primary'}`}
            style={{ minWidth: '95px', padding: '0.45rem 0.85rem' }}
          >
            {simState.running ? (
              <>
                <Pause size={15} /> Pause
              </>
            ) : (
              <>
                <Play size={15} /> Start
              </>
            )}
          </button>

          {/* Reset Button */}
          <button
            onClick={onReset}
            className="btn btn-secondary"
            title="Reset simulation parameters to default"
            style={{ padding: '0.45rem 0.85rem' }}
          >
            <RotateCcw size={15} /> Reset
          </button>

          {/* Guided Demo Launch */}
          <button
            onClick={onStartGuidedDemo}
            className="btn btn-outline-accent"
            style={{ padding: '0.45rem 0.95rem' }}
            title="Launch step-by-step judge demonstration"
          >
            <Sparkles size={15} color="#b45309" />
            Guided Demo
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 1.5rem', background: 'var(--bg-secondary)' }}>
        <button
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <Layers size={16} />
          Main Control Station
        </button>
        <button
          className={`tab-btn ${activeTab === 'experiment' ? 'active' : ''}`}
          onClick={() => setActiveTab('experiment')}
        >
          <Zap size={16} />
          8-Hour Energy Experiment & Charts
        </button>
        <button
          className={`tab-btn ${activeTab === 'circuit' ? 'active' : ''}`}
          onClick={() => setActiveTab('circuit')}
        >
          <Cpu size={16} />
          Virtual Circuit View
        </button>
        <button
          className={`tab-btn ${activeTab === 'firmware' ? 'active' : ''}`}
          onClick={() => setActiveTab('firmware')}
        >
          <Code2 size={16} />
          Arduino C++ Firmware
        </button>
        <button
          className={`tab-btn ${activeTab === 'cad' ? 'active' : ''}`}
          onClick={() => setActiveTab('cad')}
        >
          <Box size={16} />
          3D CAD Assembly
        </button>
      </div>
    </header>
  );
};

