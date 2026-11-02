"""
ComfortLoop - BME280 Environmental Sensor CAD Model
Bosch Sensortec BME280 Temperature, Humidity, and Pressure Sensor Breakout.
"""

import cadquery as cq
from cad.config import CONFIG


def create_bme280(config=CONFIG.bme280) -> cq.Workplane:
    """
    Generates a 3D CAD model of the GY-BME280 breakout board.
    Centered at (0, 0, 0) with the PCB bottom at Z=0.
    """
    w = config.width
    l = config.length
    t = config.pcb_thickness

    # Base PCB with single M3 mounting hole
    hole_y = (l / 2.0) - config.mount_hole_y
    pcb = (
        cq.Workplane("XY")
        .box(w, l, t, centered=(True, True, False))
        .faces(">Z")
        .workplane()
        .pushPoints([(0, hole_y)])
        .hole(config.mount_hole_dia)
    )

    # Bosch BME280 8-Pin Metal LGA Package (center)
    pkg_w, pkg_l, pkg_h = 2.5, 2.5, 1.0
    sensor_pkg = (
        cq.Workplane("XY")
        .transformed(offset=cq.Vector(0, 0, t))
        .box(pkg_w, pkg_l, pkg_h, centered=(True, True, False))
    )

    # 4-Pin 2.54mm I2C Header (bottom edge)
    hdr_w, hdr_l, hdr_h = 10.16, 2.54, 8.5
    hdr_y = -(l / 2.0) + (hdr_l / 2.0) + 1.0
    hdr = (
        cq.Workplane("XY")
        .transformed(offset=cq.Vector(0, hdr_y, -hdr_h))
        .box(hdr_w, hdr_l, hdr_h, centered=(True, True, False))
    )

    return pcb.union(sensor_pkg).union(hdr)


if __name__ == "__main__":
    result = create_bme280()

