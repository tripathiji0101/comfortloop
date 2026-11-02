"""
ComfortLoop CAD — Phase 2/4 Component Validation
Tests that every component and part module generates a valid, non-zero-volume solid.

Run:
    .venv/bin/python cad/tests/test_components.py
"""

import os
import sys
import traceback

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)


def run_tests():
    import cadquery as cq

    results = []

    # ---- Components (reference hardware models) ----
    component_tests = [
        ("ESP32 DevKit",   "cad.components.esp32",   "create_esp32"),
        ("LD2410 Radar",   "cad.components.ld2410",  "create_ld2410"),
        ("BME280 Sensor",  "cad.components.bme280",  "create_bme280"),
        ("INA219 Monitor", "cad.components.ina219",  "create_ina219"),
        ("Relay Module",   "cad.components.relay",   "create_relay"),
        ("120mm Fan",      "cad.components.fan120",  "create_fan120"),
    ]

    # ---- Parts (enclosure / manufactured parts) ----
    part_tests = [
        ("Main Enclosure",   "cad.parts.main_enclosure",  "create_main_enclosure"),
        ("Enclosure Cover",  "cad.parts.enclosure_cover",  "create_enclosure_cover"),
        ("Radar Housing",    "cad.parts.radar_housing",    "create_radar_housing"),
        ("BME Snorkel Pod",  "cad.parts.bme_snorkel",      "create_bme_snorkel"),
        ("Fan Duct",         "cad.parts.fan_duct",         "create_fan_duct"),
        ("Fan Grille",       "cad.parts.fan_grille",       "create_fan_grille"),
    ]

    for label, module_path, func_name in component_tests + part_tests:
        try:
            mod = __import__(module_path, fromlist=[func_name])
            fn = getattr(mod, func_name)
            solid = fn()

            # Check it produced something
            if solid is None:
                results.append((label, "FAIL", "Returned None"))
                continue

            # Get the underlying solid and check volume
            val = solid.val()
            vol = val.Volume()
            is_valid = val.isValid()

            if not is_valid:
                results.append((label, "FAIL", f"Solid invalid, volume={vol:.1f}"))
            elif vol <= 0:
                results.append((label, "FAIL", f"Zero or negative volume: {vol:.1f}"))
            else:
                # Get bounding box for dimension sanity check
                bb = val.BoundingBox()
                dims = f"{bb.xlen:.1f}×{bb.ylen:.1f}×{bb.zlen:.1f} mm"
                results.append((label, "PASS", f"Vol={vol:.0f} mm³, BBox={dims}"))

        except Exception as e:
            tb = traceback.format_exc().strip().split("\n")[-1]
            results.append((label, "FAIL", tb))

    # Report
    print()
    print("=" * 78)
    print("  COMFORTLOOP CAD — COMPONENT & PART VALIDATION REPORT")
    print("=" * 78)
    all_pass = True
    for name, status, detail in results:
        mark = "✓" if status == "PASS" else "✗"
        print(f"  {mark} {name:.<30s} {status:>4s}  {detail}")
        if status != "PASS":
            all_pass = False
    print("-" * 78)
    print(f"  VERDICT: {'ALL TESTS PASSED' if all_pass else 'SOME TESTS FAILED'}")
    print(f"  Passed: {sum(1 for r in results if r[1]=='PASS')}/{len(results)}")
    print("=" * 78)
    print()
    return all_pass


if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)

