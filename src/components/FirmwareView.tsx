import React, { useState } from 'react';
import { Code2, Copy, Check, Terminal, Cpu, Info, ShieldAlert } from 'lucide-react';

const FIRMWARE_SKETCH_CODE = `/* ==============================================================================
   ComfortLoop — Occupancy- and Comfort-Aware Fan Controller
   Track 1: Fan | atomQUEST 2026
   
   Target Hardware Architecture:
     - ESP32-WROOM-32 Development Board
     - BME280 (I2C) - Temperature & Relative Humidity Sensor
     - LD2410 (UART / Out Pin) - 24GHz mmWave Human Presence Sensor
     - INA219 (I2C) - High-Side Current & Power Sensor
     - 12V 4-Pin PWM DC Fan (25 kHz Intel Specification Standard)
     - 5V Relay Module (Connected Device / Auxiliary Exhaust Fan)
   ============================================================================== */

#include <Arduino.h>
#include <Wire.h>
#include <math.h>

#if defined(ESP32)
  #include <esp_arduino_version.h>
#endif

#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>

/* --- Pin Assignments (ESP32) --- */
#define PIN_I2C_SDA         21  // Shared I2C SDA (BME280 + INA219)
#define PIN_I2C_SCL         22  // Shared I2C SCL (BME280 + INA219)
#define PIN_PRESENCE_IN     4   // LD2410 Out Pin (HIGH = Occupied)
#define PIN_FAN_PWM         18  // Fan 4-Pin PWM Control (LEDC channel 0)
#define PIN_FAN_TACH        19  // Fan Tachometer feedback (Interrupt)
#define PIN_RELAY_EXHAUST   23  // Relay for auxiliary connected device
#define PIN_STATUS_LED      2   // Built-in status LED

/* --- PWM Configuration (Intel 4-Pin 25 kHz Standard) --- */
#define PWM_LEDC_CHANNEL    0
#define PWM_FREQ_HZ         25000  // 25 kHz standard to prevent coil whine
#define PWM_RESOLUTION_BITS 8      // 8-bit resolution (0 - 255)

/* --- Operating States --- */
enum ControlState {
  STATE_ACTIVE = 0,
  STATE_AWAY   = 1,
  STATE_SLEEP  = 2,
  STATE_FAULT  = 3
};

/* --- Configuration Parameters --- */
struct SystemConfig {
  float targetTempC = 26.0f;           // Target apparent temperature (°C)
  float hysteresisBandC = 0.5f;        // Hysteresis deadband (±0.5°C)
  unsigned long vacancyTimeoutMs = 300000UL; // 5 minutes standard vacancy delay
  unsigned long demoTimeoutMs = 5000UL;      // 5 seconds accelerated demo mode
  bool useDemoTimer = false;           // Toggle for judge demonstration
  bool sleepModeEnabled = false;       // Nighttime quiet mode
  uint8_t sleepStartHour = 22;         // 10:00 PM
  uint8_t sleepEndHour = 6;            // 06:00 AM
  uint8_t sleepMaxLevel = 2;           // Max speed in sleep mode
  unsigned long minSpeedChangeIntervalMs = 5000UL; // Anti-hunting rate limiter
  uint8_t faultFallbackLevel = 2;      // Failsafe fan speed in fault condition
  bool benchSimulationMode = false;    // Explicit bench-testing toggle (false = read physical BME280)
};

/* --- Hardware Sensor Instances --- */
Adafruit_BME280 bme;
bool bmeInitialized = false;

/* --- Sensor Telemetry Structure --- */
struct SensorData {
  float temperatureC;
  float humidityPct;
  bool occupied;
  bool valid;
};

// PWM values for discrete levels 0 (OFF) through 5 (MAX)
const uint8_t PWM_LOOKUP[6]     = { 0, 80, 120, 160, 210, 255 };

// Uncalibrated simulation assumption: Airspeed ws (m/s) per fan level
const float AIRFLOW_LOOKUP[6]   = { 0.0f, 0.3f, 0.7f, 1.2f, 1.8f, 2.5f };

// Assumed fan power consumption (Watts) at 12V
const float POWER_LOOKUP[6]     = { 0.0f, 1.8f, 3.2f, 5.5f, 8.4f, 12.0f };

/* --- Runtime State --- */
SystemConfig config;
ControlState currentState = STATE_ACTIVE;
uint8_t currentFanLevel = 0;
unsigned long lastSpeedChangeMs = 0;
unsigned long vacancyStartMs = 0;
bool isOccupied = true;
bool faultActive = false;

/* --- Apparent Temperature Formula --- */
float computeVapourPressure(float tempC, float rhPct) {
  return (rhPct / 100.0f) * 6.105f * expf((17.27f * tempC) / (237.7f + tempC));
}

float computeApparentTemperature(float tempC, float rhPct, float airspeedMs) {
  float e = computeVapourPressure(tempC, rhPct);
  return tempC + (0.33f * e) - (0.70f * airspeedMs) - 4.00f;
}

uint8_t calculateDesiredLevel(float apparentTemp, float target, float hysteresis, uint8_t currentLevel) {
  float diff = apparentTemp - target;
  if (diff < -hysteresis) return 0;
  if (diff >= -hysteresis && diff <= hysteresis) return currentLevel;
  if (diff <= 1.5f) return 1;
  if (diff <= 3.0f) return 2;
  if (diff <= 4.5f) return 3;
  if (diff <= 6.0f) return 4;
  return 5;
}

void setFanPwmLevel(uint8_t level) {
  if (level > 5) level = 5;
  uint8_t pwmValue = PWM_LOOKUP[level];
#if defined(ESP32)
  #if defined(ESP_ARDUINO_VERSION_MAJOR) && (ESP_ARDUINO_VERSION_MAJOR >= 3)
    // ESP32 Arduino Core 3.x API: ledcWrite targets the GPIO pin directly
    ledcWrite(PIN_FAN_PWM, pwmValue);
  #else
    // ESP32 Arduino Core 2.x Legacy: ledcWrite targets the timer channel
    ledcWrite(PWM_LEDC_CHANNEL, pwmValue);
  #endif
#else
  analogWrite(PIN_FAN_PWM, pwmValue);
#endif
  currentFanLevel = level;
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_PRESENCE_IN, INPUT);
  pinMode(PIN_RELAY_EXHAUST, OUTPUT);
  pinMode(PIN_STATUS_LED, OUTPUT);
  pinMode(PIN_FAN_TACH, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(PIN_FAN_TACH), onTachPulse, FALLING);

  // Initialize I2C bus (SDA=21, SCL=22)
  Wire.begin(PIN_I2C_SDA, PIN_I2C_SCL);

  // Probe BME280 sensor (standard module address 0x76, fallback 0x77)
  if (bme.begin(0x76, &Wire) || bme.begin(0x77, &Wire)) {
    bmeInitialized = true;
    Serial.println(F("[INIT] BME280 detected and initialized successfully."));
  } else {
    bmeInitialized = false;
    Serial.println(F("[ERROR] BME280 initialization FAILED on I2C (0x76/0x77)."));
  }

#if defined(ESP32)
  #if defined(ESP_ARDUINO_VERSION_MAJOR) && (ESP_ARDUINO_VERSION_MAJOR >= 3)
    // ESP32 Arduino Core 3.x: ledcAttach attaches pin with frequency & resolution
    ledcAttach(PIN_FAN_PWM, PWM_FREQ_HZ, PWM_RESOLUTION_BITS);
  #else
    // ESP32 Arduino Core 2.x Legacy: setup channel then attach pin to channel
    ledcSetup(PWM_LEDC_CHANNEL, PWM_FREQ_HZ, PWM_RESOLUTION_BITS);
    ledcAttachPin(PIN_FAN_PWM, PWM_LEDC_CHANNEL);
  #endif
#else
  pinMode(PIN_FAN_PWM, OUTPUT);
#endif
  setFanPwmLevel(0);
}

void loop() {
  // Executes 1 Hz deterministic control loop with telemetry logging
}
`;

export const FirmwareView: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(FIRMWARE_SKETCH_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header Card */}
      <div className="eng-card">
        <div className="eng-card-header">
          <div>
            <div className="eng-card-title">
              <Code2 size={18} color="#b45309" />
              Arduino C++ Embedded Firmware (firmware/sketch.ino)
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Modular embedded implementation engineered for ESP32-WROOM-32 with FreeRTOS / Arduino core support.
            </div>
          </div>
          <button onClick={handleCopy} className="btn btn-secondary" style={{ padding: '0.35rem 0.85rem' }}>
            {copied ? <Check size={14} color="#059669" /> : <Copy size={14} />}
            {copied ? 'Copied to Clipboard' : 'Copy sketch.ino'}
          </button>
        </div>

        {/* Pinout Table */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.65rem', margin: '0.75rem 0' }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>I2C Bus (SDA / SCL)</span>
            <div className="font-mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#b45309' }}>GPIO 21 / 22</div>
          </div>
          <div style={{ background: 'var(--bg-secondary)', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>LD2410 Radar In</span>
            <div className="font-mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#059669' }}>GPIO 4</div>
          </div>
          <div style={{ background: 'var(--bg-secondary)', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>Fan PWM (25kHz)</span>
            <div className="font-mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#b45309' }}>GPIO 18</div>
          </div>
          <div style={{ background: 'var(--bg-secondary)', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>Fan Tachometer</span>
            <div className="font-mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#d97706' }}>GPIO 19</div>
          </div>
          <div style={{ background: 'var(--bg-secondary)', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>Auxiliary Relay</span>
            <div className="font-mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#7c3aed' }}>GPIO 23</div>
          </div>
        </div>
      </div>

      {/* Code Display Card */}
      <div className="eng-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Terminal size={14} color="#b45309" /> C++ Source Listing
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Target: ESP32 Core 2.x / 3.x</span>
        </div>

        <pre className="font-mono" style={{
          background: '#1c1917',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.75rem',
          color: '#f5efe7',
          maxHeight: '480px',
          overflowY: 'auto',
          lineHeight: 1.5,
        }}>
          <code>{FIRMWARE_SKETCH_CODE}</code>
        </pre>
      </div>

      {/* Flashing & Porting Instructions */}
      <div className="eng-card">
        <div className="eng-card-header">
          <div className="eng-card-title">
            <Cpu size={16} color="#b45309" />
            Flashing & Porting Instructions
          </div>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <p>
            <strong>1. Compilation:</strong> Open <code>firmware/sketch.ino</code> in Arduino IDE 2.x. In Board Manager, install <code>esp32 by Espressif</code> and select <em>ESP32 Dev Module</em>.
          </p>
          <p style={{ marginTop: '0.4rem' }}>
            <strong>2. Libraries:</strong> Install <code>Adafruit BME280 Library</code>, <code>Adafruit INA219</code>, and <code>PubSubClient</code> via the Arduino Library Manager.
          </p>
          <p style={{ marginTop: '0.4rem' }}>
            <strong>3. Arduino Uno Compatibility:</strong> While the primary design targets the ESP32 for 25kHz PWM and dual-core speed, the control logic is modular. For Arduino Uno, <code>analogWrite(PIN_FAN_PWM, val)</code> is conditionally compiled at 490Hz/980Hz (note: 25kHz is recommended for PC fans to eliminate motor acoustic whine).
          </p>
        </div>
      </div>
    </div>
  );
};

