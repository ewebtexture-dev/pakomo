import {
  Package,
  Plane,
  PanelsTopLeft,
  Car,
  Bath,
  FlaskConical,
  CircuitBoard,
  Palette,
  Thermometer,
  Cable,
} from "lucide-react";
import applicationsImg from '@assets/Unsplash/applications-1.jpg';
import Adhesive from '@assets/applications/Adhesive.jpeg'
import Aeroplane from '@assets/applications/Aeroplane.jpeg'
import Aluminium from '@assets/applications/Aluminium.avif'
import Automotive from '@assets/applications/Automotive.avif'
import Bathware from '@assets/applications/Bathware.avif'
import BlowMolding from '@assets/applications/BlowMolding.avif'
import Electronics from '@assets/applications/Electronics.avif'
import ColorMeasurement from '@assets/applications/ColorMeasurement.avif'
import EnvironmentalChamber from '@assets/applications/EnvironmentalChamber.jpg'
import Cables from '@assets/applications/Cable.jpeg'



export const applications = [
  {
    id: 'adhesive-testing-instruments',
    icon: "Package",
    name: 'Adhesive Testing Instruments',
    desc: 'Specialized testing instruments for evaluating adhesive performance, bond strength, seal integrity, peel strength, and adhesion across packaging and industrial materials.',
    instruments: '85+ Instruments',
    tests: 'Seal Strength, Burst Strength, Leak Test, Dart Impact, COF, Tensile',
    image: Adhesive?.src,
    productsList: [
      "colour-matching-cabinet",
      "humidity-chamber-conditioning-chamber",
      "laboratory-hot-air-oven",
      "melt-flow-index-tester-digital",
      "moisture-analyzer-mb95",
      "peel-strength-tester-digital",
      "peel-strength-tester-computerized",
      "salt-spray-chamber-hmi-450l",
      "tape-adhesion-tester",
      "tensile-testing-machine-digital",
      "tensile-testing-machine-computerized",
      "ultra-low-deep-freezer"
    ]
  },
  {
    id: 'aerospace-testing-instruments',
    icon: "Plane",
    name: 'Aerospace Testing Instruments',
    desc: 'Advanced testing solutions for aerospace materials and components to evaluate mechanical strength, thermal performance, impact resistance, surface properties, and material consistency.',
    instruments: '60+ Instruments',
    tests: 'MFI, Tensile, Vicat/HDT, Impact, Density, Gloss',
    image: Aeroplane?.src,
    productsList: [
      "bottle-wall-thickness-gauge",
      "coating-thickness-gauge-pce-ct-26",
      "coating-thickness-gauge-pce-ct-28",
      "gloss-meter-tri-angle",
      "impact-resistance-tester",
      "izod-charpy-impact-tester",
      "laboratory-hot-air-oven",
      "melt-flow-index-tester-digital",
      "portable-spectrophotometer",
      "ultra-low-deep-freezer"
    ]
  },
  {
    id: 'aluminium-composite-panel-testing-instruments',
    icon: "PanelsTopLeft",
    name: 'Aluminium Composite Panel Testing Instruments',
    desc: 'Testing instruments for assessing the physical, mechanical, thermal, and material properties of aluminium composite panels to support consistent quality and performance.',
    instruments: '45+ Instruments',
    tests: 'GSM, Thickness, Burst, Tear, Stiffness, Smoothness',
    image: Aluminium?.src,
    productsList: [
      "melt-flow-index-tester-digital",
      "precision-colorimeter",
      "water-bath-digital"
    ]
  },
  {
    id: 'automotive-material-parts-testing-instruments',
    icon: "Car",
    name: 'Automotive Material & Parts Testing Instruments',
    desc: 'Comprehensive testing solutions for automotive materials and components to evaluate durability, dimensional accuracy, surface performance, vibration resistance, and overall product quality.',
    instruments: '40+ Instruments',
    tests: 'Hardness, Weathering, Adhesion, Salt Spray, Fatigue',
    image: Automotive?.src,
    productsList: [
      "drop-tester",
      "melt-flow-index-tester-digital",
      "profile-projector-camera-based-2d-vis",
      "vibration-table"
    ]
  },
  {
    id: 'bathware-testing-instruments',
    icon: "Bath",
    name: 'Bathware Testing Instruments',
    desc: 'Testing solutions for evaluating the strength, durability, surface quality, thermal performance, and material characteristics of bathware products and components.',
    instruments: '50+ Instruments',
    tests: 'Tensile, Tear, Pilling, Abrasion, Shrinkage, Crocking',
    image: Bathware?.src,
    productsList: [
      "bursting-strength-tester-digital",
      "melt-flow-index-tester-digital",
      "water-bath-digital"
    ]
  },
  {
    id: 'blow-molding-testing-instruments',
    icon: "FlaskConical",
    name: 'Blow Molding Testing Instruments',
    desc: 'Quality testing instruments for blow-molded products to evaluate material properties, environmental stress resistance, thermal performance, density, and overall product durability.',
    instruments: '35+ Instruments',
    tests: 'Leak Test, Seal Integrity, Torque, Drop Test, Compression',
    image: BlowMolding?.src,
    productsList: [
      "environmental-stress-cracking-resistance-tester",
      "heat-deformation-tester-hdt-vsp",
      "melt-flow-index-tester-digital",
      "muffle-furnace",
      "specific-gravity-balance"
    ]
  },
  {
    id: 'electronics-and-electrical-testing-instruments',
    icon: "CircuitBoard",
    name: 'Electronics And Electrical Testing Instruments',
    desc: 'Testing instruments for evaluating the physical condition, surface quality, material characteristics, and reliability of electronic and electrical components.',
    instruments: '55+ Instruments',
    tests: 'Hardness, Dissolution, Friability, Leak Test, Seal Strength',
    image: Electronics?.src,
    productsList: [
      "illuminated-magnifier",
      "melt-flow-index-tester-digital"
    ]
  },
  {
    id: 'color-measurement-testing-instruments',
    icon: "Palette",
    name: 'Color Measurement Testing Instruments',
    desc: 'Precision instruments for measuring, comparing, and controlling colour characteristics across materials and finished products to maintain consistent appearance and quality.',
    instruments: '30+ Instruments',
    tests: 'Thermal Cycling, Humidity, Salt Spray, Vibration, ESD',
    image: ColorMeasurement?.src,
    productsList: [
      "colour-matching-cabinet",
      "gloss-meter-tri-angle",
      "melt-flow-index-tester-digital",
      "portable-spectrophotometer",
      "precision-colorimeter"
    ]
  },
  {
    id: 'environmental-chamber-testing-instruments',
    icon: "Thermometer",
    name: 'Environmental Chamber Testing Instruments',
    desc: 'Testing solutions for evaluating material and product performance under controlled environmental conditions such as temperature, humidity, and other reliability stresses.',
    instruments: '30+ Instruments',
    tests: 'Thermal Cycling, Humidity, Salt Spray, Vibration, ESD',
    image: EnvironmentalChamber?.src,
    productsList: ["melt-flow-index-tester-digital"]
  },
  {
    id: 'cable-testing-instruments',
    icon: "Cable",
    name: 'Cable Testing Instruments',
    desc: 'Testing instruments for evaluating cable materials and components through moisture analysis, surface measurement, colour assessment, and other quality control checks.',
    instruments: '30+ Instruments',
    tests: 'Thermal Cycling, Humidity, Salt Spray, Vibration, ESD',
    image: Cables?.src,
    productsList: [
      "moisture-analyzer-mb95",
      "portable-spectrophotometer",
      "precision-colorimeter"
    ]
  },
];