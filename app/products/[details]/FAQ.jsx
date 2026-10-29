'use client'


/* cms:2910 */
import {useCmsBlock,cmsRender} from '@/components/cms/ContentProvider';
import React, { useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Minus,
} from 'lucide-react';


export default function FAQSection({ faqs }) {
  const cms=useCmsBlock("product-template","faq");
  

    const [openIndex, setOpenIndex] = useState(null);
    return (
        <section className="py-12 sm:py-12 bg-secondary/40 border-t border-border">
            <div className="max-w-3xl mx-auto px-4 sm:px-6">
                <div className="text-center mb-10">
                    <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-3">
                        <span className="w-6 h-0.5 bg-primary inline-block" /> {cmsRender(cms.text_1??" FAQ ")}<span className="w-6 h-0.5 bg-primary inline-block" />
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold text-foreground">{cmsRender(cms.text_2??"Frequently Asked Questions")}</h2>
                    <p className="text-muted-foreground text-sm mt-2">{cmsRender(cms.text_3??"Common questions about our instruments, services, and support.")}</p>
                </div>
                <div className="space-y-3">
                    {faqs?.map((faq, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.3, delay: i * 0.05 }}
                            className="rounded-2xl border border-border bg-card overflow-hidden"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                className="w-full flex items-center justify-between px-5 py-4 text-left gap-4 hover:bg-secondary/50 transition-colors"
                            >
                                <span className="font-medium text-sm text-foreground">{faq.q}</span>
                                <span className="shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                    {openIndex === i ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                                </span>
                            </button>
                            <AnimatePresence initial={false}>
                                {openIndex === i && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.25 }}
                                        className="overflow-hidden"
                                    >
                                        <p className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">{cmsRender(faq.a)}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}