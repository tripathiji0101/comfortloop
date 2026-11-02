# ComfortLoop — Embedded Firmware & Wokwi Circuit Documentation
**Track 1: Fan | atomQUEST 2026**

---

## 1. Executive Summary

ComfortLoop is an occupancy- and comfort-aware fan control system designed to optimize convective cooling while preventing unneeded fan operation. 

This directory contains the production-grade Arduino C++ firmware ([`sketch.ino`](file:///Users/helloteddy/Desktop/my%20upload/comfortloop/firmware/sketch.ino)) targeting the ESP32 microcontroller, paired with the virtual circuit simulation specification ([`wokwi/diagram.json`](file:///Users/helloteddy/Desktop/my%20upload/comfortloop/wokwi/diagram.json)).

> [!IMPORTANT]
> **VIRTUAL PROTOTYPE & SIMULATION NOTICE:**
> - In the Wokwi circuit simulator, the fan actuator is represented by a **cyan LED indicator whose brightness reflects the 25 kHz PWM duty cycle**; Wokwi does not model a physical mechanical DC fan motor or acoustic noise.
> - The human presence input is modeled using a **manual slide switch** providing digital HIGH/LOW states to GPIO 4; Wokwi cannot simulate 24 GHz microwave radar or Doppler micro-motion.
> - High-side power sensing is **calculated in software** via an empirical power lookup table (`POWER_LOOKUP[level]`); the INA219 sensor is not measured electrically by the Wokwi circuit.
> - Airflow velocity versus PWM level mappings are based on simulation approximations and require calibration with a physical hot-wire anemometer prior to physical deployment.

---

## 2. Target Hardware Architecture vs. Wokwi Virtual Implementation

| Subsystem | Target Physical Hardware | Wokwi Virtual Component | ESP32 GPIO | Electrical Interfacing & Behavioral Fidelity |
|:---|:---|:---|:---|:---|
| **Microcontroller** | ESP32-WROOM-32 DevKit | `board-esp32` | — | Central controller executing the 1 Hz deterministic state machine and 25 kHz PWM output. |
| **Environmental** | Bosch BME280 (I2C) | `chip-bme280` / Bench Mode | GPIO 21 (SDA)<br>GPIO 22 (SCL) | Ambient dry-bulb temperature and relative humidity sensing over standard I2C bus (addresses `0x76` or `0x77`). |
| **Occupancy** | HLK-LD2410 24 GHz mmWave Radar | `wokwi-slide-switch` (`ld2410_sim`) | GPIO 4 (OUT) | **Simulated Input:** Slide switch selects between 3.3V (HIGH = Occupied) and GND (LOW = Unoccupied). Simulates the binary `OUT` pin of the radar module. |
| **Fan PWM** | 12V 4-Pin Brushless DC Fan | `wokwi-led` (`fan_pwm_led`) + 330Ω Resistor | GPIO 18 (PWM) | **Speed Indicator:** Driven by ESP32 hardware LEDC peripheral at 25 kHz (8-bit resolution). In Wokwi, LED brightness visually reflects commanded fan speed (Levels 0–5). |
| **Fan Tachometer** | Hall-Effect Pulse Output (Pin 3) | *Intentionally Unconnected* | GPIO 19 (Interrupt) | Configured in firmware with `INPUT_PULLUP` and falling-edge interrupt. **Left unconnected in Wokwi** because Wokwi lacks a rotating motor model to generate Hall pulses. |
| **Power Sensor** | TI INA219 Shunt Monitor | *Software-Modeled Only* | Shared I2C (0x40) | **Software Model:** Power, voltage (12V), and current are computed from an empirical lookup table in firmware and web simulator. Not measured by Wokwi circuit. |
| **Auxiliary Relay** | 5V Optocoupler Relay Module | `wokwi-relay-module` (`relay1`) | GPIO 23 | Auxiliary connected device trigger (activates exhaust fan when room is hot, humid, and occupied). |
| **Status LED** | Onboard Blue LED | Onboard ESP32 LED | GPIO 2 | Visual state and heartbeat indicator. |

---

## 3. What the Wokwi Circuit Can and Cannot Demonstrate

### What the Wokwi Circuit CAN Demonstrate:
1. **Firmware Boot & Peripheral Initialization:** ESP32 boots, initializes I2C on GPIO 21/22, configures GPIOs, and starts the 1 Hz control loop.
2. **25 kHz Hardware PWM Fan Speed Indication:** The cyan LED on GPIO 18 dynamically alters brightness as the controller modulates duty cycle across Levels 0–5 ($0\%$, $31\%$, $47\%$, $63\%$, $82\%$, $100\%$).
3. **Interactive Occupancy State Machine:** Toggling the slide switch on GPIO 4 immediately affects occupancy status, triggering vacancy countdown upon absence and instantly resuming active mode upon presence.
4. **Vacancy Countdown & Automatic Cutoff:** After the vacancy period expires (default 5 minutes, or 5 seconds in accelerated demo mode `'d'`), the state shifts to `STATE_AWAY` and the PWM LED completely turns OFF (0% duty cycle).
5. **Nighttime Sleep Mode Clamping:** Enforces speed cap at Level 2 and gradual $\pm 1$ step rate transitions.
6. **Auxiliary Connected-Device Actuation:** Activates the relay module on GPIO 23 when hot and humid conditions warrant auxiliary ventilation.
7. **Bidirectional Serial Debugging & Telemetry:** Emits structured JSON telemetry payloads every second and processes interactive single-character commands (`'d'`, `'s'`, `'b'`, `'f'`).

### What the Wokwi Circuit CANNOT Demonstrate:
1. **Physical Aerodynamic Airflow:** Wokwi cannot simulate convective cooling, aerodynamic drag, or room airflow distribution ($ws$).
2. **Motor Tachometer Feedback:** Because there is no rotating physical rotor, GPIO 19 receives no Hall-effect pulses in Wokwi.
3. **True Electrical Load Dynamics:** Wokwi does not measure the actual back-EMF, motor inductive spikes, or real power consumption of a 12V fan motor. Power metrics are simulated in software.
4. **Physical mmWave Radar Signal Processing:** Wokwi cannot model micro-motion Doppler frequency shifts, distance gates, or radar target tracking from the LD2410.
5. **Real Room Temperature Dynamics:** Temperature and humidity changes require manual simulator inputs or bench simulation mode (`'b'`), as physical thermal capacitance is not modeled.

---

## 4. Control Algorithm & State Machine Architecture

ComfortLoop executes a deterministic loop with the following sequential stages:

```
[ Sensor Acquisition (BME280 / Bench) ]
                    ↓
[ Telemetry Bounds Verification (-40..85°C, 0..100% RH) ]
                    ↓
[ Occupancy Tracking & Vacancy Countdown Timer ]
                    ↓
[ Apparent Temperature Calculation (AT = T + 0.33e - 0.70ws - 4.00) ]
                    ↓
[ Comfort Classification & Deadband Hysteresis (±0.5°C) ]
                    ↓
[ Anti-Hunting Rate Limiter (min 5s interval, gradual ±1 step) ]
                    ↓
[ Actuator Output (25 kHz PWM on GPIO 18 & Relay on GPIO 23) ]
                    ↓
[ Serial JSON Telemetry & Diagnostic Logging ]
```

### Apparent Temperature Formulation:
$$\text{AT} = T + 0.33 \times e - 0.70 \times ws - 4.00$$
where vapour pressure $e$ (in hPa) is given by:
$$e = \left(\frac{\text{RH}}{100}\right) \times 6.105 \times \exp\left(\frac{17.27 \times T}{237.7 + T}\right)$$
and $ws$ is the assumed convective airspeed in m/s corresponding to the active fan level:
- Level 0: $0.0\text{ m/s}$ (Fan OFF)
- Level 1: $0.3\text{ m/s}$ (Low)
- Level 2: $0.7\text{ m/s}$ (Medium-Low)
- Level 3: $1.2\text{ m/s}$ (Medium)
- Level 4: $1.8\text{ m/s}$ (Medium-High)
- Level 5: $2.5\text{ m/s}$ (Maximum)

---

## 5. Serial Telemetry & Interactive Testing Commands

The firmware transmits JSON telemetry over USB Serial at **115200 baud**:
```json
{
  "state": 0,
  "fanLevel": 3,
  "pwm": 160,
  "temp": 28.50,
  "humidity": 60.0,
  "apparentTemp": 29.41,
  "occupied": true,
  "simPowerW": 5.5,
  "benchSim": false,
  "bmeOk": true
}
```

### Interactive Test Commands (via Serial Monitor):
- **`'d'`** : Toggle between 5-minute production vacancy delay and 5-second accelerated demonstration delay.
- **`'s'`** : Toggle nighttime sleep mode on/off (enforces Level 2 cap and gradual ramp-down).
- **`'b'`** : Toggle explicit bench simulation mode (injects synthetic $28.5^\circ\text{C}$ / $60.0\%$ telemetry when no physical I2C sensor is attached).
- **`'f'`** : Inject or clear a synthetic sensor fault condition to verify failsafe Level 2 fallback.

---

## 6. How to Build, Flash, and Simulate

### A. Physical Flashing with Arduino IDE 2.x
1. Install **ESP32 Board Support** via Board Manager (`esp32 by Espressif Systems`, version 3.x or 2.x).
2. Select board: **ESP32 Dev Module**.
3. Install required libraries:
   - `Adafruit BME280 Library` (v2.3.0+)
   - `Adafruit Unified Sensor` (v1.1.15+)
   - `Adafruit BusIO` (v1.17.4+)
4. Connect the ESP32 via USB and click **Upload**.

### B. Validation with Wokwi CLI
To validate the Wokwi diagram and components locally:
```bash
wokwi-cli lint wokwi/diagram.json
```
*Expected Output:* `✓ No issues found` (Exit code 0).
