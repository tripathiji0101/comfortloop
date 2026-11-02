import React, { useState } from 'react';
import { Network, Power, Send, BellRing, Settings2, CheckCircle2 } from 'lucide-react';
import type { ConnectedDeviceEvent, ControllerOutput, SensorReadings } from '../types';

interface ConnectedDevicePanelProps {
  sensors: SensorReadings;
  controller: ControllerOutput;
  events: ConnectedDeviceEvent[];
}

export const ConnectedDevicePanel: React.FC<ConnectedDevicePanelProps> = ({
  sensors,
  controller,
  events,
}) => {
  const [brokerConnected, setBrokerConnected] = useState(false);
  const [brokerHost, setBrokerHost] = useState('broker.emqx.io');

  // Exhaust fan is triggered when room is hot, humid > 60%, and occupied
  const isExhaustActive = sensors.occupied && controller.comfortStatus === 'hot' && sensors.humidity > 60;
  
  // Suggested AC setpoint calculation based on apparent temp
  const acSetpoint = controller.apparentTemp > 28 ? 24 : (controller.apparentTemp < 24 ? 26 : 25);

  const latestEvent = events.length > 0 ? events[events.length - 1] : null;

  return (
    <div className="eng-card">
      <div className="eng-card-header">
        <div className="eng-card-title">
          <Network size={16} color="#b45309" />
          Connected-Device Integration & MQTT Telemetry
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge badge-sim">Simulated MQTT Protocol</span>
        </div>
      </div>

      {/* Actuator Relay & Auxiliary Devices Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
        {/* Relay Module Status */}
        <div style={{
          background: isExhaustActive ? 'rgba(5, 150, 105, 0.12)' : 'var(--bg-secondary)',
          border: isExhaustActive ? '1px solid rgba(5, 150, 105, 0.35)' : '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '0.85rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Auxiliary Relay (GPIO23)</span>
            <span className={`badge ${isExhaustActive ? 'badge-active' : 'badge-away'}`}>
              {isExhaustActive ? 'CLOSED (ON)' : 'OPEN (OFF)'}
            </span>
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0.2rem 0' }}>
            Exhaust Fan: <span style={{ color: isExhaustActive ? '#047857' : 'var(--text-muted)' }}>{isExhaustActive ? 'RUNNING' : 'INACTIVE'}</span>
          </div>
          <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>
            Trigger: Hot Comfort + RH &gt; 60% + Occupied
          </div>
        </div>

        {/* Simulated AC Thermostat Interface */}
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>HVAC / AC Integration</span>
            <span className="badge badge-accent">Automated Setpoint</span>
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0.2rem 0' }}>
            Target Setpoint: <span className="font-mono" style={{ color: '#b45309' }}>{acSetpoint} °C</span>
          </div>
          <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>
            ComfortLoop co-pilot adjusts AC load
          </div>
        </div>
      </div>

      {/* Latest MQTT Payload Viewer */}
      <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '0.85rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#b45309', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Send size={13} />
            Published Topic: <code className="font-mono" style={{ color: 'var(--text-primary)' }}>comfortloop/room1/state</code>
          </div>
          <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>
            {latestEvent ? `${Math.round(latestEvent.timestamp / 1000)}s sim time` : 'Awaiting event'}
          </span>
        </div>

        <pre className="font-mono" style={{
          fontSize: '0.75rem',
          color: '#047857',
          background: 'var(--bg-tertiary)',
          padding: '0.65rem',
          borderRadius: '6px',
          overflowX: 'auto',
          border: '1px solid var(--border-subtle)',
          maxHeight: '130px'
        }}>
          {latestEvent ? JSON.stringify(latestEvent.payload, null, 2) : JSON.stringify({
            occupancy: sensors.occupied ? 'occupied' : 'unoccupied',
            temperature: sensors.temperature,
            humidity: sensors.humidity,
            comfort_state: controller.comfortStatus,
            fan_level: controller.fanLevel,
            connected_device_request: isExhaustActive ? 'exhaust_on' : 'none'
          }, null, 2)}
        </pre>
      </div>

      {/* Broker Connection Toggle Note */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.725rem', color: 'var(--text-secondary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <CheckCircle2 size={14} color="#10b981" />
          <span>Local Simulation Active (External broker optional — zero cloud dependencies required).</span>
        </div>
      </div>
    </div>
  );
};

