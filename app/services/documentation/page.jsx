'use client';
import SafeImage from '@/components/shared/SafeImage';


/* cms:2910 */
import {useCmsCollection,useCmsBlock,cmsArray,cmsRender} from '@/components/cms/ContentProvider';
import React from 'react';
import { useQuote } from '@/lib/QuoteContext';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';

import { ArrowRight } from 'lucide-react';
import Validation from '@assets/Services/Validation.jpg'
import services_1 from '@assets/Unsplash/services-1.jpg';


export default function ServicesPage() {
  const cms=useCmsBlock("service-documentation","detail");
 const service=useCmsCollection("service").find(s=>s._slug==="documentation")||{};
  

    const { openQuote } = useQuote();

    return (
        <>
            <PageHeader
                title={cms.title_1??"Our Services / Validation Documentation"}
                subtitle={cms.subtitle_2??"End-to-end support services to ensure your testing instruments perform at their best."}
                breadcrumbs={cmsArray([{ label: 'Services' }],cms.list_3)}
                image={cms.image_4??(services_1?.src)}
            />

            <section className="py-12 sm:py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex flex-col md:flex-row md:justify-evenly items-center gap-6 rounded-2xl border border-border overflow-hidden bg-card p-4">

                        <div className="relative w-full md:w-[45%] h-[320px] overflow-hidden rounded-xl">
                            <SafeImage
                                src={cms.image_5??(Validation?.src)}
                                alt={cms.alt_6??"Validation"}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        </div>

                        <div className="w-full md:w-[45%]">
                            <h3 className="text-2xl font-bold text-foreground">
                                {cmsRender(service.detail_title??cms.text_7??"Validation Documentation")}</h3>
                            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                                {cmsRender(service.body??cms.text_8??"Ensuring compliance with regulatory standards is critical in industries like pharmaceuticals and manufacturing. We offer: IQ (Installation Qualification): Documentation to verify proper installation of equipment according to specifications. OQ (Operational Qualification): Validation that the equipment operates as intended under defined conditions. PQ (Performance Qualification): Comprehensive testing to ensure the equipment consistently delivers the desired results in real-world scenarios. Detailed, audit-ready documentation to meet industry compliance requirements.")}</p>
                        </div>

                    </div>

                    <div className="mt-12 text-center">
                        <Button onClick={cms.button_link_1?()=>window.location.assign(cms.button_link_1):openQuote} className="bg-primary text-primary-foreground h-11 px-8 text-sm font-semibold gap-2">
                            {cmsRender(cms.text_9??"Get Service Quote ")}<ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </section>
        </>
    );
}
