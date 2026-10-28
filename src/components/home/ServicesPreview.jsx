'use client';

import React from 'react';
import Link from 'next/link';
import { Wrench, Gauge, HeadphonesIcon, FileCheck, GraduationCap, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Calibration from '@assets/Services/Calibration.jpg'
import Custom from '@assets/Services/Custom.jpg'
import Installation from '@assets/Services/Installation.jpg'
import Support from '@assets/Services/Support.jpg'
import Training from '@assets/Services/Training.jpg'

const services = [
  {
    icon: Wrench,
    title: 'Equipment Installation',
    desc: 'Professional installation & commissioning by certified engineers.',
    image: Installation?.src,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Gauge,
    title: 'Calibration Services',
    desc: 'NABL-traceable calibration for instrument accuracy.',
    image: Calibration?.src,
    color: 'bg-indigo-50 text-indigo-600',
  },
  {
    icon: HeadphonesIcon,
    title: 'Technical Support',
    desc: '24/7 helpline with remote diagnostics & on-site visits.',
    image: Support?.src,
    color: 'bg-cyan-50 text-cyan-600',
  },
  {
    icon: FileCheck,
    title: 'Custom Instrument Solutions',
    desc: 'We provide tailored solutions to meet unique testing challenges, including.',
    image: Custom?.src,
    color: 'bg-violet-50 text-violet-600',
  },
  {
    icon: GraduationCap,
    title: 'Training & Consultation',
    desc: 'Hands-on operator training and methodology consultation.',
    image: Training?.src,
    color: 'bg-sky-50 text-sky-600',
  },
];

export default function ServicesPreview() {
  return (
    <section className="py-20 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <span className="section-label">What We Offer</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-1">Our Services</h2>
            <p className="text-muted-foreground mt-2 text-sm max-w-md">
              End-to-end support to ensure your instruments perform at their best, always.
            </p>
          </div>
          <Link href="/services" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all">
            All Services <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {services.map((service, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <Link href="/services">
              <div className="relative h-32 overflow-hidden">
                <img src={service.image} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <div className="p-4">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${service.color}`}>
                  <service.icon className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-foreground text-sm">{service.title}</h3>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{service.desc}</p>
              </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}