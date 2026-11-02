"""
ComfortLoop - CAD Exporter & Mesh Generation Pipeline
Automates exporting production-grade STEP (for CNC/Tooling), STL (for FDM 3D Printing),
and web-optimized 3D mesh assets for the Three.js interactive viewer.
"""

import os
import shutil
import cadquery as cq
from cad.config import CONFIG
from cad.parts.main_enclosure import create_main_enclosure
from cad.parts.enclosure_cover import create_enclosure_cover
from cad.parts.radar_housing import create_radar_housing
from cad.parts.bme_snorkel import create_bme_snorkel
from cad.parts.fan_duct import create_fan_duct
from cad.parts.fan_grille import create_fan_grille
from cad.assembly import build_comfortloop_assembly


EXPORT_DIR = "cad/exports"
PUBLIC_CAD_DIR = "public/cad"


def run_export_pipeline():
    """Executes the complete CAD export and mesh conversion workflow."""
    os.makedirs(EXPORT_DIR, exist_ok=True)
    os.makedirs(PUBLIC_CAD_DIR, exist_ok=True)

    print("=================================================================")
    print("      COMFORTLOOP PARAMETRIC CAD EXPORT PIPELINE                 ")
    print("=================================================================")

    parts = [
        ("main_enclosure", create_main_enclosure()),
        ("enclosure_cover", create_enclosure_cover()),
        ("radar_housing", create_radar_housing()),
        ("bme_snorkel", create_bme_snorkel()),
        ("fan_duct", create_fan_duct()),
        ("fan_grille", create_fan_grille()),
    ]

    for name, solid in parts:
        step_path = os.path.join(EXPORT_DIR, f"{name}.step")
        stl_path = os.path.join(EXPORT_DIR, f"{name}.stl")
        pub_stl_path = os.path.join(PUBLIC_CAD_DIR, f"{name}.stl")

        print(f"[EXPORT] Processing part: {name}...")

        # 1. Export STEP (Standard for the Exchange of Product model data - ISO 10303-21)
        cq.exporters.export(solid, step_path, cq.exporters.ExportTypes.STEP)
        print(f"  --> STEP: {step_path} ({os.path.getsize(step_path) / 1024:.1f} KB)")

        # 2. Export high-resolution STL (stereolithography) for 3D printing
        # linear deflection 0.05mm, angular deflection 0.1 rad for smooth curves
        cq.exporters.export(
            solid,
            stl_path,
            cq.exporters.ExportTypes.STL,
            tolerance=0.05,
            angularTolerance=0.1
        )
        print(f"  --> STL:  {stl_path} ({os.path.getsize(stl_path) / 1024:.1f} KB)")

        # Copy STL to public folder for Three.js client viewer
        shutil.copy2(stl_path, pub_stl_path)

    # 3. Export System Assemblies
    print("[EXPORT] Building Master System Assemblies...")
    nom_assy = build_comfortloop_assembly(exploded=False)
    nom_step = os.path.join(EXPORT_DIR, "comfortloop_assembly.step")
    nom_assy.save(nom_step)
    print(f"  --> Assembly STEP: {nom_step} ({os.path.getsize(nom_step) / 1024:.1f} KB)")

    exp_assy = build_comfortloop_assembly(exploded=True)
    exp_step = os.path.join(EXPORT_DIR, "comfortloop_exploded.step")
    exp_assy.save(exp_step)
    print(f"  --> Exploded STEP: {exp_step} ({os.path.getsize(exp_step) / 1024:.1f} KB)")

    print("=================================================================")
    print("  ALL CAD EXPORTS COMPLETED SUCCESSFULLY!")
    print("=================================================================")


if __name__ == "__main__":
    run_export_pipeline()

