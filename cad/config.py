"""
ComfortLoop - Parametric CAD Configuration & Dimension Sheet
Track 1: Fan | atomQUEST 2026
Standard Units: Millimeters (mm), Angles: Degrees

This module defines all verified hardware dimensions (from manufacturer datasheets),
manufacturing tolerances, electrical clearances, and parametric enclosure parameters.
"""

from dataclasses import dataclass

# ==============================================================================
# MANUFACTURING TOLERANCES & GENERAL CLEARANCES (FDM 3D Printing)
# ==============================================================================
TOLERANCE_SLOT = 0.30       # Clearance for sliding/snap parts (mm)
TOLERANCE_HOLE = 0.20       # Radial clearance for through-holes (mm)
TOLERANCE_PRESS_FIT = -0.05 # Interference fit for pins (mm)
MIN_WALL_THICKNESS = 2.0    # Minimum structural wall thickness (mm)
DEFAULT_WALL_THICKNESS = 2.5# Nominal enclosure wall thickness (mm)
BASE_THICKNESS = 3.0        # Enclosure base plate thickness (mm)
COVER_THICKNESS = 2.0       # Removable cover thickness (mm)

# Fasteners: Standard M3 Machine Screws & Heat-Set Brass Inserts
M3_SCREW_DIAMETER = 3.0
M3_CLEARANCE_HOLE = 3.4     # Through-hole diameter for M3
M3_THREAD_HOLE = 2.5        # Direct tap hole for plastic M3
M3_INSERT_HOLE_OD = 4.2     # Counterbore hole for M3 heat-set insert (OD: 4.6mm)
M3_INSERT_DEPTH = 5.5       # Depth for M3 heat-set insert
M3_HEAD_DIAMETER = 5.8      # Socket head cap screw (SHCS) head OD
M3_HEAD_HEIGHT = 3.0        # SHCS head height
STANDOFF_OD = 7.0           # External diameter of screw standoff pillars

# ==============================================================================
# HARDWARE COMPONENT DIMENSIONS (VERIFIED DATASHEETS)
# ==============================================================================

@dataclass(frozen=True)
class ESP32Dimensions:
    """ESP32-WROOM-32 DevKit V1 (30-Pin Standard DOIT Board)"""
    width: float = 28.5             # PCB width (X)
    length: float = 51.5            # PCB length (Y)
    pcb_thickness: float = 1.6      # PCB substrate thickness
    overall_height: float = 12.8    # Metal RF can + top components + header pins
    header_pin_depth: float = 8.5   # Pin protrusion underneath PCB (if not trimmed)
    mount_hole_pitch_x: float = 23.5# Center-to-center widthwise hole spacing
    mount_hole_pitch_y: float = 46.5# Center-to-center lengthwise hole spacing
    mount_hole_dia: float = 3.2     # Mounting hole diameter
    usb_protrusion: float = 1.5     # Micro-USB port protrusion past Y=0 edge
    usb_width: float = 8.0          # Micro-USB connector width
    usb_height: float = 3.2         # Micro-USB connector height
    antenna_clearance_y: float = 7.0# Keep-out length under PCB antenna (no copper/metal)


@dataclass(frozen=True)
class LD2410Dimensions:
    """Hi-Link HLK-LD2410 24GHz mmWave Presence Radar Module with Breakout"""
    width: float = 16.0             # Carrier PCB width (X)
    length: float = 38.0            # Carrier PCB length (Y)
    pcb_thickness: float = 1.2
    overall_height: float = 4.5     # Top SMD + antenna traces + solder pins
    antenna_area_width: float = 14.0# RF patch antenna array width
    antenna_area_length: float = 18.0# RF patch antenna array length
    radome_standoff: float = 3.5    # Recommended distance between antenna face & radome
    radome_wall_thickness: float = 1.5 # RF transparent front wall thickness (24 GHz)
    fov_azimuth_deg: float = 120.0  # Total azimuth beamwidth (+/- 60 deg)
    fov_elevation_deg: float = 120.0# Total elevation beamwidth (+/- 60 deg)


@dataclass(frozen=True)
class BME280Dimensions:
    """Bosch BME280 Temperature, Humidity & Pressure Sensor Breakout (GY-BME280)"""
    width: float = 12.0             # Breakout PCB width (X)
    length: float = 15.5            # Breakout PCB length (Y)
    pcb_thickness: float = 1.6
    overall_height: float = 3.2     # Metal sensor package + pullups
    mount_hole_dia: float = 3.0     # Mounting hole diameter
    mount_hole_x: float = 6.0       # Hole center offset from left edge
    mount_hole_y: float = 2.5       # Hole center offset from top edge
    thermal_isolation_standoff: float = 15.0 # Air gap separation from heat sources


@dataclass(frozen=True)
class INA219Dimensions:
    """TI INA219 High-Side DC Current & Power Sensor Breakout"""
    width: float = 22.3             # PCB width (X)
    length: float = 25.5            # PCB length (Y)
    pcb_thickness: float = 1.6
    overall_height: float = 11.5    # Screw terminal block height
    mount_hole_pitch_x: float = 17.0# Widthwise hole spacing
    mount_hole_pitch_y: float = 20.0# Lengthwise hole spacing
    mount_hole_dia: float = 3.0
    terminal_block_height: float = 10.0
    terminal_block_width: float = 10.5


@dataclass(frozen=True)
class RelayDimensions:
    """Songle SRD-05VDC-SL-C 5V Optocoupled Relay Module (Narrow Single-Channel)"""
    width: float = 17.5             # PCB width (X)
    length: float = 43.5            # PCB length (Y)
    pcb_thickness: float = 1.6
    overall_height: float = 18.5    # Relay cube height
    cube_width: float = 15.5        # Songle blue plastic relay body width
    cube_length: float = 19.0       # Relay body length
    cube_height: float = 15.5       # Relay body height
    terminal_block_width: float = 15.0 # 3-pin screw terminal block (NO/COM/NC)
    terminal_block_length: float = 8.5
    mount_hole_pitch_x: float = 12.0
    mount_hole_pitch_y: float = 38.0
    mount_hole_dia: float = 3.0
    hv_creepage_barrier: float = 6.0# Minimum dielectric wall separation for mains load


@dataclass(frozen=True)
class Fan120Dimensions:
    """Standard 120mm 4-Pin PWM Brushless DC Fan (Intel 4-Wire Standard)"""
    frame_width: float = 120.0      # Outer square width (X)
    frame_height: float = 120.0     # Outer square height (Z)
    frame_depth: float = 25.4       # Fan thickness (Y)
    mount_hole_pitch: float = 105.0 # Center-to-center square hole pitch
    mount_hole_dia: float = 4.3     # Mounting hole diameter for M4 screws / fan tap
    corner_inset: float = 7.5       # Distance from corner to hole center
    hub_dia: float = 42.0           # Central motor hub diameter
    blade_sweep_dia: float = 113.0  # Rotating impeller tip diameter
    bellmouth_radius: float = 4.0   # Inlet duct acoustic bellmouth radius
    vibration_pad_thickness: float = 1.5 # Silicone/TPU damping gasket


@dataclass(frozen=True)
class PowerPortDimensions:
    """5.5 x 2.1mm DC Barrel Jack & 5x20mm Fuse Holder"""
    barrel_thread_dia: float = 11.2 # Panel cutout diameter for DC barrel jack
    barrel_flange_dia: float = 14.0 # Front flange diameter
    barrel_depth: float = 16.5      # Internal clearance depth
    fuse_thread_dia: float = 12.2   # Panel cutout diameter for 5x20 fuse holder
    fuse_flange_dia: float = 14.5   # Fuse cap bezel diameter
    fuse_depth: float = 32.0        # Internal clearance depth for fuse body


# ==============================================================================
# PARAMETRIC ENCLOSURE ARCHITECTURE SIZING
# ==============================================================================

@dataclass
class EnclosureConfig:
    """Main Electronics Enclosure Geometry Parameters"""
    # Internal Cavity Dimensions
    interior_width: float = 140.0   # X dimension inside walls
    interior_length: float = 95.0   # Y dimension inside walls
    interior_height: float = 36.0   # Z dimension from floor to cover underside
    wall_thickness: float = DEFAULT_WALL_THICKNESS
    base_thickness: float = BASE_THICKNESS
    cover_thickness: float = COVER_THICKNESS

    # Computed Exterior Dimensions
    @property
    def exterior_width(self) -> float:
        return self.interior_width + 2 * self.wall_thickness

    @property
    def exterior_length(self) -> float:
        return self.interior_length + 2 * self.wall_thickness

    @property
    def exterior_height(self) -> float:
        return self.interior_height + self.base_thickness + self.cover_thickness

    # Standoff Pillar Heights (from inner floor to PCB bottom)
    pcb_standoff_height: float = 6.0

    # Ventilation Louvers
    louver_width: float = 2.5
    louver_length: float = 24.0
    louver_spacing: float = 5.0
    louver_angle_deg: float = 45.0

    # Subsystem Dimensions
    esp32: ESP32Dimensions = ESP32Dimensions()
    radar: LD2410Dimensions = LD2410Dimensions()
    bme280: BME280Dimensions = BME280Dimensions()
    ina219: INA219Dimensions = INA219Dimensions()
    relay: RelayDimensions = RelayDimensions()
    fan: Fan120Dimensions = Fan120Dimensions()
    power: PowerPortDimensions = PowerPortDimensions()


# Global default configuration instance
CONFIG = EnclosureConfig()

