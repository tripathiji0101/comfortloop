import React from 'react';
import { UserCheck, UserX, Timer, Radio, AlertCircle } from 'lucide-react';
import type { ComfortConfig, ControllerOutput, SensorReadings } from '../types';

interface OccupancyControlsProps {
  sensors: SensorReadings;
  controller: ControllerOutput;
  config: ComfortConfig;
  onToggleOccupancy: () => void;
  onToggleDemoTimer: (useDemo: boolean) => void;
}

export const OccupancyControls: React.FC<OccupancyControlsProps> = ({
  sensors,
  controller,
  config,
  onToggleOccupancy,
  onToggleDemoTimer,
}) => {
  const activeVacancyDelayMs = config.useDemoTimer
    ? config.demoVacancyDelayMs
    : config.vacancyDelayMs;

  const secondsRemaining = Math.ceil(controller.vacancyRemainingMs / 1000);
  const totalSeconds = Math.ceil(activeVacancyDelayMs / 1000);
  const progressPct = totalSeconds > 0
    ? Math.max(0, Math.min(100, (controller.vacancyRemainingMs / activeVacancyDelayMs) * 100))
    : 0;

  return (
    <div className="eng-card">
      <div className="eng-card-header">
        <div className="eng-card-title">
          <Radio size={16} color="#10b981" />
          Occupancy & Vacancy Logic (LD2410 mmWave)
        </div>
        <span className="badge badge-sim">Simulated mmWave Radar</span>
      </div>

      {/* Occupancy Toggle */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
        <button
          onClick={() => { if (!sensors.occupied) onToggleOccupancy(); }}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.6rem',
            padding: '0.85rem 1rem',
            borderRadius: '8px',
            border: sensors.occupied ? '2px solid #059669' : '1px solid var(--border-subtle)',
            background: sensors.occupied ? 'rgba(5, 150, 105, 0.12)' : 'var(--bg-secondary)',
            color: sensors.occupied ? '#047857' : 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontWeight: 700,
            fontSize: '0.9rem',
          }}
        >
          <UserCheck size={18} color={sensors.occupied ? '#059669' : '#a89f91'} />
          OCCUPIED
          {sensors.occupied && <span className="dot dot-green" />}
        </button>

        <button
          onClick={() => { if (sensors.occupied) onToggleOccupancy(); }}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.6rem',
            padding: '0.85rem 1rem',
            borderRadius: '8px',
            border: !sensors.occupied ? '2px solid #d97706' : '1px solid var(--border-subtle)',
            background: !sensors.occupied ? 'rgba(217, 119, 6, 0.12)' : 'var(--bg-secondary)',
            color: !sensors.occupied ? '#b45309' : 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontWeight: 700,
            fontSize: '0.9rem',
          }}
        >
          <UserX size={18} color={!sensors.occupied ? '#d97706' : '#a89f91'} />
          UNOCCUPIED
          {!sensors.occupied && <span className="dot dot-amber" />}
        </button>
      </div>

      {/* Vacancy Timer Countdown Progress */}
      <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '0.85rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Timer size={14} color="#b45309" /> Vacancy Shutdown Countdown:
          </span>
          <span className="font-mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: sensors.occupied ? 'var(--text-muted)' : (secondsRemaining > 0 ? '#b45309' : '#be123c') }}>
            {sensors.occupied
              ? 'Standby (Room Occupied)'
              : secondsRemaining > 0
              ? `${secondsRemaining}s remaining`
              : 'Expired — Fan Shut Off (AWAY)'}
          </span>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: '8px', background: 'var(--border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
          <div
            style={{
              width: sensors.occupied ? '100%' : `${progressPct}%`,
              height: '100%',
              background: sensors.occupied ? '#059669' : (progressPct > 20 ? '#d97706' : '#e11d48'),
              transition: 'width 0.3s ease, background-color 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* Vacancy Configuration Mode Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.25rem', fontSize: '0.75rem' }}>
        <div style={{ color: 'var(--text-secondary)' }}>
          Mode:{' '}
          <span style={{ fontWeight: 600, color: config.useDemoTimer ? '#b45309' : '#78716c' }}>
            {config.useDemoTimer ? 'Accelerated Demo Timer (5s)' : 'Production Timer (5 Minutes / 300s)'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button
            onClick={() => onToggleDemoTimer(false)}
            style={{
              background: !config.useDemoTimer ? '#b45309' : 'var(--bg-tertiary)',
              color: !config.useDemoTimer ? '#ffffff' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: '4px',
              padding: '0.25rem 0.6rem',
              fontSize: '0.725rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Standard 5-Min
          </button>
          <button
            onClick={() => onToggleDemoTimer(true)}
            style={{
              background: config.useDemoTimer ? '#b45309' : 'var(--bg-tertiary)',
              color: config.useDemoTimer ? '#ffffff' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: '4px',
              padding: '0.25rem 0.6rem',
              fontSize: '0.725rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            title="Accelerate timer to 5s for rapid evaluation by judges"
          >
            ⚡ 5-Sec Demo
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.675rem', marginTop: '0.5rem' }}>
        <AlertCircle size={12} color="#78716c" />
        <span>Demonstration Note: The 5-second mode is strictly for live presentation; 5 minutes is the engineered production value.</span>
      </div>
    </div>
  );
};

