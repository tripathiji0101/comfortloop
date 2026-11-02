import React, { useState } from 'react';
import {
  Cpu,
  Layers,
  Info,
  Radio,
  Thermometer,
  Zap,
  Fan,
  ToggleLeft,
  ExternalLink,
  Copy,
  Check,
  ShieldAlert,
} from 'lucide-react';

interface ComponentDetail {
  id: string;
  name: string;
  category: 'sensor' | 'mcu' | 'actuator' | 'power' | 'network';
  pins: string;
  voltage: string;
  role: string;
  circuitRole: string;
}

const COMPONENTS: ComponentDetail[] = [
  {
    id: 'esp32',
    name: 'ESP32-WROOM-32 Development Board',
    category: 'mcu',
    pins: 'GPIO 21 (SDA), GPIO 22 (SCL), GPIO 4 (Radar), GPIO 18 (PWM), GPIO 19 (Tach), GPIO 23 (Relay)',
    voltage: '3.3V Logic / 5V USB Power',
    role: 'Central processing unit executing the apparent-temperature comfort algorithm, occupancy timeout state machine, and hardware PWM generation.',
    circuitRole: 'Master controller orchestrating I2C peripherals, hardware timer interrupts, and digital GPIOs.',
  },
  {
    id: 'bme280',
    name: 'Bosch BME280 Sensor Module',
    category: 'sensor',
    pins: 'VCC (3.3V), GND, SDA (GPIO 21), SCL (GPIO 22)',
    voltage: '3.3V DC',
    role: 'Precision environmental sensor capturing dry-bulb ambient temperature and relative humidity.',
    circuitRole: 'I2C slave peripheral communicating over shared I2C bus at standard 100kHz/400kHz speed.',
  },
  {
    id: 'ld2410',
    name: 'HLK-LD2410 24GHz mmWave Presence Sensor',
    category: 'sensor',
    pins: 'VCC (5V), GND, OUT (GPIO 4), TX/RX (GPIO 16/17 UART2)',
    voltage: '5V Operating / 3.3V Logic OUT',
    role: 'High-frequency radar module detecting micro-motion (breathing, sitting) and macroscopic human presence.',
    circuitRole: 'Active-high digital GPIO interrupt and serial telemetry. In Wokwi, simulated using a manual slide switch on GPIO 4 (3.3V/GND) to inject occupied/unoccupied states; Wokwi cannot simulate 24 GHz microwave physics.',
  },
  {
    id: 'ina219',
    name: 'TI INA219 Current & Power Sensor',
    category: 'power',
    pins: 'VCC (3.3V), GND, SDA (GPIO 21), SCL (GPIO 22), Vin+ / Vin-',
    voltage: '3.3V Logic, up to 26V High-Side Bus',
    role: 'Monitors instantaneous voltage, current, and wattage drawn by the 12V DC fan motor across a 0.1Ω precision shunt.',
    circuitRole: 'Software-modeled in the virtual prototype via empirical lookup table (POWER_LOOKUP); not measured electrically by the Wokwi simulation circuit.',
  },
  {
    id: 'fan',
    name: '12V 4-Pin PWM Brushless DC Fan',
    category: 'actuator',
    pins: 'Pin 1: GND, Pin 2: +12V DC, Pin 3: Tachometer (GPIO 19), Pin 4: PWM Control (GPIO 18)',
    voltage: '12V DC Motor Power, 3.3V/5V PWM Input',
    role: 'Delivers dynamic convective airflow to establish thermal comfort while minimizing unnecessary acoustic noise.',
    circuitRole: 'Operated at 25 kHz Intel standard PWM. In Wokwi, modeled using an amber/orange LED whose brightness reflects commanded fan speed (0-100% duty cycle). GPIO 19 tachometer input is active in firmware but left unconnected in Wokwi as it lacks a rotating Hall-effect motor model.',
  },
  {
    id: 'relay',
    name: '5V Optocoupler Single-Channel Relay',
    category: 'actuator',
    pins: 'VCC (5V), GND, IN (GPIO 23), NO / COM / NC Terminals',
    voltage: '5V Coil, up to 250V AC / 30V DC Load',
    role: 'Switches connected auxiliary loads such as bathroom/window exhaust fans or contactor triggers for HVAC assist.',
    circuitRole: 'Optically isolated driver protecting ESP32 GPIO from inductive kickback.',
  },
  {
    id: 'psu',
    name: '12V 2A DC Regulated Power Supply & 2A Fuse',
    category: 'power',
    pins: 'DC Barrel Jack / Terminal Block to Vin / GND',
    voltage: '12V DC Input',
    role: 'Provides primary electrical power to the 12V fan motor and steps down via on-board regulator to power ESP32.',
    circuitRole: 'Includes 2A fast-blow inline fuse and decoupling capacitors for overcurrent protection.',
  },
  {
    id: 'mqtt',
    name: 'MQTT Gateway & Telemetry Bridge',
    category: 'network',
    pins: '802.11 b/g/n Wi-Fi / TCP Port 1883',
    voltage: 'RF Transceiver',
    role: 'Publishes periodic state telemetry JSON payloads and receives remote automation commands.',
    circuitRole: 'Software communication layer connecting firmware state machine to local or cloud dashboard.',
  },
];

export const CircuitView: React.FC = () => {
  const [selectedComp, setSelectedComp] = useState<ComponentDetail>(COMPONENTS[0]);
  const [copied, setCopied] = useState(false);

  const wokwiDiagramJson = JSON.stringify(
    {
      version: 1,
      author: 'atomQUEST 2026 ComfortLoop Team',
      editor: 'wokwi',
      parts: [
        { type: 'board-esp32', id: 'esp32', top: 0, left: 0, attrs: {} },
        { type: 'chip-bme280', id: 'bme280', top: -120, left: -120, attrs: {} },
        { type: 'wokwi-slide-switch', id: 'ld2410_sim', top: -100, left: 160, attrs: {} },
        { type: 'wokwi-relay-module', id: 'relay1', top: 180, left: 160, attrs: {} },
        { type: 'wokwi-led', id: 'fan_pwm_led', top: 180, left: -100, attrs: { color: 'orange', label: 'Fan Speed PWM Indicator (GPIO 18)' } },
        { type: 'wokwi-resistor', id: 'r1', top: 240, left: -80, attrs: { value: '330' } },
      ],
      connections: [
        ['esp32:GND.1', 'bme280:GND', 'black', ['h0']],
        ['esp32:3V3', 'bme280:VIN', 'red', ['h0']],
        ['esp32:21', 'bme280:SDA', 'green', ['h0']],
        ['esp32:22', 'bme280:SCL', 'gold', ['h0']],
        ['esp32:3V3', 'ld2410_sim:1', 'red', ['h0']],
        ['esp32:4', 'ld2410_sim:2', 'orange', ['h0']],
        ['esp32:GND.2', 'ld2410_sim:3', 'black', ['h0']],
        ['esp32:5V', 'relay1:VCC', 'red', ['h0']],
        ['esp32:GND.2', 'relay1:GND', 'black', ['h0']],
        ['esp32:23', 'relay1:IN', 'purple', ['h0']],
        ['esp32:18', 'fan_pwm_led:A', 'orange', ['h0']],
        ['fan_pwm_led:C', 'r1:1', 'black', ['h0']],
        ['r1:2', 'esp32:GND.1', 'black', ['h0']],
      ],
      dependencies: {},
    },
    null,
    2
  );

  const handleCopyWokwi = () => {
    navigator.clipboard.writeText(wokwiDiagramJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header Banner */}
      <div className="eng-card">
        <div className="eng-card-header">
          <div>
            <div className="eng-card-title">
              <Cpu size={18} color="#b45309" />
              Virtual Circuit & Embedded System Architecture
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Hardware pinout, bus interconnects, and component roles for the atomQUEST 2026 track prototype.
            </div>
          </div>
          <span className="badge" style={{ background: 'rgba(225, 29, 72, 0.1)', color: '#be123c', border: '1px solid rgba(225, 29, 72, 0.25)' }}>
            CONCEPTUAL VIRTUAL CIRCUIT — NOT A PHYSICAL ELECTRICAL SCHEMATIC
          </span>
        </div>

        {/* Informative Disclaimer Banner */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(217, 119, 6, 0.08)', border: '1px solid rgba(217, 119, 6, 0.25)', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.75rem', color: '#92400e' }}>
          <ShieldAlert size={18} color="#d97706" />
          <div>
            <strong>Engineering Integrity Notice:</strong> This diagram illustrates electrical pin assignments and signal routing designed for our ESP32 prototype. It does not replace physical multi-meter or oscilloscope verification on bench hardware.
          </div>
        </div>
      </div>

      {/* Main Interactive Diagram & Component Detail Split */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.4fr) minmax(280px, 1fr)', gap: '1.25rem' }}>
        {/* Interactive Visual Circuit Map SVG */}
        <div className="eng-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '440px' }}>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Interactive System Block Diagram (Click components to inspect)
            </span>
            <span style={{ fontSize: '0.7rem', color: '#b45309', fontWeight: 600 }}>Active: {selectedComp.name.split(' ')[0]}</span>
          </div>

          <svg viewBox="0 0 600 420" style={{ width: '100%', height: 'auto', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <defs>
              {/* Wiring markers */}
              <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#b45309" />
              </marker>
              <marker id="arrowGreen" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#059669" />
              </marker>
              <marker id="arrowAmber" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#d97706" />
              </marker>
              <marker id="arrowViolet" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#7c3aed" />
              </marker>
            </defs>

            {/* Circuit Grid Background */}
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--border-subtle)" strokeWidth="0.8" />
            </pattern>
            <rect width="600" height="420" fill="url(#grid)" />

            {/* Interconnecting Signal & Power Wires */}
            {/* BME280 -> ESP32 I2C */}
            <path d="M 140 80 L 220 80 L 220 180 L 250 180" fill="none" stroke="#b45309" strokeWidth="2.5" markerEnd="url(#arrow)" />
            <text x="175" y="70" fill="#b45309" fontSize="9" fontFamily="monospace" fontWeight="600">I2C (SDA 21, SCL 22)</text>

            {/* LD2410 -> ESP32 Presence */}
            <path d="M 140 210 L 250 210" fill="none" stroke="#059669" strokeWidth="2.5" markerEnd="url(#arrowGreen)" />
            <text x="160" y="200" fill="#047857" fontSize="9" fontFamily="monospace" fontWeight="600">GPIO 4 (OUT)</text>

            {/* INA219 -> ESP32 I2C */}
            <path d="M 140 330 L 220 330 L 220 240 L 250 240" fill="none" stroke="#b45309" strokeWidth="2.5" markerEnd="url(#arrow)" />
            <text x="175" y="320" fill="#b45309" fontSize="9" fontFamily="monospace" fontWeight="600">I2C (Addr 0x40)</text>

            {/* ESP32 -> Fan PWM & Tach */}
            <path d="M 370 180 L 450 180" fill="none" stroke="#d97706" strokeWidth="2.5" markerEnd="url(#arrowAmber)" />
            <text x="380" y="170" fill="#b45309" fontSize="9" fontFamily="monospace" fontWeight="600">PWM 18 (25kHz)</text>
            <path d="M 450 200 L 370 200" fill="none" stroke="#d97706" strokeWidth="2" markerEnd="url(#arrowAmber)" />
            <text x="380" y="215" fill="#b45309" fontSize="9" fontFamily="monospace" fontWeight="600">Tach 19 (RPM)</text>

            {/* ESP32 -> Relay Module */}
            <path d="M 370 240 L 450 240" fill="none" stroke="#7c3aed" strokeWidth="2.5" markerEnd="url(#arrowViolet)" />
            <text x="385" y="255" fill="#6d28d9" fontSize="9" fontFamily="monospace" fontWeight="600">GPIO 23 Relay</text>

            {/* Relay -> Connected Device */}
            <path d="M 525 270 L 525 320" fill="none" stroke="#7c3aed" strokeWidth="2" strokeDasharray="3 3" markerEnd="url(#arrowViolet)" />

            {/* ESP32 -> MQTT Dashboard (Conceptual) */}
            <path d="M 310 140 L 310 60" fill="none" stroke="#059669" strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#arrowGreen)" />
            <text x="320" y="100" fill="#047857" fontSize="9" fontFamily="monospace" fontWeight="600">Wi-Fi / MQTT Telemetry</text>

            {/* 12V PSU Bus */}
            <path d="M 140 370 L 480 370 L 480 220" fill="none" stroke="#e11d48" strokeWidth="1.5" strokeDasharray="5 5" />
            <text x="280" y="385" fill="#be123c" fontSize="9" fontFamily="monospace" fontWeight="600">+12V DC Fan Power Rail</text>

            {/* Block 1: BME280 */}
            <g onClick={() => setSelectedComp(COMPONENTS[1])} style={{ cursor: 'pointer' }}>
              <rect x="30" y="50" width="110" height="60" rx="8" fill={selectedComp.id === 'bme280' ? '#b45309' : 'var(--bg-card)'} stroke="#b45309" strokeWidth="2" />
              <text x="85" y="75" textAnchor="middle" fill={selectedComp.id === 'bme280' ? '#ffffff' : 'var(--text-primary)'} fontSize="11" fontWeight="bold">BME280</text>
              <text x="85" y="93" textAnchor="middle" fill={selectedComp.id === 'bme280' ? '#fef3c7' : 'var(--text-secondary)'} fontSize="8">Temp & RH (I2C)</text>
            </g>

            {/* Block 2: LD2410 */}
            <g onClick={() => setSelectedComp(COMPONENTS[2])} style={{ cursor: 'pointer' }}>
              <rect x="30" y="180" width="110" height="60" rx="8" fill={selectedComp.id === 'ld2410' ? '#059669' : 'var(--bg-card)'} stroke="#059669" strokeWidth="2" />
              <text x="85" y="205" textAnchor="middle" fill={selectedComp.id === 'ld2410' ? '#ffffff' : 'var(--text-primary)'} fontSize="11" fontWeight="bold">LD2410</text>
              <text x="85" y="223" textAnchor="middle" fill={selectedComp.id === 'ld2410' ? '#ecfdf5' : 'var(--text-secondary)'} fontSize="8">24GHz mmWave</text>
            </g>

            {/* Block 3: INA219 */}
            <g onClick={() => setSelectedComp(COMPONENTS[3])} style={{ cursor: 'pointer' }}>
              <rect x="30" y="300" width="110" height="60" rx="8" fill={selectedComp.id === 'ina219' ? '#b45309' : 'var(--bg-card)'} stroke="#b45309" strokeWidth="2" />
              <text x="85" y="325" textAnchor="middle" fill={selectedComp.id === 'ina219' ? '#ffffff' : 'var(--text-primary)'} fontSize="11" fontWeight="bold">INA219</text>
              <text x="85" y="343" textAnchor="middle" fill={selectedComp.id === 'ina219' ? '#fef3c7' : 'var(--text-secondary)'} fontSize="8">Power / Current</text>
            </g>

            {/* Central Block: ESP32 */}
            <g onClick={() => setSelectedComp(COMPONENTS[0])} style={{ cursor: 'pointer' }}>
              <rect x="250" y="140" width="120" height="130" rx="10" fill={selectedComp.id === 'esp32' ? '#44403c' : 'var(--bg-card)'} stroke="#b45309" strokeWidth="3" />
              <rect x="260" y="150" width="100" height="30" rx="4" fill={selectedComp.id === 'esp32' ? '#292524' : 'var(--bg-tertiary)'} />
              <text x="310" y="170" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">ESP32 MCU</text>
              <text x="310" y="200" textAnchor="middle" fill={selectedComp.id === 'esp32' ? '#fef3c7' : '#b45309'} fontSize="9" fontWeight="600">ComfortLoop Core</text>
              <text x="310" y="220" textAnchor="middle" fill={selectedComp.id === 'esp32' ? '#ffffff' : 'var(--text-secondary)'} fontSize="8">240MHz Dual-Core</text>
              <text x="310" y="240" textAnchor="middle" fill={selectedComp.id === 'esp32' ? '#ecfdf5' : '#047857'} fontSize="8" fontWeight="600">FreeRTOS / C++</text>
            </g>

            {/* Block 4: PWM Fan */}
            <g onClick={() => setSelectedComp(COMPONENTS[4])} style={{ cursor: 'pointer' }}>
              <rect x="450" y="140" width="120" height="70" rx="8" fill={selectedComp.id === 'fan' ? '#b45309' : 'var(--bg-card)'} stroke="#b45309" strokeWidth="2" />
              <text x="510" y="168" textAnchor="middle" fill={selectedComp.id === 'fan' ? '#ffffff' : 'var(--text-primary)'} fontSize="11" fontWeight="bold">12V PWM Fan</text>
              <text x="510" y="186" textAnchor="middle" fill={selectedComp.id === 'fan' ? '#fef3c7' : 'var(--text-secondary)'} fontSize="8">4-Pin (Intel Spec)</text>
            </g>

            {/* Block 5: Relay Module */}
            <g onClick={() => setSelectedComp(COMPONENTS[5])} style={{ cursor: 'pointer' }}>
              <rect x="450" y="230" width="120" height="50" rx="8" fill={selectedComp.id === 'relay' ? '#7c3aed' : 'var(--bg-card)'} stroke="#7c3aed" strokeWidth="2" />
              <text x="510" y="253" textAnchor="middle" fill={selectedComp.id === 'relay' ? '#ffffff' : 'var(--text-primary)'} fontSize="10" fontWeight="bold">5V Relay Module</text>
              <text x="510" y="268" textAnchor="middle" fill={selectedComp.id === 'relay' ? '#f5f3ff' : 'var(--text-secondary)'} fontSize="8">Aux Connected Dev</text>
            </g>

            {/* Block 6: Connected Device */}
            <g>
              <rect x="460" y="320" width="100" height="40" rx="6" fill="var(--bg-tertiary)" stroke="#7c3aed" strokeWidth="1.5" strokeDasharray="3 3" />
              <text x="510" y="344" textAnchor="middle" fill="#7c3aed" fontSize="9" fontWeight="600">Exhaust Fan / AC</text>
            </g>

            {/* Top Block: MQTT Dashboard */}
            <g onClick={() => setSelectedComp(COMPONENTS[7])} style={{ cursor: 'pointer' }}>
              <rect x="240" y="15" width="140" height="45" rx="8" fill={selectedComp.id === 'mqtt' ? '#059669' : 'var(--bg-card)'} stroke="#059669" strokeWidth="2" />
              <text x="310" y="36" textAnchor="middle" fill={selectedComp.id === 'mqtt' ? '#ffffff' : 'var(--text-primary)'} fontSize="10" fontWeight="bold">MQTT Dashboard</text>
              <text x="310" y="50" textAnchor="middle" fill={selectedComp.id === 'mqtt' ? '#ecfdf5' : '#047857'} fontSize="8">Virtual Control Station</text>
            </g>
          </svg>
        </div>

        {/* Selected Component Technical Specification Card */}
        <div className="eng-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="eng-card-header">
              <div className="eng-card-title">
                <Info size={16} color="#b45309" />
                Component Datasheet & Pinout
              </div>
              <span className="badge badge-accent">{selectedComp.category.toUpperCase()}</span>
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
              {selectedComp.name}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.8rem', marginBottom: '1rem' }}>
              <div style={{ background: 'var(--bg-secondary)', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Pin Assignments:</span>
                <div className="font-mono" style={{ color: '#b45309', marginTop: '0.2rem', fontSize: '0.75rem', fontWeight: 600 }}>
                  {selectedComp.pins}
                </div>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Voltage & Power:</span>
                <div className="font-mono" style={{ color: '#059669', marginTop: '0.2rem', fontSize: '0.75rem', fontWeight: 600 }}>
                  {selectedComp.voltage}
                </div>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>System Function:</span>
                <p style={{ color: 'var(--text-primary)', marginTop: '0.2rem', lineHeight: 1.4, fontSize: '0.75rem' }}>
                  {selectedComp.role}
                </p>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Electrical Interfacing:</span>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.2rem', lineHeight: 1.4, fontSize: '0.75rem' }}>
                  {selectedComp.circuitRole}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Component Picker Pills */}
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              Select component to inspect:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {COMPONENTS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedComp(c)}
                  style={{
                    background: selectedComp.id === c.id ? '#b45309' : 'var(--bg-secondary)',
                    color: selectedComp.id === c.id ? '#ffffff' : 'var(--text-primary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '4px',
                    padding: '0.2rem 0.5rem',
                    fontSize: '0.675rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {c.id.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Wokwi Simulation Capabilities & Limitations */}
      <div className="eng-card">
        <div className="eng-card-header">
          <div className="eng-card-title">
            <Info size={16} color="#b45309" />
            Wokwi Virtual Circuit Scope: Capabilities vs. Limitations
          </div>
          <span className="badge badge-accent">
            VERIFIED WITH WOKWI-CLI LINT
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
          {/* Can Demonstrate */}
          <div style={{ background: 'rgba(5, 150, 105, 0.08)', border: '1px solid rgba(5, 150, 105, 0.25)', borderRadius: '6px', padding: '0.85rem' }}>
            <div style={{ fontSize: '0.775rem', fontWeight: 700, color: '#047857', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Check size={14} color="#059669" /> What the Wokwi Circuit CAN Demonstrate
            </div>
            <ul style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', paddingLeft: '1.1rem', margin: 0, lineHeight: 1.6 }}>
              <li><strong>25 kHz PWM Duty Cycle:</strong> Visual LED brightness on GPIO 18 represents commanded fan speed level (0% to 100%).</li>
              <li><strong>Presence Toggling:</strong> Slide switch on GPIO 4 simulates active-high output of LD2410 mmWave sensor.</li>
              <li><strong>State Transitions & Vacancy Timeout:</strong> Absence triggers countdown to <code>AWAY</code> mode (0% PWM).</li>
              <li><strong>Sleep Mode Clamping:</strong> Quiet hours enforce Level 2 cap and gradual ±1 step rate limiting.</li>
              <li><strong>Auxiliary Relay Trigger:</strong> GPIO 23 activates auxiliary relay during hot and humid occupied conditions.</li>
              <li><strong>Live JSON Telemetry:</strong> Periodic telemetry output and serial command parsing (<code>'d'</code>, <code>'s'</code>, <code>'b'</code>, <code>'f'</code>).</li>
            </ul>
          </div>

          {/* Cannot Demonstrate */}
          <div style={{ background: 'rgba(225, 29, 72, 0.08)', border: '1px solid rgba(225, 29, 72, 0.25)', borderRadius: '6px', padding: '0.85rem' }}>
            <div style={{ fontSize: '0.775rem', fontWeight: 700, color: '#be123c', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <ShieldAlert size={14} color="#e11d48" /> What the Wokwi Circuit CANNOT Demonstrate
            </div>
            <ul style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', paddingLeft: '1.1rem', margin: 0, lineHeight: 1.6 }}>
              <li><strong>Physical Airflow & Aero Cooling:</strong> No aerodynamic velocity ($ws$) or room heat dissipation modeling.</li>
              <li><strong>Motor Hall Tachometer Pulses:</strong> GPIO 19 is left unconnected because Wokwi lacks a spinning motor Hall sensor.</li>
              <li><strong>INA219 Power Measurement:</strong> Power is computed via software lookup table; not measured by Wokwi circuit.</li>
              <li><strong>Radar Micro-Motion Doppler:</strong> Cannot simulate 24 GHz FMCW radar target range gates or breathing micro-motion.</li>
              <li><strong>Real Room Thermal Dynamics:</strong> Environmental changes require manual inputs or bench simulation mode (<code>'b'</code>).</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Wokwi Simulation Files Card */}
      <div className="eng-card">
        <div className="eng-card-header">
          <div className="eng-card-title">
            <ExternalLink size={16} color="#b45309" />
            Wokwi Circuit Simulator Integration (wokwi/diagram.json)
          </div>
          <button onClick={handleCopyWokwi} className="btn btn-secondary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}>
            {copied ? <Check size={13} color="#059669" /> : <Copy size={13} />}
            {copied ? 'Copied to Clipboard' : 'Copy diagram.json'}
          </button>
        </div>

        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
          To simulate ComfortLoop in the free Wokwi web simulator, create an ESP32 project on <a href="https://wokwi.com" target="_blank" rel="noreferrer" style={{ color: '#b45309', fontWeight: 600 }}>wokwi.com</a>, paste the firmware into <code>sketch.ino</code>, and paste the configuration below into <code>diagram.json</code>.
        </p>

        <pre className="font-mono" style={{
          background: '#1c1917',
          padding: '0.75rem',
          borderRadius: '6px',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.725rem',
          color: '#f5efe7',
          maxHeight: '180px',
          overflowY: 'auto'
        }}>
          {wokwiDiagramJson}
        </pre>
      </div>
    </div>
  );
};

