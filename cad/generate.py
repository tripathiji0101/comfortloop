"""
ComfortLoop CAD — Master Generation & Export Pipeline (Redesigned)
Generates all individual mechanical parts, reference hardware components, fasteners,
and master multi-body assemblies.
Exports production-grade STEP (for CAD/CNC) and STL (for 3D printing & Three.js visualization).
"""

import os
import sys
import time
import shutil

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

import cadquery as cq
from cad.config import CONFIG
from cad.parts.main_enclosure import create_main_enclosure, create_main_enclosure_cutaway
from cad.parts.enclosure_cover import create_enclosure_cover, create_enclosure_cover_cutaway
from cad.parts.radar_housing import create_radar_housing
from cad.parts.bme_snorkel import create_bme_snorkel
from cad.parts.fan_duct import create_fan_duct
from cad.parts.fan_grille import create_fan_grille

from cad.components.esp32 import create_esp32
from cad.components.ina219 import create_ina219
from cad.components.relay import create_relay
from cad.components.ld2410 import create_ld2410
from cad.components.bme280 import create_bme280
from cad.components.fan120 import create_fan120
from cad.components.fasteners import create_m3_screw, create_m4_screw
from cad.assembly import build_comfortloop_assembly

STEP_DIR = os.path.join(PROJECT_ROOT, "exports", "step")
STL_DIR = os.path.join(PROJECT_ROOT, "exports", "stl")
PUBLIC_CAD_DIR = os.path.join(PROJECT_ROOT, "public", "cad")
PUBLIC_STEP_DIR = os.path.join(PUBLIC_CAD_DIR, "step")


def export_item(name, solid, step_dir=STEP_DIR, stl_dir=STL_DIR):
    """Exports a single solid/workplane as both STEP and STL."""
    os.makedirs(step_dir, exist_ok=True)
    os.makedirs(stl_dir, exist_ok=True)

    step_path = os.path.join(step_dir, f"ComfortLoop_{name}.step")
    stl_path = os.path.join(stl_dir, f"ComfortLoop_{name}.stl")

    cq.exporters.export(solid, step_path, cq.exporters.ExportTypes.STEP)
    cq.exporters.export(
        solid, stl_path, cq.exporters.ExportTypes.STL,
        tolerance=0.04, angularTolerance=0.08,
    )

    step_kb = os.path.getsize(step_path) / 1024
    stl_kb = os.path.getsize(stl_path) / 1024
    print(f"  ✓ {name:.<38s} STEP={step_kb:>7.1f} KB   STL={stl_kb:>7.1f} KB")
    return step_path, stl_path


def main():
    t0 = time.time()
    print()
    print("=" * 76)
    print("  COMFORTLOOP CAD — COMPREHENSIVE GENERATION & EXPORT PIPELINE")
    print("=" * 76)
    print()

    # 1. Printable Mechanical Parts
    print("[1/4] Generating Printable Mechanical Parts & Cutaway Enclosures...")
    mechanical_parts = [
        ("Main_Enclosure",         create_main_enclosure),
        ("Main_Enclosure_Cutaway", create_main_enclosure_cutaway),
        ("Enclosure_Cover",        create_enclosure_cover),
        ("Enclosure_Cover_Cutaway", create_enclosure_cover_cutaway),
        ("Radar_Housing",          create_radar_housing),
        ("BME_Snorkel_Pod",        create_bme_snorkel),
        ("Fan_Duct",               create_fan_duct),
        ("Fan_Grille",             create_fan_grille),
    ]

    for name, factory in mechanical_parts:
        solid = factory()
        export_item(name, solid)

    # 2. Reference Hardware Components & Fasteners
    print()
    print("[2/4] Generating Hardware Components & Standard Fasteners...")
    hardware_components = [
        ("ESP32_DevKit",           create_esp32),
        ("INA219_Sensor",          create_ina219),
        ("Relay_Module",           create_relay),
        ("LD2410_Sensor",          create_ld2410),
        ("BME280_Sensor",          create_bme280),
        ("Fan120_BLDC",            create_fan120),
        ("M3_Screw",               lambda: create_m3_screw(10.0)),
        ("M4_Screw",               lambda: create_m4_screw(12.0)),
    ]

    for name, factory in hardware_components:
        solid = factory()
        export_item(name, solid)

    # 3. Master Multi-Body Assemblies
    print()
    print("[3/4] Building Multi-Body Assemblies (Assembled, Exploded, Cutaway)...")
    
    # A. Assembled View
    assy = build_comfortloop_assembly(exploded=False, cutaway=False)
    assy_path = os.path.join(STEP_DIR, "ComfortLoop_Assembly.step")
    assy.save(assy_path)
    print(f"  ✓ Master Assembled STEP..............  {os.path.getsize(assy_path)/1024:.1f} KB")

    # B. Exploded View
    exp_assy = build_comfortloop_assembly(exploded=True, cutaway=False)
    exp_path = os.path.join(STEP_DIR, "ComfortLoop_Assembly_Exploded.step")
    exp_assy.save(exp_path)
    print(f"  ✓ Master Exploded STEP...............  {os.path.getsize(exp_path)/1024:.1f} KB")

    # C. Cutaway View
    cut_assy = build_comfortloop_assembly(exploded=False, cutaway=True)
    cut_path = os.path.join(STEP_DIR, "ComfortLoop_Assembly_Cutaway.step")
    cut_assy.save(cut_path)
    print(f"  ✓ Master Cutaway STEP................  {os.path.getsize(cut_path)/1024:.1f} KB")

    # 4. Synchronize all web assets to public/cad
    print()
    print("[4/4] Synchronizing high-fidelity assets to public/cad for Three.js...")
    os.makedirs(PUBLIC_CAD_DIR, exist_ok=True)
    os.makedirs(PUBLIC_STEP_DIR, exist_ok=True)

    copied_stl = 0
    for f in os.listdir(STL_DIR):
        if f.endswith(".stl"):
            shutil.copy2(os.path.join(STL_DIR, f), os.path.join(PUBLIC_CAD_DIR, f))
            copied_stl += 1

    copied_step = 0
    for f in os.listdir(STEP_DIR):
        if f.endswith(".step"):
            shutil.copy2(os.path.join(STEP_DIR, f), os.path.join(PUBLIC_STEP_DIR, f))
            copied_step += 1

    print(f"  ✓ Synchronized {copied_stl} STL meshes to {PUBLIC_CAD_DIR}")
    print(f"  ✓ Synchronized {copied_step} STEP CAD models to {PUBLIC_STEP_DIR}")

    elapsed = time.time() - t0
    print()
    print("-" * 76)
    print(f"  PIPELINE COMPLETED in {elapsed:.1f} seconds")
    print(f"  STEP Directory:   {STEP_DIR}")
    print(f"  STL Directory:    {STL_DIR}")
    print(f"  Web 3D Assets:    {PUBLIC_CAD_DIR}")
    print("=" * 76)
    print()


if __name__ == "__main__":
    main()
