"""
ComfortLoop - 5V Relay Module CAD Model
Songle SRD-05VDC-SL-C Optocoupled Single-Channel Relay Breakout.
"""

import cadquery as cq
from cad.config import CONFIG


def create_relay(config=CONFIG.relay) -> cq.Workplane:
    """
    Generates a 3D CAD model of the 5V relay module.
    Centered at (0, 0, 0) with PCB bottom at Z=0.
    """
    w = config.width
    l = config.length
    t = config.pcb_thickness
    hx = config.mount_hole_pitch_x / 2.0
    hy = config.mount_hole_pitch_y / 2.0

    # Base PCB with 2x mounting holes
    pcb = (
        cq.Workplane("XY")
        .box(w, l, t, centered=(True, True, False))
        .faces(">Z")
        .workplane()
        .pushPoints([(-hx, -hy), (hx, hy)])
        .hole(config.mount_hole_dia)
    )

    # Blue Relay Body Cube (Songle SRD)
    cube_w = config.cube_width
    cube_l = config.cube_length
    cube_h = config.cube_height
    relay_cube = (
        cq.Workplane("XY")
        .transformed(offset=cq.Vector(0, -2.0, t))
        .box(cube_w, cube_l, cube_h, centered=(True, True, False))
        .edges("|Z")
        .fillet(0.5)
    )

    # 3-Pin High-Voltage Screw Terminal Block (top edge)
    tb_w = config.terminal_block_width
    tb_l = config.terminal_block_length
    tb_h = 10.0
    tb_y = (l / 2.0) - (tb_l / 2.0) - 1.0
    terminal = (
        cq.Workplane("XY")
        .transformed(offset=cq.Vector(0, tb_y, t))
        .box(tb_w, tb_l, tb_h, centered=(True, True, False))
    )

    # 3-Pin Low-Voltage Control Header (bottom edge)
    hdr_w, hdr_l, hdr_h = 7.62, 2.54, 8.5
    hdr_y = -(l / 2.0) + (hdr_l / 2.0) + 1.0
    hdr = (
        cq.Workplane("XY")
        .transformed(offset=cq.Vector(0, hdr_y, -hdr_h))
        .box(hdr_w, hdr_l, hdr_h, centered=(True, True, False))
    )

    return pcb.union(relay_cube).union(terminal).union(hdr)


if __name__ == "__main__":
    result = create_relay()

