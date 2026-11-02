"""
ComfortLoop - 120mm Fan Bracket & Aerodynamic Bellmouth Duct CAD Model (Redesigned)
Features acoustic bellmouth velocity inlet (4.0mm radius), anti-vibration M4 corner lugs,
and an integrated horizontal L-bracket mounting foot that bolts directly to the enclosure rear shelf.
"""

import cadquery as cq
from cad.config import CONFIG


def create_fan_duct(cfg=CONFIG.fan) -> cq.Workplane:
    """
    Generates the aerodynamic 120mm fan duct and mounting bracket.
    Origin (0, 0, 0) is at the center of the fan intake mating face.
    Duct extends in +Z direction (intake horn).
    Bottom edge features an L-bracket horizontal foot that bolts directly to the
    main enclosure rear mounting shelf with 2x M4 screws.
    """
    fw = cfg.frame_width            # 120.0 mm
    hp = cfg.mount_hole_pitch / 2.0 # 52.5 mm
    hd = cfg.mount_hole_dia         # 4.3 mm (M4 clearance)
    throat_dia = cfg.blade_sweep_dia # 113.0 mm
    bell_r = cfg.bellmouth_radius   # 4.0 mm
    flange_t = 3.5                  # Flange thickness
    duct_depth = 12.0               # Total duct projection

    # 1. Base Mounting Flange (120x120mm with rounded corners)
    flange = (
        cq.Workplane("XY")
        .box(fw, fw, flange_t, centered=(True, True, False))
        .edges("|Z")
        .fillet(6.0)
    )

    # 2. Central Cylindrical Airflow Duct
    duct_tube = (
        cq.Workplane("XY")
        .cylinder(duct_depth, (throat_dia / 2.0) + 2.5, centered=(True, True, False))
    )
    bracket = flange.union(duct_tube)

    # 3. Cut Internal Throat Bore through entire duct
    bore = (
        cq.Workplane("XY")
        .cylinder(duct_depth + 2.0, throat_dia / 2.0, centered=(True, True, True))
    )
    bracket = bracket.cut(bore)

    # 4. Aerodynamic Bellmouth Horn Radius on the Inlet Lip
    try:
        bracket = bracket.faces(">Z").edges().fillet(bell_r)
    except Exception:
        bracket = bracket.faces(">Z").edges().chamfer(bell_r)

    # 5. Four M4 Corner Mounting Holes (with vibration damper counterbores)
    corner_pts = [(-hp, -hp), (hp, -hp), (-hp, hp), (hp, hp)]
    bracket = (
        bracket.faces("<Z")
        .workplane()
        .pushPoints(corner_pts)
        .cboreHole(hd, 8.5, 1.5)
    )

    # 6. Horizontal L-Bracket Foot projecting along +Z at bottom edge (Y = -fw/2)
    # When duct is mounted vertically, this foot rests horizontally on the enclosure shelf
    foot_w = 60.0
    foot_l = 25.0
    foot_t = 4.0
    foot = (
        cq.Workplane("XY")
        .transformed(offset=cq.Vector(0, -(fw / 2.0) + (foot_t / 2.0), foot_l / 2.0))
        .box(foot_w, foot_t, foot_l, centered=(True, True, True))
        .edges("|Y")
        .fillet(3.0)
        .faces(">Y")
        .workplane()
        .pushPoints([(-20.0, 0), (20.0, 0)]) # 40mm hole pitch matching enclosure shelf
        .hole(4.5) # M4 clearance holes
    )
    bracket = bracket.union(foot)

    return bracket


if __name__ == "__main__":
    result = create_fan_duct()
