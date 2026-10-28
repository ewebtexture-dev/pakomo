'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import productsImg from '@assets/Unsplash/products-2.jpg';
import img01BoxCompressionTesterDigital from "@assets/products/paperPackaging/BoxCompressionTester.jpeg";
import img02BoxCompressionTesterComputerized from "@assets/products/paperPackaging/02_box_compression_tester_computerized.jpg";
import img03BoxCompressionTesterTouchscreen from "@assets/products/paperPackaging/03_box_compression_tester_touchscreen.jpg";
import imgBallDropTester from "@assets/products/plasticPolymer/BallDropTester.jpeg";
import imgBurstingStrengthTesterPneumaticComputerized from "@assets/products/plasticPolymer/bursting-strength-tester-pneumatic-computerized.jpg";
import imgCarbonBlackContentApparatus from "@assets/products/plasticPolymer/carbon-black-content-apparatus.jpg";
import imgPeelStrengthTesterDigital from "@assets/products/polyFilms/01_peel_strength_tester_digital.jpg";
import imgPeelStrengthTesterComputerized from "@assets/products/polyFilms/02_peel_strength_tester_computerized.jpg";
import imgLaboratoryHeatSealer from "@assets/products/polyFilms/HeatSealer.jpeg";
import img01SaltSprayChamberDigital250l from "@assets/products/paintPlastic/salt-spray-chamber-digital-250l.jpg";
import img02SaltSprayChamberHmi250l from "@assets/products/paintPlastic/salt-spray-chamber-hmi-250l.jpg";
import img03SaltSprayChamberDigital450l from "@assets/products/paintPlastic/salt-spray-chamber-hmi-250l.jpg";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";
import { CATEGORIES } from '@/utils';

const categories = [{ key: "all", label: "All" }, ...CATEGORIES]
// const categories = [
//   { key: 'all', label: 'All' },
//   { key: 'paper&packaging', label: 'Paper & Packaging' },
//   { key: 'plastic&polymer', label: 'Plastic & Polymer' },
//   { key: 'polyFilms', label: 'PolyFilm Instruments' },
//   { key: 'paint&plastic', label: 'Paint & Plating Testing' },
// ];

const products = [
  {
    id: 'box-compression-tester-digital',
    name: 'Box Compression Strength Tester – Digital',
    category: 'paper&packaging',
    image: img01BoxCompressionTesterDigital,
    specs: {
      Capacities: '500Kgf, 1000Kgf, 2000Kgf, 3000Kgf',
      Accuracy: '±1% of FSD',
      Standards: 'ASTM D642, ASTM D4169, ISO 2234:2015'
    },
    desc: 'A Box Compression Tester (BCT) is used to evaluate the compressive strength and durability of corrugated and non-corrugated cardboard boxes.',
    tag: 'Popular'
  },
  {
    id: 'box-compression-tester-computerized',
    name: 'Box Compression Strength Tester – Computerized',
    category: 'paper&packaging',
    image: img02BoxCompressionTesterComputerized,
    specs: {
      Capacities: '500Kgf, 1000Kgf, 2000Kgf, 3000Kgf',
      Accuracy: '±1% of FSD',
      Standards: 'ASTM D642, ASTM D4169, ISO 2234:2015, EN ISO 12048'
    },
    desc: 'Computerized box compression tester with advanced software and RS232 connectivity for detailed analysis and reporting.',
    tag: 'Best Seller'
  },
  {
    id: 'box-compression-tester-touch-screen',
    name: 'Box Compression Tester – Touch Screen',
    category: 'paper&packaging',
    image: img03BoxCompressionTesterTouchscreen,
    specs: {
      Capacities: '500 Kgf, 1000 Kgf, 2000 Kgf',
      Accuracy: '±1% of FSD',
      Standards: 'ASTM D642, ASTM D4169, ISO 2234:2015, EN ISO 12048'
    },
    desc: 'Touch-screen box compression tester with integrated software for packaging strength and stacking performance evaluation.',
    tag: ''
  },
  // Plastic & Polymer
  {
    id: 'ball-drop-tester',
    name: 'Ball Drop Tester',
    category: 'plastic&polymer',
    image: imgBallDropTester,
    specs: {
      'Maximum Impact Height': 'Up to 1500mm',
      'Drop Weight Capacity': 'Up to 5000g',
      'Power Supply': '220V AC, Single Phase, 50 Hz'
    },
    desc: 'Impact resistance testing instrument designed to evaluate material durability by simulating falling-object impacts.',
    tag: ''
  },
  {
    id: 'bursting-strength-tester-pneumatic-computerized',
    name: 'Bursting Strength Tester Pneumatic – Computerized',
    category: 'plastic&polymer',
    image: imgBurstingStrengthTesterPneumaticComputerized,
    specs: {
      Capacity: '0-40 Kg/cm²',
      Accuracy: '±1%',
      Standards: 'ASTM D3786, ASTM D774'
    },
    desc: 'Computerized pneumatic bursting strength tester for paper, packaging, and textile material testing.',
    tag: ''
  },
  {
    id: 'carbon-black-content-apparatus',
    name: 'Carbon Black Content Apparatus',
    category: 'plastic&polymer',
    image: imgCarbonBlackContentApparatus,
    specs: {
      'Temperature Range': 'Up to 800°C',
      Accuracy: '±3°C',
      'Power Requirement': '220/230V AC, 50Hz'
    },
    desc: 'Thermal analysis equipment used to determine carbon black content in polymeric materials.',
    tag: 'New'
  },
  // Poly Films
  {
    "id": "peel-strength-tester-digital",
    "name": "Peel Strength Tester Digital",
    "category": "polyFilms",
    "specs": {
      "Maximum Grip-to-Grip Distance": "Up to 500 mm",
      "Display": "High-precision Digital LCD Display",
      "Load Capacity": "20 Kgf",
      "Load Cell Type": "Premium 'S-Type' load cell",
      "Least Count (Load Measurement)": "2 gm"
    },
    "desc": "The Pakmo Peel Strength Tester is a precision-engineered instrument designed to evaluate the adhesive strength of materials like tapes, laminates, and films. Built for accuracy and reliability, it ensures superior product quality across various industries. Its robust construction, user-friendly interface, and adherence to international standards make it an essential tool for quality assurance. Equipped with a high-resolution load sensor, the tester replicates real-world conditions to provide consistent and repeatable results. Widely used in packaging, automotive, and electronics industries.",
    "image": imgPeelStrengthTesterDigital,
    "tag": ""
  },
  {
    "id": "peel-strength-tester-computerized",
    "name": "Peel Strength Tester Computerized",
    "category": "polyFilms",
    "specs": {
      "Max. Grip-to-Grip Distance": "500 mm",
      "Display": "Digital LCD Display",
      "Capacity": "20 Kgf",
      "Load Cell": "'S Type' load-cell (reputed make)",
      "Least Count for Load": "2 gm"
    },
    "desc": "The Pakmo Peel Strength Tester Computerized provides highly accurate and precise measurement of adhesion strength for adhesive products such as labeling tapes, self-adhesive tapes, and packaging tapes. In the packaging industry, where these tapes play a crucial role, ensuring their quality is paramount to maintaining product protection.",
    "image": imgPeelStrengthTesterComputerized,
    "tag": ""
  },
  {
    "id": "laboratory-heat-sealer",
    "name": "Laboratory Heat Sealer",
    "category": "polyFilms",
    "specs": {
      "Sealing Temperature Range": "Ambient to 300°C",
      "Temperature Controller": "PID control system",
      "Instrument Temperature Range": "0 – 400°C",
      "Temperature Accuracy": "±0.2°C with 0.1°C resolution"
    },
    "desc": "The Laboratory Heat Sealer from Pakmo is a highly precise instrument designed for sealing a variety of packaging materials with consistent, reliable results. It is particularly useful for ensuring the integrity of packaging seals during quality control and testing processes, meeting stringent industry standards for durability and performance.",
    "image": imgLaboratoryHeatSealer,
  },
  // Paint Plastic
  {
    "id": "salt-spray-chamber-digital-250l",
    "name": "Salt Spray Chamber – Digital Model 250 Liter",
    "category": "paint&plastic",
    "specs": {
      "Inner Dimensions": "760mm x 560mm x 600mm (250L) | 1000mm x 750mm x 600mm (450L) | 1650mm x 750mm x 820mm (1000L)",
      "Temperature Control": "Ambient to 47°C",
      "Test Chamber Temperature Range": "35°C ± 2°C",
      "Air Saturator Temperature": "Up to 47°C",
      "pH Value of Salt Solution": "6.5 to 7.2 pH"
    },
    "desc": "The Salt Spray Chamber Digital 250 Liter is an advanced tool designed for conducting Neutral Salt Spray (NSS) tests on metal surface coatings. It evaluates corrosion resistance of coatings and ensures compliance with stringent industry quality and durability standards. Also known as a salt fog chamber or salt spray test chamber.",
    "image": img01SaltSprayChamberDigital250l,
  },
  {
    "id": "salt-spray-chamber-hmi-250l",
    "name": "Salt Spray Chamber – HMI Model 250 Liter",
    "category": "paint&plastic",
    "specs": {
      "Inner Dimensions": "760mm x 560mm x 600mm (250L) | 1000mm x 750mm x 600mm (450L) | 1650mm x 750mm x 820mm (1000L)",
      "Chamber Construction": "Fibre Reinforced Plastic (FRP)",
      "Chamber Temperature Range": "Ambient to 45°C; Control Range: 35°C ± 2°C",
      "Air Saturator Temperature": "Up to 47°C"
    },
    "desc": "The Salt Spray Chamber HMI Model 250 Liter is a state-of-the-art corrosion testing device with an HMI touch screen interface, designed to evaluate the quality of coatings and paints under corrosive conditions. Built from high-performance FRP, it reduces manpower requirements and simplifies the testing process.",
    "image": img02SaltSprayChamberHmi250l,
  },
  {
    "id": "salt-spray-chamber-digital-450l",
    "name": "Salt Spray Chamber – Digital Model 450 Liter",
    "category": "paint&plastic",
    "specs": {
      "Inner Dimensions": "760mm x 560mm x 600mm (250L) | 1000mm x 750mm x 600mm (450L) | 1650mm x 750mm x 820mm (1000L)",
      "Temperature Control": "Ambient to 47°C",
      "Test Chamber Temperature Range": "35°C ± 2°C",
      "Air Saturator Temperature": "Up to 47°C",
      "pH Value of Salt Solution": "6.5 to 7.2 pH"
    },
    "desc": "The Salt Spray Chamber Digital 450 Liter is an advanced tool designed for conducting Neutral Salt Spray (NSS) tests on metal surface coatings. Built with Fibre Reinforced Plastic (FRP) for enhanced durability, it evaluates corrosion resistance and ensures compliance with stringent industry quality and durability standards.",
    "image": img03SaltSprayChamberDigital450l,
  },
];

const tagColors = {
  'Best Seller': 'bg-amber-100 text-amber-700 border-amber-200',
  'Popular': 'bg-green-100 text-green-700 border-green-200',
  'New': 'bg-blue-100 text-blue-700 border-blue-200',
};

export default function FeaturedProducts() {
  const [active, setActive] = useState('all');
  // const [randomProducts, setRandomProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));

      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(data);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    fetchProducts();
  }, []);

  const filtered = active === 'all' ? products : products.filter(p => p.category === active);
  // useEffect(() => {
  //   const shuffled = [...filtered];

  //   for (let i = shuffled.length - 1; i > 0; i--) {
  //     const j = Math.floor(Math.random() * (i + 1));
  //     [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  //   }
  //   setRandomProducts(shuffled.slice(0, 6));
  // }, [filtered]);
  return (
    <section className="py-20 sm:py-18">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <span className="section-label">Product Catalog</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-1">Featured Instruments</h2>
            <p className="text-muted-foreground mt-2 text-sm max-w-md">
              200+ precision-engineered testing instruments for diverse industrial needs.
            </p>
          </div>
          <Link href="/products" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all">
            View All Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActive(cat.key)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${active === cat.key
                ? 'bg-primary text-white shadow-md shadow-primary/30'
                : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                }`}
            >
              {cat.label}
            </button>
          ))}

        </div>

        {/* Product Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.slice(0, 6).map((product, i) => (
            <motion.div
              key={product.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.07 }}
              className="group rounded-2xl border border-border bg-card shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              {/* Image */}
              <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
                <img
                  src={product.imageUrl || productsImg?.src}
                  alt={product.name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                {product.tag && (
                  <span className={`absolute top-3 right-3 px-2.5 py-1 text-[11px] font-bold rounded-full border ${tagColors[product.tag]}`}>
                    {product.tag}
                  </span>
                )}
                <span className="absolute top-3 left-3 px-2.5 py-1 text-[11px] font-semibold rounded-full bg-black/50 text-white backdrop-blur-sm">
                  {product.category}
                </span>
              </div>

              <div className="p-5">
                <h3 className="font-bold text-foreground">{product.name}</h3>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">{product.desc}</p>

                {/* Spec pills */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {Object.entries(product.specs).slice(0, 3).map(([key, val]) => (
                    <span key={key} className="px-2.5 py-1 bg-secondary rounded-lg text-[11px] font-medium text-muted-foreground">
                      <span className="text-foreground font-semibold">{key}:</span> {val}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-5 pt-4 border-t border-border">
                  <Link href="/products" className="text-sm font-semibold text-primary flex items-center gap-1 hover:gap-2 transition-all">
                    View Details <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}