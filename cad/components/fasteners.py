"""
ComfortLoop - Standard Machine Fasteners & Threaded Inserts CAD Models
Provides realistic ISO metric fasteners:
  - M3 Socket Head Cap Screws (SHCS) for enclosure lid & PCB mounts
  - M4 SHCS Bolts for fan assembly & shelf mounting
  - Brass knurled heat-set threaded inserts
"""

import cadquery as cq


def create_m3_screw(length: float = 10.0) -> cq.Workplane:
    """Standard M3 Socket Head Cap Screw (SHCS). Head Dia 5.5mm, Head H 3.0mm, Hex 2.5mm."""
    head_dia = 5.5
    head_h = 3.0
    shank_dia = 3.0

    screw = (
        cq.Workplane("XY")
        .cylinder(length, shank_dia / 2.0, centered=(True, True, False))
        .faces("<Z")
        .workplane()
        .cylinder(head_h, head_dia / 2.0, centered=(True, True, False))
        .faces("<Z")
        .workplane()
        .polygon(6, 2.5) # Hex socket recess
        .cutBlind(1.8)
    )
    return screw


def create_m4_screw(length: float = 12.0) -> cq.Workplane:
    """Standard M4 Socket Head Cap Screw (SHCS). Head Dia 7.0mm, Head H 4.0mm, Hex 3.0mm."""
    head_dia = 7.0
    head_h = 4.0
    shank_dia = 4.0

    screw = (
        cq.Workplane("XY")
        .cylinder(length, shank_dia / 2.0, centered=(True, True, False))
        .faces("<Z")
        .workplane()
        .cylinder(head_h, head_dia / 2.0, centered=(True, True, False))
        .faces("<Z")
        .workplane()
        .polygon(6, 3.0)
        .cutBlind(2.2)
    )
    return screw


def create_m3_brass_insert() -> cq.Workplane:
    """M3 Knurled Brass Heat-Set Insert (OD 4.6mm, Length 5.5mm, ID 3.0mm)."""
    insert = (
        cq.Workplane("XY")
        .cylinder(5.5, 4.6 / 2.0, centered=(True, True, False))
        .faces(">Z")
        .workplane()
        .hole(2.5, 5.5) # Threaded core
    )
    return insert


if __name__ == "__main__":
    m3 = create_m3_screw()
    m4 = create_m4_screw()
    ins = create_m3_brass_insert()

