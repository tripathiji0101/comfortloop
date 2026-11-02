# ComfortLoop — Physical Prototype Validation & First-Article Testing Plan

**Document ID:** CL-VAL-001  
**Revision:** 1.0  
**Project:** ComfortLoop — atomQUEST 2026 | Track 1: Fan  
**Author:** Senior Mechanical Design Engineer, Product Validation Engineer & Hardware Testing Specialist  
**Release Date:** November 2, 2026  
**Status:** DRAFT / APPROVED FOR FIRST-ARTICLE TESTING  
**Classification:** Prototype Internal Engineering Standard  

---

## 1. Engineering Scope, Objective & Integrity Principles

### 1.1 Objective
This document transitions the ComfortLoop desktop intelligent fan system from **CAD mathematical verification** to **real-world physical prototype validation**. It establishes the standardized test procedures, equipment specifications, calibration requirements, pass/fail acceptance criteria, and recording templates for the first 3D-printed physical article.

### 1.2 Engineering Integrity & Traceability Rules
All testing personnel must adhere strictly to the following professional engineering standards:
1. **Separation of CAD Data from Physical Reality:** CAD bounding boxes and theoretical calculations are design intents, not proof of manufacturing execution. Physical measurements alone determine prototype validity.
2. **Zero Fabrication Policy:** Under no circumstances shall measurement values, sensor telemetry, acoustic levels, or test results be fabricated or estimated.
3. **Mandatory `NOT TESTED` Baseline:** Until a physical prototype is printed, assembled, and instrumented in the laboratory, all actual measurement fields must remain explicitly marked as `NOT TESTED`.
4. **Unit Traceability & Instrument Accuracy:** Every recorded number must carry SI physical units and cite the calibration serial number and measurement uncertainty of the instrument.
5. **Regulatory Caution:** Do not declare compliance with safety standards (e.g., IEC 60335-2-80 or UL 507) based solely on dimensional checks. Where specialist test fingers or accredited test labs are required, tests must be marked as **REQUIRING SPECIALIST VERIFICATION**.
6. **Electrical Safety Boundary:** The physical prototype operates strictly as an isolated **12V DC Class 2 / SELV appliance**. Mains AC voltage ($115\text{V}/230\text{V AC}$) is strictly prohibited from entering the enclosure.

---

## 2. Baseline Implemented CAD Hardware Geometry

The physical validation plan directly verifies the following production CAD geometry exported from the verified CadQuery B-Rep model:

| Subsystem Component | CAD Source File | STEP / STL Asset | Implemented Envelope ($X \times Y \times Z$) | Material Specification |
| :--- | :--- | :--- | :---: | :--- |
| **Main Electronics Chassis** | `cad/parts/main_enclosure.py` | `ComfortLoop_Main_Enclosure.step`<br>`ComfortLoop_Main_Enclosure.stl` | $145.0 \times 142.0 \times 39.0\text{ mm}$ | PETG / ABS (35% Gyroid Infill, 2.5mm Wall) |
| **Enclosure Cover Lid** | `cad/parts/enclosure_cover.py`| `ComfortLoop_Enclosure_Cover.step`<br>`ComfortLoop_Enclosure_Cover.stl` | $145.0 \times 100.0 \times 3.5\text{ mm}$ | PETG / PLA (100% Solid Infill, 2.0mm Plate) |
| **120mm Aerodynamic Duct** | `cad/parts/fan_duct.py` | `ComfortLoop_Fan_Duct.step`<br>`ComfortLoop_Fan_Duct.stl` | $120.0 \times 120.0 \times 25.0\text{ mm}$ | PETG / ABS ($R=4.0\text{mm}$ Bellmouth, Foot $t=4.0\text{mm}$) |
| **Concentric Safety Grille**| `cad/parts/fan_grille.py` | `ComfortLoop_Fan_Grille.step`<br>`ComfortLoop_Fan_Grille.stl` | $121.0 \times 121.0 \times 2.5\text{ mm}$ | PETG / ABS / Nickel-Plated Steel Wire ($t=2.5\text{mm}$) |
| **HLK-LD2410 Radar Pod** | `cad/parts/radar_housing.py`| `ComfortLoop_Radar_Housing.step`<br>`ComfortLoop_Radar_Housing.stl` | $26.6 \times 42.6 \times 12.2\text{ mm}$ | Low-Loss Polycarbonate / PETG ($1.5\text{mm}$ Window) |
| **BME280 Thermal Snorkel** | `cad/parts/bme_snorkel.py` | `ComfortLoop_BME_Snorkel_Pod.step`<br>`ComfortLoop_BME_Snorkel_Pod.stl` | $16.6 \times 38.1 \times 22.0\text{ mm}$ | PETG / ASA ($15\text{mm}$ Thermal Standoff Conduit) |
| **Master Assembly** | `cad/assembly.py` | `ComfortLoop_Assembly.step` | $183.1 \times 215.6 \times 145.5\text{ mm}$ | Multi-Body Mechanical & Electrical Assembly |

---

## 3. Physical Prototype Validation Test Procedures

```
          PHYSICAL PROTOTYPE VALIDATION PROTOCOL HIERARCHY
          ┌──────────────────────────────────────────────┐
          │     Stage 1: First-Article Print Inspection  │
          │     (Dimensions, Wall Thickness, Inserts)    │
          └──────────────────────┬───────────────────────┘
                                 │
                                 ▼
          ┌──────────────────────────────────────────────┐
          │     Stage 2: Subsystem Mechanical Testing    │
          │  • Test 1: Radar Hinge & Clevis Fit          │
          │  • Test 2: Fan Grille Mechanical Safety      │
          │  • Test 3: Fan Duct & Fastener Interface     │
          └──────────────────────┬───────────────────────┘
                                 │
                                 ▼
          ┌──────────────────────────────────────────────┐
          │     Stage 3: Thermal, Airflow & RF Testing   │
          │  • Test 4: BME280 4-Hour Thermal Isolation   │
          │  • Test 5: Fan Airflow (CFM) & Acoustics     │
          │  • Test 6: Radar Detection Through Radome    │
          └──────────────────────┬───────────────────────┘
                                 │
                                 ▼
          ┌──────────────────────────────────────────────┐
          │     Stage 4: Complete System Integration     │
          │  • Test 7: 4-Hour Continuous Assembly Test   │
          └──────────────────────────────────────────────┘
```

---

### Test 1 — Radar Hinge and Clevis Fit

| Field | Required Information |
| :--- | :--- |
| **Test ID** | **VAL-MEC-001** |
| **Component** | Radar Housing Pod (`ComfortLoop_Radar_Housing`), Main Enclosure Front Clevis Lugs, M3 $\times$ 35 mm Socket Head Bolt, M3 Nyloc Nut |
| **Objective** | Verify dimensional clearance between radar trunnion ears and clevis lugs, confirm smooth non-binding pitch adjustment across required $-20.0^\circ\text{ to } -10.0^\circ$ operating window (nominal $-15.0^\circ$), verify absence of layer delamination under clamping, and confirm angular stability under fan vibration. |
| **Equipment** | 1. Digital Vernier Caliper ($0.01\text{ mm}$ resolution, $\pm 0.02\text{ mm}$ uncertainty)<br>2. Digital Inclinometer / Angle Protractor ($\pm 0.1^\circ$ accuracy)<br>3. Precision Calibrated Torque Screwdriver ($0.1\text{ to } 1.0\text{ N}\cdot\text{m}$, $\pm 5\%$) |
| **Step-by-Step Procedure** | 1. Measure internal gap between the printed clevis lugs at front chassis ($X \in [-13.5, +13.5]$) at 3 points (top, center at pivot axis, bottom).<br>2. Measure outer width across printed radar pod trunnion ears ($X = 26.6\text{ mm}$ nominal).<br>3. Inspect pivot through-holes ($\varnothing 3.2\text{ mm}$ nominal) for cylindrical roundness and clean print layer ridges with a $3.2\text{ mm}$ reamer or drill bit by hand.<br>4. Insert radar pod into clevis. Check insertion force. It must slip into place without forced deflection of the clevis lugs.<br>5. Pass M3 $\times$ 35 mm SHCS bolt through clevis lugs and trunnion ears. Thread M3 Nyloc nut onto protruding thread.<br>6. Attach digital inclinometer to front face of radar pod.<br>7. Manually rotate pod through full angular envelope. Record angles where binding, rubbing, or contact with enclosure front wall or cover lid occurs.<br>8. Measure clearance between pod rear surface and enclosure front wall at nominal $-15.0^\circ$ downward tilt.<br>9. Tighten M3 Nyloc nut incrementally to $0.2\text{ N}\cdot\text{m}$, $0.3\text{ N}\cdot\text{m}$, and $0.4\text{ N}\cdot\text{m}$. Inspect clevis lugs under $10\times$ magnification for layer delamination, crazing, or boss deformation.<br>10. Power fan to maximum speed ($100\%$ PWM / ~2000 RPM) for 15 minutes. Measure radar pod pitch angle before and after to verify zero vibration drift. |
| **Expected Result** | 1. Printed clevis gap: $27.00 \pm 0.20\text{ mm}$.<br>2. Printed trunnion width: $26.60 \pm 0.15\text{ mm}$.<br>3. Net bilateral clearance: $0.15\text{ to } 0.35\text{ mm}$ total ($0.08\text{ to } 0.18\text{ mm}$ per side).<br>4. Free, smooth rotation across $-21.0^\circ\text{ to } +19.0^\circ$ with zero binding.<br>5. Clearance to enclosure front wall at $-15.0^\circ$: $\ge 1.50\text{ mm}$; clearance to cover lid: $\ge 2.00\text{ mm}$.<br>6. Zero visible cracking or layer splitting at $0.4\text{ N}\cdot\text{m}$ clamping torque.<br>7. Zero angular drift ($< 0.5^\circ$) after 15 minutes of full-speed fan vibration. |
| **Actual Result** | `NOT TESTED` (Awaiting physical print inspection) |
| **Evidence** | `docs/evidence/VAL-MEC-001/` (Caliper reading photos, protractor angle verification, post-vibration angle log) |
| **Status** | **NOT TESTED** |
| **Remarks** | CAD calculations demonstrate collision-free kinematics between $-21.50^\circ$ and $+19.75^\circ$. Clamping torque must be empirically verified; if PETG clevis exhibits creep, an internal brass spacer or Belleville spring washer will be specified. |

---

### Test 2 — Fan Grille Mechanical Safety & Probe Resistance

| Field | Required Information |
| :--- | :--- |
| **Test ID** | **VAL-SAF-002** |
| **Component** | Concentric Safety Finger Grille (`ComfortLoop_Fan_Grille`), 120mm BLDC Fan Impeller |
| **Objective** | Verify physical dimensions of all concentric ring openings, inspect layer bonding strength of thin radial ribs, measure structural deflection of grille under calibrated $20\text{ N}$ push force, determine whether adult or child test probes can contact moving fan blades, and evaluate compliance boundaries under IEC 60335-2-80 and UL 507. |
| **Equipment** | 1. Digital Caliper with depth probe rod ($0.01\text{ mm}$)<br>2. Pin Gauges set ($3.0\text{ mm to } 7.0\text{ mm}$ in $0.1\text{ mm}$ increments)<br>3. Push-Pull Force Gauge ($0\text{ to } 50\text{ N}$, resolution $0.05\text{ N}$)<br>4. Rigid test finger / probe fixture (specialist laboratory equipment) |
| **Step-by-Step Procedure** | 1. Measure radial width of all 5 concentric openings using pin gauges and calipers at 4 circumferential locations per ring.<br>2. Measure thickness of grille rings ($2.50\text{ mm}$ nominal) and radial rib width ($2.50\text{ mm}$ nominal).<br>3. Inspect the 4 radial structural ribs under magnification for inter-layer voids, print underextrusion, or brittleness.<br>4. Mount grille to 120mm fan frame using 4x corner bolts. Measure axial distance from outer face of grille to nearest edge of stationary fan blade with caliper depth rod.<br>5. **Controlled Load Deflection Test:** Mount force gauge with a flat $\varnothing 10\text{ mm}$ contact tip against the center hub of the grille. Apply $10\text{ N}$, $20\text{ N}$, and $30\text{ N}$ axial force perpendicular to the grille face. Measure deflection using a dial indicator mounted to the fan frame.<br>6. Inspect grille for cracking, permanent plastic deformation, or layer detachment after releasing load.<br>7. **Adult Finger Probe Test (IEC 60335-1 / Test Probe B):** Attempt insertion of a $\varnothing 12.0\text{ mm}$ test finger at every opening under $20\text{ N}$ force. Record insertion depth.<br>8. **Child Probe Test (IEC Probe 19):** Attempt insertion of a $\varnothing 5.6\text{ mm}$ probe into the $6.2\text{ mm}$ openings under $2.5\text{ N}$ force. Measure whether probe tip can touch fan blades.<br>9. Spin fan at low speed (PWM Level 1) under safety bench shielding. Re-test probe contact (using non-conductive, soft-tipped probe). |
| **Expected Result** | 1. Measured radial gaps must not exceed CAD limits:<br>   - Hub to Ring 1: $6.10 \pm 0.30\text{ mm}$<br>   - Ring 1 to Ring 2: $6.20 \pm 0.30\text{ mm}$<br>   - Ring 2 to Ring 3: $6.20 \pm 0.30\text{ mm}$<br>   - Ring 3 to Ring 4: $5.20 \pm 0.30\text{ mm}$<br>   - Ring 4 to Bezel: $3.10 \pm 0.30\text{ mm}$<br>2. Blade setback from outer grille face: $\ge 4.00\text{ mm}$.<br>3. Deflection under $20\text{ N}$ center load: $\le 1.80\text{ mm}$ (maintaining $\ge 2.2\text{ mm}$ clearance to blade).<br>4. Zero contact between $\varnothing 12.0\text{ mm}$ Test Probe B and fan blades under $20\text{ N}$ force.<br>5. Zero cracking, layer separation, or permanent set after load removal. |
| **Actual Result** | `NOT TESTED` (Awaiting physical print and force gauge setup) |
| **Evidence** | `docs/evidence/VAL-SAF-002/` (Pin gauge photos, force vs deflection dial gauge log, probe penetration depth records) |
| **Status** | **NOT TESTED — REQUIRES SPECIALIST CERTIFICATION FOR FORMAL IEC/UL COMPLIANCE** |
| **Remarks** | **Critical Safety Finding:** While the $6.2\text{ mm}$ maximum gap excludes adult index fingers ($\varnothing 12\text{ mm}$), it exceeds the $\varnothing 5.6\text{ mm}$ child finger probe (IEC Probe 19). If child safety compliance is mandated, the grille design must either incorporate an internal wire mesh ($< 4\text{ mm}$ mesh) or be certified in a specialized safety laboratory. Formal IEC 60335 compliance must NOT be claimed without third-party test house certification. |

---

### Test 3 — Fan Duct and Fastener Fit

| Field | Required Information |
| :--- | :--- |
| **Test ID** | **VAL-MEC-003** |
| **Component** | 120mm Aerodynamic Fan Duct (`ComfortLoop_Fan_Duct`), Rear Mounting Shelf (`ComfortLoop_Main_Enclosure`), 2x M4 $\times$ 8 mm SHCS Screws, 2x M4 Brass Heat-Set Inserts |
| **Objective** | Verify the $40.0\text{ mm}$ mounting hole pitch between duct foot and rear shelf, verify flush seating of foot on shelf, verify that M4 screw tips do NOT protrude below the enclosure bottom plane ($Z=0$), inspect heat-set insert retention, and verify zero blade rubbing in duct throat. |
| **Equipment** | 1. Digital Caliper ($0.01\text{ mm}$)<br>2. Precision Machinist Square / Flat Granite Surface Plate<br>3. Feeler Gauge set ($0.05\text{ to } 1.00\text{ mm}$)<br>4. Calibrated Torque Screwdriver ($0.5\text{ to } 2.5\text{ N}\cdot\text{m}$) |
| **Step-by-Step Procedure** | 1. Measure center-to-center pitch of the 2 mounting holes on the fan duct foot ($40.0\text{ mm}$ nominal).<br>2. Measure center-to-center pitch of the 2 insert bores on the chassis rear shelf ($40.0\text{ mm}$ nominal).<br>3. Place printed fan duct foot on a flat granite surface plate. Check for corner lifting or warping using feeler gauges.<br>4. Install 2x M4 brass heat-set inserts ($\varnothing 5.6\text{ mm} \times 4.0\text{ mm}$ length) into the rear shelf bores using temperature-controlled soldering iron at $220^\circ\text{C}$. Verify inserts seat perpendicular and flush with shelf top surface.<br>5. Place fan duct foot onto shelf. Insert 2x M4 $\times$ 8 mm SHCS bolts.<br>6. Torque screws to $0.8\text{ N}\cdot\text{m}$. Inspect shelf underside with straight edge and feeler gauge.<br>7. Measure protrusion of screw tips past the underside of the shelf ($Z = 0.0\text{ mm}$ plane).<br>8. Mount 120mm fan into duct frame using 4x corner bolts. Manually spin fan impeller by hand. Check for axial or radial rub against duct throat ($\varnothing 113\text{ mm}$ nominal bore).<br>9. Repeat test with M4 $\times$ 12 mm screws to document the $4.0\text{ mm}$ protrusion interference demonstrated in the CAD audit. |
| **Expected Result** | 1. Hole pitch: $40.00 \pm 0.20\text{ mm}$ on both foot and shelf.<br>2. Foot flatness: gap $< 0.15\text{ mm}$ across full $60.0 \times 25.0\text{ mm}$ contact patch.<br>3. M4 $\times$ 8 mm screw tip protrusion below bottom plane: **$\le 0.00\text{ mm}$ (100% flush or slightly recessed)**.<br>4. Zero protrusion beyond $Z=0$; unit sits completely flat on table with zero rocking.<br>5. Heat-set inserts show zero pull-out, cracking, or thread stripping at $0.8\text{ N}\cdot\text{m}$ torque.<br>6. Impeller spins freely with $> 1.0\text{ mm}$ radial clearance around entire duct bellmouth circumference. |
| **Actual Result** | `NOT TESTED` (Awaiting physical assembly) |
| **Evidence** | `docs/evidence/VAL-MEC-003/` (Pitch measurement photos, feeler gauge check under foot, tabletop straight edge inspection, rotation video) |
| **Status** | **NOT TESTED** |
| **Remarks** | The CAD audit proved that M4 $\times$ 12 mm screws protrude $4.0\text{ mm}$ into the tabletop. Physical testing must confirm that M4 $\times$ 8 mm screws eliminate this defect completely. If only M4 $\times$ 12 mm screws are available in the workshop, $\ge 5.0\text{ mm}$ rubber feet MUST be installed. |

---

### Test 4 — BME280 Thermal Isolation Verification

| Field | Required Information |
| :--- | :--- |
| **Test ID** | **VAL-THM-004** |
| **Component** | BME280 Breakout in External Snorkel Pod (`ComfortLoop_BME_Snorkel_Pod`), Main Electronics Enclosure, ESP32 DevKit (active Wi-Fi), INA219, Songle 5V Relay, 120mm Fan |
| **Objective** | Quantify the thermal self-heating rise of the BME280 sensor when mounted in the external $15\text{ mm}$ standoff snorkel versus an independent calibrated ambient reference sensor over a continuous 4-hour operating period under multiple fan operational modes. |
| **Equipment** | 1. ComfortLoop Prototype with BME280 telemetry streaming over I2C<br>2. Calibrated 4-Wire PT100 RTD or Laboratory Thermocouple Data Logger ($\pm 0.1^\circ\text{C}$ accuracy) positioned in free ambient air $1.0\text{ m}$ away from the prototype at equal height<br>3. Secondary thermocouple attached to ESP32 RF shield inside enclosure<br>4. Tertiary thermocouple attached to Songle Relay coil body<br>5. Automated CSV data logging software recording every 10 seconds |
| **Step-by-Step Procedure** | 1. Place ComfortLoop in an enclosed test room with stabilized ambient temperature ($23.0 \pm 1.5^\circ\text{C}$, $< 0.1\text{ m/s}$ air draft).<br>2. Position reference temperature sensor $1.0\text{ m}$ laterally from the prototype, shielded from direct sunlight or fan draft.<br>3. Allow unpowered prototype to thermally soak for 60 minutes until $T_{\text{BME}} - T_{\text{ref}} \le 0.2^\circ\text{C}$. Record initial ambient baseline.<br>4. Power system on via 12V 5A DC supply. Start ESP32 firmware running continuous dual-core RTOS control loop, Wi-Fi telemetry active (transmitting MQTT/HTTP packets every 1s), and Relay energized (`CLOSED`).<br>5. **Phase A (Worst-Case Thermal Stagnation):** Keep fan commanded OFF (PWM Level 0) for 120 minutes. Log $T_{\text{BME}}$, $T_{\text{ref}}$, $T_{\text{ESP32}}$, and $T_{\text{Relay}}$ every 10 seconds.<br>6. **Phase B (Active Convective Cooling):** Command fan to Level 3 (PWM 160 / ~1500 RPM) for 120 minutes. Continue logging all temperatures.<br>7. Calculate instantaneous temperature delta: $\Delta T(t) = T_{\text{BME}}(t) - T_{\text{ref}}(t)$.<br>8. Plot $\Delta T(t)$ vs time across the full 240-minute test.<br>9. Determine maximum temperature rise $\Delta T_{\max}$ and thermal time constant $\tau_{95}$ (time to 95% steady-state).<br>10. Inspect physical heat transfer paths: conduct touch-probe measurement along snorkel conduit arm and examine thermal conduction through the 4-pin silicone wiring harness. |
| **Expected Result** | 1. Initial unpowered offset: $|T_{\text{BME}} - T_{\text{ref}}| \le 0.30^\circ\text{C}$ (within sensor factory calibration tolerance).<br>2. **Phase A (Fan OFF, 120 min):** Maximum steady-state sensor rise $\Delta T_{\max} \le \mathbf{1.50^\circ\text{C}}$. Internal enclosure air will rise by $6\text{ to } 10^\circ\text{C}$, but the $15\text{ mm}$ standoff conduit and convective slits must restrict sensor heating to $\le 1.5^\circ\text{C}$.<br>3. **Phase B (Fan Level 3, 120 min):** Active room air circulation must reduce sensor rise to $\Delta T_{\text{active}} \le \mathbf{0.50^\circ\text{C}}$.<br>4. Thermal stabilization time $\tau_{95} \le 45\text{ minutes}$. |
| **Actual Result** | `NOT TESTED` (Awaiting 4-hour laboratory data acquisition) |
| **Evidence** | `docs/evidence/VAL-THM-004/` (CSV temperature time-series, $\Delta T$ vs Time graph, thermal imaging FLIR photos of snorkel arm) |
| **Status** | **NOT TESTED** |
| **Remarks** | Prior audit reports claimed "zero thermal conduction" based on CAD air gaps. This is physically invalid because heat conducts along the 4-pin copper jumper wires and radiates from the left chassis wall. The acceptance criterion of $\le 1.5^\circ\text{C}$ (fan off) and $\le 0.5^\circ\text{C}$ (fan active) reflects realistic desktop instrumentation standards. |

---

### Test 5 — Fan Airflow & Acoustic Performance Characterization

| Field | Required Information |
| :--- | :--- |
| **Test ID** | **VAL-AER-005** |
| **Component** | 120mm 4-Pin PWM Fan (`ComfortLoop_Fan120_BLDC`), Aerodynamic Duct (`ComfortLoop_Fan_Duct`), Safety Grille (`ComfortLoop_Fan_Grille`), TI INA219 Current Sensor |
| **Objective** | Measure actual fan rotational speed (RPM), discharge air velocity (m/s), estimated volumetric airflow (CFM), electrical power consumption (W), and acoustic noise emissions (dBA) across all 6 firmware speed levels to quantify the physical impact of the $22.8\%$ rear wall obstruction. |
| **Equipment** | 1. Digital Vane Anemometer ($\varnothing 70\text{ mm}$ vane head, $0.2\text{ to } 30.0\text{ m/s}$, resolution $0.01\text{ m/s}$)<br>2. Non-Contact Optical Laser Tachometer ($\pm 1\text{ RPM}$ accuracy)<br>3. Type 2 Sound Level Meter (IEC 61672 Class 2, A-weighting, Slow response, $30\text{ to } 130\text{ dBA}$ range)<br>4. TI INA219 calibrated DC power monitor reading 12V bus voltage and fan motor current<br>5. Custom airflow traverse jig holding anemometer at 9 grid points across discharge face |
| **Step-by-Step Procedure** | 1. Mount assembled ComfortLoop prototype on vibration-damping test pad in a semi-anechoic or low-noise room (ambient noise floor $\le 24.0\text{ dBA}$).<br>2. Position sound level meter microphone on a tripod at $1.0\text{ m}$ distance from the fan exhaust face, angled $45^\circ$ off-axis at fan center height ($Z=64\text{ mm}$).<br>3. Position anemometer head at $100\text{ mm}$ axial distance from the grille face.<br>4. Connect ESP32 firmware running fan diagnostic script.<br>5. Test system sequentially at 6 steady-state operating levels:<br>   - Level 0: 0% PWM (0/255)<br>   - Level 1: 30% PWM (77/255)<br>   - Level 2: 50% PWM (128/255)<br>   - Level 3: 63% PWM (160/255 — nominal 1500 RPM)<br>   - Level 4: 82% PWM (210/255)<br>   - Level 5: 100% PWM (255/255 — maximum speed)<br>6. Allow 60 seconds stabilization at each speed level.<br>7. At each speed level, record:<br>   - PWM command and hardware PWM frequency ($25.0\text{ kHz}$)<br>   - Impeller RPM (from optical laser tachometer and ESP32 tachometer pulse counter)<br>   - Air velocity at 9 traverse points across discharge area (center, 4 quadrants, 4 edge points)<br>   - Calculate average velocity $\bar{v}$ and estimate volumetric airflow: $Q = \bar{v} \times A_{\text{effective}}$ (where $A = \pi R^2 = 0.01003\text{ m}^2$)<br>   - Bus Voltage ($V$), Current ($I_{\text{mA}}$), and Power ($P_{\text{W}}$) via INA219<br>   - Sound Pressure Level ($L_A$ in dBA)<br>   - Subjective vibration and tonal hum notes (Blade Pass Frequency tonal peak)<br>8. Generate the 4 required characterization curves:<br>   - Curve 1: PWM Duty Cycle vs RPM<br>   - Curve 2: RPM vs Discharge Air Velocity (m/s)<br>   - Curve 3: RPM vs Electrical Power (W)<br>   - Curve 4: RPM vs Sound Pressure Level (dBA) |
| **Expected Result** | 1. RPM linearity: Monotonic increase from ~600 RPM (Level 1) to ~2000 RPM (Level 5) with $< 50\text{ RPM}$ fluctuation.<br>2. Airflow delivery: Minimum $15\text{ CFM}$ at Level 1, reaching $\ge 45\text{ CFM}$ at Level 5.<br>3. Acoustic limits: Sound level must not exceed $28.0\text{ dBA}$ at Level 1, $34.0\text{ dBA}$ at Level 3, and $45.0\text{ dBA}$ at Level 5.<br>4. Power consumption: Maximum electrical power $\le 3.60\text{ W}$ at full speed ($12.0\text{ V} \times 0.30\text{ A}$).<br>5. Rear wall obstruction check: Measure difference in air velocity between top half ($Z > 39\text{ mm}$) and bottom half ($Z < 39\text{ mm}$) of discharge face to quantify flow asymmetry. |
| **Actual Result** | `NOT TESTED` (Awaiting laboratory test bench instrumentation) |
| **Evidence** | `docs/evidence/VAL-AER-005/` (Raw multi-point anemometer logs, INA219 CSV trace, decibel meter readout photos, 4 plotted curves) |
| **Status** | **NOT TESTED** |
| **Remarks** | The CAD audit proved an exact $22.78\%$ frontal area obstruction caused by the enclosure rear wall. This test will empirically measure the resulting flow derating and acoustic penalty rather than relying on theoretical fan laws. |

---

### Test 6 — Radar Detection Through Printed Radome

| Field | Required Information |
| :--- | :--- |
| **Test ID** | **VAL-RAD-006** |
| **Component** | Hi-Link HLK-LD2410 24GHz FMCW mmWave Radar, Printed Radar Radome Pod (`ComfortLoop_Radar_Housing`), Assembled ComfortLoop Enclosure |
| **Objective** | Verify that the $1.50\text{ mm}$ 3D-printed thermoplastic radome front face does not attenuate the 24GHz radar signal to a degree that degrades human presence detection, micro-motion sensing, or distance gate accuracy compared to an unhoused bare-board reference. |
| **Equipment** | 1. HLK-LD2410 mmWave Radar Module connected to ESP32 UART interface<br>2. LD2410 PC Configuration Tool / Serial Diagnostic Streamer logging target energy values across distance gates 0 to 8<br>3. Laser Distance Meter ($\pm 1.5\text{ mm}$ accuracy)<br>4. Calibrated test room ($6.0\text{ m} \times 4.0\text{ m}$) free of secondary moving objects or metallic reflectors |
| **Step-by-Step Procedure** | 1. Mount bare-board LD2410 on a non-metallic tripod at $1.0\text{ m}$ height. Mark target distances on floor ($0.5\text{ m}$, $1.0\text{ m}$, $1.5\text{ m}$, $2.0\text{ m}$, $2.5\text{ m}$, $3.0\text{ m}$, $4.0\text{ m}$).<br>2. **Bare Board Baseline:**<br>   - Record stationary human target energy levels across all gates for 60s at each marked distance.<br>   - Record moving human target energy levels while walking toward/away.<br>   - Record angular beamwidth by measuring target detection at $\pm 15^\circ, \pm 30^\circ, \pm 45^\circ, \pm 60^\circ$ azimuth.<br>   - Leave room unoccupied for 15 minutes; record false positive trigger rate.<br>3. **Installed Radome Test:**<br>   - Install LD2410 into the 3D-printed radar housing (ensuring the $3.5\text{ mm}$ antenna airgap standoff is preserved and radome front face is $1.50\text{ mm}$).<br>   - Mount housing in chassis clevis at nominal $-15.0^\circ$ pitch.<br>   - Repeat all stationary, moving, angular, and false-positive measurements at identical test positions.<br>4. **Comparative Analysis:**<br>   - Calculate energy signal attenuation: $\Delta E(\text{gate}) = E_{\text{bare}} - E_{\text{radome}}$.<br>   - Verify whether stationary micro-motion (breathing/typing) is reliably detected at $1.5\text{ m}$ desktop distance.<br>5. Turn on 120mm fan at full speed. Verify whether rotating fan blades behind the enclosure cause false radar reflections or Doppler interference. |
| **Expected Result** | 1. Radar energy attenuation through $1.5\text{ mm}$ PETG/PC radome: $\le \mathbf{15\%}$ gate energy reduction (equivalent to $\le 1.5\text{ dB}$ two-way insertion loss).<br>2. Stationary target detection: 100% reliable detection at desktop distance ($0.5\text{ m to } 2.0\text{ m}$).<br>3. Azimuth coverage: Detection verified out to $\pm 45^\circ$ minimum.<br>4. False positive rate: 0 triggers over 15 minutes in an unoccupied room.<br>5. Fan reflection immunity: Zero target detection triggered by fan rotation behind the enclosure. |
| **Actual Result** | `NOT TESTED` (Awaiting prototype print and RF telemetry capture) |
| **Evidence** | `docs/evidence/VAL-RAD-006/` (LD2410 raw serial gate energy logs, comparative sensitivity bar chart, floor layout diagram) |
| **Status** | **NOT TESTED** |
| **Remarks** | Engineering audit notes that theoretical low dielectric loss for PETG ($\epsilon_r \approx 2.8, \tan\delta \approx 0.015$) requires physical validation. FDM infill voids can cause internal reflection or phase distortion if printed with non-uniform infill. Radome window MUST be printed with 100% solid concentric perimeter loops. |

---

### Test 7 — Complete Multi-Body Assembly & 4-Hour System Soak Test

| Field | Required Information |
| :--- | :--- |
| **Test ID** | **VAL-SYS-007** |
| **Component** | Fully Assembled ComfortLoop Virtual Prototype (Monolithic Chassis, Top Cover, Fan Duct, 120mm Fan, Finger Grille, Radar Pod, Thermal Snorkel, ESP32, INA219, Relay, DC Jack, Fuse Holder) |
| **Objective** | Verify complete electro-mechanical integration, physical fastener retention, tabletop stability (zero rocking), cable routing and strain relief, cover latching/serviceability, and continuous 4-hour operating stability under full electrical and aerodynamic load. |
| **Equipment** | 1. Fully assembled ComfortLoop prototype<br>2. Regulated 12.0V 5.0A DC Power Supply with calibrated digital ammeter<br>3. USB Power Meter / Oscilloscope monitoring 5V and 3.3V internal rail noise<br>4. Precision Granite Surface Plate / Tabletop straight edge<br>5. FLIR / Thermal Imaging Camera |
| **Step-by-Step Procedure** | 1. Inspect all 14 fastener locations. Confirm M3 cover screws, M3 PCB screws, M4 duct screws, and M3 pivot bolt are torqued to specification.<br>2. Place assembled unit on a flat granite surface plate. Press firmly on all 4 corners. Check for teetering, rocking, or gaps between chassis base and surface.<br>3. Inspect bottom plane: confirm M4 duct screw tips do NOT protrude beyond the $Z = 0.0\text{ mm}$ plane.<br>4. Inspect internal wiring: verify fan 4-pin harness passes through rear slot without pinching; verify radar 4-pin harness passes through clevis passage without strain during swivel; verify BME280 I2C harness passes through left wall passage.<br>5. Verify high-voltage partition: confirm 24mm dielectric barrier completely isolates the relay terminal compartment from the ESP32 and INA219.<br>6. Power system on at 12.0V DC. Initiate automated 4-hour system test script:<br>   - Cycles fan through Levels 1 to 5 every 30 minutes<br>   - Toggles Relay ON for 10 minutes every hour (connected to 12V dummy load, 1.0A)<br>   - Streams BME280, LD2410, and INA219 telemetry to console<br>7. Monitor 12V bus voltage, total system current, and temperature profiles.<br>8. At $T = 240\text{ minutes}$, capture thermal image of full assembly.<br>9. Power off. Immediately inspect all 3D-printed parts for heat warping, fastener loosening, or mechanical creep. Remove cover lid and inspect ease of internal access. |
| **Expected Result** | 1. Tabletop stability: Zero rocking ($< 0.10\text{ mm}$ corner gap). Base rests flat on surface.<br>2. Fastener clearance: Zero protrusion of M4 duct screws or inserts below baseplate.<br>3. Wiring integrity: Zero pinched, chafed, or pulled conductors across full radar swivel motion.<br>4. Continuous operation: Zero resets, zero brownouts, zero watchdog timeouts over 240 minutes.<br>5. Thermal safety: Maximum enclosure exterior surface temperature $\le 40.0^\circ\text{C}$; ESP32 die temperature $\le 65.0^\circ\text{C}$; Relay coil body $\le 55.0^\circ\text{C}$.<br>6. Serviceability: Cover lid can be unscrewed and removed in $< 60\text{ seconds}$ without disturbing external fan, radar, or snorkel wiring. |
| **Actual Result** | `NOT TESTED` (Awaiting complete prototype build) |
| **Evidence** | `docs/evidence/VAL-SYS-007/` (Assembled prototype photographs, 4-hour telemetry CSV log, FLIR thermal map, post-test fastener torque audit) |
| **Status** | **NOT TESTED** |
| **Remarks** | This test represents the master gate review for first-article hardware demonstration. All previous subsystem tests (VAL-MEC-001 through VAL-RAD-006) must be completed before running the final endurance test. |

---

## 4. Test Result Summary & Compliance Matrix

| Test ID | Subsystem | Engineering Acceptance Criterion | Verification Method | CAD Status | Physical Status |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **VAL-MEC-001** | Radar Hinge & Clevis | Gap $27.0\pm 0.2\text{mm}$, Width $26.6\pm 0.15\text{mm}$, $-20^\circ\text{ to } -10^\circ$ sweep | Caliper + Inclinometer + Torque | **PASS (CAD)** | `NOT TESTED` |
| **VAL-SAF-002** | Grille Mechanical Safety | Gaps $\le 6.2\text{mm}$, Deflection $\le 1.8\text{mm}$ at $20\text{N}$, Probe B pass | Force Gauge + Test Probes | **PASS (CAD)** | `NOT TESTED` |
| **VAL-MEC-003** | Fan Duct & Shelf Fit | $40\text{mm}$ pitch, flat foot, M4$\times$8mm flush ($0.0\text{mm}$ protrusion) | Surface Plate + Caliper | **PASS (CAD)** | `NOT TESTED` |
| **VAL-THM-004** | BME280 Thermal Isolation | Sensor rise $\le 1.5^\circ\text{C}$ (fan off), $\le 0.5^\circ\text{C}$ (fan on) vs Ref | 4-Hour 4-Wire RTD Logger | **PASS (CAD)** | `NOT TESTED` |
| **VAL-AER-005** | Airflow & Acoustic Perf. | Monotonic RPM, $>15\text{ CFM}$ L1, $<28\text{ dBA}$ L1, $<34\text{ dBA}$ L3 | Anemometer + dBA Meter | **PASS (CAD)** | `NOT TESTED` |
| **VAL-RAD-006** | Radar Radome Penetration | Radar attenuation $\le 15\%$, $100\%$ presence detection at $2.0\text{m}$ | LD2410 UART Gate Monitor | **PASS (CAD)** | `NOT TESTED` |
| **VAL-SYS-007** | Full System Integration | 4-Hour soak test, zero rocking, temp $\le 40^\circ\text{C}$, 12V SELV | 4-Hour Data Logger + FLIR | **PASS (CAD)** | `NOT TESTED` |

