import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import {
  Box,
  Eye,
  EyeOff,
  Maximize2,
  RotateCcw,
  Layers,
  Download,
  Info,
  CheckCircle,
  FileCode,
  Compass,
  Scissors,
  FileText,
  Sliders,
} from 'lucide-react';

export interface PartMetadata {
  id: string;
  name: string;
  filename: string;
  cutawayFilename?: string;
  stepFilename: string;
  category: 'Enclosure' | 'Sensor Housing' | 'Airflow Assembly' | 'Internal Electronics' | 'Hardware Fasteners';
  material: string;
  color: string;
  roughness: number;
  metalness: number;
  dimensions: string;
  fasteners: string;
  notes: string;
  nominalPos: [number, number, number];
  nominalRot: [number, number, number];
  explodedOffset: [number, number, number];
}

export const PARTS_DATA: PartMetadata[] = [
  {
    id: 'main_enclosure',
    name: 'Main Electronics Chassis',
    filename: 'ComfortLoop_Main_Enclosure.stl',
    cutawayFilename: 'ComfortLoop_Main_Enclosure_Cutaway.stl',
    stepFilename: 'ComfortLoop_Main_Enclosure.step',
    category: 'Enclosure',
    material: 'PETG / ABS (35% Gyroid Infill, 2.5mm Wall)',
    color: '#262930',
    roughness: 0.55,
    metalness: 0.08,
    dimensions: '145.0 × 142.0 × 39.0 mm',
    fasteners: '4x M3 Brass Heat-Set Inserts, 8x PCB Inserts, 2x M4 Shelf Inserts',
    notes: 'Engineered with integrated rear fan shelf, front radar clevis, USB port, DC jack, fuse, and 5 convective louvers.',
    nominalPos: [0, 0, 0],
    nominalRot: [0, 0, 0],
    explodedOffset: [0, 0, 0],
  },
  {
    id: 'enclosure_cover',
    name: 'Enclosure Top Cover Lid',
    filename: 'ComfortLoop_Enclosure_Cover.stl',
    cutawayFilename: 'ComfortLoop_Enclosure_Cover_Cutaway.stl',
    stepFilename: 'ComfortLoop_Enclosure_Cover.step',
    category: 'Enclosure',
    material: 'PETG / PLA (100% Solid Infill, 2.0mm Plate)',
    color: '#383e48',
    roughness: 0.45,
    metalness: 0.1,
    dimensions: '145.0 × 100.0 × 3.5 mm',
    fasteners: '4x M3×10mm Counterbore Socket Head Cap Screws',
    notes: 'Features 1.5mm interlocking perimeter lip for dust and ingress prevention.',
    nominalPos: [0, 0, 39.0],
    nominalRot: [0, 0, 0],
    explodedOffset: [0, 0, 75.0],
  },
  {
    id: 'esp32_devkit',
    name: 'ESP32 DevKit V1 Microcontroller',
    filename: 'ComfortLoop_ESP32_DevKit.stl',
    stepFilename: 'ComfortLoop_ESP32_DevKit.step',
    category: 'Internal Electronics',
    material: 'FR4 PCB + Metal RF Shield Can + MicroUSB',
    color: '#15803d',
    roughness: 0.35,
    metalness: 0.4,
    dimensions: '28.5 × 53.0 × 13.3 mm',
    fasteners: '4x M3×6mm Pan Head Screws into Standoffs',
    notes: 'Primary MCU executing dual-core RTOS control loop, apparent temperature filter, and mmWave UART protocol.',
    nominalPos: [-35.0, -15.0, 9.0],
    nominalRot: [0, 0, 0],
    explodedOffset: [0, 0, 40.0],
  },
  {
    id: 'ina219_sensor',
    name: 'TI INA219 Current & Power Sensor',
    filename: 'ComfortLoop_INA219_Sensor.stl',
    stepFilename: 'ComfortLoop_INA219_Sensor.step',
    category: 'Internal Electronics',
    material: 'FR4 Breakout + 0.1Ω Precision Shunt Resistor',
    color: '#1d4ed8',
    roughness: 0.35,
    metalness: 0.3,
    dimensions: '22.3 × 25.5 × 20.1 mm',
    fasteners: '2x M3 Screws on Standoffs (17x20mm pitch)',
    notes: 'Monitors real-time 12V bus voltage, fan current, and power consumption with 12-bit ADC accuracy.',
    nominalPos: [38.0, -22.0, 9.0],
    nominalRot: [0, 0, 0],
    explodedOffset: [0, 0, 40.0],
  },
  {
    id: 'relay_module',
    name: 'Songle 5V Optocoupled Relay Module',
    filename: 'ComfortLoop_Relay_Module.stl',
    stepFilename: 'ComfortLoop_Relay_Module.step',
    category: 'Internal Electronics',
    material: 'FR4 Substrate + Songle Relay Cube + Screw Terminals',
    color: '#2563eb',
    roughness: 0.4,
    metalness: 0.2,
    dimensions: '17.5 × 43.5 × 25.6 mm',
    fasteners: '2x M3 Screws Behind 24mm Dielectric Wall',
    notes: 'Auxiliary zero-power isolation relay switching peripheral loads under SELV/Class II isolation.',
    nominalPos: [38.0, 22.0, 9.0],
    nominalRot: [0, 0, 0],
    explodedOffset: [0, 0, 40.0],
  },
  {
    id: 'radar_housing',
    name: 'HLK-LD2410 Radar Radome Pod',
    filename: 'ComfortLoop_Radar_Housing.stl',
    stepFilename: 'ComfortLoop_Radar_Housing.step',
    category: 'Sensor Housing',
    material: 'Low-loss Polycarbonate / PETG (1.5mm Radome)',
    color: '#f1f5f9',
    roughness: 0.3,
    metalness: 0.05,
    dimensions: '26.6 × 42.6 × 12.2 mm',
    fasteners: 'M3 Pivot Axle Screw through Front Clevis (15° Down-Tilt)',
    notes: 'Dielectric-optimized 1.5mm front face for zero 24GHz mmWave radar beam attenuation.',
    nominalPos: [0, -68.89, 25.58],
    nominalRot: [-105 * (Math.PI / 180), 0, 0],
    explodedOffset: [0, -50.0, 0],
  },
  {
    id: 'ld2410_sensor',
    name: 'HLK-LD2410 mmWave Radar Module',
    filename: 'ComfortLoop_LD2410_Sensor.stl',
    stepFilename: 'ComfortLoop_LD2410_Sensor.step',
    category: 'Internal Electronics',
    material: 'FR4 High-Frequency PCB + 24GHz Microstrip Array',
    color: '#0284c7',
    roughness: 0.3,
    metalness: 0.5,
    dimensions: '16.0 × 38.0 × 10.9 mm',
    fasteners: 'Slide-in Retention Rails in Radome Pod',
    notes: 'FMCW 24GHz presence sensor detecting micro-motions and tracking occupant occupancy.',
    nominalPos: [0, -68.89, 25.58],
    nominalRot: [-105 * (Math.PI / 180), 0, 0],
    explodedOffset: [0, -75.0, 0],
  },
  {
    id: 'bme_snorkel',
    name: 'BME280 External Snorkel Pod',
    filename: 'ComfortLoop_BME_Snorkel_Pod.stl',
    stepFilename: 'ComfortLoop_BME_Snorkel_Pod.step',
    category: 'Sensor Housing',
    material: 'PETG (Continuous 15mm Thermal Standoff)',
    color: '#e2e8f0',
    roughness: 0.45,
    metalness: 0.05,
    dimensions: '16.6 × 38.1 × 22.0 mm',
    fasteners: '2x M3 Screws into Enclosure Left Wall',
    notes: 'Eliminates sensor self-heating by projecting 15mm outside main enclosure into free ambient air.',
    nominalPos: [-75.5, 0.0, 20.0],
    nominalRot: [-90 * (Math.PI / 180), 0, 90 * (Math.PI / 180)],
    explodedOffset: [-50.0, 0, 0],
  },
  {
    id: 'bme280_sensor',
    name: 'Bosch BME280 Environmental Sensor',
    filename: 'ComfortLoop_BME280_Sensor.stl',
    stepFilename: 'ComfortLoop_BME280_Sensor.step',
    category: 'Internal Electronics',
    material: 'FR4 Breakout + Metal Shield Package',
    color: '#0369a1',
    roughness: 0.35,
    metalness: 0.4,
    dimensions: '12.0 × 15.5 × 11.1 mm',
    fasteners: '1x M2.5 Screw inside Snorkel Chamber',
    notes: 'Measures ambient room temperature, relative humidity, and barometric pressure.',
    nominalPos: [-100.25, 0.0, 20.0],
    nominalRot: [0, 0, 0],
    explodedOffset: [-75.0, 0, 0],
  },
  {
    id: 'fan_duct',
    name: '120mm Aerodynamic Fan Duct',
    filename: 'ComfortLoop_Fan_Duct.stl',
    stepFilename: 'ComfortLoop_Fan_Duct.step',
    category: 'Airflow Assembly',
    material: 'PETG / ABS (Acoustic Bellmouth Lip, R=4.0mm)',
    color: '#1e232a',
    roughness: 0.5,
    metalness: 0.1,
    dimensions: '120.0 × 120.0 × 25.0 mm',
    fasteners: '2x M4 Screws into Rear Shelf + 4x M4 Fan Lugs',
    notes: 'Smooth aerodynamic transition reducing intake turbulence. Horizontal L-bracket foot bolts to chassis rear shelf.',
    nominalPos: [0, 50.0, 64.0],
    nominalRot: [90 * (Math.PI / 180), Math.PI, 0],
    explodedOffset: [0, 30.0, 40.0],
  },
  {
    id: 'fan120_bldc',
    name: '120mm 4-Pin PWM BLDC Fan',
    filename: 'ComfortLoop_Fan120_BLDC.stl',
    stepFilename: 'ComfortLoop_Fan120_BLDC.step',
    category: 'Airflow Assembly',
    material: 'PBT Frame + 7-Blade Impeller + Motor Hub',
    color: '#111827',
    roughness: 0.5,
    metalness: 0.15,
    dimensions: '120.0 × 120.0 × 25.4 mm',
    fasteners: '4x M4×35mm Corner Through-Bolts',
    notes: 'High-efficiency brushless DC fan modulated via 25kHz hardware PWM signal from ESP32 timer.',
    nominalPos: [0, 75.0, 64.0],
    nominalRot: [-90 * (Math.PI / 180), 0, 0],
    explodedOffset: [0, 80.0, 40.0],
  },
  {
    id: 'fan_grille',
    name: 'Concentric Safety Finger Grille',
    filename: 'ComfortLoop_Fan_Grille.stl',
    stepFilename: 'ComfortLoop_Fan_Grille.step',
    category: 'Airflow Assembly',
    material: 'Nickel-Plated Steel Wire or High-Strength PETG',
    color: '#94a3b8',
    roughness: 0.25,
    metalness: 0.8,
    dimensions: '121.0 × 121.0 × 2.5 mm',
    fasteners: '4x M4 Corner Screws Shared with Duct',
    notes: 'Concentric rings with <5.8mm radial spacing designed to prevent finger contact with blades.',
    nominalPos: [0, 100.4, 64.0],
    nominalRot: [-90 * (Math.PI / 180), 0, 0],
    explodedOffset: [0, 130.0, 40.0],
  },
  {
    id: 'cover_screws',
    name: 'Cover Fasteners (4x M3×10mm SHCS)',
    filename: 'ComfortLoop_M3_Screw.stl',
    stepFilename: 'ComfortLoop_M3_Screw.step',
    category: 'Hardware Fasteners',
    material: 'Grade 8.8 Black Oxide or Stainless Steel',
    color: '#475569',
    roughness: 0.25,
    metalness: 0.85,
    dimensions: 'M3 × 10.0 mm (Head Ø 5.5mm, Hex 2.5mm)',
    fasteners: '4x M3 Brass Heat-Set Corner Inserts',
    notes: 'Secures top lid with counterbored flush fit into chassis corner bosses.',
    nominalPos: [0, 0, 42.0],
    nominalRot: [Math.PI, 0, 0],
    explodedOffset: [0, 0, 110.0],
  },
  {
    id: 'duct_screws',
    name: 'Fan Duct Shelf Fasteners (2x M4×12mm SHCS)',
    filename: 'ComfortLoop_M4_Screw.stl',
    stepFilename: 'ComfortLoop_M4_Screw.step',
    category: 'Hardware Fasteners',
    material: 'Zinc-Plated Steel Machine Fastener',
    color: '#64748b',
    roughness: 0.25,
    metalness: 0.85,
    dimensions: 'M4 × 12.0 mm (Head Ø 7.0mm, Hex 3.0mm)',
    fasteners: '2x M4 Brass Inserts in Rear Mounting Shelf',
    notes: 'Firmly clamps the fan duct foot to the main enclosure base.',
    nominalPos: [0, 62.5, 8.0],
    nominalRot: [Math.PI, 0, 0],
    explodedOffset: [0, 40.0, 75.0],
  },
];

const DRAWINGS_LIST = [
  { id: 'Drawing_Complete_Assembly', title: 'Complete System Assembly', sheet: 'CL-DWG-006', desc: 'Integrated desktop system: fan, enclosure, sensors, and PCBs' },
  { id: 'Drawing_Main_Enclosure', title: 'Main Electronics Chassis', sheet: 'CL-DWG-001', desc: 'Chassis with rear fan shelf, front clevis, and port cutouts' },
  { id: 'Drawing_Cover', title: 'Enclosure Top Cover Lid', sheet: 'CL-DWG-002', desc: 'Cover lid with 1.5mm dust lip and 4x M3 counterbore recesses' },
  { id: 'Drawing_Fan_Duct', title: '120mm Aerodynamic Fan Duct', sheet: 'CL-DWG-003', desc: 'Acoustic bellmouth duct with horizontal shelf mounting foot' },
  { id: 'Drawing_Radar_Housing', title: 'HLK-LD2410 Radar Radome Pod', sheet: 'CL-DWG-004', desc: '1.50mm RF radome with lateral trunnion pivot ears' },
  { id: 'Drawing_BME_Snorkel', title: 'BME280 Thermal Snorkel Pod', sheet: 'CL-DWG-005', desc: 'Continuous 15mm standoff pod with convective ventilation slits' },
];

export const CadViewer: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Presentation Mode: 'assembled' | 'exploded' | 'cutaway'
  const [viewMode, setViewMode] = useState<'assembled' | 'exploded' | 'cutaway'>('assembled');
  const [activeSubTab, setActiveSubTab] = useState<'3d' | 'drawings'>('3d');
  const [selectedDrawingId, setSelectedDrawingId] = useState<string>('Drawing_Complete_Assembly');

  // Loading & Selection
  const [loading, setLoading] = useState<boolean>(true);
  const [loadProgress, setLoadProgress] = useState<number>(0);
  const [selectedPartId, setSelectedPartId] = useState<string>('main_enclosure');
  const [partVisibility, setPartVisibility] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    PARTS_DATA.forEach((p) => {
      init[p.id] = true;
    });
    return init;
  });
  const [wireframeMode, setWireframeMode] = useState<boolean>(false);

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshGroupRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const animationFrameRef = useRef<number | null>(null);

  // Target explosion factor (0.0 to 1.0)
  const explosionFactorRef = useRef<number>(0.0);

  // Synchronize viewMode ref so requestAnimationFrame always reads current mode without stale closures
  const viewModeRef = useRef<'assembled' | 'exploded' | 'cutaway'>(viewMode);
  useEffect(() => {
    viewModeRef.current = viewMode;
  }, [viewMode]);

  // Initialize Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 650;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#f7f2ea'); // Warm Linen Canvas
    sceneRef.current = scene;

    // 2. Camera: CAD coordinate system (Z is UP)
    const camera = new THREE.PerspectiveCamera(40, width / height, 1, 3000);
    camera.up.set(0, 0, 1);
    camera.position.set(240, -320, 200);
    cameraRef.current = camera;

    // 3. Renderer with antialiasing and shadow support
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 10, 35);
    controls.maxPolarAngle = Math.PI / 2 + 0.15; // Don't flip below ground
    controls.minDistance = 60;
    controls.maxDistance = 1500;
    controlsRef.current = controls;

    // 5. Lighting Setup (Engineering Studio Warm Sunlight)
    const ambientLight = new THREE.AmbientLight(0xfffbf5, 1.25);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 1.9);
    keyLight.position.set(220, -220, 320);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 50;
    keyLight.shadow.camera.far = 900;
    const d = 180;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0004;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xfef3c7, 0.75);
    fillLight.position.set(-220, 160, 160);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xd97706, 0.45);
    rimLight.position.set(0, 260, -50);
    scene.add(rimLight);

    // 6. Subtle Ground Grid & Shadow Receiver
    const gridHelper = new THREE.GridHelper(550, 25, 0xb45309, 0xe2d9cb);
    gridHelper.rotation.x = Math.PI / 2; // Lie on XY plane (Z=0)
    gridHelper.position.set(0, 20, -0.5);
    scene.add(gridHelper);

    const groundGeo = new THREE.PlaneGeometry(1200, 1200);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.14 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.set(0, 20, -0.6);
    ground.receiveShadow = true;
    scene.add(ground);

    // 7. Load REAL CAD STL Geometries for ALL parts
    const loader = new STLLoader();
    let loadedCount = 0;
    const meshMap = new Map<string, THREE.Mesh>();

    PARTS_DATA.forEach((part) => {
      loader.load(
        `/cad/${part.filename}`,
        (geometry) => {
          geometry.computeVertexNormals();

          const material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(part.color),
            roughness: part.roughness,
            metalness: part.metalness,
            wireframe: false,
          });

          const mesh = new THREE.Mesh(geometry, material);
          mesh.name = part.id;
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          // Apply nominal orientation & position
          mesh.rotation.set(...part.nominalRot);
          mesh.position.set(...part.nominalPos);

          scene.add(mesh);
          meshMap.set(part.id, mesh);

          loadedCount += 1;
          setLoadProgress(Math.round((loadedCount / PARTS_DATA.length) * 100));

          if (loadedCount === PARTS_DATA.length) {
            setLoading(false);
          }
        },
        undefined,
        (err) => {
          console.warn(`Could not load STL for ${part.id}:`, err);
          loadedCount += 1;
          if (loadedCount === PARTS_DATA.length) setLoading(false);
        }
      );
    });

    meshGroupRef.current = meshMap;

    // 8. Render & Animation Loop
    let lastTime = performance.now();
    const animate = (time: number) => {
      animationFrameRef.current = requestAnimationFrame(animate);
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      // Smoothly interpolate explosion factor (reads active viewMode ref without stale closure)
      const targetFactor = viewModeRef.current === 'exploded' ? 1.0 : 0.0;
      const speed = 3.5;
      explosionFactorRef.current += (targetFactor - explosionFactorRef.current) * Math.min(delta * speed, 1.0);

      // Apply exploded offsets to each part
      const factor = explosionFactorRef.current;
      PARTS_DATA.forEach((part) => {
        const mesh = meshMap.get(part.id);
        if (mesh) {
          mesh.position.set(
            part.nominalPos[0] + part.explodedOffset[0] * factor,
            part.nominalPos[1] + part.explodedOffset[1] * factor,
            part.nominalPos[2] + part.explodedOffset[2] * factor
          );
        }
      });

      controls.update();
      renderer.render(scene, camera);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    // 9. Handle Window Resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 650;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Handle Cutaway Mode (Swapping Chassis and Cover to Cutaway STL models only when entering/exiting cutaway)
  const prevViewModeRef = useRef<'assembled' | 'exploded' | 'cutaway'>(viewMode);
  useEffect(() => {
    const prevMode = prevViewModeRef.current;
    prevViewModeRef.current = viewMode;

    const meshMap = meshGroupRef.current;
    const loader = new STLLoader();

    if (viewMode === 'cutaway' && prevMode !== 'cutaway') {
      // Swap main_enclosure geometry to cutaway
      const encMesh = meshMap.get('main_enclosure');
      if (encMesh) {
        loader.load('/cad/ComfortLoop_Main_Enclosure_Cutaway.stl', (geo) => {
          geo.computeVertexNormals();
          encMesh.geometry.dispose();
          encMesh.geometry = geo;
        });
      }
      // Swap cover geometry to cutaway
      const covMesh = meshMap.get('enclosure_cover');
      if (covMesh) {
        loader.load('/cad/ComfortLoop_Enclosure_Cover_Cutaway.stl', (geo) => {
          geo.computeVertexNormals();
          covMesh.geometry.dispose();
          covMesh.geometry = geo;
        });
      }
    } else if (viewMode !== 'cutaway' && prevMode === 'cutaway') {
      // Restore nominal geometry
      const encMesh = meshMap.get('main_enclosure');
      if (encMesh) {
        loader.load('/cad/ComfortLoop_Main_Enclosure.stl', (geo) => {
          geo.computeVertexNormals();
          encMesh.geometry.dispose();
          encMesh.geometry = geo;
        });
      }
      const covMesh = meshMap.get('enclosure_cover');
      if (covMesh) {
        loader.load('/cad/ComfortLoop_Enclosure_Cover.stl', (geo) => {
          geo.computeVertexNormals();
          covMesh.geometry.dispose();
          covMesh.geometry = geo;
        });
      }
    }
  }, [viewMode]);

  // Update wireframe mode
  useEffect(() => {
    meshGroupRef.current.forEach((mesh) => {
      if (mesh.material instanceof THREE.MeshStandardMaterial) {
        mesh.material.wireframe = wireframeMode;
      }
    });
  }, [wireframeMode]);

  // Update part visibility
  useEffect(() => {
    meshGroupRef.current.forEach((mesh, id) => {
      mesh.visible = !!partVisibility[id];
    });
  }, [partVisibility]);

  // Camera preset handlers
  const setCameraView = (type: 'iso' | 'top' | 'front' | 'side' | 'duct' | 'cutaway') => {
    if (!cameraRef.current || !controlsRef.current) return;
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;

    switch (type) {
      case 'iso':
        cam.position.set(240, -320, 200);
        ctrl.target.set(0, 10, 35);
        break;
      case 'top':
        cam.position.set(0, 10, 480);
        ctrl.target.set(0, 10, 0);
        break;
      case 'front':
        cam.position.set(0, -380, 40);
        ctrl.target.set(0, 0, 40);
        break;
      case 'side':
        cam.position.set(-380, 10, 40);
        ctrl.target.set(0, 10, 40);
        break;
      case 'duct':
        cam.position.set(0, 380, 70);
        ctrl.target.set(0, 62.5, 64);
        break;
      case 'cutaway':
        cam.position.set(180, -220, 160);
        ctrl.target.set(15, -10, 25);
        break;
    }
    ctrl.update();
  };

  const resetCamera = () => {
    setCameraView('iso');
  };

  const togglePartVisibility = (id: string) => {
    setPartVisibility((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const showAllParts = () => {
    const updated: Record<string, boolean> = {};
    PARTS_DATA.forEach((p) => {
      updated[p.id] = true;
    });
    setPartVisibility(updated);
  };

  const hideAllParts = () => {
    const updated: Record<string, boolean> = {};
    PARTS_DATA.forEach((p) => {
      updated[p.id] = false;
    });
    setPartVisibility(updated);
  };

  const selectedPart = PARTS_DATA.find((p) => p.id === selectedPartId) || PARTS_DATA[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* Top Header & Mode Switcher */}
      <div className="eng-card" style={{ padding: '1rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Box size={22} color="#b45309" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.02em', color: 'var(--text-primary)' }}>
                COMFORTLOOP PHYSICAL CAD HARDWARE SUITE
              </h2>
              <span className="badge badge-accent">100% OPENCASCADE B-REP GEOMETRY</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
              Unified Desktop System: 120mm BLDC Fan, Monolithic Chassis, 24GHz mmWave Radome &amp; Thermal Snorkel.
            </div>
          </div>

          {/* Sub-Tab Navigation: 3D CAD Viewer vs 2D Technical Blueprints */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => setActiveSubTab('3d')}
              className={`btn ${activeSubTab === '3d' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.8rem' }}
            >
              <Box size={14} />
              Interactive 3D Assembly
            </button>
            <button
              onClick={() => setActiveSubTab('drawings')}
              className={`btn ${activeSubTab === 'drawings' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.8rem' }}
            >
              <FileText size={14} />
              2D Technical Blueprints (6)
            </button>
          </div>

          {/* Quick Download Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <a
              href="/cad/step/ComfortLoop_Assembly.step"
              download="ComfortLoop_Assembly.step"
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
              title="Download Master STEP Assembly (2.4 MB)"
            >
              <Download size={13} color="#b45309" />
              Assembled STEP (2.5MB)
            </a>
            <a
              href="/cad/step/ComfortLoop_Assembly_Exploded.step"
              download="ComfortLoop_Assembly_Exploded.step"
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
              title="Download Exploded Assembly STEP"
            >
              <Download size={13} color="#b45309" />
              Exploded STEP
            </a>
            <a
              href="/cad/step/ComfortLoop_Assembly_Cutaway.step"
              download="ComfortLoop_Assembly_Cutaway.step"
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
              title="Download Cutaway Assembly STEP"
            >
              <Scissors size={13} color="#b45309" />
              Cutaway STEP
            </a>
          </div>
        </div>
      </div>

      {/* SUB-TAB 1: 3D CAD VIEWER */}
      {activeSubTab === '3d' && (
        <>
          {/* Presentation Mode Selector Banner */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-secondary)', padding: '0.65rem 1.25rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Sliders size={16} color="#b45309" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                PRESENTATION CONFIGURATION:
              </span>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  onClick={() => setViewMode('assembled')}
                  className={`btn ${viewMode === 'assembled' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.725rem', padding: '0.3rem 0.75rem' }}
                >
                  <Box size={13} /> Assembled View
                </button>
                <button
                  onClick={() => setViewMode('exploded')}
                  className={`btn ${viewMode === 'exploded' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.725rem', padding: '0.3rem 0.75rem' }}
                >
                  <Maximize2 size={13} /> Exploded View
                </button>
                <button
                  onClick={() => {
                    setViewMode('cutaway');
                    setCameraView('cutaway');
                  }}
                  className={`btn ${viewMode === 'cutaway' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.725rem', padding: '0.3rem 0.75rem' }}
                >
                  <Scissors size={13} /> Internal Cutaway
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <span>
                {viewMode === 'assembled' && 'Showing nominal physical product assembly with zero floating gaps.'}
                {viewMode === 'exploded' && 'Exploding lid, PCBs, sensors, and fan assembly along physical build axes.'}
                {viewMode === 'cutaway' && 'Sectioning front-right chassis to expose ESP32, relay, and 24mm dielectric barrier.'}
              </span>
            </div>
          </div>

          {/* Main 3D Viewport Workspace */}
          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr 340px', gap: '1.25rem', alignItems: 'start' }}>
            {/* Left Column: Component Tree & Visibility Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="eng-card" style={{ padding: '1rem' }}>
                <div className="eng-card-header">
                  <span className="eng-card-title">
                    <Layers size={15} color="#b45309" />
                    Physical Components ({PARTS_DATA.length})
                  </span>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      onClick={showAllParts}
                      style={{ background: 'none', border: 'none', fontSize: '0.7rem', color: '#b45309', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Show All
                    </button>
                    <span style={{ color: 'var(--border-subtle)' }}>•</span>
                    <button
                      onClick={hideAllParts}
                      style={{ background: 'none', border: 'none', fontSize: '0.7rem', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      Hide All
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '460px', overflowY: 'auto' }}>
                  {PARTS_DATA.map((part) => {
                    const isSelected = selectedPartId === part.id;
                    const isVisible = !!partVisibility[part.id];

                    return (
                      <div
                        key={part.id}
                        onClick={() => setSelectedPartId(part.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.5rem 0.65rem',
                          borderRadius: '8px',
                          background: isSelected ? 'rgba(180, 83, 9, 0.12)' : 'var(--bg-secondary)',
                          border: `1px solid ${isSelected ? '#b45309' : 'var(--border-subtle)'}`,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                          <div
                            style={{
                              width: '11px',
                              height: '11px',
                              borderRadius: '3px',
                              background: part.color,
                              border: '1px solid rgba(0,0,0,0.15)',
                            }}
                          />
                          <div>
                            <div
                              style={{
                                fontSize: '0.775rem',
                                fontWeight: isSelected ? 700 : 500,
                                color: isSelected ? '#b45309' : 'var(--text-primary)',
                              }}
                            >
                              {part.name}
                            </div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                              {part.category}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePartVisibility(part.id);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: isVisible ? 'var(--text-primary)' : 'var(--text-muted)',
                            padding: '0.2rem',
                          }}
                          title={isVisible ? 'Hide part' : 'Show part'}
                        >
                          {isVisible ? <Eye size={14} /> : <EyeOff size={14} color="#94a3b8" />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Camera Presets Card */}
              <div className="eng-card" style={{ padding: '1rem' }}>
                <div className="eng-card-header">
                  <span className="eng-card-title">
                    <Compass size={15} color="#b45309" />
                    Camera Angles
                  </span>
                  <button
                    onClick={resetCamera}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: '0.725rem',
                    }}
                    title="Reset View"
                  >
                    <RotateCcw size={13} /> Reset
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem' }}>
                  <button className="btn btn-secondary" style={{ fontSize: '0.725rem', padding: '0.35rem' }} onClick={() => setCameraView('iso')}>
                    Isometric 3D
                  </button>
                  <button className="btn btn-secondary" style={{ fontSize: '0.725rem', padding: '0.35rem' }} onClick={() => setCameraView('top')}>
                    Top (Interior)
                  </button>
                  <button className="btn btn-secondary" style={{ fontSize: '0.725rem', padding: '0.35rem' }} onClick={() => setCameraView('front')}>
                    Front (Radar)
                  </button>
                  <button className="btn btn-secondary" style={{ fontSize: '0.725rem', padding: '0.35rem' }} onClick={() => setCameraView('side')}>
                    Side (BME280)
                  </button>
                  <button className="btn btn-secondary" style={{ fontSize: '0.725rem', padding: '0.35rem' }} onClick={() => setCameraView('duct')}>
                    Rear (120mm Fan)
                  </button>
                  <button className="btn btn-secondary" style={{ fontSize: '0.725rem', padding: '0.35rem' }} onClick={() => setCameraView('cutaway')}>
                    Cutaway Focus
                  </button>
                </div>

                <div style={{ marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>Wireframe Mesh</span>
                  <button
                    onClick={() => setWireframeMode(!wireframeMode)}
                    className={`btn ${wireframeMode ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.725rem', padding: '0.25rem 0.6rem' }}
                  >
                    {wireframeMode ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
            </div>

            {/* Center: 3D WebGL Canvas */}
            <div style={{ position: 'relative', width: '100%', height: '670px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-subtle)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              {/* WebGL Canvas Container */}
              <div ref={mountRef} style={{ width: '100%', height: '100%', outline: 'none' }} />

              {/* Loading Overlay */}
              {loading && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(247, 242, 234, 0.88)',
                    backdropFilter: 'blur(5px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.85rem',
                    zIndex: 10,
                  }}
                >
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      border: '3px solid var(--border-subtle)',
                      borderTopColor: '#b45309',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }}
                  />
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Loading OpenCASCADE B-Rep Geometries ({loadProgress}%)...
                  </div>
                </div>
              )}

              {/* Floating Controls Overlay */}
              <div
                style={{
                  position: 'absolute',
                  top: '1rem',
                  left: '1rem',
                  background: 'rgba(245, 239, 231, 0.94)',
                  backdropFilter: 'blur(8px)',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.725rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  color: 'var(--text-secondary)',
                }}
              >
                <span style={{ fontWeight: 700, color: '#b45309' }}>ROTATE:</span> Left Click + Drag
                <span>•</span>
                <span style={{ fontWeight: 700, color: '#b45309' }}>PAN:</span> Right Click + Drag
                <span>•</span>
                <span style={{ fontWeight: 700, color: '#b45309' }}>ZOOM:</span> Scroll
              </div>

              {/* Bottom Info Bar with Dimension Callouts */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '1rem',
                  left: '1rem',
                  right: '1rem',
                  background: 'rgba(245, 239, 231, 0.95)',
                  backdropFilter: 'blur(8px)',
                  padding: '0.6rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.775rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: viewMode === 'exploded' ? '#d97706' : (viewMode === 'cutaway' ? '#e11d48' : '#059669'),
                    }}
                  />
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                    {viewMode} Mode Active
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>•</span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    Scale: 1.0mm = 1 unit • System Envelope: 183.1 × 215.6 × 145.5 mm
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => setViewMode(viewMode === 'exploded' ? 'assembled' : 'exploded')}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.725rem', padding: '0.25rem 0.65rem' }}
                  >
                    <Maximize2 size={12} />
                    {viewMode === 'exploded' ? 'Pack' : 'Explode'}
                  </button>
                  <button
                    onClick={() => setViewMode(viewMode === 'cutaway' ? 'assembled' : 'cutaway')}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.725rem', padding: '0.25rem 0.65rem' }}
                  >
                    <Scissors size={12} />
                    {viewMode === 'cutaway' ? 'Solid' : 'Cutaway'}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Part Technical Datasheet */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="eng-card" style={{ padding: '1.15rem' }}>
                <div className="eng-card-header">
                  <span className="eng-card-title">
                    <Info size={15} color="#b45309" />
                    Component Inspector
                  </span>
                  <span className="badge badge-sim">{selectedPart.category}</span>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    {selectedPart.name}
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                    {selectedPart.notes}
                  </p>
                </div>

                {/* Technical Specifications */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem',
                    background: 'var(--bg-secondary)',
                    padding: '0.85rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.75rem',
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.675rem', textTransform: 'uppercase' }}>
                      Physical Dimensions
                    </span>
                    <span className="font-mono" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {selectedPart.dimensions}
                    </span>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.675rem', textTransform: 'uppercase' }}>
                      Material &amp; Infill Specification
                    </span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {selectedPart.material}
                    </span>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.675rem', textTransform: 'uppercase' }}>
                      Fasteners &amp; Mating Interface
                    </span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {selectedPart.fasteners}
                    </span>
                  </div>
                </div>

                {/* Individual File Downloads */}
                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <a
                    href={`/cad/${selectedPart.filename}`}
                    download={selectedPart.filename}
                    className="btn btn-secondary"
                    style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.75rem' }}
                  >
                    <Download size={14} color="#b45309" />
                    Download Printable STL ({selectedPart.filename})
                  </a>

                  <a
                    href={`/cad/step/${selectedPart.stepFilename}`}
                    download={selectedPart.stepFilename}
                    className="btn btn-secondary"
                    style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.75rem' }}
                  >
                    <FileCode size={14} color="#b45309" />
                    Download Parametric STEP ({selectedPart.stepFilename})
                  </a>
                </div>
              </div>

              {/* Manufacturing & Safety Checklist Card */}
              <div className="eng-card" style={{ padding: '1.15rem' }}>
                <div className="eng-card-header">
                  <span className="eng-card-title">
                    <CheckCircle size={15} color="#059669" />
                    Manufacturing Status
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.725rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <span style={{ color: '#059669', fontWeight: 800 }}>✓</span>
                    <span>
                      <strong>Watertight BRep Solids:</strong> Verified single manifold solids with zero air gaps.
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <span style={{ color: '#059669', fontWeight: 800 }}>✓</span>
                    <span>
                      <strong>Integrated Mechanical Interfaces:</strong> Rear fan mounting shelf and front radar clevis.
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <span style={{ color: '#059669', fontWeight: 800 }}>✓</span>
                    <span>
                      <strong>Wall Cutouts:</strong> 17 verified penetrating bores for USB, DC, fuse, and vents.
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <span style={{ color: '#b45309', fontWeight: 800 }}>⚠</span>
                    <span>
                      <strong>Electrical Boundary:</strong> 12V DC SELV isolated operation (mains voltage prohibited).
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* SUB-TAB 2: 2D TECHNICAL ENGINEERING BLUEPRINTS */}
      {activeSubTab === 'drawings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Blueprint Selector Ribbon */}
          <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {DRAWINGS_LIST.map((dwg) => {
              const isSelected = selectedDrawingId === dwg.id;
              return (
                <button
                  key={dwg.id}
                  onClick={() => setSelectedDrawingId(dwg.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    background: isSelected ? 'rgba(180, 83, 9, 0.12)' : 'var(--bg-card)',
                    border: `1px solid ${isSelected ? '#b45309' : 'var(--border-subtle)'}`,
                    cursor: 'pointer',
                    minWidth: '220px',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#b45309' }}>
                    {dwg.sheet}
                  </div>
                  <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                    {dwg.title}
                  </div>
                  <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {dwg.desc}
                  </div>
                </button>
              );
            })}
          </div>

          {/* SVG Vector Drawing Display Sheet */}
          <div className="eng-card" style={{ padding: '1rem', background: '#ffffff', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e293b' }}>
                  {DRAWINGS_LIST.find((d) => d.id === selectedDrawingId)?.title} — Dimensioned Blueprint
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '0.75rem' }}>
                  Standard ISO Third-Angle Projection • Units: Millimeters (mm)
                </span>
              </div>

              <a
                href={`/cad/drawings/${selectedDrawingId}.svg`}
                download={`${selectedDrawingId}.svg`}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
              >
                <Download size={13} color="#b45309" />
                Download Vector SVG
              </a>
            </div>

            <div style={{ width: '100%', minHeight: '650px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f8fafc', borderRadius: '8px', padding: '1rem', overflow: 'hidden' }}>
              <img
                src={`/cad/drawings/${selectedDrawingId}.svg`}
                alt={selectedDrawingId}
                style={{ width: '100%', height: 'auto', maxHeight: '720px', objectFit: 'contain', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
