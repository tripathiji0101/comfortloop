"""
ComfortLoop - Main Electronics Enclosure CAD Model (Redesigned)
Chassis housing the ESP32, INA219, 5V Relay, Power Ingress, and Integrated Mounting Interfaces.
Engineered for FDM 3D printing (PETG/ABS) with heat-set brass inserts.
"""

import cadquery as cq
from cad.config import CONFIG, M3_INSERT_HOLE_OD, M3_INSERT_DEPTH, STANDOFF_OD


def create_main_enclosure(cfg=CONFIG) -> cq.Workplane:
    """
    Generates the monolithic main electronics enclosure chassis.
    Features:
      - 140x95x36mm internal cavity with 2.5mm walls and 3.0mm base
      - 4x M3 heat-set corner bosses for cover fastening
      - 4x ESP32 standoffs, 2x INA219 standoffs, 2x Relay standoffs
      - 24mm high-voltage dielectric isolation wall
      - Rear integrated mounting shelf with 2x M4 insert bores for 120mm Fan Duct
      - Front integrated swivel clevis lugs for HLK-LD2410 Radar pod
      - True world-coordinate cutouts for Micro-USB, DC barrel jack, fuse, fan harness,
        BME280 flange mounts & wire grommet, and 5x convective louvers.
    Origin (0, 0, 0) is at the center of the main body bottom surface.
    """
    ext_w = cfg.exterior_width       # 145.0 mm (X)
    ext_l = cfg.exterior_length      # 100.0 mm (Y)
    wall = cfg.wall_thickness        # 2.5 mm
    base = cfg.base_thickness        # 3.0 mm
    cav_h = cfg.interior_height      # 36.0 mm
    total_h = base + cav_h           # 39.0 mm (Z)

    int_w = cfg.interior_width       # 140.0 mm
    int_l = cfg.interior_length      # 95.0 mm

    # 1. Main Outer Shell with rounded external vertical edges
    outer_box = (
        cq.Workplane("XY")
        .box(ext_w, ext_l, total_h, centered=(True, True, False))
        .edges("|Z")
        .fillet(3.0)
    )

    # 2. Hollow out internal cavity
    cavity = (
        cq.Workplane("XY")
        .transformed(offset=cq.Vector(0, 0, base))
        .box(int_w, int_l, cav_h + 1.0, centered=(True, True, False))
        .edges("|Z")
        .fillet(1.5)
    )
    chassis = outer_box.cut(cavity)

    # 3. Four Corner Standoff Pillars for Cover Fastening (M3 heat-set insert bores)
    corner_x = (int_w / 2.0) - 4.5
    corner_y = (int_l / 2.0) - 4.5
    corner_pts = [
        (-corner_x, -corner_y),
        (corner_x, -corner_y),
        (-corner_x, corner_y),
        (corner_x, corner_y),
    ]

    corner_bosses = (
        cq.Workplane("XY")
        .transformed(offset=cq.Vector(0, 0, base))
        .pushPoints(corner_pts)
        .cylinder(cav_h, 4.5, centered=(True, True, False)) # OD 9.0 mm
        .faces(">Z")
        .workplane()
        .pushPoints(corner_pts)
        .hole(M3_INSERT_HOLE_OD, M3_INSERT_DEPTH)
    )
    chassis = chassis.union(corner_bosses)

    # 4. ESP32 Mounting Standoffs (4x M3 pillars)
    esp_cx, esp_cy = -35.0, -15.0
    esp_hx = cfg.esp32.mount_hole_pitch_x / 2.0
    esp_hy = cfg.esp32.mount_hole_pitch_y / 2.0
    esp_pts = [
        (esp_cx - esp_hx, esp_cy - esp_hy),
        (esp_cx + esp_hx, esp_cy - esp_hy),
        (esp_cx - esp_hx, esp_cy + esp_hy),
        (esp_cx + esp_hx, esp_cy + esp_hy),
    ]
    esp_bosses = (
        cq.Workplane("XY")
        .transformed(offset=cq.Vector(0, 0, base))
        .pushPoints(esp_pts)
        .cylinder(cfg.pcb_standoff_height, STANDOFF_OD / 2.0, centered=(True, True, False))
        .faces(">Z")
        .workplane()
        .pushPoints(esp_pts)
        .hole(M3_INSERT_HOLE_OD, cfg.pcb_standoff_height)
    )
    chassis = chassis.union(esp_bosses)

    # 5. INA219 Current Sensor Standoffs (2x diagonal M3 pillars)
    ina_cx, ina_cy = 38.0, -22.0
    ina_hx = cfg.ina219.mount_hole_pitch_x / 2.0
    ina_hy = cfg.ina219.mount_hole_pitch_y / 2.0
    ina_pts = [
        (ina_cx - ina_hx, ina_cy - ina_hy),
        (ina_cx + ina_hx, ina_cy + ina_hy),
    ]
    ina_bosses = (
        cq.Workplane("XY")
        .transformed(offset=cq.Vector(0, 0, base))
        .pushPoints(ina_pts)
        .cylinder(cfg.pcb_standoff_height, STANDOFF_OD / 2.0, centered=(True, True, False))
        .faces(">Z")
        .workplane()
        .pushPoints(ina_pts)
        .hole(M3_INSERT_HOLE_OD, cfg.pcb_standoff_height)
    )
    chassis = chassis.union(ina_bosses)

    # 6. Relay Module Standoffs (2x diagonal M3 pillars)
    rel_cx, rel_cy = 38.0, 22.0
    rel_hx = cfg.relay.mount_hole_pitch_x / 2.0
    rel_hy = cfg.relay.mount_hole_pitch_y / 2.0
    rel_pts = [
        (rel_cx - rel_hx, rel_cy - rel_hy),
        (rel_cx + rel_hx, rel_cy + rel_hy),
    ]
    rel_bosses = (
        cq.Workplane("XY")
        .transformed(offset=cq.Vector(0, 0, base))
        .pushPoints(rel_pts)
        .cylinder(cfg.pcb_standoff_height, STANDOFF_OD / 2.0, centered=(True, True, False))
        .faces(">Z")
        .workplane()
        .pushPoints(rel_pts)
        .hole(M3_INSERT_HOLE_OD, cfg.pcb_standoff_height)
    )
    chassis = chassis.union(rel_bosses)

    # 7. High-Voltage Dielectric Isolation Barrier Wall (Relay safety partition)
    barrier_x = 18.0
    barrier_w = 2.0
    barrier_l = 48.0
    barrier_h = 24.0
    barrier = (
        cq.Workplane("XY")
        .transformed(offset=cq.Vector(barrier_x, rel_cy, base))
        .box(barrier_w, barrier_l, barrier_h, centered=(True, True, False))
    )
    chassis = chassis.union(barrier)

    # 8. Integrated Rear Mounting Shelf for 120mm Fan Duct Bracket
    # Extends from Y=+50.0 to Y=+75.0mm (Length 25.0mm, Width 70.0mm, Thickness 4.0mm)
    shelf = (
        cq.Workplane("XY")
        .transformed(offset=cq.Vector(0, 62.5, 2.0))
        .box(70.0, 25.0, 4.0, centered=(True, True, True))
        .edges("|Z")
        .fillet(3.0)
        .faces(">Z")
        .workplane()
        .pushPoints([(-20.0, 0), (20.0, 0)]) # Matches 40mm hole pitch on Fan Duct foot
        .hole(5.6, 4.0) # Bores for M4 brass heat-set inserts (OD 5.6mm)
    )
    chassis = chassis.union(shelf)

    # 9. Integrated Front Swivel Clevis Lugs for HLK-LD2410 Radar Pod
    # Dual clevis lugs projecting forward from Y=-50.0 to Y=-67.0mm at Z=24.0mm
    # Standoff of 17.0mm provides full physical clearance for -15 deg downward pitch
    lug_l = (
        cq.Workplane("XY")
        .transformed(offset=cq.Vector(-15.0, -58.5, 24.0))
        .box(3.0, 17.0, 10.0, centered=(True, True, True))
        .edges("|X")
        .fillet(2.0)
    )
    lug_r = (
        cq.Workplane("XY")
        .transformed(offset=cq.Vector(15.0, -58.5, 24.0))
        .box(3.0, 17.0, 10.0, centered=(True, True, True))
        .edges("|X")
        .fillet(2.0)
    )
    # Through-hole for M3 pivot axle bolt across both lugs (at Y=-63.0mm, Z=24.0mm)
    clevis_hole = (
        cq.Workplane("XY")
        .transformed(offset=cq.Vector(0, -63.0, 24.0), rotate=cq.Vector(0, 90, 0))
        .cylinder(40.0, 3.2 / 2.0, centered=(True, True, True))
    )
    chassis = chassis.union(lug_l).union(lug_r).cut(clevis_hole)

    # ==========================================================================
    # 10. TRUE WORLD-COORDINATE CUTOUTS & WALL APERTURES
    # ==========================================================================

    # A. Micro-USB Service Port (Front Wall: Y = -50.0mm, centered at ESP32 X = -35.0mm)
    usb_cutout = (
        cq.Workplane("XY")
        .transformed(offset=cq.Vector(esp_cx, -50.0, base + cfg.pcb_standoff_height + 2.5))
        .box(11.0, 10.0, 6.5, centered=(True, True, True))
    )
    chassis = chassis.cut(usb_cutout)

    # B. DC 5.5x2.1mm Barrel Jack Circular Cutout (Right Wall: X = +72.5mm, Y = -18.0mm)
    dc_jack = (
        cq.Workplane("XY")
        .transformed(offset=cq.Vector(ext_w / 2.0, -18.0, base + 14.0), rotate=cq.Vector(0, 90, 0))
        .cylinder(10.0, cfg.power.barrel_thread_dia / 2.0, centered=(True, True, True))
    )
    chassis = chassis.cut(dc_jack)

    # C. Panel Mount 5x20mm Fuse Holder Circular Cutout (Right Wall: X = +72.5mm, Y = +18.0mm)
    fuse_cut = (
        cq.Workplane("XY")
        .transformed(offset=cq.Vector(ext_w / 2.0, 18.0, base + 14.0), rotate=cq.Vector(0, 90, 0))
        .cylinder(10.0, cfg.power.fuse_thread_dia / 2.0, centered=(True, True, True))
    )
    chassis = chassis.cut(fuse_cut)

    # D. 4-Pin Fan Cable Pass-Through Slot (Rear Wall: Y = +50.0mm, X = -10.0mm)
    fan_slot = (
        cq.Workplane("XY")
        .transformed(offset=cq.Vector(-10.0, 50.0, total_h - 4.0))
        .box(12.0, 10.0, 8.0, centered=(True, True, True))
    )
    chassis = chassis.cut(fan_slot)

    # E. Radar Cable Wire Pass-Through Hole (Front Wall: Y = -50.0mm, X = 0.0mm, Z = 24.0mm)
    radar_wire_hole = (
        cq.Workplane("XY")
        .transformed(offset=cq.Vector(0, -50.0, 24.0), rotate=cq.Vector(90, 0, 0))
        .cylinder(10.0, 3.0, centered=(True, True, True)) # 6.0mm dia
    )
    chassis = chassis.cut(radar_wire_hole)

    # F. BME280 Snorkel Pod Mounts & Wire Hole (Left Wall: X = -72.5mm, Y = 0.0mm, Z = 20.0mm)
    bme_wire_hole = (
        cq.Workplane("XY")
        .transformed(offset=cq.Vector(-ext_w / 2.0, 0.0, 20.0), rotate=cq.Vector(0, 90, 0))
        .cylinder(10.0, 3.0, centered=(True, True, True)) # 6.0mm dia
    )
    bme_mount_1 = (
        cq.Workplane("XY")
        .transformed(offset=cq.Vector(-ext_w / 2.0, -7.0, 20.0), rotate=cq.Vector(0, 90, 0))
        .cylinder(10.0, 2.1, centered=(True, True, True)) # 4.2mm bore for M3 insert
    )
    bme_mount_2 = (
        cq.Workplane("XY")
        .transformed(offset=cq.Vector(-ext_w / 2.0, 7.0, 20.0), rotate=cq.Vector(0, 90, 0))
        .cylinder(10.0, 2.1, centered=(True, True, True)) # 4.2mm bore for M3 insert
    )
    chassis = chassis.cut(bme_wire_hole).cut(bme_mount_1).cut(bme_mount_2)

    # G. Convective Passive Airflow Louvers (Left Wall: X = -72.5mm, Y = -15.0mm)
    for i in range(5):
        louver_z = base + 8.0 + (i * 4.5)
        louver = (
            cq.Workplane("XY")
            .transformed(offset=cq.Vector(-ext_w / 2.0, esp_cy, louver_z))
            .box(10.0, 22.0, 2.2, centered=(True, True, True))
        )
        chassis = chassis.cut(louver)

    return chassis


def create_main_enclosure_cutaway(cfg=CONFIG) -> cq.Workplane:
    """
    Generates a sectioned cutaway chassis showing internal electronics cavity.
    Cuts away the front-right quadrant (X > 0, Y < 0) from Z=15 to Z=39mm.
    """
    chassis = create_main_enclosure(cfg)
    ext_w = cfg.exterior_width
    ext_l = cfg.exterior_length
    cut_box = (
        cq.Workplane("XY")
        .transformed(offset=cq.Vector(ext_w / 4.0, -ext_l / 4.0, 27.0))
        .box(ext_w / 2.0 + 5.0, ext_l / 2.0 + 5.0, 26.0, centered=(True, True, True))
    )
    return chassis.cut(cut_box)


if __name__ == "__main__":
    result = create_main_enclosure()
    cutaway = create_main_enclosure_cutaway()
