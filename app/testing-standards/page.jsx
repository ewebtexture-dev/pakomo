'use client';
import SafeImage from '@/components/shared/SafeImage';


/* cms:2910 */
import {useCmsBlock,useCmsCollection,cmsArray,cmsRender} from '@/components/cms/ContentProvider';
import React, { useRef, useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import { motion } from 'framer-motion';
import testing_standards_1 from '@assets/Unsplash/testing-standards-1.jpg';
import ASTMTS from '@assets/TestingStandards/ASTMTS.jpg'
import DINTS from '@assets/TestingStandards/DINTS.png'
import ISOTS from '@assets/TestingStandards/ISOTS.png'
import ISTATS from '@assets/TestingStandards/ISTATS.jpg'
import JISTS from '@assets/TestingStandards/JISTS.png'
import MPTS from '@assets/TestingStandards/MPTS.png'
import TAPPITS from '@assets/TestingStandards/TAPPITS.png'
import GEMTS from '@assets/TestingStandards/GEMTS.jpeg'

const standards = [
  { code: 'ASTM', name: 'American Society for Testing and Materials', image: ASTMTS, country: 'USA', desc: 'ASTM International develops and publishes voluntary consensus technical standards for a wide range of materials, products, systems, and services. Our instruments comply with 85+ ASTM test methods.', methods: ['ASTM D882 - Tensile Properties of Thin Plastic Sheeting', 'ASTM D3786 - Bursting Strength of Textile Fabrics', 'ASTM D1709 - Impact Resistance of Plastic Film', 'ASTM D1238 - Melt Flow Rates of Thermoplastics', 'ASTM D642 - Compression Testing of Shipping Containers'] },
  { code: 'ISO', name: 'International Organization for Standardization', image: ISOTS, country: 'International', desc: 'ISO develops international standards covering technology, manufacturing, food safety, and more. We offer 120+ instruments that comply with various ISO test standards.', methods: ['ISO 527 - Tensile Properties of Plastics', 'ISO 2758 - Determination of Bursting Strength', 'ISO 1133 - Melt Mass-Flow Rate', 'ISO 2233 - Packaging Conditioning', 'ISO 5636 - Air Permeance of Paper'] },
  { code: 'BIS', name: 'Bureau of Indian Standards', country: 'India', image: MPTS, desc: 'BIS is the national standards body of India. We manufacture 60+ instruments compliant with BIS/IS standards for Indian industry requirements.', methods: ['IS 1060 - Tensile Testing', 'IS 1776 - Bursting Strength', 'IS 101 - Methods of Testing Paints', 'IS 2508 - Packaging Requirements', 'IS 7028 - Corrugated Board Testing'] },
  { code: 'TAPPI', name: 'Technical Association of the Pulp and Paper Industry', image: TAPPITS, country: 'USA', desc: 'TAPPI is the leading association for pulp, paper, packaging, and converting industries. 40+ of our instruments follow TAPPI test methods.', methods: ['TAPPI T403 - Bursting Strength', 'TAPPI T411 - Thickness of Paper', 'TAPPI T494 - Tensile Properties', 'TAPPI T811 - Edgewise Compressive Strength', 'TAPPI T815 - Ring Crush'] },
  { code: 'DIN', name: 'Deutsches Institut für Normung', image: DINTS, country: 'Germany', desc: 'DIN is the German Institute for Standardization, the German national organization for standardization. We support 35+ DIN-compliant test methods.', methods: ['DIN 53112 - Tensile Test', 'DIN 53113 - Bursting Strength', 'DIN 53373 - Tear Resistance', 'DIN EN ISO 1133 - MFI', 'DIN 53357 - Peel Test'] },
  { code: 'ISTA', name: 'International Safe Transit Association', image: ISTATS, country: 'International', desc: 'IEC prepares and publishes international standards for electrical, electronic, and related technologies. 25+ instruments meet IEC standards.', methods: ['IEC 60068 - Environmental Testing', 'IEC 61215 - PV Module Design', 'IEC 60335 - Safety of Appliances', 'IEC 60529 - IP Protection Rating', 'IEC 60695 - Fire Hazard Testing'] },
  { code: 'JIS', name: 'Japanese Industrial Standards', image: JISTS, country: 'Japan', desc: 'JIS specifies the standards used for industrial activities in Japan. We offer 20+ JIS-compliant testing instruments.', methods: ['JIS K7113 - Tensile Properties of Plastics', 'JIS P8131 - Bursting Strength', 'JIS K7210 - Melt Flow Rate', 'JIS Z0212 - Compression Testing', 'JIS L1096 - Textile Testing'] },
  {code: 'GeM', name: 'Government e-Marketplace', image: GEMTS, country: 'India', desc: 'GeM is the official online procurement platform of the Government of India for ministries, departments, PSUs, and government organizations. We are a registered GeM seller offering a wide range of laboratory testing instruments and equipment.', methods: ['Government Procurement & Tender Participation', 'Direct Purchase & L1 Procurement', 'Laboratory Testing Equipment Supply', 'Quality Compliance & Certification Support', 'Bulk Institutional Orders' ]}
];

const cmsSeed_standards_standards=standards;
export default function TestingStandardsPage() {
  const cms=useCmsBlock("testing-standards","standards");
  const standards=cmsArray(cmsSeed_standards_standards,useCmsCollection("standard",cms.items_standards));

  const [active, setActive] = useState(null);
  const detailRef = useRef(null);

  return (
    <>
      <PageHeader
        title={cms.title_1??"Testing Standards"}
        subtitle={cms.subtitle_2??"Our instruments comply with major international and national testing standards."}
        breadcrumbs={cmsArray([{ label: 'Testing Standards' }],cms.list_3)}
        image={cms.image_4??(testing_standards_1?.src)}
      />

      <section className="py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-12">
            {standards.map((std, i) => (
              <motion.button
                key={std.code}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                onClick={() => {
                  const newValue = active === std.code ? null : std.code;
                  setActive(newValue);
                  if (newValue) {
                    setTimeout(() => {
                      detailRef.current?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                      });
                    }, 100);
                  }
                }}
                className={`p-5 border text-left transition-all ${active === std.code
                  ? 'bg-cyan-600 border-primary text-primary-foreground'
                  : 'border-border bg-card hover:border-primary/30 text-foreground'
                  }`}
              >
                <div className='flex justify-between items-center'>
                  <div>
                    <span className="text-2xl font-mono font-bold block">{std.code}</span>
                    <span className={`text-[10px] mt-1 block ${active === std.code ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                      {std.country}
                    </span>
                  </div>
                  <p className='text-[11px] text-muted-foreground group-hover:text-white/70 mt-1.5 leading-tight transition-colors min-h-[32px]'>
                    <SafeImage src={std.image?.src} alt={'Image missing'} className="w-16 h-auto mx-auto" />
                  </p>
                </div>
              </motion.button>
            ))}
          </div>

          {active && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              ref={detailRef}
              className="border border-border bg-card p-6 sm:p-8"
            >
              {(() => {
                const std = standards.find(s => s.code === active);
                return (
                  <>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <span className="text-3xl font-mono font-bold text-primary">{std.code}</span>
                        <h3 className="text-sm font-semibold text-foreground mt-1">{std.name}</h3>
                        <span className="text-xs text-muted-foreground">{std.country}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-6">{cmsRender(std.desc)}</p>
                    <h4 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">{cmsRender(cms.text_5??"Supported Test Methods")}</h4>
                    <div className="space-y-2">
                      {std.methods.map((m, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-foreground p-2 bg-secondary">
                          <div className="w-1 h-1 bg-primary shrink-0" />
                          {m}
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}
            </motion.div>
          )}
        </div>
      </section>
    </>
  );
}
