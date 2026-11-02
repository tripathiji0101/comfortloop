"""
ComfortLoop - Master 3D Assembly CAD Model (Redesigned)
Assembles all mechanical enclosures, structural brackets, internal electronics,
fan duct, safety grille, and fasteners into a physically cohesive product.

Supports three presentation configurations:
  1. Assembled View: Complete, unified desktop hardware product.
  2. Exploded View: Components separated along logical assembly directions.
  3. Cutaway View: Sectioned enclosure revealing internal PCBs and dielectric barrier.
"""

import cadquery as cq
from cad.config import CONFIG
from cad.parts.main_enclosure import create_main_enclosure, create_main_enclosure_cutaway
from cad.parts.enclosure_cover import create_enclosure_cover, create_enclosure_cover_cutaway
from cad.parts.radar_housing import create_radar_housing
from cad.parts.bme_snorkel import create_bme_snorkel
from cad.parts.fan_duct import create_fan_duct
from cad.parts.fan_grille import create_fan_grille

from cad.components.esp32 import create_esp32
from cad.components.ina219 import create_ina219
from cad.components.relay import create_relay
from cad.components.ld2410 import create_ld2410
from cad.components.bme280 import create_bme280
from cad.components.fan120 import create_fan120
from cad.components.fasteners import create_m3_screw, create_m4_screw


def build_comfortloop_assembly(
    exploded: bool = False,
    cutaway: bool = False,
    cfg=CONFIG
) -> cq.Assembly:
    """
    Builds the multi-body ComfortLoop system assembly.
    
    Modes:
      - Nominal Assembled: Complete product with all components physically mated.
      - Exploded: Components separated along assembly axes.
      - Cutaway: Enclosure sectioned to reveal internal electronics layout.
    """
    assy_name = "ComfortLoop_Cutaway" if cutaway else ("ComfortLoop_Exploded" if exploded else "ComfortLoop_Assembled")
    assy = cq.Assembly(name=assy_name)

    # Color definitions (RGBA)
    COLOR_CHASSIS = cq.Color(0.20, 0.22, 0.25, 1.0)       # Dark charcoal engineering plastic (PETG)
    COLOR_COVER = cq.Color(0.25, 0.28, 0.32, 0.95)         # Matte dark slate lid
    COLOR_RADAR = cq.Color(0.90, 0.92, 0.94, 1.0)         # Radome clean white
    COLOR_SNORKEL = cq.Color(0.85, 0.88, 0.90, 1.0)       # Sensor pod cool gray
    COLOR_PCB_GREEN = cq.Color(0.08, 0.40, 0.18, 1.0)     # FR4 Green solder mask
    COLOR_PCB_BLUE = cq.Color(0.12, 0.28, 0.65, 1.0)      # Sensor breakout blue
    COLOR_RELAY_BLUE = cq.Color(0.10, 0.40, 0.85, 1.0)    # Songle Relay blue
    COLOR_FAN_FRAME = cq.Color(0.14, 0.14, 0.16, 1.0)     # PBT black fan frame
    COLOR_GRILLE = cq.Color(0.75, 0.78, 0.82, 1.0)        # Steel nickel wire grille
    COLOR_STEEL_SCREW = cq.Color(0.80, 0.82, 0.85, 1.0)   # Zinc-plated steel fastener

    base = cfg.base_thickness
    pcb_z = base + cfg.pcb_standoff_height # 9.0 mm
    total_h = base + cfg.interior_height  # 39.0 mm

    # Exploded view translation offsets (mm)
    z_cov_off = 70.0 if exploded else 0.0
    z_screw_off = 110.0 if exploded else 0.0
    z_pcb_off = 35.0 if exploded else 0.0
    y_radar_off = -50.0 if exploded else 0.0
    y_radar_pcb_off = -75.0 if exploded else 0.0
    x_bme_off = -50.0 if exploded else 0.0
    x_bme_pcb_off = -75.0 if exploded else 0.0
    z_duct_off = 40.0 if exploded else 0.0
    y_duct_off = 30.0 if exploded else 0.0
    y_fan_off = 50.0 if exploded else 0.0
    y_grille_off = 50.0 if exploded else 0.0

    # --------------------------------------------------------------------------
    # 1. Main Electronics Enclosure Chassis (Anchor base at Z=0)
    # --------------------------------------------------------------------------
    enclosure = create_main_enclosure_cutaway(cfg) if cutaway else create_main_enclosure(cfg)
    assy.add(enclosure, name="main_enclosure", color=COLOR_CHASSIS)

    # --------------------------------------------------------------------------
    # 2. ESP32 DevKit V1 Module (Mounted at X=-35.0, Y=-15.0 on 6mm standoffs)
    # --------------------------------------------------------------------------
    esp32 = create_esp32(cfg.esp32)
    assy.add(
        esp32,
        name="esp32_devkit",
        loc=cq.Location(cq.Vector(-35.0, -15.0, pcb_z + z_pcb_off)),
        color=COLOR_PCB_GREEN,
    )

    # --------------------------------------------------------------------------
    # 3. INA219 Current & Voltage Monitor (Mounted at X=38.0, Y=-22.0)
    # --------------------------------------------------------------------------
    ina219 = create_ina219(cfg.ina219)
    assy.add(
        ina219,
        name="ina219_sensor",
        loc=cq.Location(cq.Vector(38.0, -22.0, pcb_z + z_pcb_off)),
        color=COLOR_PCB_BLUE,
    )

    # --------------------------------------------------------------------------
    # 4. 5V Relay Module (Mounted at X=38.0, Y=22.0 behind dielectric wall)
    # --------------------------------------------------------------------------
    relay = create_relay(cfg.relay)
    assy.add(
        relay,
        name="relay_module",
        loc=cq.Location(cq.Vector(38.0, 22.0, pcb_z + z_pcb_off)),
        color=COLOR_RELAY_BLUE,
    )

    # --------------------------------------------------------------------------
    # 5. Enclosure Cover Lid
    # --------------------------------------------------------------------------
    cover = create_enclosure_cover_cutaway(cfg) if cutaway else create_enclosure_cover(cfg)
    assy.add(
        cover,
        name="enclosure_cover",
        loc=cq.Location(cq.Vector(0, 0, total_h + z_cov_off)),
        color=COLOR_COVER,
    )

    # Cover Fasteners: 4x M3 Socket Head Cap Screws
    corner_x = (cfg.interior_width / 2.0) - 4.5
    corner_y = (cfg.interior_length / 2.0) - 4.5
    for idx, (cx, cy) in enumerate([(-corner_x, -corner_y), (corner_x, -corner_y), (-corner_x, corner_y), (corner_x, corner_y)]):
        m3_screw = create_m3_screw(length=10.0)
        assy.add(
            m3_screw,
            name=f"cover_screw_{idx+1}",
            loc=cq.Location(cq.Vector(cx, cy, total_h + 2.0 + z_screw_off), cq.Vector(1, 0, 0), 180.0),
            color=COLOR_STEEL_SCREW,
        )

    # --------------------------------------------------------------------------
    # 6. HLK-LD2410 Radar Housing & Sensor (Front Clevis Mount at Y=-63.0, Z=24.0)
    # --------------------------------------------------------------------------
    radar_y = -63.0 + y_radar_off
    radar_z = 24.0
    radar_pod = create_radar_housing(cfg.radar)
    # Pivot axis in local coordinates is at (0, 0, 6.1).
    # Rotate by -105 deg around X (-90 deg to face forward in -Y, plus -15 deg downward tilt).
    loc_piv = cq.Location(cq.Vector(0, radar_y, radar_z), cq.Vector(1, 0, 0), -105.0)
    loc_offset = cq.Location(cq.Vector(0, 0, -6.1))
    loc_radar = loc_piv * loc_offset
    assy.add(
        radar_pod,
        name="radar_housing",
        loc=loc_radar,
        color=COLOR_RADAR,
    )

    ld2410 = create_ld2410(cfg.radar)
    loc_sensor_piv = cq.Location(cq.Vector(0, -63.0 + y_radar_pcb_off, radar_z), cq.Vector(1, 0, 0), -105.0)
    loc_sensor_local = cq.Location(cq.Vector(0, 0, 7.5), cq.Vector(1, 0, 0), 180.0)
    loc_sensor = loc_sensor_piv * loc_offset * loc_sensor_local
    assy.add(
        ld2410,
        name="ld2410_sensor",
        loc=loc_sensor,
        color=COLOR_PCB_BLUE,
    )

    # --------------------------------------------------------------------------
    # 7. BME280 Thermal Snorkel Pod & Sensor (Left Wall Mated at X=-72.5, Y=0.0)
    # --------------------------------------------------------------------------
    snorkel_x = -(cfg.exterior_width / 2.0) - 3.0 + x_bme_off # -75.5 mm base origin
    snorkel_y = 0.0
    snorkel_z = 20.0
    snorkel_pod = create_bme_snorkel(cfg.bme280)
    # Rotate local Y -> world -X, local Z -> world Y
    loc1 = cq.Location(cq.Vector(0, 0, 0), cq.Vector(0, 1, 0), 90.0)
    loc2 = cq.Location(cq.Vector(0, 0, 0), cq.Vector(0, 0, 1), 90.0)
    loc_t_snorkel = cq.Location(cq.Vector(snorkel_x, snorkel_y, snorkel_z))
    loc_snorkel = loc_t_snorkel * loc2 * loc1
    assy.add(
        snorkel_pod,
        name="bme_snorkel",
        loc=loc_snorkel,
        color=COLOR_SNORKEL,
    )

    bme280 = create_bme280(cfg.bme280)
    arm_len = cfg.bme280.thermal_isolation_standoff
    pod_l = cfg.bme280.length + 2.0 + 4.0
    pod_center_y = arm_len + (pod_l / 2.0)
    loc_sensor_local = cq.Location(cq.Vector(0, pod_center_y - 1.0, 2.0))
    loc_t_sensor = cq.Location(cq.Vector(snorkel_x + (x_bme_pcb_off - x_bme_off), snorkel_y, snorkel_z))
    loc_sensor_bme = loc_t_sensor * loc2 * loc1 * loc_sensor_local
    assy.add(
        bme280,
        name="bme280_sensor",
        loc=loc_sensor_bme,
        color=COLOR_PCB_BLUE,
    )

    # --------------------------------------------------------------------------
    # 8. 120mm Fan Duct, BLDC Fan Motor, Finger Grille, and Fasteners
    # --------------------------------------------------------------------------
    # The fan duct foot sits directly on the rear shelf at Y in [50, 75], Z in [4, 8]
    duct_y = 50.0 + y_duct_off
    duct_z = 64.0 + z_duct_off

    duct = create_fan_duct(cfg.fan)
    loc_rx = cq.Location(cq.Vector(0, 0, 0), cq.Vector(1, 0, 0), 90.0)
    loc_rz = cq.Location(cq.Vector(0, 0, 0), cq.Vector(0, 0, 1), 180.0)
    loc_t_duct = cq.Location(cq.Vector(0, duct_y, duct_z))
    loc_duct = loc_t_duct * loc_rz * loc_rx
    assy.add(
        duct,
        name="fan_duct",
        loc=loc_duct,
        color=COLOR_CHASSIS,
    )

    # 2x M4 Foot Screws fastening duct foot into the chassis rear shelf
    for idx, fx in enumerate([-20.0, 20.0]):
        m4_screw = create_m4_screw(length=12.0)
        assy.add(
            m4_screw,
            name=f"duct_screw_{idx+1}",
            loc=cq.Location(cq.Vector(fx, 62.5 + y_duct_off, 8.0 + (z_duct_off * 1.5)), cq.Vector(1, 0, 0), 180.0),
            color=COLOR_STEEL_SCREW,
        )

    # 120mm BLDC Fan seated against the duct frame at Y in [75.0, 100.4]
    fan = create_fan120(cfg.fan)
    fan_y_pos = 75.0 + y_duct_off + (y_fan_off if exploded else 0.0)
    assy.add(
        fan,
        name="fan120_bldc",
        loc=cq.Location(cq.Vector(0, fan_y_pos, duct_z), cq.Vector(1, 0, 0), -90.0),
        color=COLOR_FAN_FRAME,
    )

    # Concentric Safety Finger Grille on the intake/exhaust face at Y in [100.4, 102.9]
    grille = create_fan_grille(cfg.fan)
    grille_y_pos = 100.4 + y_duct_off + (y_fan_off if exploded else 0.0) + (y_grille_off if exploded else 0.0)
    assy.add(
        grille,
        name="fan_grille",
        loc=cq.Location(cq.Vector(0, grille_y_pos, duct_z), cq.Vector(1, 0, 0), -90.0),
        color=COLOR_GRILLE,
    )

    return assy


if __name__ == "__main__":
    assembled = build_comfortloop_assembly(exploded=False, cutaway=False)
    exploded = build_comfortloop_assembly(exploded=True, cutaway=False)
    cutaway = build_comfortloop_assembly(exploded=False, cutaway=True)
