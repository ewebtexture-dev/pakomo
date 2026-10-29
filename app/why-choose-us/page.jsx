'use client';


/* cms:2910 */
import {useCmsBlock,cmsArray,cmsRender} from '@/components/cms/ContentProvider';
import React from 'react';
import { useQuote } from '@/lib/QuoteContext';
import PageHeader from '@/components/shared/PageHeader';
import { Crosshair, ShieldCheck, Cpu, HeadphonesIcon, Wrench, Settings2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import why_choose_us_1 from '@assets/Unsplash/why-choose-us-1.jpg';

const strengths = [
  { icon: Crosshair, title: 'High Accuracy', desc: 'Precision-engineered instruments with ±0.5% accuracy, utilizing advanced load cells and digital sensors for repeatable, reliable results every time.' },
  { icon: ShieldCheck, title: 'Standards Compliance', desc: 'Complete compliance with ASTM, ISO, BIS, TAPPI, DIN, IEC & JIS standards. Every instrument is designed and calibrated to meet global testing norms.' },
  { icon: Cpu, title: 'Advanced Technology', desc: 'Microprocessor-based controls, touchscreen interfaces, IoT connectivity, and PC-integrated data management for modern testing workflows.' },
  { icon: HeadphonesIcon, title: 'Expert Support', desc: '24/7 technical helpline, 150+ service engineers across India, and remote diagnostics capability for minimum downtime.' },
  { icon: Wrench, title: 'Durable Equipment', desc: 'Built with premium-grade stainless steel, powder-coated frames, and industrial-grade components for 15+ years of reliable service.' },
  { icon: Settings2, title: 'Custom Solutions', desc: 'Tailor-made testing solutions with custom ranges, fixtures, and software to match your specific industry and application requirements.' },
];

const qaProcess = [
  { step: '01', title: 'Design Review', desc: 'Every instrument undergoes rigorous design validation against international standards.' },
  { step: '02', title: 'Component Sourcing', desc: 'Premium components sourced from certified global suppliers with incoming QC checks.' },
  { step: '03', title: 'Manufacturing', desc: 'Precision CNC machining, laser cutting, and controlled assembly in ISO-certified facility.' },
  { step: '04', title: 'Testing & Calibration', desc: 'Multi-point calibration and performance testing against reference standards.' },
  { step: '05', title: 'Final Inspection', desc: 'Comprehensive functional testing, safety checks, and documentation before dispatch.' },
];

const capabilities = [
  { value: '50,000', unit: 'sq. ft.', label: 'Manufacturing Facility' },
  { value: '200+', unit: '', label: 'Product Range' },
  { value: '150+', unit: '', label: 'Engineers & Staff' },
  { value: '15+', unit: '', label: 'Service Centers' },
];

const cmsSeed_why_capabilities=capabilities;
const cmsSeed_why_qaProcess=qaProcess;
const cmsSeed_why_strengths=strengths;
export default function WhyChooseUsPage() {
  const cms=useCmsBlock("why-choose-us","why");
  const strengths=cmsArray(cmsSeed_why_strengths,cms.items_strengths);
  const qaProcess=cmsArray(cmsSeed_why_qaProcess,cms.items_qaProcess);
  const capabilities=cmsArray(cmsSeed_why_capabilities,cms.items_capabilities);

  const { openQuote } = useQuote();

  return (
    <>
      <PageHeader
        title={cms.title_1??"Why Choose Us"}
        subtitle={cms.subtitle_2??"Three decades of engineering excellence and unwavering commitment to precision."}
        breadcrumbs={cmsArray([{ label: 'Why Choose Us' }],cms.list_3)}
        image={cms.image_4??(why_choose_us_1?.src)}
      />

      <section className="py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {strengths.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="group p-6 border border-border bg-card hover:border-primary/20 transition-all"
              >
                <div className="w-10 h-10 flex items-center justify-center bg-primary/5 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <s.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-foreground">{s.title}</h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{cmsRender(s.desc)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-20 bg-secondary border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <span className="text-[11px] font-mono uppercase tracking-widest text-primary mb-2 block">{cmsRender(cms.text_5??"Quality Assurance")}</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-10">{cmsRender(cms.text_6??"Our Quality Process")}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {qaProcess.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="p-5 bg-card border border-border"
              >
                <span className="text-3xl font-mono font-bold text-primary/20">{p.step}</span>
                <h3 className="font-semibold text-foreground text-sm mt-2">{p.title}</h3>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{cmsRender(p.desc)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <span className="text-[11px] font-mono uppercase tracking-widest text-primary mb-2 block">{cmsRender(cms.text_7??"Capabilities")}</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-10">{cmsRender(cms.text_8??"Manufacturing Scale")}</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {capabilities.map((c, i) => (
              <div key={i} className="p-6 border border-border bg-card text-center">
                <span className="text-3xl sm:text-4xl font-mono font-bold text-foreground">{c.value}</span>
                {c.unit && <span className="text-sm font-mono text-muted-foreground ml-1">{c.unit}</span>}
                <p className="text-sm text-muted-foreground mt-2">{c.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button onClick={cms.button_link_1?()=>window.location.assign(cms.button_link_1):openQuote} className="bg-primary text-primary-foreground h-11 px-8 text-sm font-semibold gap-2">
              {cmsRender(cms.text_9??"Get a Custom Quote ")}<ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
