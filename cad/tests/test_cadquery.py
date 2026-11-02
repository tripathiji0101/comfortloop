"""
ComfortLoop CAD — Phase 1 Validation Test
Generates a 20×20×20 mm test cube, exports STEP and STL,
re-imports the STEP, and validates geometry round-trip integrity.

Expected cube volume: 8000 mm³

Run:
    .venv/bin/python cad/tests/test_cadquery.py
"""

import os
import sys
import math

# Ensure the project root is on sys.path so 'cad' package resolves
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

EXPORT_DIR = os.path.join(PROJECT_ROOT, "exports", "test")
EXPECTED_VOLUME = 8000.0  # 20 * 20 * 20 mm³
VOLUME_TOLERANCE = 1.0    # acceptable deviation in mm³


def run_test():
    results = []

    # -----------------------------------------------------------
    # 1. Import CadQuery
    # -----------------------------------------------------------
    try:
        import cadquery as cq
        results.append(("Import CadQuery", "PASS", f"Version {cq.__version__}"))
    except Exception as e:
        results.append(("Import CadQuery", "FAIL", str(e)))
        _report(results)
        return False

    # -----------------------------------------------------------
    # 2. Generate a 20×20×20 mm cube
    # -----------------------------------------------------------
    try:
        cube = cq.Workplane("XY").box(20, 20, 20)
        assert cube is not None
        results.append(("Generate cube", "PASS", "20×20×20 mm solid created"))
    except Exception as e:
        results.append(("Generate cube", "FAIL", str(e)))
        _report(results)
        return False

    # -----------------------------------------------------------
    # 3. Calculate volume
    # -----------------------------------------------------------
    try:
        vol = cube.val().Volume()
        vol_ok = math.isclose(vol, EXPECTED_VOLUME, abs_tol=VOLUME_TOLERANCE)
        status = "PASS" if vol_ok else "FAIL"
        results.append(("Volume check", status, f"{vol:.2f} mm³ (expected {EXPECTED_VOLUME})"))
        if not vol_ok:
            _report(results)
            return False
    except Exception as e:
        results.append(("Volume check", "FAIL", str(e)))
        _report(results)
        return False

    # -----------------------------------------------------------
    # 4. Export STEP
    # -----------------------------------------------------------
    step_path = os.path.join(EXPORT_DIR, "test_cube.step")
    try:
        os.makedirs(EXPORT_DIR, exist_ok=True)
        cq.exporters.export(cube, step_path, cq.exporters.ExportTypes.STEP)
        assert os.path.isfile(step_path) and os.path.getsize(step_path) > 0
        results.append(("Export STEP", "PASS", f"{os.path.getsize(step_path)} bytes"))
    except Exception as e:
        results.append(("Export STEP", "FAIL", str(e)))
        _report(results)
        return False

    # -----------------------------------------------------------
    # 5. Export STL
    # -----------------------------------------------------------
    stl_path = os.path.join(EXPORT_DIR, "test_cube.stl")
    try:
        cq.exporters.export(cube, stl_path, cq.exporters.ExportTypes.STL)
        assert os.path.isfile(stl_path) and os.path.getsize(stl_path) > 0
        results.append(("Export STL", "PASS", f"{os.path.getsize(stl_path)} bytes"))
    except Exception as e:
        results.append(("Export STL", "FAIL", str(e)))
        _report(results)
        return False

    # -----------------------------------------------------------
    # 6. Verify both files exist and are non-empty (already done above)
    # -----------------------------------------------------------
    results.append(("Files non-empty", "PASS", f"STEP={os.path.getsize(step_path)}B, STL={os.path.getsize(stl_path)}B"))

    # -----------------------------------------------------------
    # 7. Re-import the STEP file
    # -----------------------------------------------------------
    try:
        reimported = cq.importers.importStep(step_path)
        assert reimported is not None
        results.append(("Re-import STEP", "PASS", "Geometry loaded"))
    except Exception as e:
        results.append(("Re-import STEP", "FAIL", str(e)))
        _report(results)
        return False

    # -----------------------------------------------------------
    # 8. Validate re-imported geometry
    # -----------------------------------------------------------
    try:
        reimported_solid = reimported.val()
        assert reimported_solid.isValid()
        results.append(("Re-imported valid", "PASS", "Solid is valid"))
    except Exception as e:
        results.append(("Re-imported valid", "FAIL", str(e)))
        _report(results)
        return False

    # -----------------------------------------------------------
    # 9. Compare original and re-imported volumes
    # -----------------------------------------------------------
    try:
        reimported_vol = reimported_solid.Volume()
        vol_match = math.isclose(vol, reimported_vol, abs_tol=VOLUME_TOLERANCE)
        status = "PASS" if vol_match else "FAIL"
        results.append(("Volume round-trip", status,
                         f"Original={vol:.2f}, Re-imported={reimported_vol:.2f}"))
    except Exception as e:
        results.append(("Volume round-trip", "FAIL", str(e)))

    _report(results)
    return all(r[1] == "PASS" for r in results)


def _report(results):
    print()
    print("=" * 70)
    print("  COMFORTLOOP CAD — PHASE 1 VALIDATION REPORT")
    print("=" * 70)
    all_pass = True
    for name, status, detail in results:
        mark = "✓" if status == "PASS" else "✗"
        print(f"  {mark} {name:.<35s} {status:>4s}  {detail}")
        if status != "PASS":
            all_pass = False
    print("-" * 70)
    verdict = "ALL TESTS PASSED" if all_pass else "SOME TESTS FAILED"
    print(f"  VERDICT: {verdict}")
    print("=" * 70)
    print()


if __name__ == "__main__":
    success = run_test()
    sys.exit(0 if success else 1)

