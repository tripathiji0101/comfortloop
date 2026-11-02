"""
ComfortLoop - BME280 Thermal Snorkel Pod CAD Model (Redesigned)
Thermally isolated external environmental sensing chamber.
Features 15mm standoff conduit, natural convection louvers, and direct ambient airflow.
Single unified solid with zero air gaps, mating directly to the enclosure left wall.
"""

import cadquery as cq
from cad.config import CONFIG, TOLERANCE_SLOT, M3_THREAD_HOLE


def create_bme_snorkel(cfg=CONFIG.bme280) -> cq.Workplane:
    """
    Generates the thermally isolated BME280 snorkel pod and mounting arm.
    Origin (0, 0, 0) is at the mounting flange mating face with the main enclosure.
    Flange spans Y in [-3.0, 0.0] with 2x M3 mounting holes at Z = +/-7.0mm.
    Conduit arm spans Y in [0.0, 15.0] with internal wire tunnel.
    Sensor chamber spans Y in [15.0, 35.1] with convective ventilation slits.
    """
    arm_len = cfg.thermal_isolation_standoff # 15.0 mm standoff
    arm_w = 12.0
    arm_h = 10.0
    arm_wall = 1.8

    # Sensor Chamber Dimensions
    pod_w = cfg.width + (2 * TOLERANCE_SLOT) + 4.0   # 16.6 mm
    pod_l = cfg.length + (2 * TOLERANCE_SLOT) + 4.0  # 20.1 mm
    pod_h = 16.0                                     # 16.0 mm

    # 1. Base Mounting Flange (spans Y in [-3.0, 0.0])
    flange = (
        cq.Workplane("XY")
        .transformed(offset=cq.Vector(0, -1.5, 0))
        .box(16.0, 3.0, 22.0, centered=(True, True, True))
        .edges("|Y")
        .fillet(2.5)
    )
    # 2x M3 mounting holes at Z = +/-7.0mm
    flange_h1 = (
        cq.Workplane("XY")
        .transformed(offset=cq.Vector(0, -1.5, 7.0), rotate=cq.Vector(90, 0, 0))
        .cylinder(10.0, 3.4 / 2.0, centered=(True, True, True))
    )
    flange_h2 = (
        cq.Workplane("XY")
        .transformed(offset=cq.Vector(0, -1.5, -7.0), rotate=cq.Vector(90, 0, 0))
        .cylinder(10.0, 3.4 / 2.0, centered=(True, True, True))
    )
    flange = flange.cut(flange_h1).cut(flange_h2)

    # 2. Hollow Conduit Arm (15mm thermal standoff, spans Y in [0.0, arm_len])
    conduit = (
        cq.Workplane("XY")
        .transformed(offset=cq.Vector(0, arm_len / 2.0, 0))
        .box(arm_w, arm_len, arm_h, centered=(True, True, True))
    )
    # Wire tunnel passing completely through the conduit and flange
    tunnel = (
        cq.Workplane("XY")
        .transformed(offset=cq.Vector(0, (arm_len / 2.0) - 1.5, 0))
        .box(arm_w - (2 * arm_wall), arm_len + 5.0, arm_h - (2 * arm_wall), centered=(True, True, True))
    )
    conduit = conduit.cut(tunnel)

    # 3. Sensor Chamber Pod Body (at end of conduit arm, spans Y in [arm_len, arm_len + pod_l])
    pod_center_y = arm_len + (pod_l / 2.0)
    pod_body = (
        cq.Workplane("XY")
        .transformed(offset=cq.Vector(0, pod_center_y, 0))
        .box(pod_w, pod_l, pod_h, centered=(True, True, True))
        .edges("|Z")
        .fillet(2.0)
    )

    # 4. Hollow out internal sensing cavity
    cavity = (
        cq.Workplane("XY")
        .transformed(offset=cq.Vector(0, pod_center_y, 0))
        .box(pod_w - 3.6, pod_l - 3.6, pod_h - 3.0, centered=(True, True, True))
        .edges("|Z")
        .fillet(1.0)
    )
    pod_body = pod_body.cut(cavity)

    # 5. Internal PCB Mounting Boss
    boss_y = pod_center_y + (cfg.length / 2.0) - cfg.mount_hole_y
    boss = (
        cq.Workplane("XY")
        .transformed(offset=cq.Vector(0, boss_y, -(pod_h / 2.0) + 1.5))
        .cylinder(4.0, 3.0, centered=(True, True, False))
        .faces(">Z")
        .workplane()
        .hole(M3_THREAD_HOLE, 4.0)
    )
    pod_body = pod_body.union(boss)

    # 6. Convective Airflow Slits (Bottom & Side vents for direct air exchange)
    for i in range(4):
        slot_y = pod_center_y - (pod_l / 2.0) + 4.0 + (i * 3.5)
        # Bottom slot
        b_slot = (
            cq.Workplane("XY")
            .transformed(offset=cq.Vector(0, slot_y, -(pod_h / 2.0)))
            .box(pod_w - 6.0, 1.8, 4.0, centered=(True, True, True))
        )
        # Side slots (left and right)
        side_l = (
            cq.Workplane("XY")
            .transformed(offset=cq.Vector(-(pod_w / 2.0), slot_y, 0))
            .box(4.0, 1.8, pod_h - 6.0, centered=(True, True, True))
        )
        side_r = (
            cq.Workplane("XY")
            .transformed(offset=cq.Vector((pod_w / 2.0), slot_y, 0))
            .box(4.0, 1.8, pod_h - 6.0, centered=(True, True, True))
        )
        pod_body = pod_body.cut(b_slot).cut(side_l).cut(side_r)

    # Union all segments into a single, continuous, watertight solid
    total_pod = flange.union(conduit).union(pod_body)
    return total_pod


if __name__ == "__main__":
    result = create_bme_snorkel()
