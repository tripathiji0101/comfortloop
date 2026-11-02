"""
ComfortLoop CAD — 2D Engineering Drawings Generator
Generates dimensioned technical drawing sheets in vector SVG format with:
  - Standard engineering border, title block, and third-angle projection
  - Orthographic projections: Top, Front, Right Side, and Isometric 3D views
  - Key dimensional annotations, tolerances, material specs, and drawing metadata

Drawings generated:
  1. Drawing_Main_Enclosure.svg
  2. Drawing_Cover.svg
  3. Drawing_Fan_Duct.svg
  4. Drawing_Radar_Housing.svg
  5. Drawing_BME_Snorkel.svg
  6. Drawing_Complete_Assembly.svg
"""

import os
import sys
import xml.etree.ElementTree as ET

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

import cadquery as cq
from cad.config import CONFIG
from cad.parts.main_enclosure import create_main_enclosure
from cad.parts.enclosure_cover import create_enclosure_cover
from cad.parts.radar_housing import create_radar_housing
from cad.parts.bme_snorkel import create_bme_snorkel
from cad.parts.fan_duct import create_fan_duct
from cad.assembly import build_comfortloop_assembly

DRAWING_DIR = os.path.join(PROJECT_ROOT, "exports", "drawings")
PUBLIC_DRAWING_DIR = os.path.join(PROJECT_ROOT, "public", "cad", "drawings")
TEMP_DIR = os.path.join(PROJECT_ROOT, "exports", "temp_svg")


def create_sheet_svg(part_name, drawing_num, material, dimensions, notes, view_svgs):
    """
    Composites orthographic views and metadata into an ISO A3-proportioned technical drawing.
    Width: 1120px, Height: 792px (approx A3 aspect ratio 1.414).
    """
    svg_header = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1120 792" width="100%" height="100%" style="background:#ffffff; font-family:'Helvetica Neue', Arial, sans-serif;">
  <defs>
    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" stroke-width="0.5"/>
    </pattern>
    <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#b45309" />
    </marker>
  </defs>

  <!-- Background Grid -->
  <rect width="1120" height="792" fill="#ffffff" />
  <rect width="1120" height="792" fill="url(#grid)" />

  <!-- Drawing Outer Border -->
  <rect x="25" y="25" width="1070" height="742" fill="none" stroke="#1e293b" stroke-width="2.5" />
  <rect x="35" y="35" width="1050" height="722" fill="none" stroke="#64748b" stroke-width="0.75" />

  <!-- Grid Reference Labels -->
  <g font-size="10" fill="#64748b" text-anchor="middle">
    <text x="200" y="20">A</text><text x="450" y="20">B</text><text x="700" y="20">C</text><text x="950" y="20">D</text>
    <text x="200" y="780">A</text><text x="450" y="780">B</text><text x="700" y="780">C</text><text x="950" y="780">D</text>
    <text x="15" y="150">1</text><text x="15" y="350">2</text><text x="15" y="550">3</text>
    <text x="1105" y="150">1</text><text x="1105" y="350">2</text><text x="1105" y="550">3</text>
  </g>

  <!-- Title Block (Bottom Right Corner) -->
  <g transform="translate(685, 607)">
    <rect width="400" height="150" fill="#f8fafc" stroke="#1e293b" stroke-width="1.5" />
    <line x1="0" y1="35" x2="400" y2="35" stroke="#1e293b" stroke-width="1.0" />
    <line x1="0" y1="80" x2="400" y2="80" stroke="#1e293b" stroke-width="1.0" />
    <line x1="0" y1="115" x2="400" y2="115" stroke="#1e293b" stroke-width="1.0" />
    <line x1="200" y1="35" x2="200" y2="80" stroke="#1e293b" stroke-width="1.0" />
    <line x1="280" y1="80" x2="280" y2="150" stroke="#1e293b" stroke-width="1.0" />

    <!-- Title Block Text -->
    <text x="15" y="24" font-size="14" font-weight="bold" fill="#b45309">COMFORTLOOP — atomQUEST 2026 | TRACK 1: FAN</text>
    <text x="15" y="52" font-size="9" fill="#64748b">PART NAME:</text>
    <text x="15" y="70" font-size="13" font-weight="bold" fill="#0f172a">{part_name}</text>
    
    <text x="215" y="52" font-size="9" fill="#64748b">DRAWING NO:</text>
    <text x="215" y="70" font-size="13" font-weight="bold" fill="#0f172a">{drawing_num}</text>

    <text x="15" y="97" font-size="9" fill="#64748b">MATERIAL / FINISH:</text>
    <text x="15" y="110" font-size="10" font-weight="600" fill="#1e293b">{material}</text>

    <text x="295" y="97" font-size="9" fill="#64748b">UNITS / SCALE:</text>
    <text x="295" y="110" font-size="10" font-weight="600" fill="#1e293b">mm / 1:1 (ISO)</text>

    <text x="15" y="132" font-size="9" fill="#64748b">ENVELOPE DIMS:</text>
    <text x="15" y="143" font-size="10" font-weight="600" fill="#1e293b">{dimensions}</text>

    <text x="295" y="132" font-size="9" fill="#64748b">PROJECTION:</text>
    <text x="295" y="143" font-size="10" font-weight="600" fill="#1e293b">Third Angle (3D)</text>
  </g>

  <!-- Notes Block (Top Right) -->
  <g transform="translate(700, 50)">
    <rect width="360" height="150" fill="#ffffff" stroke="#94a3b8" stroke-width="0.75" rx="4" />
    <text x="15" y="25" font-size="11" font-weight="bold" fill="#1e293b">ENGINEERING NOTES &amp; TOLERANCES:</text>
    <text x="15" y="48" font-size="9.5" fill="#334155">1. UNLESS SPECIFIED: DIMS IN mm. LINEAR TOL: ±0.20 mm.</text>
    <text x="15" y="66" font-size="9.5" fill="#334155">2. MANUFACTURING: FDM 3D PRINTING (0.20 mm LAYER HEIGHT).</text>
    <text x="15" y="84" font-size="9.5" fill="#334155">3. THREADED INSERTS: M3 / M4 BRASS HEAT-SET (220°C PRESS).</text>
    <text x="15" y="102" font-size="9.5" fill="#334155">4. ELECTRICAL: 12V DC SELV OPERATION (CLASS II ISOLATION).</text>
    <text x="15" y="120" font-size="9.5" fill="#b45309">5. {notes}</text>
  </g>

  <!-- View Quadrant Labels -->
  <text x="260" y="70" font-size="12" font-weight="bold" fill="#475569" text-anchor="middle">TOP VIEW</text>
  <text x="260" y="410" font-size="12" font-weight="bold" fill="#475569" text-anchor="middle">FRONT VIEW</text>
  <text x="560" y="410" font-size="12" font-weight="bold" fill="#475569" text-anchor="middle">RIGHT SIDE VIEW</text>
  <text x="560" y="70" font-size="12" font-weight="bold" fill="#475569" text-anchor="middle">ISOMETRIC 3D VIEW</text>
"""
    # Embed the SVG views (pre-centered inside respective quadrant bounding boxes)
    v_top = view_svgs.get("top", "")
    v_front = view_svgs.get("front", "")
    v_side = view_svgs.get("side", "")
    v_iso = view_svgs.get("iso", "")

    svg_content = f"""{svg_header}
  <!-- Top View -->
  <g transform="translate(60, 85)">
    <rect width="360" height="290" fill="#fdfdfd" stroke="#e2e8f0" stroke-width="0.5" rx="4" />
    {v_top}
  </g>

  <!-- Front View -->
  <g transform="translate(60, 425)">
    <rect width="360" height="290" fill="#fdfdfd" stroke="#e2e8f0" stroke-width="0.5" rx="4" />
    {v_front}
  </g>

  <!-- Side View -->
  <g transform="translate(430, 425)">
    <rect width="240" height="290" fill="#fdfdfd" stroke="#e2e8f0" stroke-width="0.5" rx="4" />
    {v_side}
  </g>

  <!-- Isometric View -->
  <g transform="translate(430, 85)">
    <rect width="250" height="290" fill="#fdfdfd" stroke="#e2e8f0" stroke-width="0.5" rx="4" />
    {v_iso}
  </g>

</svg>"""
    return svg_content


def render_and_center_view(shape, proj_dir, box_w, box_h):
    """
    Renders projection view with CadQuery getSVG and calculates the exact
    coordinate offset required to center the geometry dead-center in box_w x box_h.
    """
    import re
    shape_obj = shape.val() if hasattr(shape, "val") else shape
    raw_svg = cq.exporters.getSVG(
        shape_obj,
        opts={
            "projectionDir": proj_dir,
            "showHidden": False,
            "width": box_w * 0.82,
            "height": box_h * 0.82,
            "marginLeft": 0,
            "marginTop": 0,
            "strokeWidth": 0.8,
            "strokeColor": (30, 41, 59),
        }
    )

    m_scale = re.search(r"scale\(([-0-9.]+),\s*([-0-9.]+)\)", raw_svg)
    m_trans = re.search(r"translate\(([-0-9.]+),\s*([-0-9.]+)\)", raw_svg)
    if not m_scale or not m_trans:
        return "<g></g>"

    sx, sy = float(m_scale.group(1)), float(m_scale.group(2))
    tx, ty = float(m_trans.group(1)), float(m_trans.group(2))

    d_attrs = re.findall(r'd="([^"]+)"', raw_svg)
    xs, ys = [], []
    for d in d_attrs:
        pts = re.findall(r"([-0-9.]+),([-0-9.]+)", d)
        for x_str, y_str in pts:
            x, y = float(x_str), float(y_str)
            xs.append(sx * (x + tx))
            ys.append(sy * (y + ty))

    if not xs or not ys:
        return "<g></g>"

    xmin, xmax = min(xs), max(xs)
    ymin, ymax = min(ys), max(ys)
    w_drawn = xmax - xmin
    h_drawn = ymax - ymin

    # Calculate offset to place center of drawing at center of box
    offset_x = (box_w - w_drawn) / 2.0 - xmin
    offset_y = (box_h - h_drawn) / 2.0 - ymin

    start = raw_svg.find("<g")
    end = raw_svg.rfind("</svg>")
    inner = raw_svg[start:end]

    return f'<g transform="translate({offset_x:.2f}, {offset_y:.2f})">{inner}</g>'


def export_drawing(part_name, drawing_num, shape, material, dimensions, notes, filename):
    os.makedirs(TEMP_DIR, exist_ok=True)
    os.makedirs(DRAWING_DIR, exist_ok=True)
    os.makedirs(PUBLIC_DRAWING_DIR, exist_ok=True)

    views = {
        "top": render_and_center_view(shape, (0, 0, 1), 360, 290),
        "front": render_and_center_view(shape, (0, -1, 0), 360, 290),
        "side": render_and_center_view(shape, (1, 0, 0), 240, 290),
        "iso": render_and_center_view(shape, (1, -1, 1), 250, 290),
    }

    sheet_svg = create_sheet_svg(part_name, drawing_num, material, dimensions, notes, views)
    
    out_path = os.path.join(DRAWING_DIR, f"{filename}.svg")
    pub_path = os.path.join(PUBLIC_DRAWING_DIR, f"{filename}.svg")
    
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(sheet_svg)
    with open(pub_path, "w", encoding="utf-8") as f:
        f.write(sheet_svg)
        
    print(f"  ✓ {part_name:.<32s} -> {filename}.svg ({os.path.getsize(out_path)/1024:.1f} KB)")


def main():
    print()
    print("=" * 76)
    print("  COMFORTLOOP CAD — 2D TECHNICAL ENGINEERING DRAWING GENERATION")
    print("=" * 76)
    print()

    drawings = [
        (
            "Main Electronics Chassis",
            "CL-DWG-001",
            create_main_enclosure(),
            "PETG (35% Gyroid Infill, 2.5mm Wall)",
            "145.0 x 132.0 x 39.0 mm",
            "Features rear fan shelf, front clevis, and 5 convective louvers.",
            "Drawing_Main_Enclosure"
        ),
        (
            "Enclosure Top Cover Lid",
            "CL-DWG-002",
            create_enclosure_cover(),
            "PETG / PLA (100% Infill, 2.0mm Plate)",
            "145.0 x 100.0 x 3.5 mm",
            "Features 1.5mm perimeter dust lip and 4x M3 counterbore recesses.",
            "Drawing_Cover"
        ),
        (
            "120mm Fan Duct &amp; Bracket",
            "CL-DWG-003",
            create_fan_duct(),
            "PETG / ABS (R=4.0mm Acoustic Bellmouth)",
            "120.0 x 120.0 x 25.0 mm",
            "Integrated L-bracket foot bolts directly to chassis rear shelf.",
            "Drawing_Fan_Duct"
        ),
        (
            "HLK-LD2410 Radar Radome Pod",
            "CL-DWG-004",
            create_radar_housing(),
            "Low-loss Polycarbonate / PETG",
            "26.6 x 42.6 x 12.2 mm",
            "1.50mm RF radome front face. Lateral trunnion ears for 15° tilt.",
            "Drawing_Radar_Housing"
        ),
        (
            "BME280 Thermal Snorkel Pod",
            "CL-DWG-005",
            create_bme_snorkel(),
            "PETG (Continuous Thermal Standoff)",
            "16.6 x 38.1 x 22.0 mm",
            "15mm conduit standoff with 4x ambient airflow exchange slits.",
            "Drawing_BME_Snorkel"
        ),
        (
            "Complete System Assembly",
            "CL-DWG-006",
            build_comfortloop_assembly(exploded=False).toCompound(),
            "Electro-Mechanical Multi-Body Assembly",
            "183.1 x 215.6 x 145.5 mm",
            "Integrated desktop system: fan, enclosure, sensors, and PCBs.",
            "Drawing_Complete_Assembly"
        ),
    ]

    for part_name, dwg_no, shape, mat, dims, notes, fname in drawings:
        export_drawing(part_name, dwg_no, shape, mat, dims, notes, fname)

    # Clean temp files
    if os.path.exists(TEMP_DIR):
        import shutil
        shutil.rmtree(TEMP_DIR)

    print()
    print("-" * 76)
    print(f"  ALL 6 DRAWINGS GENERATED in {DRAWING_DIR}")
    print(f"  Web Assets Synchronized in {PUBLIC_DRAWING_DIR}")
    print("=" * 76)
    print()


if __name__ == "__main__":
    main()

