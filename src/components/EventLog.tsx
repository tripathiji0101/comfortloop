import React from 'react';
import { History, Trash2, ArrowRight } from 'lucide-react';
import type { LogEntry } from '../types';

interface EventLogProps {
  logs: LogEntry[];
  onClearLogs: () => void;
}

export const EventLog: React.FC<EventLogProps> = ({ logs, onClearLogs }) => {
  const getBadgeStyle = (event: string) => {
    switch (event) {
      case 'STATE_CHANGE':
        return { background: 'rgba(180, 83, 9, 0.12)', color: '#b45309', border: '1px solid rgba(180, 83, 9, 0.3)' };
      case 'FAN_SPEED':
        return { background: 'rgba(5, 150, 105, 0.12)', color: '#047857', border: '1px solid rgba(5, 150, 105, 0.3)' };
      case 'OCCUPANCY':
        return { background: 'rgba(217, 119, 6, 0.12)', color: '#b45309', border: '1px solid rgba(217, 119, 6, 0.3)' };
      case 'FAULT':
        return { background: 'rgba(225, 29, 72, 0.12)', color: '#be123c', border: '1px solid rgba(225, 29, 72, 0.3)' };
      default:
        return { background: 'rgba(120, 113, 108, 0.15)', color: '#57534e', border: '1px solid rgba(120, 113, 108, 0.3)' };
    }
  };

  return (
    <div className="eng-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="eng-card-header">
        <div className="eng-card-title">
          <History size={16} color="#b45309" />
          Controller Event & Transition Telemetry Log
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="font-mono" style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
            {logs.length} entries
          </span>
          {logs.length > 0 && (
            <button
              onClick={onClearLogs}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '0.2rem',
              }}
              title="Clear event log"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        maxHeight: '340px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.4rem',
        paddingRight: '0.25rem'
      }}>
        {logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Awaiting controller events... Adjust sensors, change occupancy, or let the simulation run.
          </div>
        ) : (
          logs.slice().reverse().map((entry, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.45rem 0.65rem',
                borderRadius: '6px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.75rem',
                gap: '0.65rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                <span className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.675rem', minWidth: '45px' }}>
                  {(entry.simTimeMs / 1000).toFixed(0)}s
                </span>
                <span className="badge" style={getBadgeStyle(entry.event)}>
                  {entry.event}
                </span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                  {entry.detail}
                </span>
              </div>
              <span className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>
                {new Date(entry.wallTime).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

