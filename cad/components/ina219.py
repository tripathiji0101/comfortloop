"""
ComfortLoop - INA219 Current & Power Sensor CAD Model
TI INA219 High-Side I2C Current/Voltage/Power Monitor Breakout.
"""

import cadquery as cq
from cad.config import CONFIG


def create_ina219(config=CONFIG.ina219) -> cq.Workplane:
    """
    Generates a 3D CAD model of the INA219 breakout board.
    Centered at (0, 0, 0) with the PCB bottom at Z=0.
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

    # 2-Pin High Current Screw Terminal Block
    tb_w, tb_l, tb_h = config.terminal_block_width, 7.5, config.terminal_block_height
    tb_y = (l / 2.0) - (tb_l / 2.0) - 1.0
    terminal = (
        cq.Workplane("XY")
        .transformed(offset=cq.Vector(0, tb_y, t))
        .box(tb_w, tb_l, tb_h, centered=(True, True, False))
    )

    # 6-Pin Header (bottom edge)
    hdr_w, hdr_l, hdr_h = 15.24, 2.54, 8.5
    hdr_y = -(l / 2.0) + (hdr_l / 2.0) + 1.0
    hdr = (
        cq.Workplane("XY")
        .transformed(offset=cq.Vector(0, hdr_y, -hdr_h))
        .box(hdr_w, hdr_l, hdr_h, centered=(True, True, False))
    )

    # Shunt Resistor (center)
    shunt = (
        cq.Workplane("XY")
        .transformed(offset=cq.Vector(0, -2.0, t))
        .box(6.4, 3.2, 1.2, centered=(True, True, False))
    )

    return pcb.union(terminal).union(hdr).union(shunt)


if __name__ == "__main__":
    result = create_ina219()

