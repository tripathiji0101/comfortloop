"""
ComfortLoop - ESP32 DevKit V1 CAD Model
Standard 30-Pin DOIT ESP32-WROOM-32 Development Board.
"""

import cadquery as cq
from cad.config import CONFIG


def create_esp32(config=CONFIG.esp32) -> cq.Workplane:
    """
    Generates a realistic parametric 3D CAD model of the ESP32 DevKit V1.
    Centered at (0, 0, 0) in XY, with the PCB bottom at Z=0.
    """
    w = config.width
    l = config.length
    t = config.pcb_thickness
    hx = config.mount_hole_pitch_x / 2.0
    hy = config.mount_hole_pitch_y / 2.0
    hd = config.mount_hole_dia

    # Base PCB substrate (FR4)
    pcb = (
        cq.Workplane("XY")
        .box(w, l, t, centered=(True, True, False))
        .faces(">Z")
        .workplane()
        .pushPoints([(-hx, -hy), (hx, -hy), (-hx, hy), (hx, hy)])
        .hole(hd)
    )

    # ESP-WROOM-32 Metal RF Shielding Can (top side)
    rf_w, rf_l, rf_h = 18.0, 16.0, 3.0
    rf_can = (
        cq.Workplane("XY")
        .transformed(offset=cq.Vector(0, 8.0, t))
        .box(rf_w, rf_l, rf_h, centered=(True, True, False))
        .edges("|Z")
        .fillet(0.8)
    )

    # PCB Trace Antenna Keep-out Area (top end of PCB)
    ant_w, ant_l, ant_h = 24.0, 6.5, 0.4
    antenna = (
        cq.Workplane("XY")
        .transformed(offset=cq.Vector(0, (l / 2.0) - (ant_l / 2.0), t))
        .box(ant_w, ant_l, ant_h, centered=(True, True, False))
    )

    # Micro-USB Connector (bottom end, protruding past edge)
    usb_w, usb_l, usb_h = config.usb_width, 6.0, config.usb_height
    usb = (
        cq.Workplane("XY")
        .transformed(offset=cq.Vector(0, -(l / 2.0) + (usb_l / 2.0) - config.usb_protrusion, t))
        .box(usb_w, usb_l, usb_h, centered=(True, True, False))
    )

    # Dual 15-pin header strips on bottom side
    hdr_w, hdr_l, hdr_d = 2.5, 38.1, config.header_pin_depth
    hdr_x = (w / 2.0) - 2.54 / 2.0
    hdr_left = (
        cq.Workplane("XY")
        .transformed(offset=cq.Vector(-hdr_x, 0, -hdr_d))
        .box(hdr_w, hdr_l, hdr_d, centered=(True, True, False))
    )
    hdr_right = (
        cq.Workplane("XY")
        .transformed(offset=cq.Vector(hdr_x, 0, -hdr_d))
        .box(hdr_w, hdr_l, hdr_d, centered=(True, True, False))
    )

    # Combine into single composite solid
    model = pcb.union(rf_can).union(antenna).union(usb).union(hdr_left).union(hdr_right)
    return model


if __name__ == "__main__":
    result = create_esp32()

