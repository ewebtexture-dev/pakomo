'use client';


/* cms:2910 */
import {useCmsBlock,cmsArray,cmsRender} from '@/components/cms/ContentProvider';
import React from 'react';
import { useQuote } from '@/lib/QuoteContext';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';

import { ArrowRight } from 'lucide-react';
import CalibrationServices from '@assets/Services/CalibrationServices.jpg'
import services_1 from '@assets/Unsplash/services-1.jpg';


export default function ServicesPage({service}) {
  const cms=useCmsBlock("service-template","detail");

  

    const { openQuote } = useQuote();

    return (
        <>
            <PageHeader
                title={service.header_title||("Our Services / "+service.title)}
                subtitle={service.header_description||"End-to-end support services to ensure your testing instruments perform at their best."}
                breadcrumbs={cmsArray([{ label: 'Services' }],cms.list_3)}
                image={cms.image_4??(services_1?.src)}
            />

            <section className="py-12 sm:py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex flex-col md:flex-row md:justify-evenly items-center gap-6 rounded-2xl border border-border overflow-hidden bg-card p-4">

                        <div className="relative w-full md:w-[45%] h-[320px] overflow-hidden rounded-xl">
                            <img
                                src={service.image?.src||service.image||CalibrationServices?.src}
                                alt={cms.alt_6??"CalibrationServices"}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        </div>

                        <div className="w-full md:w-[45%]">
                            <h3 className="text-2xl font-bold text-foreground">
                                {cmsRender(service.detail_title??cms.text_7??"Calibration Services")}</h3>
                            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                                {cmsRender(service.body??cms.text_8??"Regular calibration ensures your instruments perform at peak accuracy. We provide: Precise calibration services as per ISO and NABL standards. Comprehensive calibration certificates for regulatory compliance. On-site and in-house calibration options for your convenience.")}</p>
                        </div>

                    </div>

                    <div className="mt-12 text-center">
                        <Button onClick={openQuote} className="bg-primary text-primary-foreground h-11 px-8 text-sm font-semibold gap-2">
                            {cmsRender(service.cta_label||"Get Service Quote ")}<ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </section>
        </>
    );
}
