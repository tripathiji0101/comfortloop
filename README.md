# ComfortLoop — Interactive Virtual Prototype
### atomQUEST 2026 | Track 1: Fan
**Occupancy- and Comfort-Aware Fan Controller**

![Virtual Prototype Badge](https://img.shields.io/badge/Prototype-Virtual%20Simulation-cyan?style=for-the-badge)
![Embedded Architecture](https://img.shields.io/badge/Target-ESP32%20%7C%20FreeRTOS-emerald?style=for-the-badge)
![atomQUEST Track](https://img.shields.io/badge/atomQUEST%202026-Track%201%3A%20Fan-blue?style=for-the-badge)
![Test Status](https://img.shields.io/badge/Unit%20Tests-14%2F14%20Passing-green?style=for-the-badge)

---

## 1. Project Background & Executive Summary

Conventional fans operate on crude manual switches (Off / 1 / 2 / 3 / 4 / 5) with zero awareness of room occupancy or thermal dynamics. Consequently:
1. Fans are frequently left running in empty rooms, causing substantial electricity waste.
2. Changes in temperature or humidity force occupants to constantly adjust speeds manually.
3. At night, conventional fans over-cool sleeping individuals or generate sleep-disturbing acoustic motor whine.

**ComfortLoop** solves this through a closed-loop embedded control system that combines:
- **Bosch BME280** temperature and relative humidity sensing.
- **HLK-LD2410 24GHz mmWave radar** for human presence and micro-motion detection (breathing/sitting).
- An empirical **apparent-temperature thermal comfort model** ($AT = T + 0.33e - 0.70ws - 4.00$) with a ±0.5°C hysteresis band to prevent speed hunting.
- **25 kHz 4-pin PWM fan motor regulation** (Intel specification standard) delivering smooth, quiet airflow modulation.
- **TI INA219 current/power monitoring** and auxiliary relay control for connected smart-home appliances (e.g., automated bathroom/window exhaust fans).

> **IMPORTANT SIMULATION & ACADEMIC HONESTY NOTICE:**
> This repository is an interactive **virtual prototype and simulation testbed**. It demonstrates the complete end-to-end control loop, state machine, mathematical equations, and embedded C++ firmware.
> - **Simulated Data:** Sensor values (temperature, humidity, mmWave radar detection, and INA219 power metrics) are simulated by the interactive engine.
> - **Uncalibrated Model Assumptions:** The fan airspeed lookup table ($ws$) and power draw values are simulation assumptions and have **not** yet been calibrated against physical hot-wire anemometers or motor dynamometers.
> - **Energy Figures:** The ~25% energy savings figure in the project abstract is an engineering target. The percentage displayed in the dashboard is calculated dynamically from the actual configured power curve and simulated run profile. No claims of measured physical hardware savings are made.

---

## 2. Classification of Prototype Realization

To ensure complete technical clarity and academic integrity for atomQUEST 2026 judges, project components are categorized explicitly:

### Category 1: Implemented and Tested in Software
- **Interactive Dashboard:** Complete React 19 + TypeScript + Vite web application with dark engineering design system.
- **Control Algorithm:** Pure deterministic state machine implementing apparent-temperature calculation, $\pm 0.5^\circ\text{C}$ hysteresis, vacancy timing, sleep limits, and fault recovery.
- **Automated Test Suite:** 14/14 automated Vitest test cases passing in 250ms, verifying all control transitions, timing delays, and energy calculations.
- **8-Hour Energy Simulator:** Discrete numerical integration comparing dynamic ComfortLoop operation against a fixed-speed baseline fan.
- **Telemetry & Event Logging:** Real-time event tracking with timestamps and deduplication.

### Category 2: Compiled but Not Physically Tested
- **ESP32 Firmware:** Production Arduino C++ code (`firmware/sketch.ino`) featuring dual-version LEDC PWM (ESP32 Arduino Core 2.x & 3.x), I2C BME280 driver with dual address fallback (`0x76`/`0x77`), tachometer ISR on GPIO 19, and FreeRTOS-compatible design. **Compiled successfully via `arduino-cli` (v1.5.1, core `esp32:esp32@3.3.12`) with 0 errors (319,623 bytes flash / 24%, 24,440 bytes RAM / 7%).** Physical hardware has not been flashed.
- **Wokwi Circuit Model:** Schematic in `wokwi/diagram.json` validated with `wokwi-cli lint` (0 errors, 0 warnings). Headless CLI execution without a CI token is reported as **NOT VERIFIED**.

### Category 3: Simulated or Estimated
- **Sensor Telemetry:** BME280 temperature and humidity values, LD2410 mmWave presence detection, and INA219 bus voltage and shunt current are simulated in software.
- **Airspeed & Power Curves:** Fan airspeed lookup table ($ws$) and fan electrical power draw per level are modeled estimates based on typical 12V 120mm PWM specifications, not physical dynamometer measurements.
- **Tachometer RPM:** Displayed RPM is an idealized estimate derived from commanded PWM duty cycle ($RPM = 500 + \frac{PWM}{255} \cdot 1700$), not measured physical Hall sensor pulses.
- **MQTT Networking:** Formatted MQTT JSON payloads and topic events are generated locally in software; no live external MQTT broker connection is established.

### Category 4: Planned Future Work
- Physical bench fabrication and soldering with the ₹3,360 BOM (ESP32-WROOM-32, BME280, LD2410, 12V 4-pin fan, INA219, optocoupled relay).
- Hot-wire anemometer wind-tunnel calibration of physical airspeed ($ws$) vs. PWM duty cycle.
- Physical INA219 shunt validation across operating temperatures and supply voltage variations.
- Empirical field testing across Indian summer conditions and real-world multi-room energy metering.

---

## 2. System Architecture & Complete Control Loop

The ComfortLoop control loop executes deterministically at 1 Hz:

```
[BME280 Temp & RH] ───┐
                      ├─► [Apparent Temperature AT] ──► [Hysteresis Evaluator]
[Fan Airflow ws]   ───┘                                        │
                                                               ▼
[LD2410 mmWave Radar] ──► [Vacancy Countdown Timer] ──► [State Machine] ──► [25kHz PWM Fan]
                                                            │                   │
                                                            ├─► [Relay Trigger] ├─► [INA219 Power]
                                                            ▼                   ▼
                                                     [Aux Exhaust]     [Energy Accumulator]
                                                            │                   │
                                                            └─► [MQTT Telemetry]┘
```

### The 4 Operating States
1. **`ACTIVE`:** Room is occupied. Fan speed is automatically modulated (Levels 1–5) based on the apparent-temperature deviation from the 26.0°C target.
2. **`AWAY`:** Occupant is absent and the vacancy delay has elapsed. Fan is commanded to Level 0 (0% PWM, 0 RPM). Standby motor power drops to 0.0 W.
3. **`SLEEP`:** Active during nighttime hours (10:00 PM – 6:00 AM) when the room is occupied. Fan speed is capped at Level 2, and speed shifts are constrained to gentle single increments ($\pm 1$ level) to prevent disturbance.
4. **`FAULT`:** Triggered if sensor readings fall outside valid physical boundaries or an I2C communication timeout occurs. A failsafe fallback speed (Level 2) is automatically enforced to maintain baseline ventilation.

---

## 3. Technology Stack

- **Dashboard Frontend:** React 19, TypeScript 5.8, Vite 6
- **Visualization & UI:** Clean custom CSS with dark engineering theme, CSS variable design system, animated SVG fan component with rotation speed tied to commanded PWM
- **Analytics & Graphs:** Recharts 2.15 (Fan speed over time, Temperature vs Target, Instantaneous Power, Cumulative Energy)
- **Icons:** Lucide React
- **Embedded Firmware:** Arduino C++ (`firmware/sketch.ino`) targeting ESP32-WROOM-32 with 25 kHz LEDC PWM and FreeRTOS compatibility
- **Circuit Simulation:** Wokwi compatible (`wokwi/diagram.json` and `wokwi/libraries.txt`)
- **Testing:** Vitest test suite (`tests/controller.test.ts`) covering all 10 core algorithmic requirements

---

## 4. Hardware Architecture & ₹4,000 Component Budget

| Component | Function / Interface | Target Model | Est. Cost (INR) |
|---|---|---|---|
| **Microcontroller** | Core control loop, 25kHz PWM, Wi-Fi | ESP32-WROOM-32 DevKit | ₹450 |
| **Environmental Sensor** | Temperature & Relative Humidity (I2C) | Bosch BME280 Breakout | ₹320 |
| **Presence Sensor** | 24GHz mmWave radar (GPIO / UART) | Hi-Link HLK-LD2410 | ₹550 |
| **Power Sensor** | High-side voltage & current monitor (I2C) | TI INA219 Breakout | ₹220 |
| **Cooling Fan** | 12V 4-Pin PWM DC Brushless Fan | 120mm 4-Pin PC Fan | ₹650 |
| **Auxiliary Relay** | Connected exhaust / AC control | 5V Optocoupler Relay | ₹120 |
| **Power Supply** | 12V 2A DC Regulated Wall Adapter | 12V 2A Adapter + Jack | ₹450 |
| **Circuit Protection** | Inline 2A fuse, enclosure, wiring | Passive Components & PCB | ₹600 |
| **Total Estimated Hardware Budget** | | | **~₹3,360 (Well within ₹4,000)** |

---

## 5. Quickstart & Installation

### Prerequisites
- Node.js 18.x or 20.x or later
- npm 9.x or later

### Installation
```bash
# Clone or navigate to repository directory
cd comfortloop

# Install dependencies
npm install
```

### Running the Application
```bash
# Start local Vite development server
npm run dev
```
Open your browser to the URL displayed in the terminal (typically `http://localhost:5173`).

### Building for Production
```bash
npm run build
npm run preview
```

### Running Automated Test Suite
```bash
npm test
```

---

## 6. atomQUEST Round 2 Demonstration Script (90-Second & 3-Minute Walkthrough)

Use the built-in **"Guided Demo"** button on the navigation bar to walk through the complete 10-step sequence:

| Step | Title | Script / Narrative | Dashboard Action | Observable System Response |
|---|---|---|---|---|
| **1** | Introduction & Problem | *"Judges, conventional fans run at fixed manual speeds regardless of whether rooms are empty or thermal conditions change. ComfortLoop introduces closed-loop comfort and occupancy intelligence."* | Click **Guided Demo** → Step 1 | System initializes in `AUTO` mode, room occupied at 25.0°C and 45% RH. |
| **2** | Comfortable Room | *"At 25°C and 45% RH, conditions are near the 26°C target. ComfortLoop runs the fan at quiet low speed (Level 0–1, ~700 RPM, 1.8W), avoiding draft and acoustic whine."* | Step 2 | Fan rotates slowly. State is `ACTIVE`. Motor power is 1.8 W. |
| **3** | Heat & Humidity Rise | *"Now ambient conditions spike to 33.5°C and 65% RH. The apparent-temperature formula detects an apparent temperature of 35.1°C (HOT)."* | Step 3 | Apparent temp jumps to 35.1°C; comfort status flags `HOT`. |
| **4** | Dynamic Speed Increase | *"The controller increases PWM to Level 4 (PWM 210, ~1800 RPM) to deliver cooling airflow, and closes the auxiliary relay for exhaust."* | Step 4 | Fan accelerates to Level 4. Auxiliary relay shifts to `CLOSED (ON)`. |
| **5** | Occupant Leaves | *"The occupant leaves the room. The LD2410 mmWave sensor transitions to UNOCCUPIED. The controller initiates a grace countdown."* | Step 5 | Occupancy indicator flips to `UNOCCUPIED`. Grace countdown armed. |
| **6** | 5-Second Vacancy Countdown | *"To demonstrate the 5-minute production timeout rapidly for judges, we switch to an accelerated 5-second demo timer. If the occupant returns, it immediately resets."* | Step 6 | Live countdown bar ticks down. Fan remains spinning during grace period. |
| **7** | Fan Stops (AWAY Mode) | *"When the timer elapses, state transitions to AWAY and the fan shuts OFF completely (0 RPM, 0.0 W), eliminating wasted electricity in empty rooms."* | Step 7 | Fan blades stop rotating completely (0 RPM). State becomes `AWAY`. Power is 0.0 W. |
| **8** | Sleep Mode & Failsafe | *"At night, Sleep Mode caps speed at Level 2 with gradual transitions. If sensor communications fail, FAULT mode engages a Level 2 ventilation fallback."* | Step 8 | Sleep mode cap and fault fallback protection demonstrated. |
| **9** | 8-Hour Daily Profile | *"We now fast-forward through an 8-hour daily profile (morning occupied, afternoon absent, evening heat peak) comparing ComfortLoop to a fixed Level 3 fan."* | Step 9 | Automatically switches to **Experiment** tab and fast-forwards 96 discrete steps. |
| **10** | Defensible Metrics | *"Results: Baseline consumes 44.00 Wh. ComfortLoop uses 41.77 Wh, saving 2.23 Wh (5.08%) while actively boosting cooling during peak heat. All values are labeled as simulated estimates."* | Step 10 | Displays 4 Recharts, KPI comparison cards, operating state badges, and CSV export. |

---

## 7. Automated Test Verification (Section 15 Compliance)

All 14 required algorithmic test cases are automated in `tests/controller.test.ts` and pass with 100% success in Vitest (`npm test`):

| Test Case | Description | Verification Method | Status |
|---|---|---|---|
| **Test 1** | Occupied + comfortable room | Verifies fan is commanded to appropriate low speed (Level $\le 1$) | **PASSED** |
| **Test 2** | Occupied + hot room | Verifies fan speed increases to high levels (Level $\ge 4$, PWM $\ge 210$) | **PASSED** |
| **Test 3** | Unoccupied < timeout | Verifies vacancy countdown timer initiates while fan remains running | **PASSED** |
| **Test 4** | Unoccupied = full timeout | Verifies transition to `AWAY` state and fan commanded OFF (0% PWM) | **PASSED** |
| **Test 5** | Occupancy returns mid-countdown | Verifies countdown timer immediately resets back to full delay | **PASSED** |
| **Test 6** | Sleep mode active | Verifies speed is strictly capped at `sleepMaxLevel` (Level 2) and gradual | **PASSED** |
| **Test 7** | Fault activated | Verifies transition to `FAULT` state and failsafe fallback level applied | **PASSED** |
| **Test 8** | Temperature inside hysteresis deadband | Verifies fan maintains current speed to prevent rapid hunting | **PASSED** |
| **Test 9** | Power model calculation | Verifies trapezoidal energy integration and power formula consistency | **PASSED** |
| **Test 10** | Reset experiment | Verifies all prior accumulated snapshots and energy readings clear | **PASSED** |
| **Test 11** | Deterministic 8-hour experiment | Verifies exact 8.00h runtime, 44.0 Wh baseline, positive savings, and repeatability | **PASSED** |
| **Test 12** | Safe energy calculation boundaries | Verifies zero, negative, and NaN baseline energies return 0% savings safely without NaN | **PASSED** |
| **Test 13** | CSV export integrity | Verifies 97 CSV lines, correct column headers, and agreement with final Wh totals | **PASSED** |
| **Test 14** | Sensor fault recovery | Verifies invalid readings enter FAULT fallback, and recovery cleanly restores ACTIVE | **PASSED** |

---

## 8. Defensible 8-Hour Energy Comparison Results

The 8-hour daily profile simulates a realistic Indian household routine:
- **0h – 2h:** Morning occupied, moderate temperature (26.5°C $\to$ 28.0°C, 50% RH).
- **2h – 4h:** Occupant absent (28.0°C $\to$ 30.0°C, 55% RH). Fan shuts OFF after 5-minute vacancy grace period.
- **4h – 6h:** Afternoon heat wave with occupant present (32.0°C $\to$ 34.5°C, 65% RH). Fan ramps up to Level 4 and 5.
- **6h – 8h:** Evening cooldown with occupant present (29.0°C $\to$ 26.5°C, 52% RH). Moderate fan speed.

### Summary Metrics:
- **Simulated Duration:** 8.00 hours (96 discrete 5-minute integration steps)
- **Baseline Fan (Fixed Level 3, 5.5 W continuous):** **44.0000 Wh** (8.00 h $\times$ 5.5 W)
- **ComfortLoop (Dynamic Adaptive Modulation):** **41.7667 Wh**
- **Absolute Energy Difference:** **2.2333 Wh**
- **Calculated Energy Reduction:** **5.08%**
- **Fan Motor Active Duration:** **6.08 hours** (ComfortLoop) vs. **8.00 hours** (Baseline)
- **Vacancy Motor Shutoff Duration:** **1.92 hours** (Motor power = 0.0 W)
- **Comfort Preservation:** 100% compliance within comfort target during occupied periods

> **Engineering Insight for Judges:** ComfortLoop is an *occupancy- and comfort-aware* system, not merely a fan slower. During the vacant period, it completely eliminates power consumption. During peak afternoon heat, it expends *more* power (Levels 4–5, 8.4W–12.0W) than the fixed Level 3 baseline because the baseline fan leaves the occupant overheated. Energy is saved responsibly where it matters—in empty rooms.

---

## 9. Virtual Circuit & ESP32 Firmware Inspection

- **Virtual Circuit Schematic:** Inspect `wokwi/diagram.json`. Schema passes `wokwi-cli lint` with 0 errors. Note: Headless CLI simulation without an external token is reported as **NOT VERIFIED**. The circuit diagram uses standard ESP32, BME280, 4-pin PWM LED indicator (GPIO 18), slide switch (GPIO 4), and relay module (GPIO 23).
- **Production Firmware:** Inspect `firmware/sketch.ino`. Implements dual-core LEDC PWM (pin-based Core 3.x vs. channel-based Core 2.x), I2C BME280 sensor reader with 0x76/0x77 address probing and NaN detection, `'b'` serial command for bench test mode, and tachometer ISR on GPIO 19. **Compiles with exit code 0 via `arduino-cli` for target `esp32:esp32:esp32` (319,623 bytes flash / 24%).**

---

## 8. Repository Structure

---

## 10. Repository Structure

```
comfortloop/
├── README.md                      # Comprehensive project documentation & demo script
├── package.json                   # Dependencies: React 19, Recharts, Lucide, Vitest
├── index.html                     # HTML5 entry with Inter & JetBrains Mono fonts
├── vite.config.ts                 # Vite bundler configuration
├── tsconfig.json                  # Strict TypeScript configuration
├── dist/                          # Production build distribution bundle
├── src/
│   ├── main.tsx                   # React root entry point
│   ├── App.tsx                    # Top-level state orchestration & tabs
│   ├── components/
│   │   ├── Navbar.tsx             # Controls, simulation clock, speed multiplier, tabs
│   │   ├── Dashboard.tsx          # Main control station layout
│   │   ├── EnvironmentalPanel.tsx # BME280 sliders, apparent temp, target tuning
│   │   ├── OccupancyControls.tsx  # LD2410 toggle, vacancy countdown, 5s demo toggle
│   │   ├── FanVisualization.tsx   # Rendered animated SVG fan, 25kHz PWM, manual override
│   │   ├── ControlStatePanel.tsx  # ACTIVE / AWAY / SLEEP / FAULT state machine & fault inject
│   │   ├── PowerPanel.tsx         # INA219 voltage, current, power, Wh, power curve tuner
│   │   ├── ConnectedDevicePanel.tsx # MQTT payload generator, relay trigger, AC setpoint
│   │   ├── EventLog.tsx           # Telemetry transition log with timestamps
│   │   ├── EnergyCharts.tsx       # 8-hour experiment, 4 Recharts, CSV export, data inspector
│   │   ├── CircuitView.tsx        # Conceptual circuit block diagram, component datasheets
│   │   ├── FirmwareView.tsx       # C++ source code viewer & ESP32 flashing instructions
│   │   └── GuidedDemoModal.tsx    # Step-by-step judge demonstration overlay
│   ├── logic/
│   │   ├── comfortModel.ts        # Apparent temperature & vapour pressure mathematical model
│   │   ├── controller.ts          # Pure deterministic state-machine control loop
│   │   ├── powerModel.ts          # INA219 simulated voltage, current, power & Wh integration
│   │   └── simulator.ts           # Clock simulation engine & 8-hour profile runner
│   ├── types/
│   │   └── index.ts               # Core TypeScript interface definitions
│   └── styles/
│       └── globals.css            # Dark engineering theme, CSS variables, fan keyframes
├── firmware/
│   ├── sketch.ino                 # Production Arduino C++ firmware for ESP32
│   └── README.md                  # Firmware pinouts, Intel 4-pin fan PWM guide & flashing
├── wokwi/
│   ├── diagram.json               # Wokwi circuit simulation schematic
│   └── libraries.txt              # Required Arduino libraries for Wokwi simulation
└── tests/
    └── controller.test.ts         # Section 15 Vitest test suite (14 test cases)
```

---

## 11. Academic Credentials & Competition Submission

- **Project:** ComfortLoop — Occupancy- and Comfort-Aware Fan Controller
- **Competition:** atomQUEST 2026
- **Track:** Track 1: Fan
- **Submission Mode:** Interactive Software Simulation Prototype (Round 2 Virtual Prototype Assessment)

