"""
ComfortLoop - LD2410 mmWave Radar Housing CAD Model (Redesigned)
Aimable, low-dielectric-loss radome pod for 24GHz FMCW human presence radar.
Features 1.5mm calibrated RF window, 3.5mm antenna standoff, lateral swivel trunnion ears,
and bottom cable exit slot.
"""

import cadquery as cq
from cad.config import CONFIG, TOLERANCE_SLOT


def create_radar_housing(cfg=CONFIG.radar) -> cq.Workplane:
    """
    Generates the RF-optimized LD2410 radar sensor pod.
    Origin (0, 0, 0) is at the center of the outer radome front face.
    Pod extends in +Z direction (depth).
    Features lateral trunnion ears on +/-X with an M3 pivot axle through-hole at Y=0, Z=total_depth/2.
    """
    radome_t = cfg.radome_wall_thickness   # 1.5 mm
    int_w = cfg.width + (2 * TOLERANCE_SLOT) # 16.6 mm
    int_l = cfg.length + (2 * TOLERANCE_SLOT) # 38.6 mm
    standoff = cfg.radome_standoff          # 3.5 mm airgap
    pcb_t = cfg.pcb_thickness               # 1.2 mm
    rear_clearance = 6.0                    # clearance for header pins and solder joints
    int_depth = standoff + pcb_t + rear_clearance # 10.7 mm

    wall = 2.0
    ext_w = int_w + (2 * wall)              # 20.6 mm
    ext_l = int_l + (2 * wall)              # 42.6 mm
    total_depth = radome_t + int_depth      # 12.2 mm

    # 1. Outer Pod Body (centered in XY, Z in [0, total_depth])
    pod = (
        cq.Workplane("XY")
        .box(ext_w, ext_l, total_depth, centered=(True, True, False))
        .edges("|Z")
        .fillet(2.5)
    )

    # 2. Hollow out internal chamber from the back, preserving 1.5mm front radome window
    chamber = (
        cq.Workplane("XY")
        .transformed(offset=cq.Vector(0, 0, radome_t))
        .box(int_w, int_l, int_depth + 1.0, centered=(True, True, False))
        .edges("|Z")
        .fillet(1.0)
    )
    pod = pod.cut(chamber)

    # 3. PCB Retaining Side Rails & Antenna Airgap Standoff
    rail_stop = (
        cq.Workplane("XY")
        .transformed(offset=cq.Vector(0, 0, radome_t))
        .box(int_w - 2.0, int_l, standoff, centered=(True, True, False))
    )
    antenna_void = (
        cq.Workplane("XY")
        .transformed(offset=cq.Vector(0, (int_l / 2.0) - 10.0, radome_t - 0.1))
        .box(cfg.antenna_area_width + 1.0, cfg.antenna_area_length + 2.0, standoff + 0.2, centered=(True, True, False))
    )
    antenna_airgap = rail_stop.cut(antenna_void)
    pod = pod.union(antenna_airgap)

    # 4. Lateral Swivel Trunnion Ears on +/- X sides
    ear_w = 3.0
    ear_dia = 9.0
    pivot_z = total_depth / 2.0

    ear_l = (
        cq.Workplane("XY")
        .transformed(offset=cq.Vector(-(ext_w / 2.0) - (ear_w / 2.0), 0, pivot_z), rotate=cq.Vector(0, 90, 0))
        .cylinder(ear_w, ear_dia / 2.0, centered=(True, True, True))
    )
    ear_r = (
        cq.Workplane("XY")
        .transformed(offset=cq.Vector((ext_w / 2.0) + (ear_w / 2.0), 0, pivot_z), rotate=cq.Vector(0, 90, 0))
        .cylinder(ear_w, ear_dia / 2.0, centered=(True, True, True))
    )
    pod = pod.union(ear_l).union(ear_r)

    # Pivot Through-Hole across both ears (3.2mm for M3 axle screw)
    pivot_hole = (
        cq.Workplane("XY")
        .transformed(offset=cq.Vector(0, 0, pivot_z), rotate=cq.Vector(0, 90, 0))
        .cylinder(ext_w + (2 * ear_w) + 2.0, 1.6, centered=(True, True, True))
    )
    pod = pod.cut(pivot_hole)

    # 5. Rear Cable Exit Slot (at bottom edge Y = -ext_l/2)
    cable_slot = (
        cq.Workplane("XY")
        .transformed(offset=cq.Vector(0, -(ext_l / 2.0), total_depth - 3.0))
        .box(10.0, 10.0, 6.0, centered=(True, True, True))
    )
    pod = pod.cut(cable_slot)

    return pod


if __name__ == "__main__":
    result = create_radar_housing()
