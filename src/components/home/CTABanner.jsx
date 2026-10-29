'use client';
import SafeImage from '@/components/shared/SafeImage';


/* cms:2910 */
import {useSiteSettings,useCmsBlock,cmsRender} from '@/components/cms/ContentProvider';
import React from 'react';
import { useQuote } from '@/lib/QuoteContext';
import { ArrowRight, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import testing_standards_1 from '@assets/Unsplash/testing-standards-1.jpg';

export default function CTABanner() {
  const cms=useCmsBlock("home","cta");
  const contact=useSiteSettings("contact");
  

  const { openQuote } = useQuote();


  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      <div className="absolute inset-0">
        <SafeImage
          src={cms.image_1??(testing_standards_1?.src)}
          alt={cms.alt_2??"Quality testing laboratory"}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/90 to-blue-600/85" />
      </div>

      {/* Pattern overlay */}
      <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '24px 24px'}} />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-1.5 bg-white/15 rounded-full text-white/80 text-xs font-semibold tracking-wide uppercase mb-6">
            {cmsRender(cms.text_3??"Get Started Today")}</span>
          <h2 className="text-3xl sm:text-5xl font-bold text-white leading-tight">
            {cmsRender(cms.text_4??"Find the Perfect Testing")}<br />{cmsRender(cms.text_5??"Instrument for Your Industry")}</h2>
          <p className="text-white/70 mt-5 text-base max-w-xl mx-auto">
            {cmsRender(cms.text_6??"Our experts will help you choose the right solution. Get a custom quote with specs, pricing and delivery timeline.")}</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Button
              onClick={cms.button_link_1?()=>window.location.assign(cms.button_link_1):openQuote}
              className="bg-white text-primary hover:bg-white/90 h-13 px-8 text-sm font-bold gap-2 rounded-full shadow-xl"
            >
              {cmsRender(cms.text_7??"Request a Free Quote ")}<ArrowRight className="w-4 h-4" />
            </Button>
            <a href={"tel:"+(contact.phones?.[0]?.number||"+918595362719")}>
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/15 h-13 px-8 text-sm font-semibold gap-2 rounded-full">
                <Phone className="w-4 h-4" /> {cmsRender(cms.text_9??" Call Us Now")}</Button>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}