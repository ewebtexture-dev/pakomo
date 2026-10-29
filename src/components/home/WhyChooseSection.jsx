'use client';

/* cms:2910 */
import {useCmsBlock,cmsArray,cmsRender} from '@/components/cms/ContentProvider';
import React from 'react';
import { Crosshair, ShieldCheck, Cpu, HeadphonesIcon, Wrench, Settings2 } from 'lucide-react';
import { motion } from 'framer-motion';
import why_choose_us_1 from '@assets/Unsplash/why-choose-us-1.jpg';

const reasons = [
  { icon: Crosshair, title: 'High Accuracy', desc: 'Precision-engineered instruments with ±0.5% accuracy for reliable, repeatable test results every time.', color: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' },
  { icon: ShieldCheck, title: 'Standards Compliance', desc: 'Full compliance with ASTM, ISO, BIS, TAPPI, DIN, IEC & JIS standards — globally trusted.', color: 'bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white' },
  { icon: Cpu, title: 'Advanced Technology', desc: 'Microprocessor-based controls, IoT connectivity and real-time data management.', color: 'bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white' },
  { icon: HeadphonesIcon, title: 'Expert Support', desc: '24/7 technical support with 150+ dedicated service engineers across India.', color: 'bg-cyan-50 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white' },
  { icon: Wrench, title: 'Durable Equipment', desc: 'Built with premium-grade stainless steel & industrial components for 15+ years of reliable service.', color: 'bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white' },
  { icon: Settings2, title: 'Custom Solutions', desc: 'Tailor-made testing solutions designed precisely for your industry requirements.', color: 'bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white' },
];

const cmsSeed_why_reasons=reasons;
export default function WhyChooseSection() {
  const cms=useCmsBlock("home","why");
  const reasons=cmsArray(cmsSeed_why_reasons,cms.items_reasons);

  return (
    <section className="py-20 sm:py-18 relative overflow-hidden bg-[#0b1120]">
      {/* Background image with moderate overlay */}
      <div className="absolute inset-0">
        <img
          src={cms.image_1??(why_choose_us_1?.src)}
          alt={cms.alt_2??"Laboratory background"}
          className="w-full h-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0b1120]/90 via-[#0b1120]/80 to-blue-950/70" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-400 mb-3">
            <span className="w-6 h-0.5 bg-blue-400 inline-block" />
            {cmsRender(cms.text_3??"Why Pakmoo")}<span className="w-6 h-0.5 bg-blue-400 inline-block" />
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">{cmsRender(cms.text_4??"Why Industries Choose Us")}</h2>
          <p className="text-slate-400 mt-3 max-w-lg mx-auto text-sm leading-relaxed">
            {cmsRender(cms.text_5??"Three decades of engineering excellence backed by rigorous quality standards and a relentless focus on precision.")}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {reasons.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="group p-6 rounded-2xl bg-white/8 border border-white/15 hover:bg-white/12 hover:border-blue-400/30 hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300 ${r.color}`}>
                <r.icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">{r.title}</h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">{cmsRender(r.desc)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}