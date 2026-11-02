# ComfortLoop — Parametric 3D CAD & Mechanical Hardware Architecture
### atomQUEST 2026 | Track 1: Fan
**Professional Mechanical Engineering Documentation & CAD Manual**

---

## 1. System Overview & Product Architecture

ComfortLoop is an intelligent closed-loop thermal comfort control system designed to replace static mechanical fan regulators with dynamic apparent-temperature regulation, 24GHz mmWave radar occupant tracking, and high-efficiency BLDC motor management.

The physical hardware product is an integrated desktop / tabletop device:
- **Main Electronics Chassis**: Acts as the structural base, housing the ESP32 microcontroller, INA219 power monitor, 5V optocoupled relay, and power ingress.
- **Integrated Rear Mounting Shelf**: A $4.0\text{ mm}$ thick structural extension ($Y \in [50.0, 75.0\text{ mm}]$) with two M4 brass heat-set insert bores.
- **120mm Aerodynamic Fan Duct**: Features an L-bracket horizontal foot that bolts directly onto the chassis rear shelf with 2x M4 machine screws, and an acoustic bellmouth lip ($R = 4.0\text{ mm}$) at the intake.
- **120mm BLDC Fan & Concentric Finger Grille**: Sits directly inside the duct bracket, protected by an IEC-compliant concentric wire grille.
- **Aimable 24GHz mmWave Radar Pod**: Housed in a $1.50\text{ mm}$ RF-transparent radome with lateral trunnion ears mounted onto dual front clevis lugs on the enclosure ($15^\circ$ downward tilt).
- **Thermally Isolated BME280 Snorkel**: Projects $15.0\text{ mm}$ outboard from the left wall into undisturbed room air via a continuous, watertight hollow conduit with convective ventilation slits.

---

## 2. Hardware Dimension Register (Verified Datasheet Specifications)

| Subsystem / Component | Manufacturer / Model | Dimensions ($X \times Y \times Z\text{ mm}$) | Mounting Interface | Datasheet Source |
|---|---|---|---|---|
| **Microcontroller** | ESP32-WROOM-32 DevKit V1 | 28.5 × 51.5 × 12.8 mm | 23.5 × 46.5 mm (4x M3) | Espressif ESP32-DevKitC V4 Datasheet |
| **mmWave Radar** | Hi-Link HLK-LD2410 24GHz | 16.0 × 38.0 × 4.5 mm | Slide-in Rails + M3 Pivot | Hi-Link HLK-LD2410 User Manual v1.07 |
| **Climate Sensor** | Bosch BME280 Breakout (GY) | 12.0 × 15.5 × 3.2 mm | 6.0 × 2.5 mm single M2.5 | Bosch Sensortec BME280 Rev 1.8 |
| **Power Monitor** | TI INA219 High-Side Module | 22.3 × 25.5 × 11.5 mm | 17.0 × 20.0 mm (2x M3) | Texas Instruments INA219 SBOS448G |
| **Mains Switch** | Songle SRD-05VDC-SL-C Relay | 17.5 × 43.5 × 18.5 mm | 12.0 × 38.0 mm (2x M3) | Songle Relay Co., Ltd. SRD Series Spec |
| **BLDC Fan** | 120mm 4-Pin PWM Fan (Intel Spec)| 120.0 × 120.0 × 25.4 mm | 105.0 × 105.0 mm (4x M4) | Intel 4-Wire Pulse Width Modulation Spec |
| **Power Ingress** | 5.5 × 2.1mm DC Barrel Jack | Thread Ø 11.2 mm, D 16.5 mm | Bulkhead Hex Nut (M11) | Switchcraft 722A Spec Sheet |
| **Safety Fuse** | 5 × 20mm Panel Fuse Holder | Thread Ø 12.2 mm, D 32.0 mm | Bulkhead Hex Nut (M12) | Littelfuse 03453LS Series |

---

## 3. Presentation Configurations

The CAD assembly provides three presentation configurations:

### A. Assembled View
Shows the complete product in its nominal assembled state. All 18 components (chassis, cover, PCBs, sensors, fan, duct, grille, and fasteners) are in their exact physical mating positions with zero floating gaps.

### B. Exploded View
Components are separated along their natural manufacturing and assembly directions:
- Top cover lid lifts $+Z$ by $+75\text{ mm}$ with 4x M3 SHCS screws lifting $+110\text{ mm}$.
- Internal circuit boards lift $+Z$ by $+40\text{ mm}$ above their standoffs.
- Radar housing and radar sensor pull forward along $-Y$ by $-50\text{ mm}$ and $-75\text{ mm}$.
- BME280 snorkel pod and sensor pull outboard along $-X$ by $-50\text{ mm}$ and $-75\text{ mm}$.
- Fan duct lifts $+Z$ by $+35\text{ mm}$ and pulls rearward $+Y$ by $+40\text{ mm}$.
- 120mm BLDC fan and grille separate along the airflow axis.

### C. Cutaway View
The front-right quadrant ($X > 0, Y < 0$) of the enclosure chassis and cover lid is sectioned away. This exposes the internal electronics layout, the ESP32 microcontroller, the INA219 power monitor, the Songle relay, the M3 brass heat-set standoffs, and the $24.0\text{ mm}$ high-voltage dielectric isolation wall in cross-section while retaining all components in their assembled coordinates.

---

## 4. 2D Technical Engineering Blueprints

Six dimensioned engineering drawings have been generated in vector SVG format conforming to ISO standard title blocks and third-angle orthographic projection:

| Drawing No. | Sheet Title | Component Scope | Projected Views |
|---|---|---|---|
| **CL-DWG-001** | Main Electronics Chassis | 145 × 132 × 39 mm Chassis | Top, Front, Right Side, Isometric |
| **CL-DWG-002** | Enclosure Top Cover Lid | 145 × 100 × 3.5 mm Cover | Top, Front, Right Side, Isometric |
| **CL-DWG-003** | 120mm Aerodynamic Fan Duct | Bellmouth Duct & L-Bracket Foot | Top, Front, Right Side, Isometric |
| **CL-DWG-004** | HLK-LD2410 Radar Radome Pod | 1.50mm RF Window & Clevis Ears | Top, Front, Right Side, Isometric |
| **CL-DWG-005** | BME280 Thermal Snorkel Pod | 15mm Standoff Pod & Slits | Top, Front, Right Side, Isometric |
| **CL-DWG-006** | Complete System Assembly | Multi-Body Assembled Product | Top, Front, Right Side, Isometric |

Drawings are stored in `exports/drawings/` and accessible in the web dashboard under the **"2D Technical Blueprints"** tab.

---

## 5. Automated Verification & Testing

### Test Suites Execution
```bash
# 1. Run Vitest simulation and logic tests (14 tests)
npm test

# 2. Run CadQuery OpenCASCADE kernel tests (9 tests)
.venv/bin/python cad/tests/test_cadquery.py

# 3. Run hardware component envelope tests (12 tests)
.venv/bin/python cad/tests/test_components.py

# 4. Run rigorous topological & cutout penetration tests (10 tests)
.venv/bin/python cad/tests/test_geometry.py
```
**Total Passing Tests: 45/45**

---

## 6. How to Regenerate CAD & Drawings

```bash
# Activate workspace Python environment
source .venv/bin/activate

# Regenerate all 19 STEP models and 16 STL meshes
python cad/generate.py

# Regenerate all 6 vector SVG engineering drawings
python cad/drawings.py
```
Outputs are automatically synchronized to `public/cad/` for the web viewer.
