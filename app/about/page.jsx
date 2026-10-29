'use client';


/* cms:2910 */
import {useCmsBlock,cmsArray,cmsRender} from '@/components/cms/ContentProvider';
import React from 'react';
import PageHeader from '@/components/shared/PageHeader';
import { Target, Eye, Award, Users, Factory, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import AboutUsBanner from '@assets/AboutUs.png'
import About from '@assets/Unsplash/About.jpg'

const timeline = [
  { year: '2025', title: 'Company Founded', desc: 'Pakmoo Testing Instrument established in Ghaziabad, Uttar Pradesh.' },
  { year: '2025', title: 'ISO 9001 Certification', desc: 'Achieved ISO 9001 quality management system certification.' },
  { year: '2025', title: 'In House Production', desc: 'Expanded to 100+ testing instruments across 5 industry verticals.' },
  { year: '2026', title: 'Export Business', desc: 'Expanded to international markets serving 20+ countries worldwide.' },
];

const values = [
  { icon: Target, title: 'Our Mission', desc: 'To deliver world-class testing instruments that empower industries to achieve the highest quality standards, ensuring product safety and compliance.' },
  { icon: Eye, title: 'Our Vision', desc: 'To be the global leader in precision testing solutions, driving innovation and setting new benchmarks in measurement technology.' },
];

const strengths = [
  { icon: Award, title: '10+ Years Experience', desc: 'Three decades of engineering excellence in testing instruments.' },
  { icon: Users, title: '150+ Engineers', desc: 'Dedicated R&D and service engineering team across India.' },
  { icon: Factory, title: '50,000 sq. ft. Facility', desc: 'State-of-the-art manufacturing plant with modern CNC machines.' },
  { icon: ShieldCheck, title: '100% Quality Tested', desc: 'Every instrument undergoes rigorous quality checks before dispatch.' },
];

const cmsSeed_about_strengths=strengths;
const cmsSeed_about_values=values;
const cmsSeed_about_timeline=timeline;
export default function AboutPage() {
  const cms=useCmsBlock("about","about");
  const timeline=cmsArray(cmsSeed_about_timeline,cms.items_timeline);
  const values=cmsArray(cmsSeed_about_values,cms.items_values);
  const strengths=cmsArray(cmsSeed_about_strengths,cms.items_strengths);

  return (
    <>
      <PageHeader
        title={cms.title_1??"About Us"}
        subtitle={cms.subtitle_2??"Four decades of precision engineering and unwavering commitment to quality testing solutions."}
        breadcrumbs={cmsArray([{ label: 'About Us' }],cms.list_3)}
        image={cms.image_4??(About?.src)}
      />

      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="section-label">{cmsRender(cms.text_5??"Who We Are")}</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">{cmsRender(cms.text_6??"Precision in Every Instrument")}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {cmsRender(cms.text_7??"Pakmoo Testing Instrument Pvt. Ltd. is a leading manufacturer of precision testing instruments, serving diverse industries including packaging, plastics, paper, textiles, pharmaceuticals, and more.")}</p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {cmsRender(cms.text_8??"With over 40 years of engineering expertise, we have built a reputation for delivering accurate, reliable, and industry-compliant testing solutions. Our instruments meet international standards including ASTM, ISO, BIS, TAPPI, DIN, IEC, and JIS.")}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {cmsRender(cms.text_9??"From our state-of-the-art manufacturing facility, we design and produce 200+ testing instruments that are trusted by 445+ industries across India and internationally.")}</p>
            </div>
            <div className="relative">
              <img
                src={cms.image_10??(AboutUsBanner?.src)}
                alt={cms.alt_11??"Pakmoo manufacturing facility"}
                className="w-full aspect-[4/3] object-cover rounded-2xl"
              />
              <div className="absolute -bottom-4 -left-4 bg-primary p-4 sm:p-6 rounded-2xl shadow-xl">
                <span className="text-3xl font-bold text-white block">{cmsRender(cms.text_12??"10+")}</span>
                <span className="text-xs text-white/70">{cmsRender(cms.text_13??"Years of Excellence")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-12 bg-secondary border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="p-8 bg-card border border-border rounded-2xl hover:shadow-lg transition-all"
              >
                <v.icon className="w-6 h-6 text-primary mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-3">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{cmsRender(v.desc)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <span className="text-[11px] font-mono uppercase tracking-widest text-primary mb-2 block">{cmsRender(cms.text_14??"Our Journey")}</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-10">{cmsRender(cms.text_15??"Company History")}</h2>

          <div className="relative">
            <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-8">
              {timeline.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  className={`relative flex flex-col sm:flex-row ${i % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'} items-start gap-4 sm:gap-8`}
                >
                  <div className={`flex-1 ${i % 2 === 0 ? 'sm:text-right' : 'sm:text-left'} pl-10 sm:pl-0`}>
                    <span className="font-mono font-bold text-primary text-lg">{item.year}</span>
                    <h4 className="font-semibold text-foreground text-sm mt-1">{item.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{cmsRender(item.desc)}</p>
                  </div>
                  <div className="absolute left-2.5 sm:left-1/2 sm:-translate-x-1/2 w-3 h-3 bg-primary border-2 border-background mt-1" />
                  <div className="flex-1 hidden sm:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-12 bg-secondary border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <span className="text-[11px] font-mono uppercase tracking-widest text-primary mb-2 block">{cmsRender(cms.text_16??"Our Strengths")}</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-10">{cmsRender(cms.text_17??"Manufacturing Expertise")}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {strengths.map((s, i) => (
              <div key={i} className="p-6 bg-card border border-border rounded-2xl hover:shadow-lg hover:-translate-y-1 transition-all">
                <s.icon className="w-5 h-5 text-primary mb-3" />
                <h3 className="font-semibold text-foreground text-sm">{s.title}</h3>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{cmsRender(s.desc)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
