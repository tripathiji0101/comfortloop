"""
ComfortLoop - 120mm BLDC Fan CAD Model
Standard 120x120x25.4mm 4-Pin PWM Brushless DC Fan.
"""

import cadquery as cq
import math
from cad.config import CONFIG


def create_fan120(config=CONFIG.fan) -> cq.Workplane:
    """
    Generates a 3D CAD model of the 120mm PWM fan.
    Centered at (0, 0, 0) in XY, with the intake face at Z=0 and exhaust face at Z=25.4.
    """
    fw = config.frame_width
    fd = config.frame_depth
    hp = config.mount_hole_pitch / 2.0
    hd = config.mount_hole_dia
    blade_dia = config.blade_sweep_dia
    hub_dia = config.hub_dia

    # Outer square frame
    frame = (
        cq.Workplane("XY")
        .box(fw, fw, fd, centered=(True, True, False))
        .faces(">Z")
        .workplane()
        .hole(blade_dia + 2.0)  # Central circular airflow duct cutout
    )

    # 4x Corner Mounting Holes (through-holes)
    frame = (
        frame.faces(">Z")
        .workplane()
        .pushPoints([(-hp, -hp), (hp, -hp), (-hp, hp), (hp, hp)])
        .hole(hd)
    )

    # Central Motor Hub
    hub = (
        cq.Workplane("XY")
        .transformed(offset=cq.Vector(0, 0, 2.0))
        .cylinder(fd - 4.0, hub_dia / 2.0, centered=(True, True, False))
    )

    # 4x Stator Support Struts (connecting hub to outer frame)
    struts = cq.Workplane("XY")
    for angle in [45, 135, 225, 315]:
        rad = math.radians(angle)
        strut_len = (fw / 2.0) - (hub_dia / 2.0)
        cx = math.cos(rad) * ((hub_dia / 2.0) + (strut_len / 2.0))
        cy = math.sin(rad) * ((hub_dia / 2.0) + (strut_len / 2.0))
        strut = (
            cq.Workplane("XY")
            .transformed(offset=cq.Vector(cx, cy, fd - 4.0), rotate=cq.Vector(0, 0, angle))
            .box(strut_len, 3.5, 3.5, centered=(True, True, False))
        )
        struts = struts.union(strut)

    # 7x Impeller Blades inside the shroud
    blades = cq.Workplane("XY")
    blade_length = (blade_dia - hub_dia) / 2.0
    for i in range(7):
        angle = i * (360.0 / 7.0)
        rad = math.radians(angle)
        cx = math.cos(rad) * ((hub_dia / 2.0) + (blade_length / 2.0))
        cy = math.sin(rad) * ((hub_dia / 2.0) + (blade_length / 2.0))
        blade = (
            cq.Workplane("XY")
            .transformed(
                offset=cq.Vector(cx, cy, 5.0),
                rotate=cq.Vector(15, 0, angle) # Pitch angle for aerodynamic blade
            )
            .box(blade_length, 1.8, 14.0, centered=(True, True, False))
        )
        blades = blades.union(blade)

    return frame.union(hub).union(struts).union(blades)


if __name__ == "__main__":
    result = create_fan120()

