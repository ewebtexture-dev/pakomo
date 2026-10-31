"use client";
import {testimonialText} from '@/cms/plain-text';
import SafeImage from '@/components/shared/SafeImage';


/* cms:2910 */
import {useCmsBlock,useCmsCollection,cmsArray,cmsRender} from '@/components/cms/ContentProvider';
import React, { useState, useEffect } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";
import clients_1 from "@assets/Unsplash/clients-1.jpg";
import Reliance from "@assets/clients/Reliance.png";
import Apollo from '@assets/clients/Apollo.jpeg'
import VGuard from "@assets/clients/V-Guard.webp";
import AshokLeyland from "@assets/clients/AshokLeyland.png";
import ApolloCoatedProducts from "@assets/clients/Apollo.jpeg";
import SuprajitEngineering from "@assets/clients/SUPRAJIT.png";
import YutikaNatural from "@assets/clients/Yutika.jpg";
import JKDPlastic from "@assets/clients/JKD.jpeg";
import ModernWhiteners from "@assets/clients/Whitener.webp";
import K95Food from "@assets/clients/K95.avif";
import ShriJagannathSteelPower from "@assets/clients/SJSPL.jpeg";

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

const testimonials = [
  {
    quote:
      "We are satisfied with the performance of the Salt Spray Chamber supplied to us. The product quality is good, and after successful installation, the machine has been operating smoothly without any issues. The equipment meets our testing requirements and has been reliable in day-to-day use.",
    name: "Quality Head",
    role: "Quality Head",
    company: "Apollo Coated Products Pvt. Ltd.",
    rating: 5,
  },
  {
    quote:
      "The Salt Spray Chamber supplied to our organization has demonstrated excellent performance since its installation. The equipment is well-engineered, user-friendly, and provides stable operating conditions for conducting corrosion tests. We appreciate the product quality and the dependable after-sales support provided. Based on our experience, the chamber has proven to be a valuable asset to our testing laboratory.",
    name: "Director",
    role: "Director",
    company: "U T Global Solutions",
    rating: 5,
  },
  {
    quote:
      "We have installed and are using the CCS Testing Machine supplied by your company at our plant. The machine is performing satisfactorily and delivering consistent test results as per our requirements. We found the equipment to be sturdy, easy to operate, and suitable for our testing applications. The installation and commissioning support provided by your team was satisfactory, and any queries raised during operation were attended to promptly. Based on our experience, we appreciate the overall quality of the machine and the support extended by your organization.",
    name: "DGM – Projects",
    role: "DGM – Projects",
    company: "Shree Jagannath Steel & Power Ltd.",
    rating: 5,
  },
];

const industries = [
  { name: "Packaging", count: 120 },
  { name: "Plastic", count: 85 },
  { name: "Paper", count: 65 },
  { name: "Textile", count: 55 },
  { name: "Automobile", count: 40 },
  { name: "FMCG", count: 45 },
  { name: "Pharma", count: 20 },
  { name: "Electronics", count: 15 },
];

const cmsSeed_clients_industries=industries;
const cmsSeed_clients_testimonials=testimonials;
const cmsSeed_clients_clients=clients;
export default function ClientsPage() {
  const cms=useCmsBlock("clients","clients");
  const clients=cmsArray(cmsSeed_clients_clients,useCmsCollection("client",cms.items_clients));
  const testimonials=cmsArray(cmsSeed_clients_testimonials,useCmsCollection("testimonial",cms.items_testimonials));
  const industries=cmsArray(cmsSeed_clients_industries,cms.items_industries);

  const [current, setCurrent] = useState(0);
  const activeTestimonial=testimonials[current % Math.max(1,testimonials.length)];

  useEffect(() => {
    const timer = setInterval(
      () => setCurrent((p) => (p + 1) % Math.max(1,testimonials.length)),
      5000,
    );
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <>
      <PageHeader
        title={cms.title_1??"Our Clients"}
        subtitle={cms.subtitle_2??"Trusted by 445+ industries across India and internationally."}
        breadcrumbs={cmsArray([{ label: "Our Clients" }],cms.list_3)}
        image={cms.image_4??(clients_1?.src)}
      />

      <section className="py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <span className="text-[11px] font-mono uppercase tracking-widest text-primary mb-2 block">
            {cmsRender(cms.text_5??"Trusted By")}</span>
          <h2 className="text-2xl font-bold text-foreground mb-8">
            {cmsRender(cms.text_6??"Our Valued Clients")}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
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
        </div>
      </section>

      <section className="py-12 sm:py-20 bg-secondary border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <span className="text-[11px] font-mono uppercase tracking-widest text-primary mb-2 block">
            {cmsRender(cms.text_7??"Sectors")}</span>
          <h2 className="text-2xl font-bold text-foreground mb-8">
            {cmsRender(cms.text_8??"Industries Served")}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {industries.map((ind, i) => (
              <div key={i} className="p-5 border border-border bg-card">
                <span className="text-2xl font-mono font-bold text-primary">
                  {ind.count}{cmsRender(cms.text_9??"+")}</span>
                <span className="block text-sm font-semibold text-foreground mt-1">
                  {ind.name}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {cmsRender(cms.text_10??"Companies served")}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-[11px] font-mono uppercase tracking-widest text-primary mb-2 block">
            {cmsRender(cms.text_11??"Testimonials")}</span>
          <h2 className="text-2xl font-bold text-foreground mb-8">
            {cmsRender(cms.text_12??"What Our Clients Say")}</h2>

          <Quote className="w-8 h-8 text-primary/20 mx-auto mb-6" />
          <div className="relative min-h-[140px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
              >
                <p className="text-base sm:text-lg text-foreground leading-relaxed italic">
                  {cmsRender(cms.text_13??"\"")}{testimonialText(activeTestimonial.quote)}{cmsRender(cms.text_14??"\"")}</p>
                <div className="mt-6">
                  <p className="font-semibold text-foreground text-sm">
                    {activeTestimonial.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activeTestimonial.role}{cmsRender(cms.text_15??",")}{" "}
                    {activeTestimonial.company}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() =>
                setCurrent(
                  (current - 1 + testimonials.length) % Math.max(1,testimonials.length),
                )
              }
              className="w-8 h-8 flex items-center justify-center border border-border hover:border-primary/30 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2 h-2 transition-colors ${i === current ? "bg-primary" : "bg-border"}`}
                />
              ))}
            </div>
            <button
              onClick={() => setCurrent((current + 1) % Math.max(1,testimonials.length))}
              className="w-8 h-8 flex items-center justify-center border border-border hover:border-primary/30 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
