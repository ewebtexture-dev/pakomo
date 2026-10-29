'use client';
import SafeImage from '@/components/shared/SafeImage';

/* cms:2910 */
import {useCmsBlock,useCmsCollection,cmsArray,cmsRender} from '@/components/cms/ContentProvider';
import React from 'react';
import { motion } from 'framer-motion';
import ASTMTS from '@assets/TestingStandards/ASTMTS.jpg'
import DINTS from '@assets/TestingStandards/DINTS.png'
import ISOTS from '@assets/TestingStandards/ISOTS.png'
import ISTATS from '@assets/TestingStandards/ISTATS.jpg'
import JISTS from '@assets/TestingStandards/JISTS.png'
import MPTS from '@assets/TestingStandards/MPTS.png'
import TAPPITS from '@assets/TestingStandards/TAPPITS.png'
import GEMTS from '@assets/TestingStandards/GEMTS.jpeg'

const standards = [
  { code: 'ASTM', name: 'American Society for Testing and Materials', count: '85+ Tests', color: 'hover:bg-blue-600', image: ASTMTS },
  { code: 'ISO', name: 'International Organization for Standardization', count: '120+ Tests', color: 'hover:bg-yellow-600', image: ISOTS },
  { code: 'BIS', name: 'Bureau of Indian Standards', count: '60+ Tests', color: 'hover:bg-green-600', image: MPTS },
  { code: 'TAPPI', name: 'Pulp & Paper Industry Standards', count: '40+ Tests', color: 'hover:bg-amber-600', image: TAPPITS },
  { code: 'DIN', name: 'Deutsches Institut für Normung', count: '35+ Tests', color: 'hover:bg-red-600', image: DINTS },
  { code: 'ISTA', name: 'International Safe Transit Association', count: '25+ Tests', color: 'hover:bg-cyan-600', image: ISTATS },
  { code: 'JIS', name: 'Japanese Industrial Standards', count: '20+ Tests', color: 'hover:bg-violet-600', image: JISTS },
  { code: 'GEM', name: 'Government e Marketplace (GeM) ', count: '30+ Tests', color: 'hover:bg-teal-600', image: GEMTS },
];

// Duplicate items for seamless looping
const duplicatedStandards = [...standards, ...standards];

const cmsSeed_standards_standards=standards;
export default function StandardsSection() {
  const cms=useCmsBlock("home","standards");
  const standards=cmsArray(cmsSeed_standards_standards,useCmsCollection("standard",cms.items_standards)).map(item=>({...item,name:item.home_name||item.name,count:item.home_count||item.count}));
  const duplicatedStandards=[...standards,...standards];

  return (
    <section className="py-20 sm:py-16 bg-secondary/40 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <span className="section-label">{cmsRender(cms.text_1??"Compliance")}</span>

            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-1">
              {cmsRender(cms.text_2??"Global Testing Standards")}</h2>

            <p className="text-muted-foreground mt-2 text-sm max-w-md">
              {cmsRender(cms.text_3??"Our testing instruments adhere to stringent international standards, making them suitable for use in global markets.")}</p>
          </div>
        </div>

        {/* Infinite Carousel */}
        <div className="relative overflow-hidden">
          <motion.div
            className="flex gap-4 w-max"
            animate={{
              x: cmsArray(['0%', '-50%'],cms.list_4),
            }}
            transition={{
              duration: 20,
              ease: 'linear',
              repeat: Infinity,
            }}
          >
            {duplicatedStandards.map((std, i) => (
              <div
                key={`${std.code}-${i}`}
                className={`group min-w-[220px] sm:min-w-[240px] p-5 rounded-2xl border border-border bg-card text-center cursor-pointer transition-all duration-300 ${std.color} hover:border-transparent hover:text-white hover:-translate-y-1 hover:shadow-xl`}
              >

                <p className='text-[11px] text-align-center text-muted-foreground group-hover:text-white/70 mt-1.5 leading-tight transition-colors min-h-[32px]'>
                  <SafeImage src={std.image?.src} alt={'Image missing'} className="w-16 h-auto mx-auto" />
                </p>

                <p className="text-2xl font-bold text-foreground group-hover:text-white transition-colors mt-2">
                  {std.code}
                </p>
                <p className="text-[11px] text-muted-foreground group-hover:text-white/70 mt-1.5 leading-tight transition-colors min-h-[15px]">
                  {std.name}
                </p>

                <span className="inline-block mt-0 text-[10px] font-bold text-primary group-hover:text-white/80 transition-colors">
                  {std.count}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}