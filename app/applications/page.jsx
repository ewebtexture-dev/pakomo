'use client';

import React from 'react';
import Link from 'next/link';
import PageHeader from '@/components/shared/PageHeader';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import applications_1_1 from '@assets/Unsplash/applications-1.jpg';
import {applications} from './applicationData'


export default function ApplicationsPage() {
  return (
    <>
      <PageHeader
        title="Applications"
        subtitle="Our testing instruments serve 8+ major industry verticals with specialized solutions."
        breadcrumbs={[{ label: 'Applications' }]}
        image={applications_1_1?.src}
      />

      <section className="py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 gap-5">
            {applications.map((app, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={app.image}
                    alt={app.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white border border-white/20">
                      <app.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{app.name}</h3>
                      <span className="text-xs text-white/70">{app.instruments}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-sm text-muted-foreground leading-relaxed">{app.desc}</p>
                  <div className="mt-4 pt-4 border-t border-border">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Key Tests</span>
                    <p className="text-sm text-foreground mt-1.5 font-medium">{app.tests}</p>
                  </div>
                  <Link href={`/applications/${app.id}`} className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-primary hover:gap-3 transition-all">
                    View Instruments <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
