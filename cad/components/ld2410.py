"""
ComfortLoop - HLK-LD2410 mmWave Radar Sensor CAD Model
Hi-Link 24GHz FMCW Human Presence Sensing Module.
"""

import cadquery as cq
from cad.config import CONFIG


def create_ld2410(config=CONFIG.radar) -> cq.Workplane:
    """
    Generates a 3D CAD model of the HLK-LD2410 mmWave radar sensor.
    Centered at (0, 0, 0) with the PCB bottom at Z=0.
    """
    w = config.width
    l = config.length
    t = config.pcb_thickness

    # Base sensor PCB
    pcb = cq.Workplane("XY").box(w, l, t, centered=(True, True, False))

    # 24GHz Microstrip Patch Antenna Array (top half of PCB)
    ant_w = config.antenna_area_width
    ant_l = config.antenna_area_length
    ant_y = (l / 2.0) - (ant_l / 2.0) - 2.0
    antennas = (
        cq.Workplane("XY")
        .transformed(offset=cq.Vector(0, ant_y, t))
        .box(ant_w, ant_l, 0.3, centered=(True, True, False))
    )

    # Radar Controller IC & RF Shield (center)
    ic_w, ic_l, ic_h = 8.0, 8.0, 1.2
    ic = (
        cq.Workplane("XY")
        .transformed(offset=cq.Vector(0, -2.0, t))
        .box(ic_w, ic_l, ic_h, centered=(True, True, False))
    )

    # 5-Pin Interface Header (bottom edge)
    hdr_w, hdr_l, hdr_h = 13.0, 2.5, 8.5
    hdr = (
        cq.Workplane("XY")
        .transformed(offset=cq.Vector(0, -(l / 2.0) + (hdr_l / 2.0), -hdr_h))
        .box(hdr_w, hdr_l, hdr_h, centered=(True, True, False))
    )

    return pcb.union(antennas).union(ic).union(hdr)


if __name__ == "__main__":
    result = create_ld2410()

