'use client';
import SafeImage from '@/components/shared/SafeImage';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import applications1 from '@assets/Unsplash/applications-1.jpg';
import applications_1 from '@assets/Unsplash/applications-2.jpg';
import applications_2 from '@assets/Unsplash/applications-3.jpg';
import applications_3 from '@assets/Unsplash/applications-4.jpg';
import applications_4 from '@assets/Unsplash/applications-5.jpg';
import applications_5 from '@assets/Unsplash/applications-6.jpg';

const applications = [
  {
    name: 'Packaging',
    count: '85+ Instruments',
    image: applications1?.src,
    desc: 'Burst, seal strength, leak testing',
  },
  {
    name: 'Plastic',
    count: '60+ Instruments',
    image: applications1?.src,
    desc: 'MFI, tensile, impact testing',
  },
  {
    name: 'Paper & Board',
    count: '45+ Instruments',
    image: applications_1?.src,
    desc: 'GSM, tear, stiffness testing',
  },
  {
    name: 'Textile',
    count: '50+ Instruments',
    image: applications1?.src,
    desc: 'Pilling, abrasion, strength',
  },
  {
    name: 'Automobile',
    count: '40+ Instruments',
    image: applications_2?.src,
    desc: 'Hardness, weathering, fatigue',
  },
  {
    name: 'Pharma',
    count: '55+ Instruments',
    image: applications_4?.src,
    desc: 'Hardness, dissolution, leak',
  },
  {
    name: 'FMCG',
    count: '35+ Instruments',
    image: applications_3?.src,
    desc: 'Seal integrity, torque, drop',
  },
  {
    name: 'Electronics',
    count: '30+ Instruments',
    image: applications_5?.src,
    desc: 'Thermal, humidity, vibration',
  },
];

export default function ApplicationsPreview() {
  return (
    <section className="py-20 sm:py-28 bg-secondary/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <span className="section-label">Industries We Serve</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-1">
              Testing Applications
            </h2>
            <p className="text-muted-foreground mt-2 text-sm max-w-md">
              Specialized testing instruments for every major industrial sector.
            </p>
          </div>
          <Link href="/applications" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all">
            View All Applications <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {applications.map((app, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <Link href="/applications" className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="relative overflow-hidden aspect-[4/3]">
                  <SafeImage
                    src={app.image}
                    alt={app.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-bold text-white text-sm">{app.name}</h3>
                    <p className="text-[11px] text-white/70 mt-0.5">{app.desc}</p>
                  </div>
                </div>
                <div className="px-4 py-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary">{app.count}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}