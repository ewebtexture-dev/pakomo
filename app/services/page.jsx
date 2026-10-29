'use client';
import SafeImage from '@/components/shared/SafeImage';


/* cms:2910 */
import {useCmsBlock,useCmsCollection,cmsArray,cmsRender} from '@/components/cms/ContentProvider';
import React from 'react';
import { useQuote } from '@/lib/QuoteContext';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Manufacturing from '@assets/Services/Manufacturing.jpg'
import CalibrationServices from '@assets/Services/CalibrationServices.jpg'
import Repair from '@assets/Services/Repair.jpg'
import Validation from '@assets/Services/Validation.jpg'
import Custom from '@assets/Services/Custom.jpg'
import TechnicalSupport from '@assets/Services/TechnicalSupport.jpg'
import Setup from '@assets/Services/Setup.jpg'
import Consultation from '@assets/Services/Consultation.jpg'
import Link from 'next/link';
import services_1 from '@assets/Unsplash/services-1.jpg';

const services = [
  {
    title: 'Manufacturing of Testing Instruments',
    desc: 'We specialize in designing and manufacturing high-performance testing instruments tailored to diverse industries.',
    image: Manufacturing?.src,
    color: 'bg-blue-50 text-blue-600',
    link: '/services/manufacture'
  },
  {
    title: 'Calibration Services',
    desc: 'Regular calibration ensures your instruments perform at peak accuracy. We provide: Precise calibration services as per ISO and NABL standards.',
    image: CalibrationServices?.src,
    color: 'bg-indigo-50 text-indigo-600',
    link: '/services/calibration'
  },
  {
    title: 'Repair and Maintenance Services',
    desc: 'Keep your instruments running smoothly with our repair and maintenance solutions: Expert diagnostics and repairs for a wide range of instruments.',
    image: Repair?.src,
    color: 'bg-cyan-50 text-cyan-600',
    link: '/services/maintenance'
  },
  {
    title: 'Validation Documentation (IQ, OQ, PQ)',
    desc: 'Ensuring compliance with regulatory standards is critical in industries like pharmaceuticals and manufacturing.Ensuring compliance with regulatory standards is critical in industries like pharmaceuticals and manufacturing.',
    image: Validation?.src,
    color: 'bg-violet-50 text-violet-600',
    link: '/services/documentation'
  },
  {
    title: 'Custom Instrument Solutions',
    desc: 'We provide tailored solutions to meet unique testing challenges, including',
    image: Custom?.src,
    color: 'bg-sky-50 text-sky-600',
    link: '/services/instrument'
  },
  {
    title: 'Technical Support and Training',
    desc: 'Empower your team to make the best use of our instruments with our expert support and training services.',
    image: TechnicalSupport?.src,
    color: 'bg-sky-50 text-sky-600',
    link: '/services/support'
  },
  {
    title: 'Installation and Setup Services',
    desc: 'Ensure seamless integration of your instruments with our installation services.',
    image: Setup?.src,
    color: 'bg-sky-50 text-sky-600',
    link: '/services/installation'
  },
  {
    title: 'Consultation Services',
    desc: 'Our experts can guide you in choosing the best solutions for your testing and validation needs.',
    image: Consultation?.src,
    color: 'bg-sky-50 text-sky-600',
    link: '/services/consultation'
  },
];

const cmsSeed_listing_services=services;
export default function ServicesPage() {
  const cms=useCmsBlock("services","listing");
  const services=cmsArray(cmsSeed_listing_services,useCmsCollection("service",cms.items_services));

  const { openQuote } = useQuote();

  return (
    <>
      <PageHeader
        title={cms.title_1??"Our Services"}
        subtitle={cms.subtitle_2??"End-to-end support services to ensure your testing instruments perform at their best."}
        breadcrumbs={cmsArray([{ label: 'Services' }],cms.list_3)}
        image={cms.image_4??(services_1?.src)}
      />

      <section className="py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="items-stretch flex flex-wrap gap-10 justify-center">
            {services.map((service, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group w-[90vw] sm:w-[45vw] lg:w-[25vw] rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <Link href={service?.link}>
              <div className="relative h-[120px] overflow-hidden">
                <SafeImage src={service.image} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-foreground text-sm">{service.title}</h3>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{cmsRender(service.desc)}</p>
              </div>
              </Link>
            </motion.div>
          ))}
          </div>

          <div className="mt-12 text-center">
            <Button onClick={cms.button_link_1?()=>window.location.assign(cms.button_link_1):openQuote} className="bg-primary text-primary-foreground h-11 px-8 text-sm font-semibold gap-2">
              {cmsRender(cms.text_5??"Get Service Quote ")}<ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
