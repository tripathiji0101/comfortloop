# ComfortLoop — Prototype Test Equipment & Instrumentation List

**Document ID:** CL-EQP-001  
**Revision:** 1.0  
**Project:** ComfortLoop — atomQUEST 2026 | Track 1: Fan  
**Author:** Senior Mechanical Design Engineer & Hardware Validation Specialist  
**Release Date:** November 2, 2026  
**Status:** DRAFT / APPROVED FOR TEST READINESS ALLOCATION  
**Appliance Boundary:** 12V DC Class 2 / SELV Isolated Desktop Appliance  

---

## 1. Scope and Classification Overview

This document categorizes all instrumentation, metrology tooling, and laboratory apparatus required to execute the complete physical prototype validation plan (`CL-VAL-001`) and the First Article Inspection (`CL-CHK-001`) for the ComfortLoop desktop fan prototype.

To ensure realistic laboratory planning and budget transparency, equipment is partitioned into four clear logistical tiers:
1. **Tier A — Already Available Workshop Tools:** Basic tools found on any standard electronics/maker workbench.
2. **Tier B — Equipment to Purchase / Consumables:** Cost-effective instrumentation and specialized fasteners to procure immediately.
3. **Tier C — Borrowable from College / University Laboratories:** Specialized engineering instruments available in academic mechanical/electrical labs.
4. **Tier D — Specialist Equipment Requiring External Accredited Facilities:** High-end certification apparatus required only for formal regulatory testing (IEC / UL / ISO).

---

## 2. Category A: Already Available Workshop Equipment

These items are currently present in the project workspace or available in a standard personal/maker workshop. No procurement delay is expected.

| Tool ID | Equipment Description | Brand / Model (or Equivalent) | Measurement Range & Resolution | Primary Use in ComfortLoop Testing | Test IDs Supported | Status |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: |
| **EQP-A01** | Digital Vernier Caliper (150mm) | Mitutoyo / Clockwise Tools (Stainless Steel) | Range: $0 - 150.00\text{ mm}$<br>Res: $0.01\text{ mm}$<br>Acc: $\pm 0.02\text{ mm}$ | First-article dimensional inspection, clevis gap, trunnion width, grille radial openings, shelf hole pitch. | VAL-MEC-001<br>VAL-MEC-002<br>VAL-MEC-003<br>VAL-SYS-007 | **AVAILABLE** |
| **EQP-A02** | True-RMS Digital Multimeter | Uni-T UT61E+ / Fluke 87V | DC Volts: $0.01\text{ mV} - 1000\text{ V}$<br>DC Current: $0.1\,\mu\text{A} - 10\text{ A}$<br>Resistance: $0.01\,\Omega - 220\text{ M}\Omega$ | 12V bus voltage verification, continuity check, power distribution, INA219 current shunt calibration check. | VAL-SYS-007<br>VAL-MEC-005 | **AVAILABLE** |
| **EQP-A03** | Temperature-Controlled Soldering Station | Pinecil V2 / TS100 / Hakko FX-888D | Temp Range: $100^\circ\text{C} - 450^\circ\text{C}$<br>Stability: $\pm 2^\circ\text{C}$ | Heat-set insert installation (M3 and M4 brass threaded inserts into 3D printed bosses at $230^\circ\text{C}$). | VAL-MEC-003<br>Assembly | **AVAILABLE** |
| **EQP-A04** | Variable Benchtop DC Power Supply | Wanptek / Eventek (0-30V, 0-5A) | Voltage: $0 - 30.00\text{ V}$ (CV)<br>Current: $0 - 5.000\text{ A}$ (CC)<br>Ripple: $< 30\text{ mV}_{\text{p-p}}$ | Isolated 12V DC power injection, over-current trip protection testing, system 4-hour thermal soak power. | VAL-SYS-007<br>VAL-MEC-004<br>VAL-MEC-005 | **AVAILABLE** |
| **EQP-A05** | Precision Metric Hex Key & Screwdriver Set | Wera / Wiha MicroSet (1.5, 2.0, 2.5, 3.0mm) | Metric hex 1.5, 2.0, 2.5, 3.0 mm;<br>Phillips PH0, PH1, Flat 2.5mm | Assembly and fastener installation: M3 pivot bolt, M4 duct screws, M3 PCB screws, M3 lid screws. | Assembly<br>VAL-MEC-001<br>VAL-MEC-003 | **AVAILABLE** |
| **EQP-A06** | Post-Processing Deburring & Flush Cutter Set | Plato 170 / Noga Deburring Tool | Hardened carbon steel cutting edges | Support removal, 3D print brim trimming, port clearing, borehole deburring. | FAI Checklist | **AVAILABLE** |
| **EQP-A07** | Laptop / Host Engineering Workstation | Apple MacBook Pro / PC (macOS/Linux) | USB-C / USB-A ports, Python 3.13, Arduino IDE 2.x, Chromium browser | ESP32 firmware flashing, telemetry logging via UART serial, RTOS state inspection, data analysis. | VAL-RAD-006<br>VAL-THM-004<br>VAL-MEC-005 | **AVAILABLE** |

---

## 3. Category B: Equipment to Purchase / Consumables to Procure

These are low-cost instruments and mechanical hardware that are required for validation and must be ordered immediately. Total estimated procurement budget: **~\$145 – \$230 USD**.

| Tool ID | Item Description | Recommended Model / Source | Key Specifications | Testing Function in ComfortLoop | Est. Cost (USD) | Priority |
| :---: | :--- | :--- | :--- | :--- | :---: | :---: |
| **EQP-B01** | Type 2 Digital Sound Level Meter | Protmex MS6708 / Tacklife SLM01 (or Amazon equivalent) | Standard: IEC 61672-1 Class 2<br>Range: $30.0 - 130.0\text{ dBA}$<br>Res: $0.1\text{ dB}$, Acc: $\pm 1.4\text{ dB}$<br>Weighting: A / C; Time: Fast / Slow | Test 5 acoustic noise characterization at 1.0m distance across PWM levels (500 to 2000 RPM). | \$35 – \$50 | **HIGH** |
| **EQP-B02** | Digital Mini Vane Anemometer | BTMETER BT-100 / Proster Vane Meter | Range: $0.3 - 30.0\text{ m/s}$<br>Res: $0.01\text{ m/s}$, Acc: $\pm 3\%$<br>Integrated impeller ($d=45\text{ mm}$) | Test 5 airflow velocity mapping (9-point duct exit traverse) and volumetric CFM calculation. | \$25 – \$40 | **HIGH** |
| **EQP-B03** | Multi-Channel USB Temperature Data Logger | PerfectPrime TC41 / Elitech RC-4HC (with K-Type Probes) | Range: $-50^\circ\text{C} - +250^\circ\text{C}$<br>Res: $0.1^\circ\text{C}$, Acc: $\pm 0.5^\circ\text{C}$<br>Logging Interval: 1s to 1 hour | Test 4 BME280 thermal isolation validation (independent reference probe placed 100mm from chassis). | \$45 – \$75 | **HIGH** |
| **EQP-B04** | Adjustable Low-Torque Screwdriver | Wheeler / Capri Tools Micro Torque ($0.1 - 1.2\text{ N}\cdot\text{m}$) | Range: $0.1 - 1.2\text{ N}\cdot\text{m}$<br>Res: $0.05\text{ N}\cdot\text{m}$, Acc: $\pm 6\%$<br>1/4" Hex bit receiver | Test 1 M3 Nyloc nut friction adjustment ($0.2 - 0.4\text{ N}\cdot\text{m}$) and insert strip resistance test. | \$30 – \$50 | **MEDIUM** |
| **EQP-B05** | Brass Heat-Set Insert Installation Tip Set | CNC Kitchen / Insubuy (M3 & M4 Tips) | CNC-machined brass tips for Pinecil / Hakko 900M soldering irons | Clean, perpendicular installation of M3 ($L=5\text{mm}$) and M4 ($L=6\text{mm}$) brass threaded inserts. | \$15 – \$20 | **HIGH** |
| **EQP-B06** | Metric Fasteners & Hardware Pack | 304 Stainless Steel Assortment | - M3 $\times$ 35 mm SHCS (Pivot)<br>- M3 Nyloc Nuts (DIN 985)<br>- M4 $\times$ 8 mm SHCS (Duct Shelf)<br>- M4 $\times$ 30 mm Fan Screws<br>- M3 $\times$ 6 mm Button Heads (PCBs)<br>- M3 $\times$ 8 mm Countersunk (Lid)<br>- Silicone Bumper Feet ($\varnothing 10\text{mm}$) | Mechanical assembly of all 7 prototype subassemblies without makeshift substitutes. | \$20 – \$30 | **HIGH** |

---

## 4. Category C: Borrowable from College / University Laboratory

These instruments are standard equipment in university mechanical engineering, electronics, or physics laboratories and should be borrowed for specific test sessions.

| Tool ID | Equipment Description | Typical College Lab Source | Key Specifications | ComfortLoop Validation Task | Booking Lead Time |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **EQP-C01** | 4-Channel Digital Storage Oscilloscope (DSO) | Electronics / Mechatronics Lab (Keysight / Tektronix / Rigol DS1054Z) | Bandwidth: $\ge 100\text{ MHz}$<br>Sample Rate: $1\text{ GSa/s}$<br>Probes: 10X Passive | Verify 25 kHz fan PWM frequency and rise/fall times; capture fan tachometer square wave pulses; debug UART packets. | 2–3 Days |
| **EQP-C02** | Digital Non-Contact Optical Stroboscope / Tachometer | Fluid Dynamics / Machines Lab (Shimpo / Extech 461825) | Range: $10 - 99,999\text{ RPM}$<br>Res: $0.1\text{ RPM}$, Acc: $\pm 0.05\%$<br>Optical reflective tape pickup | Calibrate and cross-check the fan tachometer ISR pin 19 pulse count against true optical blade rotational speed. | 2–3 Days |
| **EQP-C03** | Precision Push-Pull Digital Force Gauge | Materials Testing / Metrology Lab (Mark-10 / Chatillon DFE II) | Range: $0 - 50.00\text{ N}$<br>Res: $0.01\text{ N}$, Acc: $\pm 0.2\%$<br>Includes flat probe and test stand | Test 2 grille mechanical deflection under calibrated $20\text{ N}$ axial force; measure heat-set insert pullout resistance. | 3–5 Days |
| **EQP-C04** | Precision Grade B Granite Surface Plate ($300 \times 300\text{ mm}$) | Metrology / Quality Lab | Flatness: $< 0.005\text{ mm}$ ($5\,\mu\text{m}$)<br>Certified reference plane | Tabletop co-planarity inspection; feeler gauge rocking check for chassis base plate. | 1 Day |
| **EQP-C05** | Benchtop Environmental Test Chamber | Thermal / Reliability Lab (Thermotron / Espec) | Temp Range: $-20^\circ\text{C} - +80^\circ\text{C}$<br>RH: $20\% - 95\%$<br>Control Accuracy: $\pm 0.3^\circ\text{C}$ | Subject ComfortLoop to controlled ambient temperature ramp ($20^\circ\text{C} \to 35^\circ\text{C}$) to isolate BME280 sensor response. | 1–2 Weeks |
| **EQP-C06** | Digital Inclinometer / Angle Gauge | Metrology Lab (Wixey / GemRed) | Range: $0 - 360^\circ$<br>Res: $0.05^\circ$, Acc: $\pm 0.1^\circ$<br>Magnetic V-groove base | Measure exact radar pod tilt angle relative to tabletop datum across the $-20^\circ \text{ to } -10^\circ$ swivel range. | 1 Day |

---

## 5. Category D: Specialist Equipment Requiring External Accredited Test Facility

These facilities are required **only for formal regulatory safety and EMC/RF certification**. They are NOT required for the initial atomQUEST 2026 student prototype demonstration, but must be identified to maintain strict engineering integrity.

> [!WARNING]
> Do NOT claim IEC 60335-2-80, UL 507, or FCC Title 47 Part 15 compliance based on workshop measurements alone. Formal certification mandates third-party accredited testing.

| Facility / Tool ID | Specialized Apparatus Description | Governed Standard | Technical Requirement & Test Rig | Why External Facility is Required |
| :---: | :--- | :--- | :--- | :--- |
| **EQP-D01** | Full Hemi-Anechoic Acoustic Test Chamber | **ISO 3744**<br>**ISO 7779**<br>**ECMA-74** | - Ambient noise floor $< 15\text{ dBA}$<br>- Free-field reflection-free boundary down to $100\text{ Hz}$<br>- Array of Class 1 calibrated microphones ($\pm 0.5\text{ dB}$)<br>- Precision sound power level ($L_{\text{WA}}$) hemispherical traverse | Normal college rooms have ambient noise floors of $38 - 50\text{ dBA}$ and heavy acoustic wall reflections, making accurate fan noise measurements below $40\text{ dBA}$ mathematically invalid. |
| **EQP-D02** | Calibrated Jointed Mechanical Test Probes | **IEC 60335-1**<br>**IEC 60335-2-80**<br>**UL 507** | - **IEC Test Probe B:** Articulated adult finger ($\varnothing 12\text{ mm}$, $80\text{ mm}$ length, calibrated $10\text{ N} / 20\text{ N} / 30\text{ N}$ force spring)<br>- **IEC Probe 19:** Articulated child finger ($\varnothing 5.6\text{ mm}$, $44\text{ mm}$ length)<br>- **UL 507 Articulated Probe:** Electrical contact buzzer | Formal electrical and mechanical safety compliance for household appliances requires certified, traceable test fingers with calibrated spring-loaded force gauges. |
| **EQP-D03** | 24 GHz Millimeter-Wave RF Anechoic Chamber | **FCC Part 15.245**<br>**ETSI EN 300 440** | - Fully shielded RF chamber lined with radar-absorbing foam (RAM) at $24.0 - 24.25\text{ GHz}$<br>- Vector Network Analyzer (VNA) up to $40\text{ GHz}$<br>- Standard gain horn antennas<br>- Dielectric coaxial probe kit for plastic permittivity ($\varepsilon_r, \tan \delta$) | Millimeter-wave signals at $24\text{ GHz}$ undergo multipath reflections from room walls, metal furniture, and human bodies. True radome insertion loss and beam pattern distortion require an RF anechoic environment. |
| **EQP-D04** | Aerodynamic Fan Flow Wind Tunnel (AMCA 210) | **ANSI / AMCA 210**<br>**ISO 5801** | - Standardized settling plenum chamber with multi-nozzle flow measurement board<br>- Variable speed exhaust booster fan<br>- Precision differential micro-manometers ($\pm 0.1\text{ Pa}$) | True fan performance curves (Static Pressure $P_s$ vs Volumetric Flow $Q$) cannot be measured by a handheld vane anemometer alone; AMCA 210 test chamber is required. |

---

## 6. Test-to-Equipment Traceability Matrix

The following matrix maps every test procedure from `docs/PHYSICAL_PROTOTYPE_VALIDATION.md` and `docs/PROTOTYPE_TEST_TRACKER.csv` to the specific equipment IDs defined above:

| Test ID | Test Description | Mandatory Primary Tools | Secondary / Validation Tools | Facility Tier Required |
| :---: | :--- | :--- | :--- | :---: |
| **VAL-MEC-001** | Radar Hinge & Clevis Fit | **EQP-A01** (Digital Caliper)<br>**EQP-B04** (Torque Driver)<br>**EQP-C06** (Inclinometer) | EQP-A05 (Hex Keys)<br>EQP-B06 (M3 Fasteners) | Tier A + B + C (College Workshop) |
| **VAL-MEC-002** | Fan Grille Mechanical Safety | **EQP-A01** (Digital Caliper)<br>**EQP-C03** (Digital Force Gauge) | EQP-D02 (IEC Probes B & 19) | Tier A + C (Workshop)<br>*Tier D for certification* |
| **VAL-MEC-003** | Fan Duct & Fastener Fit | **EQP-A01** (Digital Caliper)<br>**EQP-B05** (Insert Tips)<br>**EQP-B06** (M4 Fasteners) | EQP-A03 (Soldering Station)<br>EQP-B04 (Torque Driver) | Tier A + B (College Workshop) |
| **VAL-THM-004** | BME280 Thermal Isolation | **EQP-B03** (Temp Logger)<br>**EQP-A07** (Telemetry PC) | EQP-C05 (Environmental Chamber)<br>EQP-A02 (Multimeter) | Tier A + B (Workshop)<br>*Tier C for chamber ramp* |
| **VAL-MEC-005** | Fan Airflow & Acoustics | **EQP-B01** (Sound Meter)<br>**EQP-B02** (Vane Anemometer)<br>**EQP-A07** (Telemetry / INA219) | EQP-C01 (DSO PWM check)<br>EQP-C02 (Optical Tachometer)<br>EQP-D01 (Anechoic Chamber) | Tier A + B + C (College Lab)<br>*Tier D for certified dBA* |
| **VAL-RAD-006** | Radar Detection Through Radome | **EQP-A07** (PC Serial Radar Visualizer)<br>**EQP-B06** (Assembly Fasteners) | EQP-D03 (24 GHz RF Chamber) | Tier A + B (College Workshop)<br>*Tier D for RF loss* |
| **VAL-SYS-007** | Complete Assembly & 4h Soak | **EQP-A04** (Bench Power Supply)<br>**EQP-A02** (Multimeter)<br>**EQP-C04** (Granite Plate) | EQP-B03 (Thermal Logger)<br>EQP-A07 (Telemetry Station) | Tier A + B + C (College Workshop) |

---

## 7. Immediate Procurement Action Plan

To enable first-article testing without delay, execute the following purchasing checklist:

```
PROCURING TIER B INSTRUMENTATION & CONSUMABLES:
[ ] 1. Type 2 Sound Level Meter (IEC 61672-1 Class 2) ───────── ~$40.00
[ ] 2. Handheld Digital Vane Anemometer (0.3 - 30 m/s) ────── ~$30.00
[ ] 3. 4-Channel K-Type USB Temperature Data Logger ────────── ~$55.00
[ ] 4. Adjustable Low-Torque Driver (0.1 - 1.2 N·m) ────────── ~$40.00
[ ] 5. M3 & M4 Brass Heat-Set Soldering Iron Tips ──────────── ~$18.00
[ ] 6. 304 Stainless Metric Fastener Assortment (M3/M4) ────── ~$25.00
───────────────────────────────────────────────────────────────────────
TOTAL ESTIMATED PROCUREMENT BUDGET:                             ~$208.00
```

---

**Lead Hardware Validation Engineer Approval:**  
`___________________________________________`  
**Date:** `November 2, 2026`

