'use client';
import {testimonialText} from '@/cms/plain-text';
import SafeImage from '@/components/shared/SafeImage';

/* cms:2910 */
import {useCmsBlock,useCmsCollection,cmsArray,cmsRender} from '@/components/cms/ContentProvider';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import Reliance from "@assets/clients/Reliance.png";
import VGuard from "@assets/clients/V-Guard.webp";
import AshokLeyland from "@assets/clients/AshokLeyland.png";
import ApolloCoatedProducts from "@assets/clients/Apollo.jpeg";
import SuprajitEngineering from "@assets/clients/SUPRAJIT.png";
import YutikaNatural from "@assets/clients/Yutika.jpg";
import JKDPlastic from "@assets/clients/JKD.jpeg";
import ModernWhiteners from "@assets/clients/Whitener.webp";
import K95Food from "@assets/clients/K95.avif";
import ShriJagannathSteelPower from "@assets/clients/SJSPL.jpeg";

const testimonials = [
  {
    quote: "We are satisfied with the performance of the Salt Spray Chamber supplied to us. The product quality is good, and after successful installation, the machine has been operating smoothly without any issues. The equipment meets our testing requirements and has been reliable in day-to-day use.",
    name: "Quality Head",
    role: "Quality Head",
    company: "Apollo Coated Products Pvt. Ltd.",
    rating: 5,
  },
  {
    quote: "The Salt Spray Chamber supplied to our organization has demonstrated excellent performance since its installation. The equipment is well-engineered, user-friendly, and provides stable operating conditions for conducting corrosion tests. We appreciate the product quality and the dependable after-sales support provided. Based on our experience, the chamber has proven to be a valuable asset to our testing laboratory.",
    name: "Director",
    role: "Director",
    company: "U T Global Solutions",
    rating: 5,
  },
  {
    quote: "We have installed and are using the CCS Testing Machine supplied by your company at our plant. The machine is performing satisfactorily and delivering consistent test results as per our requirements. We found the equipment to be sturdy, easy to operate, and suitable for our testing applications. The installation and commissioning support provided by your team was satisfactory, and any queries raised during operation were attended to promptly. Based on our experience, we appreciate the overall quality of the machine and the support extended by your organization.",
    name: "DGM – Projects",
    role: "DGM – Projects",
    company: "Shree Jagannath Steel & Power Ltd.",
    rating: 5,
  },
];

const getImageSrc = (asset) => (typeof asset === "string" ? asset : asset?.src || "");

const clients = [
  { name: "Reliance Industries Ltd.", logo: Reliance },
  { name: "V-Guard Industries Ltd.", logo: VGuard },
  { name: "Ashok Leyland Industries Ltd.", logo: AshokLeyland },
  { name: "Apollo Coated Products Pvt. Ltd.", logo: ApolloCoatedProducts },
  { name: "Suprajit Engineering Ltd.", logo: SuprajitEngineering },
  { name: "Yutika Natural Pvt. Ltd.", logo: YutikaNatural },
  { name: "JKD Plastic", logo: JKDPlastic },
  { name: "Modern Whiteners Pvt. Ltd.", logo: ModernWhiteners },
  { name: "K95 Food Pvt. Ltd.", logo: K95Food },
  { name: "Shri Jagannath Steel & Power Ltd.", logo: ShriJagannathSteelPower },
];

const cmsSeed_clients_clients=clients;
const cmsSeed_clients_testimonials=testimonials;
export default function ClientsPreview() {
  const cms=useCmsBlock("home","clients");
  const testimonials=cmsArray(cmsSeed_clients_testimonials,useCmsCollection("testimonial",cms.items_testimonials));
  const clients=cmsArray(cmsSeed_clients_clients,useCmsCollection("client",cms.items_clients));

  const [current, setCurrent] = useState(0);
  const activeTestimonial=testimonials[current % Math.max(1,testimonials.length)];

  useEffect(() => {
    const timer = setInterval(() => setCurrent((p) => (p + 1) % Math.max(1,testimonials.length)), 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <section className="py-20 sm:py-16 bg-secondary/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <span className="section-label mx-auto justify-center">{cmsRender(cms.text_1??"Trusted By")}</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-1">{cmsRender(cms.text_2??"Our Happy Clients")}</h2>
          <p className="text-muted-foreground mt-2 text-sm">{cmsRender(cms.text_3??"Partnering with India's leading manufacturers across sectors.")}</p>
        </div>

        {/* Client Logos */}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-16">
          {clients.map((client, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.02 }}
                className="flex flex-col items-center justify-center gap-2 p-5 h-24 border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all duration-300 group"
              >
                <SafeImage
                  src={getImageSrc(client.logo)}
                  alt={client.name}
                  className="h-10 w-full object-contain  group-hover:grayscale-0 opacity-100 group-hover:opacity-50 transition-all duration-300"
                  loading="lazy"
                />
                <span className="text-[10px] font-medium text-muted-foreground text-center">{client.name}</span>
              </motion.div>
            ))}
        </div>

        {/* Testimonial Card */}
        <div className="max-w-3xl mx-auto">
          <div className="relative rounded-3xl bg-card border border-border p-8 sm:p-10 shadow-xl overflow-hidden">
            {/* Decorative bg */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/4" />

            <Quote className="w-10 h-10 text-primary/20 mb-6" />
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(activeTestimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-lg sm:text-xl text-foreground leading-relaxed font-medium">
                  {cmsRender(cms.text_4??"\"")}{testimonialText(activeTestimonial.quote)}{cmsRender(cms.text_5??"\"")}</p>
                <div className="flex items-center gap-4 mt-8">
                  <div>
                    <p className="font-bold text-foreground">{activeTestimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{activeTestimonial.role}{cmsRender(cms.text_6??", ")}{activeTestimonial.company}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Dots */}
            <div className="flex items-center gap-2 mt-6">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-8 bg-primary' : 'w-2 bg-border'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}