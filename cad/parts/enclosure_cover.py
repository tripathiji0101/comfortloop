"""
ComfortLoop - Enclosure Cover CAD Model
Removable top service lid with flush M3 fastener recesses, interlocking lip,
and optical status LED aperture.
"""

import cadquery as cq
from cad.config import CONFIG, M3_CLEARANCE_HOLE, M3_HEAD_DIAMETER, TOLERANCE_SLOT


def create_enclosure_cover(cfg=CONFIG) -> cq.Workplane:
    """
    Generates the precision enclosure cover lid.
    Origin (0, 0, 0) is at the center of the bottom mating plane (Z=0).
    Cover plate extends upwards from Z=0 to Z=cover_thickness.
    Interlocking alignment rim extends downwards from Z=0 to Z=-1.5.
    """
    ext_w = cfg.exterior_width       # 145.0 mm
    ext_l = cfg.exterior_length      # 100.0 mm
    cov_t = cfg.cover_thickness      # 2.0 mm
    int_w = cfg.interior_width       # 140.0 mm
    int_l = cfg.interior_length      # 95.0 mm

    # 1. Main Cover Plate
    lid = (
        cq.Workplane("XY")
        .box(ext_w, ext_l, cov_t, centered=(True, True, False))
        .edges("|Z")
        .fillet(3.0)
    )

    # 2. Chamfer top external edge for ergonomic tactile finish
    lid = lid.faces(">Z").chamfer(0.8)

    # 3. Interlocking Sealing Rim (underneath lid, into cavity)
    lip_w = int_w - (2 * TOLERANCE_SLOT)
    lip_l = int_l - (2 * TOLERANCE_SLOT)
    lip_h = 1.5
    lip_t = 1.5

    outer_lip = (
        cq.Workplane("XY")
        .transformed(offset=cq.Vector(0, 0, -lip_h))
        .box(lip_w, lip_l, lip_h, centered=(True, True, False))
        .edges("|Z")
        .fillet(1.0)
    )
    inner_lip_void = (
        cq.Workplane("XY")
        .transformed(offset=cq.Vector(0, 0, -lip_h - 0.1))
        .box(lip_w - (2 * lip_t), lip_l - (2 * lip_t), lip_h + 0.2, centered=(True, True, False))
    )
    rim = outer_lip.cut(inner_lip_void)
    lid = lid.union(rim)

    # 4. Four M3 Counterbored Screw Holes (Matching Corner Standoffs)
    corner_x = (int_w / 2.0) - 4.5
    corner_y = (int_l / 2.0) - 4.5
    corner_pts = [
        (-corner_x, -corner_y),
        (corner_x, -corner_y),
        (-corner_x, corner_y),
        (corner_x, corner_y),
    ]

    lid = (
        lid.faces(">Z")
        .workplane()
        .pushPoints(corner_pts)
        .cboreHole(M3_CLEARANCE_HOLE, M3_HEAD_DIAMETER + 0.6, 1.4)
    )

    # 5. Status LED Viewing Aperture (over ESP32 status LED indicator)
    esp_cx, esp_cy = -35.0, -15.0
    led_x = esp_cx + 4.0
    led_y = esp_cy + 8.0
    lid = (
        lid.faces(">Z")
        .workplane()
        .pushPoints([(led_x, led_y)])
        .hole(3.0)
    )

    return lid


def create_enclosure_cover_cutaway(cfg=CONFIG) -> cq.Workplane:
    """
    Generates a sectioned cover lid with the front-right quadrant cut away.
    """
    lid = create_enclosure_cover(cfg)
    ext_w = cfg.exterior_width
    ext_l = cfg.exterior_length
    cut_box = (
        cq.Workplane("XY")
        .transformed(offset=cq.Vector(ext_w / 4.0, -ext_l / 4.0, 0.0))
        .box(ext_w / 2.0 + 5.0, ext_l / 2.0 + 5.0, 10.0, centered=(True, True, True))
    )
    return lid.cut(cut_box)


if __name__ == "__main__":
    result = create_enclosure_cover()
    cutaway = create_enclosure_cover_cutaway()

