# ComfortLoop — First-Print Physical Inspection Checklist (FAI)

**Document ID:** CL-CHK-001  
**Revision:** 1.0  
**Project:** ComfortLoop — atomQUEST 2026 | Track 1: Fan  
**Standard:** AS9102 / ISO 9001 First Article Inspection (Adapted for Desktop Additive Rapid Prototyping)  
**Date:** November 2, 2026  
**Status:** DRAFT / PENDING PHYSICAL ARTICLE EXECUTION  
**Appliance Boundary:** 12V DC SELV Isolated Desktop Appliance  

---

## 1. Inspection Administrative Information

| Record Field | Entry / Inspector Record | Reference Specification |
| :--- | :--- | :--- |
| **Inspector Name / Title** | `___________________________` | Lead Validation Engineer |
| **Inspection Date & Time** | `___________________________` | Post-Print Stabilization (+24h) |
| **3D Printer Make & Model**| `___________________________` | FDM CoreXY / Cartesian (e.g. Bambu X1C / Prusa MK4) |
| **Filament Material & Batch**| `___________________________` | PETG / ABS / ASA (Brand, Color, Spool ID) |
| **Slicer & Profile Version**| `___________________________` | PrusaSlicer / OrcaSlicer (0.20mm Layer Height, 3-4 Walls) |
| **Ambient Inspection Temp** | `_____ °C` (Target: 20°C - 24°C) | Standard Metrology Room Ambient |
| **Relative Humidity (RH)**  | `_____ %` (Target: 40% - 60% RH) | Standard Laboratory Environment |
| **Primary Inspection Tool** | Digital Vernier Caliper (0.01mm) | Calibrated ID: `________________` |
| **Secondary Inspection Tool**| Feeler Gauge Set (0.05 - 1.00mm) | Calibrated ID: `________________` |
| **Angle Gauge / Protractor** | Digital Inclinometer (±0.1°)    | Calibrated ID: `________________` |

---

## 2. Standard Operating Procedure for First Article Inspection (FAI)

1. **Post-Processing Stabilization:** Allow all 3D printed components to cool to room ambient temperature and stabilize for at least 4 hours after build plate removal before taking dimensional measurements.
2. **Support Removal:** Cleanly remove all support structures, brims, and stringing using flush cutters and deburring blades. Inspect boreholes and overhangs for residual support material.
3. **Calibrated Tooling:** Ensure the digital caliper has fresh batteries, is zeroed on closed jaws with consistent hand pressure, and has a valid calibration sticker.
4. **Individually Checkable Items:** Inspect each feature in sequence. Mark `[x]` upon satisfactory physical verification or `[FAIL]` with measured deviation.
5. **No Assumed Pass:** Do not mark items as passed based on slicer preview or CAD geometry. If a measurement cannot be taken, leave as `[ ] PENDING`.

---

## 3. Section 1: Raw 3D Print Quality & Visual Appearance

Inspect all six discrete 3D printed parts for surface anomalies, structural delamination, and print artifacts.

### 3.1 Main Electronics Chassis (`ComfortLoop_Main_Enclosure.stl`)
- [ ] **1.1.1 Bed Adhesion & Warping:** Base plate ($145 \times 142\text{ mm}$) is flat with zero corner lift or bowing (check with straightedge against glass plate: gap $< 0.3\text{ mm}$).
- [ ] **1.1.2 Layer Lamination:** Outer wall perimeter ($2.5\text{ mm}$) exhibits continuous interlayer fusion with zero visible cracks, layer separation, or under-extrusion.
- [ ] **1.1.3 Port Cutouts:** USB-C/micro-USB slot ($12 \times 7\text{ mm}$), DC jack barrel hole ($\varnothing 11.2\text{ mm}$), and 5x20mm fuse holder hole ($\varnothing 12.2\text{ mm}$) are fully open and free of drooping.
- [ ] **1.1.4 Clevis Lug Geometry:** Dual front clevis lugs are vertical, parallel, and exhibit no sagging or layer shear along the pivot axis.
- [ ] **1.1.5 Rear Fan Shelf:** Horizontal shelf ($60 \times 20\text{ mm}$, $4\text{ mm}$ thick) is planar, perpendicular to the rear wall, and properly supported during print.
- [ ] **1.1.6 Internal PCB Standoffs:** All 10 internal cylindrical standoffs (ESP32, Relay, INA219) are fully formed with clean central pilot bores for heat-set inserts.

### 3.2 Enclosure Cover Lid (`ComfortLoop_Enclosure_Cover.stl`)
- [ ] **1.2.1 Flatness:** Lid plate ($145 \times 100\text{ mm}$) is completely planar without concave or convex bowing (gap $< 0.25\text{ mm}$).
- [ ] **1.2.2 Perimeter Dust Lip:** $1.5\text{ mm}$ step lip around the bottom perimeter is sharp and continuous without curling.
- [ ] **1.2.3 Counterbore Holes:** 4x M3 corner fastener counterbores have clean flat shoulders for screw head seating.

### 3.3 120mm Aerodynamic Fan Duct (`ComfortLoop_Fan_Duct.stl`)
- [ ] **1.3.1 Bellmouth Surface Finish:** Smooth interior intake contour ($R=4.0\text{ mm}$) without steps, severe ringing, or stringing that could disrupt boundary layer airflow.
- [ ] **1.3.2 Throat Roundness:** Fan throat bore ($\varnothing 115\text{ mm}$) is circular with zero ovality ($< 0.3\text{ mm}$ diameter difference between perpendicular axes).
- [ ] **1.3.3 Mounting L-Foot:** Bottom horizontal mounting flange ($60 \times 20 \times 4\text{ mm}$) is perpendicular to the duct face and free of warpage.
- [ ] **1.3.4 Fan Mounting Flange:** 4x corner mounting pads with $105.0\text{ mm}$ hole pitch are flat and coplanar.

### 3.4 Concentric Safety Grille (`ComfortLoop_Fan_Grille.stl`)
- [ ] **1.4.1 Concentric Ring Fusion:** All 6 concentric rings and 4 radial support ribs are solidly fused without brittle cold joints or under-extruded segments.
- [ ] **1.4.2 Ring Roundness & Spacing:** No sag or eccentricity between rings; radial spacing is visibly uniform across all 4 quadrants.
- [ ] **1.4.3 Mounting Holes:** 4x through-holes at $105.0\text{ mm}$ pitch accept M4 screws freely without reaming.

### 3.5 HLK-LD2410 Radar Radome Pod (`ComfortLoop_Radar_Housing.stl`)
- [ ] **1.5.1 Radome Window Uniformity:** Forward RF window ($1.5\text{ mm}$ nominal wall) has consistent wall thickness and zero voids, bubbles, or localized density variations.
- [ ] **1.5.2 Trunnion Pivot Ears:** Lateral cylindrical pivot bosses ($\varnothing 8.0\text{ mm}$) are concentric and axial with the pivot borehole.
- [ ] **1.5.3 Sensor Cavity Fit:** Internal cavity ($20.0 \times 40.0 \times 10.0\text{ mm}$) is clean and permits the bare HLK-LD2410 module to slide in smoothly.

### 3.6 BME280 Thermal Snorkel Pod (`ComfortLoop_BME_Snorkel_Pod.stl`)
- [ ] **1.6.1 Mounting Flange Flatness:** Rear mating face of the snorkel flange is flat to ensure flush sealing against the chassis left wall.
- [ ] **1.6.2 Convective Vent Slits:** All vertical ventilation louvers ($1.5\text{ mm}$ wide) are cleanly bridged without drooping strands blocking airflow.
- [ ] **1.6.3 Internal Wire Conduit:** Cable passage channel ($6.0 \times 4.0\text{ mm}$) is clear through the full $15.0\text{ mm}$ standoff length.

---

## 4. Section 2: Critical Dimensional Metrology

Record measured physical dimensions using calibrated digital vernier calipers (minimum resolution $0.01\text{ mm}$). All dimensions in millimeters (mm).

| Item # | Part Name | Feature Description | Nominal CAD (mm) | Min Limit (mm) | Max Limit (mm) | Measured Value (mm) | Deviation (mm) | Status | Check |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **2.1** | Chassis | Outer Overall Width ($X$) | $145.00$ | $144.60$ | $145.40$ | `_______` | `_______` | `NOT TESTED` | [ ] |
| **2.2** | Chassis | Outer Electronics Depth ($Y$) | $100.00$ | $99.60$ | $100.40$ | `_______` | `_______` | `NOT TESTED` | [ ] |
| **2.3** | Chassis | Total Overall Depth incl. Shelf | $142.00$ | $141.60$ | $142.40$ | `_______` | `_______` | `NOT TESTED` | [ ] |
| **2.4** | Chassis | Chassis Overall Height ($Z$) | $39.00$ | $38.70$ | $39.30$ | `_______` | `_______` | `NOT TESTED` | [ ] |
| **2.5** | Chassis | Outer Wall Thickness | $2.50$ | $2.35$ | $2.65$ | `_______` | `_______` | `NOT TESTED` | [ ] |
| **2.6** | Chassis | Floor Base Thickness | $2.50$ | $2.35$ | $2.65$ | `_______` | `_______` | `NOT TESTED` | [ ] |
| **2.7** | Chassis | **Clevis Internal Gap** | **$27.00$** | **$26.85$** | **$27.25$** | `_______` | `_______` | `NOT TESTED` | [ ] |
| **2.8** | Chassis | Clevis Lug Individual Thickness | $3.00$ | $2.85$ | $3.15$ | `_______` | `_______` | `NOT TESTED` | [ ] |
| **2.9** | Chassis | Clevis Pivot Bore Diameter | $\varnothing 3.40$ | $\varnothing 3.25$ | $\varnothing 3.55$ | `_______` | `_______` | `NOT TESTED` | [ ] |
| **2.10**| Chassis | Rear Shelf Hole Pitch ($X$) | $40.00$ | $39.80$ | $40.20$ | `_______` | `_______` | `NOT TESTED` | [ ] |
| **2.11**| Chassis | Rear Shelf Thickness | $4.00$ | $3.85$ | $4.15$ | `_______` | `_______` | `NOT TESTED` | [ ] |
| **2.12**| Chassis | USB Port Cutout Width $\times$ Height | $12.0 \times 7.0$ | $11.7 \times 6.7$ | $12.3 \times 7.3$ | `_______` | `_______` | `NOT TESTED` | [ ] |
| **2.13**| Chassis | DC Barrel Jack Hole Diameter | $\varnothing 11.20$| $\varnothing 11.00$| $\varnothing 11.40$| `_______` | `_______` | `NOT TESTED` | [ ] |
| **2.14**| Chassis | Panel Fuse Holder Hole Diameter | $\varnothing 12.20$| $\varnothing 12.00$| $\varnothing 12.40$| `_______` | `_______` | `NOT TESTED` | [ ] |
| **2.15**| Cover Lid| Outer Width $\times$ Depth | $145.0 \times 100.0$| $144.6 \times 99.6$| $145.4 \times 100.4$| `_______` | `_______` | `NOT TESTED` | [ ] |
| **2.16**| Cover Lid| Main Plate Thickness | $2.00$ | $1.85$ | $2.15$ | `_______` | `_______` | `NOT TESTED` | [ ] |
| **2.17**| Cover Lid| Dust Lip Inset Step Width | $1.50$ | $1.35$ | $1.65$ | `_______` | `_______` | `NOT TESTED` | [ ] |
| **2.18**| Cover Lid| 4x M3 Fastener Pitch ($X \times Y$) | $135.0 \times 90.0$| $134.7 \times 89.7$| $135.3 \times 90.3$| `_______` | `_______` | `NOT TESTED` | [ ] |
| **2.19**| Fan Duct| Outer Frame Width $\times$ Height | $120.0 \times 120.0$| $119.5 \times 119.5$| $120.5 \times 120.5$| `_______` | `_______` | `NOT TESTED` | [ ] |
| **2.20**| Fan Duct| 4x Fan Mounting Hole Pitch | $105.00$ | $104.70$ | $105.30$ | `_______` | `_______` | `NOT TESTED` | [ ] |
| **2.21**| Fan Duct| Bellmouth Throat Diameter | $\varnothing 115.00$| $\varnothing 114.50$| $\varnothing 115.50$| `_______` | `_______` | `NOT TESTED` | [ ] |
| **2.22**| Fan Duct| Mounting Foot Hole Pitch ($X$) | $40.00$ | $39.80$ | $40.20$ | `_______` | `_______` | `NOT TESTED` | [ ] |
| **2.23**| Fan Duct| Mounting Foot Thickness | $4.00$ | $3.85$ | $4.15$ | `_______` | `_______` | `NOT TESTED` | [ ] |
| **2.24**| Grille | 4x Mounting Hole Pitch | $105.00$ | $104.70$ | $105.30$ | `_______` | `_______` | `NOT TESTED` | [ ] |
| **2.25**| Grille | Grille Outer Diameter | $\varnothing 121.00$| $\varnothing 120.50$| $\varnothing 121.50$| `_______` | `_______` | `NOT TESTED` | [ ] |
| **2.26**| Grille | Concentric Ring Radial Gap (Max) | $6.20$ | $5.90$ | $6.50$ | `_______` | `_______` | `NOT TESTED` | [ ] |
| **2.27**| Grille | Rib & Ring Axial Thickness | $2.50$ | $2.35$ | $2.65$ | `_______` | `_______` | `NOT TESTED` | [ ] |
| **2.28**| Radar Pod| **Trunnion Boss Outer Width** | **$26.60$** | **$26.40$** | **$26.75$** | `_______` | `_______` | `NOT TESTED` | [ ] |
| **2.29**| Radar Pod| Pivot Bore Hole Diameter | $\varnothing 3.40$ | $\varnothing 3.25$ | $\varnothing 3.55$ | `_______` | `_______` | `NOT TESTED` | [ ] |
| **2.30**| Radar Pod| Front Radome Face Thickness | $1.50$ | $1.35$ | $1.65$ | `_______` | `_______` | `NOT TESTED` | [ ] |
| **2.31**| Snorkel | Thermal Standoff Distance | $15.00$ | $14.70$ | $15.30$ | `_______` | `_______` | `NOT TESTED` | [ ] |
| **2.32**| Snorkel | Flange 2x M3 Hole Pitch | $26.00$ | $25.80$ | $26.20$ | `_______` | `_______` | `NOT TESTED` | [ ] |
| **2.33**| Snorkel | Internal Cable Passage Dimension | $6.0 \times 4.0$ | $5.7 \times 3.7$ | $6.3 \times 4.3$ | `_______` | `_______` | `NOT TESTED` | [ ] |

---

## 5. Section 3: Heat-Set Insert Installation Quality

ComfortLoop utilizes brass heat-set threaded inserts (ultrasonically or thermally installed via temperature-controlled soldering iron with dedicated insertion tip).

### 5.1 Installation Parameters & Equipment Setup
- [ ] **3.1.1 Temperature Setting:** Soldering iron calibrated to $220^\circ\text{C} - 240^\circ\text{C}$ for PETG (or $250^\circ\text{C}$ for ABS). Never exceed $260^\circ\text{C}$ to prevent thermal degradation of resin.
- [ ] **3.1.2 Alignment Tooling:** Vertical soldering press or guide rig used to ensure perpendicular insert travel (tilt $< 2^\circ$).

### 5.2 M3 Brass Heat-Set Inserts ($4.0\text{ mm}$ Outer Diameter $\times 5.0\text{ mm}$ Length)
Inspect all 14x M3 brass inserts across the chassis:
- **4x Cover Lid Bosses:** Corners of chassis upper rim ($X=\pm 67.5, Y=\pm 45.0$).
- **4x ESP32 DevKit Standoffs:** Internal floor bosses ($H=6.0\text{ mm}$).
- **4x Relay Module Standoffs:** Internal floor bosses ($H=6.0\text{ mm}$).
- **2x INA219 Power Monitor Standoffs:** Internal floor bosses ($H=6.0\text{ mm}$).

Checklist items for M3 inserts:
- [ ] **3.2.1 Flushness:** Insert top face sits flush with or slightly below ($0.0\text{ to } -0.15\text{ mm}$) the top surface of the plastic boss. No insert protrudes proud of the mating face.
- [ ] **3.2.2 Thread Cleanliness:** Internal threads are free of molten plastic flash. A clean M3 screw threads in by hand for at least 5 full turns without binding.
- [ ] **3.2.3 Boss Integrity:** Cylindrical plastic bosses show zero radial splitting, stress whitening, or localized bulge deformation after cooling.
- [ ] **3.2.4 Pull-Out Resistance Snug Test:** Each M3 insert tested with an M3 screw torqued hand-tight to $0.4\text{ N}\cdot\text{m}$. Verify zero axial pullout or rotational slippage in plastic.

### 5.3 M4 Brass Heat-Set Inserts ($5.6\text{ mm}$ Outer Diameter $\times 6.0\text{ mm}$ Length)
Inspect 2x M4 inserts installed in the rear mounting shelf:
- [ ] **3.3.1 Verticality:** Inserts pressed perfectly perpendicular ($90^\circ \pm 1.5^\circ$) to the shelf top surface.
- [ ] **3.3.2 Flush Seating:** Insert tops are flush with shelf surface ($Z=+39.0\text{ mm}$).
- [ ] **3.3.3 Shelf Underbelly Integrity:** Inspect bottom surface of shelf at $Z=+35.0\text{ mm}$. Confirm brass inserts did not break through or distort the bottom plastic face.
- [ ] **3.3.4 Torque Verification:** Thread an M4 screw into each shelf insert and torque to $0.8\text{ N}\cdot\text{m}$. Confirm firm grip without thread stripping or insert spinout.

---

## 6. Section 4: Mechanical Interface & Subassembly Inspection

### 4.1 Test 1 Interface: Clevis & Radar Pod Assembly
- [ ] **4.1.1 Physical Gap Calculation:**
  $$\text{Measured Clevis Gap } (D_{\text{clevis}}) - \text{Measured Trunnion Width } (W_{\text{trunnion}}) = \text{Total Clearance } (\Delta)$$
  - Expected: $27.00 - 26.60 = 0.40\text{ mm}$ total ($0.20\text{ mm}$ per side).
  - Measured: `______ mm` - `______ mm` = `______ mm`.
  - Acceptance criterion: $0.15\text{ mm} \le \Delta \le 0.50\text{ mm}$.
- [ ] **4.1.2 Free Swivel Range:** Pod rotates freely from $-25.0^\circ$ to $+20.0^\circ$ without friction binding against clevis lugs.
- [ ] **4.1.3 Nominal Angle Clearance:** At the nominal $-15.0^\circ$ tilt angle:
  - Clearance between radar pod top edge and enclosure front cover: `______ mm` (Nominal CAD: $2.26\text{ mm}$, Limit: $\ge 1.0\text{ mm}$).
  - Clearance between radar pod rear wall and chassis front face: `______ mm` (Nominal CAD: $1.84\text{ mm}$, Limit: $\ge 1.0\text{ mm}$).
- [ ] **4.1.4 Pivot Bolt Installation:** M3 $\times$ 35 mm socket head cap screw slides through both lugs and pod trunnion without forced hammering.
- [ ] **4.1.5 Nyloc Nut Engagement:** M3 Nyloc nut threads fully onto bolt with at least 1.5 threads protruding through nylon ring.
- [ ] **4.1.6 Pivot Frictional Retention:** Adjust Nyloc torque until pod holds position by friction without sagging under its own weight, yet can be manually re-aimed.

### 4.2 Test 2 Interface: Fan Grille Mechanical Fit
- [ ] **4.2.1 Hole Alignment:** 4x M4 mounting holes align with 120mm fan corner holes and duct flanges at $105.0\text{ mm}$ pitch.
- [ ] **4.2.2 Blade Sweep Clearance:** Grille inner surface does not touch rotating fan blade sweep plane (measured clearance $\ge 4.0\text{ mm}$).
- [ ] **4.2.3 Finger Probe Exclusion (Adult):** Test with $\varnothing 12.0\text{ mm}$ rod (IEC Test Probe B equivalent). Probe cannot penetrate any grille opening.
- [ ] **4.2.4 Child Probe Check (IEC Probe 19):** Test with $\varnothing 5.6\text{ mm}$ rod. Document probe penetration depth: `______ mm`. Verify probe does not touch fan blades.
- [ ] **4.2.5 Axial Rigidity:** Apply $20\text{ N}$ central axial load. Measure deflection: `______ mm` (Acceptance: deflection $< 3.0\text{ mm}$, zero contact with blades).

### 4.3 Test 3 Interface: Fan Duct & Rear Shelf Fastener Fit
- [ ] **4.3.1 Foot Seating:** Fan duct L-bracket foot sits flat against the shelf with zero visible gap or rocking across the $60\text{ mm}$ contact length.
- [ ] **4.3.2 Screw Length & Protrusion (Critical Safety Check):**
  - Fasteners used: M4 $\times$ 8 mm Socket Head Cap Screws.
  - Foot thickness: $4.0\text{ mm}$; Shelf thickness: $4.0\text{ mm}$; Total stack: $8.0\text{ mm}$.
  - Under-shelf inspection: Visually check and feel beneath the rear shelf. Confirm screw tip is completely flush or recessed ($Z_{\text{tip}} \ge +35.0\text{ mm}$).
  - **PROTRUSION BELOW CHASSIS BASE ($Z \le 0.0\text{ mm}$):** **ZERO ALLOWED.** Screw must NOT extend past the tabletop datum.
- [ ] **4.3.3 Fan Frame Attachment:** 120mm fan mounts securely to the duct face using 4x M4 $\times$ 30mm screws through corners.
- [ ] **4.3.4 Throat Blade Clearance:** Fan blades rotate freely with $> 1.5\text{ mm}$ radial tip clearance inside duct bellmouth. Zero rubbing or scraping.

### 4.4 Test 4 Interface: BME280 Snorkel Alignment & Thermal Isolation
- [ ] **4.4.1 Flange Seating:** Snorkel rear flange seats completely flush against the chassis left exterior wall.
- [ ] **4.4.2 Fastener Pitch:** 2x M3 mounting screws pass cleanly through snorkel flange into chassis inserts at $26.0\text{ mm}$ vertical pitch.
- [ ] **4.4.3 Wire Passage Alignment:** $6.0 \times 4.0\text{ mm}$ wire slot in snorkel perfectly matches the rectangular wall penetration in the chassis.
- [ ] **4.4.4 Wire Chafing Inspection:** 4-pin JST / Dupont jumper harness passes freely through wall into snorkel without sharp edge pinch or tension.
- [ ] **4.4.5 Sensor Air Exposure:** BME280 PCB sits securely in the vented pod chamber with sensor IC centered behind ventilation louvers.

### 4.5 Test 7 Interface: Enclosure Cover Lid Mating
- [ ] **4.5.1 Dust Lip Engagement:** Cover lid drops into chassis opening; $1.5\text{ mm}$ perimeter lip engages inner rebate smoothly without binding.
- [ ] **4.5.2 Flush Mating:** Cover sits flush with chassis top rim with $< 0.3\text{ mm}$ step height mismatch across all 4 edges.
- [ ] **4.5.3 Screw Fastening:** 4x M3 $\times$ 8 mm flat head / button head screws engage corner inserts cleanly; torqued hand-snug ($0.3\text{ N}\cdot\text{m}$).
- [ ] **4.5.4 Removal Repeatability:** Remove and reinstall cover lid 5 times. Verify zero cracking of corner bosses or stripping of brass inserts.

---

## 7. Section 5: Internal Packaging, Cable Routing & Fasteners

### 5.1 Internal Component Clearances & Fastening
- [ ] **5.1.1 ESP32 DevKit V1:** Secured to 4x standoffs with M3 $\times$ 6 mm button head screws. Micro-USB / USB-C port aligns with chassis cutout ($< 0.5\text{ mm}$ offset).
- [ ] **5.1.2 5V Optocoupled Relay:** Mounted on 4x standoffs with M3 $\times$ 6 mm screws. Screw terminals face toward internal wiring trench.
- [ ] **5.1.3 TI INA219 Power Monitor:** Mounted on 2x standoffs with M3 $\times$ 6 mm screws. Shunt resistor and terminal block accessible.
- [ ] **5.1.4 DC Barrel Jack (5.5 / 2.1mm):** Panel mount jack inserted into rear $\varnothing 11.2\text{ mm}$ port and secured with hex locknut.
- [ ] **5.1.5 Inline 5x20mm Fuse Holder:** Panel mount fuse holder installed into rear $\varnothing 12.2\text{ mm}$ port; screw cap accessible from rear exterior.

### 5.2 Wire Harness Routing & Strain Relief
- [ ] **5.2.1 Fan 4-Pin Cable:** Routed from fan hub through rear chassis notch to ESP32 (PWM Pin 18, Tach Pin 19) and INA219 / 12V rail. Wire slack allows fan removal.
- [ ] **5.2.2 Radar 4-Pin Cable:** 28 AWG flexible ribbon routed through front clevis wire port into radar housing. Full $\pm 20^\circ$ rotation verified without wire stretching or pinch.
- [ ] **5.2.3 BME280 4-Pin Cable:** I2C lines (SDA Pin 21, SCL Pin 22, 3.3V, GND) routed through left wall cutout. No sharp-edge contact.
- [ ] **5.2.4 Internal Bend Radii:** All internal wire harnesses maintain a minimum bend radius $\ge 10\text{ mm}$ (no sharp $90^\circ$ kinks).
- [ ] **5.2.5 High-Current Isolation:** 12V power distribution wiring ($18 - 20\text{ AWG}$) physically separated from sensitive 3.3V I2C/UART sensor signal lines by at least $15\text{ mm}$.

---

## 8. Section 6: Tabletop Flatness & Complete Assembly Stability

Place the fully assembled, weighted ComfortLoop unit on a Grade B granite surface plate or flat precision reference table.

- [ ] **6.1 4-Point Coplanarity (Rocking Test):** Press alternating diagonal corners of the chassis with index finger.
  - Rocking observed: `[ ] YES / [ ] NO`
  - Maximum feeler gauge leaf inserted under any lifted corner: `______ mm` (Acceptance: $< 0.35\text{ mm}$).
- [ ] **6.2 Rubber Bumper Foot Installation:** 4x silicone / neoprene non-slip adhesive feet installed in designated corner recesses. Confirm rock-free tabletop contact.
- [ ] **6.3 System Weight Measurement:**
  - Total assembled dry weight (calibrated digital scale): `______ grams` (Target estimate: $580 - 650\text{ g}$).
- [ ] **6.4 Center of Mass & Dynamic Stability:**
  - Fan operating at 0 RPM: Unit is stable, cannot be tipped by a $5\text{ N}$ lateral push.
  - Fan operating at 1,000 RPM: Zero creeping, walking, or chassis vibration chatter on smooth wooden desk.
  - Fan operating at 1,500 RPM: Chassis remains stationary; rubber feet isolate motor harmonics.
  - Fan operating at 2,000 RPM (Max Speed): Unit remains completely stable; zero lateral drift or acoustic rattling.
- [ ] **6.5 Tabletop Surface Clearance:** Inspect underside with optical borelight while seated on table. Confirm zero mechanical fastener touches table surface.

---

## 9. Section 7: First Article Inspection Summary & Sign-Off

### 9.1 Metric Summary
- **Total Inspection Points:** 68
- **Passed Points:** `______`
- **Failed Points:** `______`
- **Pending Measurement:** `______`

### 9.2 Non-Conformance Log & Deviation Notes
| Item # | Description of Non-Conformance / Tolerance Breach | Root Cause (Print / Slicer / CAD) | Corrective Action Required |
| :---: | :--- | :--- | :--- |
| `____` | `_______________________________________________` | `_____________________________` | `_____________________________` |
| `____` | `_______________________________________________` | `_____________________________` | `_____________________________` |
| `____` | `_______________________________________________` | `_____________________________` | `_____________________________` |

### 9.3 First Article Disposition
- [ ] **ACCEPTED:** All critical dimensions, interfaces, and safety clearances comply with specification. Approved for first-article functional assembly.
- [ ] **CONDITIONAL ACCEPTANCE:** Minor non-critical cosmetic or reworkable deviations observed (e.g., hole reaming or deburring required). Functional assembly permitted under engineering supervision.
- [ ] **REJECTED (REPRINT REQUIRED):** Critical failure detected (e.g., clevis binding, fastener protrusion below base, chassis warping $> 0.5\text{ mm}$). Slicer compensation / CAD adjustment required before reprinting.

---

**Lead Hardware Validation Engineer Signature:**  
`___________________________________________`  
**Date:** `____________________`

