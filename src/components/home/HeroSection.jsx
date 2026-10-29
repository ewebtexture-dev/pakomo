'use client';


/* cms:2910 */
import {useCmsBlock,cmsArray,cmsRender} from '@/components/cms/ContentProvider';
import React from 'react';
import Link from 'next/link';
import { useQuote } from '@/lib/QuoteContext';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import why_choose_us_1 from '@assets/Unsplash/why-choose-us-1.jpg';

const badges = ['ISO 9001:2015', 'ASTM Compliant', 'BIS Certified', 'NABL Traceable'];

const cmsSeed_hero_badges=badges;
export default function HeroSection() {
  const cms=useCmsBlock("home","hero");
  const badges=cmsArray(cmsSeed_hero_badges,cms.items_badges);

  const { openQuote } = useQuote();

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#0a0f1e]">
      {/* Background Image with gradient overlay */}
      <div className="absolute inset-0">
        <img
          src={cms.image_1??(why_choose_us_1?.src)}
          alt={cms.alt_2??"Industrial testing laboratory"}
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0f1e] via-[#0a0f1e]/90 to-[#0a0f1e]/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e] via-transparent to-transparent" />
      </div>

      {/* Subtle dot pattern */}
      <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(rgba(59,130,246,0.08) 1px, transparent 1px)', backgroundSize: '32px 32px'}} />

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-blue-500/8 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-8"
            >
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-primary tracking-wide uppercase">
                {cmsRender(cms.text_3??"40+ Years of Precision Engineering")}</span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight"
            >
              {cmsRender(cms.text_4??"Precision Testing")}<br />
              <span className="bg-gradient-to-r from-blue-400 to-primary bg-clip-text text-transparent">
                {cmsRender(cms.text_5??"Instruments")}</span>
              <br />
              {cmsRender(cms.text_6??"for Industry")}</motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-base sm:text-lg text-white/60 mt-6 max-w-lg leading-relaxed"
            >
              {cmsRender(cms.text_7??"Delivering reliable, accurate & industry-compliant testing solutions trusted by ")}<span className="text-white font-semibold">{cmsRender(cms.text_8??"445+ industries")}</span> {cmsRender(cms.text_9??" worldwide across packaging, plastic, paper, textile and more.")}</motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-wrap gap-4 mt-10"
            >
              <Link href={cms.href_10??"/products"}>
                <Button className="bg-primary hover:bg-primary/90 text-white h-12 px-8 text-sm font-semibold gap-2 rounded-full shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all">
                  {cmsRender(cms.text_11??"Explore Products")}<ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={cms.button_link_1?()=>window.location.assign(cms.button_link_1):openQuote}
                className="border-white/20 text-white hover:bg-white/10 h-12 px-8 text-sm font-semibold rounded-full backdrop-blur-sm"
              >
                {cmsRender(cms.text_12??"Request a Quote")}</Button>
            </motion.div>

            {/* Trust strips */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="flex flex-wrap gap-3 mt-10"
            >
              {badges.map((b) => (
                <div key={b} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full">
                  <CheckCircle className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs text-white/60 font-medium">{b}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Stat cards */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hidden lg:grid grid-cols-2 gap-4"
          >
            {cmsArray([
              { value: '200+', label: 'Products', sub: 'Testing instruments', color: 'from-blue-500/20 to-primary/10' },
              { value: '445+', label: 'Industries', sub: 'Served globally', color: 'from-cyan-500/20 to-blue-500/10' },
              { value: '525+', label: 'Applications', sub: 'Across sectors', color: 'from-indigo-500/20 to-blue-500/10' },
              { value: '40+', label: 'Years', sub: 'Of excellence', color: 'from-violet-500/20 to-primary/10' },
            ],cms.list_13).map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                className={`p-6 rounded-2xl border border-white/10 bg-gradient-to-br ${stat.color} backdrop-blur-sm`}
              >
                <span className="text-3xl font-bold text-white">{stat.value}</span>
                <p className="text-sm font-semibold text-white/80 mt-1">{stat.label}</p>
                <p className="text-xs text-white/40 mt-0.5">{stat.sub}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Bottom scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] text-white/30 tracking-widest uppercase">{cmsRender(cms.text_14??"Scroll")}</span>
          <div className="w-px h-10 bg-gradient-to-b from-white/20 to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}