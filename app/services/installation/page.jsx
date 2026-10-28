'use client';

import React from 'react';
import { useQuote } from '@/lib/QuoteContext';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Setup from '@assets/Services/Setup.jpg'
import services_1 from '@assets/Unsplash/services-1.jpg';


export default function ServicesPage() {
    const { openQuote } = useQuote();

    return (
        <>
            <PageHeader
                title="Our Services / Installation and Setup Services"
                subtitle="End-to-end support services to ensure your testing instruments perform at their best."
                breadcrumbs={[{ label: 'Services' }]}
                image={services_1?.src}
            />

            <section className="py-12 sm:py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex flex-col md:flex-row md:justify-evenly items-center gap-6 rounded-2xl border border-border overflow-hidden bg-card p-4">

                        <div className="relative w-full md:w-[45%] h-[320px] overflow-hidden rounded-xl">
                            <img
                                src={Setup?.src}
                                alt="Setup"
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        </div>

                        <div className="w-full md:w-[45%]">
                            <h3 className="text-2xl font-bold text-foreground">
                                Installation and Setup Services
                            </h3>
                            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                                Ensure seamless integration of your instruments with our installation services: <br />

                                Professional installation and setup by our qualified technicians.
                                Initial testing and verification to ensure optimal performance.
                                Training on operational procedures for smooth handover.
                            </p>
                        </div>

                    </div>

                    <div className="mt-12 text-center">
                        <Button onClick={openQuote} className="bg-primary text-primary-foreground h-11 px-8 text-sm font-semibold gap-2">
                            Get Service Quote <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </section>
        </>
    );
}
