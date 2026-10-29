'use client'
import SafeImage from '@/components/shared/SafeImage';

/* cms:2910 */
import {useCmsBlock,useCmsCollection,cmsArray,cmsRender} from '@/components/cms/ContentProvider';
import React, {useState} from 'react';
import Link from 'next/link';
import PageHeader from '@/components/shared/PageHeader';
import { useRouter } from "next/navigation";
import { useParams } from 'next/navigation';
import { Search, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { applications } from '../applicationData'



export default function ApplicationDetail({ params }) {
  const cms=useCmsBlock("application-template","detail");
  

    const [search, setSearch] = useState('');
    const resolvedParams = useParams();
    const applicationId = resolvedParams.application;
    const allApplications=useCmsCollection("application",applications);
    const application=allApplications.find(a=>a.id===applicationId||a._slug===applicationId);
    const catalog=useCmsCollection("product");
    const router = useRouter();

    const products=catalog.filter(p=>(application?.productsList?.includes(p.id)||application?.productsList?.includes(p._key)));
    
    
    

    if (!application) {
        return (
            <>
                <PageHeader
                    title={cms.title_1??"Application Not Found"}
                    subtitle={cms.subtitle_2??"The application you're looking for doesn't exist."}
                    breadcrumbs={cmsArray([{ label: 'Applications', path: '/applications' }, { label: 'Not Found' }],cms.list_3)}
                />
                <section className="py-20 text-center">
                    <Link href={cms.href_4??"/applications"} className="inline-flex items-center gap-2 text-primary font-semibold">
                        <ArrowLeft className="w-4 h-4" /> {cmsRender(cms.text_5??" Back to Applications")}</Link>
                </section>
            </>
        );
    }

    const Icon = application?.icon;
    const relevantProducts = products;
    const filtered = relevantProducts.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) || p.desc.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <PageHeader
                title={application.name}
                subtitle={application.desc}
                breadcrumbs={cmsArray([{ label: 'Applications', path: '/applications' }, { label: application.name }],cms.list_6)}
                image={application.image}
            />

            {/* Overview bar */}
            <section className="py-8 border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                            <Icon className="w-7 h-7 text-primary" />
                        </div>
                        <div className="flex-1">
                            <div className="flex flex-wrap gap-4 text-sm">
                                <div>
                                    <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block">{cmsRender(cms.text_7??"Instruments")}</span>
                                    <span className="font-semibold text-foreground">{application.instruments}</span>
                                </div>
                                <div className="hidden sm:block w-px h-10 bg-border" />
                                <div>
                                    <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block">{cmsRender(cms.text_8??"Key Tests")}</span>
                                    <span className="font-semibold text-foreground">{application.tests}</span>
                                </div>
                            </div>
                        </div>
                        <Link href={cms.href_9??"/contact"} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all whitespace-nowrap">
                            {cmsRender(cms.text_10??"Request a Quote ")}<ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Products grid */}
            <section className="py-12 sm:py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <span className="text-[11px] font-mono uppercase tracking-widest text-primary mb-2 block">{cmsRender(cms.text_11??"Instruments")}</span>
                            <h2 className="text-2xl font-bold text-foreground">{cmsRender(cms.text_12??"Products for ")}{application.name}</h2>
                        </div>
                        <div className="relative sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder={cms.placeholder_13??"Search instruments..."}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 h-9 text-sm"
                            />
                        </div>
                    </div>

                    <p className="text-xs text-muted-foreground font-mono mb-6">{filtered.length} {cmsRender(cms.text_14??" instruments found")}</p>

                    {filtered.length > 0 ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filtered.map((product, i) => (
                                <motion.div
                                    key={product.name}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: i * 0.03 }}
                                    className="group rounded-2xl border border-border bg-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
                                    onClick={() => router.push(`/products/${product._slug||product.id}`)}
                                >
                                    <div className="aspect-[4/3] bg-secondary overflow-hidden">
                                        <SafeImage src={product?.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-foreground text-sm">{product.name}</h3>
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{cmsRender(product.desc)}</p>
                                        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border">
                                            {Object.entries(product.specs).slice(0,3).map(([key, val]) => (
                                                <div key={key}>
                                                    <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">{key}</span>
                                                    <span className="block text-[11px] font-mono font-semibold text-foreground">{val}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <p className="text-muted-foreground">{cmsRender(cms.text_15??"No instruments found matching your search.")}</p>
                        </div>
                    )}

                    {/* Key features section */}
                    <div className="mt-12 rounded-2xl border border-border bg-secondary/50 p-6 sm:p-8">
                        <span className="text-[11px] font-mono uppercase tracking-widest text-primary mb-2 block">{cmsRender(cms.text_16??"Why Choose Pakmo")}</span>
                        <h3 className="text-lg font-bold text-foreground mb-4">{cmsRender(cms.text_17??"Specialized Solutions for ")}{application.name}</h3>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {cmsArray([
                                'ISO 9001 certified manufacturing',
                                'NABL accredited calibration',
                                'On-site installation & training',
                                'Comprehensive AMC support',
                                'Spare parts availability',
                                'Custom test fixtures available',
                            ],cms.list_18).map((feature, i) => (
                                <div key={i} className="flex items-center gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                    <span className="text-sm text-foreground">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Back link */}
                    <div className="mt-8">
                        <Link href={cms.href_19??"/applications"} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all">
                            <ArrowLeft className="w-3.5 h-3.5" /> {cmsRender(cms.text_20??" Back to All Applications")}</Link>
                    </div>
                </div>
            </section>
        </>
    );
}