'use client'
import SafeImage from '@/components/shared/SafeImage';

/* cms:2910 */
import {useCmsBlock,cmsArray,cmsRender} from '@/components/cms/ContentProvider';
import RichContent from '@/components/shared/RichContent';
import FaqSection from '@/components/shared/FaqSection';
import SocialLinks from '@/components/shared/SocialLinks';
import React from 'react';
import { ArrowLeft, Calendar, User, Clock, Home, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';





const blogCategories = [
    { key: 'all', label: 'All Articles' },
    { key: 'quality_control', label: 'Quality Control' },
    { key: 'testing_standards', label: 'Testing Standards' },
    { key: 'manufacturing', label: 'Manufacturing' },
    { key: 'industry_insights', label: 'Industry Insights' },
    { key: 'product_updates', label: 'Product Updates' },
];

const cmsSeed_article_blogCategories=blogCategories;
export default function BlogArticle({ post, blogPosts }) {
  const cms=useCmsBlock("blog-template","article");
  const blogCategories=cmsArray(cmsSeed_article_blogCategories,cms.items_blogCategories);

    const getDate = (timestamp) => {
        const date = new Date(timestamp.seconds * 1000);
        const formattedDate = date.toLocaleDateString("en-US", {
            month: "long",day:"numeric",
            year: "numeric",
        });
        return formattedDate;
    }

    if (!post) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <h2 className="text-2xl font-bold text-foreground">{cmsRender(cms.text_1??"Article not found")}</h2>
                <Link href={cms.href_2??"/blog"} className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <ArrowLeft className="w-4 h-4" /> {cmsRender(cms.text_3??" Back to Blog")}</Link>
            </div>
        );
    }

    const categoryLabel = blogCategories.find(c => c.key === post.category)?.label;
    const relatedPosts = blogPosts.filter(p => p.id !== post.id && p.category === post.category).slice(0, 3);

    return (
        <>
            {/* Hero */}
            <section className="relative bg-[#0a0f1e] pt-24 pb-16 overflow-hidden">
                <div className="absolute inset-0">
                    <SafeImage src={post.imageUrl} alt={post.imageAlt || post.title} className="w-full h-full object-cover opacity-15" />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1e]/90 via-[#0a0f1e]/75 to-blue-950/60" />
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(59,130,246,0.05) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
                </div>
                <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-1.5 mb-6 flex-wrap text-xs text-white/40">
                        <Link href={cms.href_4??"/"} className="hover:text-white/70 flex items-center gap-1 transition-colors"><Home className="w-3 h-3" /> {cmsRender(cms.text_5??" Home")}</Link>
                        <ChevronRight className="w-3 h-3" />
                        <Link href={cms.href_6??"/blog"} className="hover:text-white/70 transition-colors">{cmsRender(cms.text_7??"Blog")}</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-white/70 line-clamp-1">{post.title}</span>
                    </div>
                    <span className="inline-block text-[10px] font-mono uppercase tracking-widest text-blue-400 mb-3 border border-blue-400/30 px-2.5 py-1 rounded-full">
                        {cmsRender(cms.text_8??"Pakmoo Blogs")}</span>
                    <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">{post.title}</h1>
                    <div className="flex flex-wrap items-center gap-4 mt-5 text-xs text-white/40">
                        <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {post.author || "Pakmoo"}</span>
                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {getDate(post.date)}</span>
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {post.readTime || '10 Min'} {cmsRender(cms.text_9??" read")}</span>
                    </div>
                </div>
            </section>

            <div className="max-w-6xl mx-auto px-6"><div className="flex flex-wrap gap-3 mt-5">{post.categoryProfiles?.map(c=><Link className="text-primary text-sm" key={c.key} href={'/blog/category/'+c.slug}>{c.name}</Link>)}</div><SocialLinks share title={post.title}/></div>{/* Article Body */}
            <section className="py-12 sm:py-16">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="flex flex-col lg:flex-row gap-10">
                        {/* Content */}
                        <motion.div
                            initial={false}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="flex-1 min-w-0"
                        >
                            {/* Featured Image */}
                            <figure className="blog-featured-image w-full max-w-full rounded-2xl overflow-hidden border border-border mb-8">
                                <SafeImage src={post.imageUrl} alt={post.imageAlt || post.title} width={1920} height={1080} className="w-full h-auto max-w-full object-contain" />{post.featured_caption&&<figcaption className="text-sm text-muted-foreground p-3">{post.featured_caption}</figcaption>}
                            </figure>

                            {/* Markdown Content */}
                            {/* <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground prose-strong:text-foreground prose-table:text-sm prose-th:text-foreground prose-td:text-muted-foreground prose-blockquote:text-muted-foreground prose-blockquote:border-primary prose-code:text-primary prose-code:bg-secondary prose-code:px-1 prose-code:rounded">
                                <ReactMarkdown>{post.description}</ReactMarkdown>
                            </div> */}

                            <RichContent html={post.description} autoImageSize/>
                            <FaqSection key={post.slug} value={post.faqSection} emitSchema={false} anchorId="post-faqs"/>

                            {/* Back Link */}
                            <div className="mt-10 pt-8 border-t border-border">
                                <Link href={cms.href_10??"/blog"} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group">
                                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                    {cmsRender(cms.text_11??"Back to all articles")}</Link>
                            </div>
                        </motion.div>

                        {/* Sidebar: Related Posts */}
                        {relatedPosts.length > 0 && (
                            <motion.aside
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.15 }}
                                className="lg:w-64 shrink-0"
                            >
                                <div className="sticky top-24">
                                    <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-4 block">{cmsRender(cms.text_12??"Related Articles")}</span>
                                    <div className="space-y-4">
                                        {relatedPosts.map((related, i) => (
                                            <Link
                                                key={i}
                                                href={`/blog/${related.id}`}
                                                className="group block rounded-xl border border-border bg-card hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
                                            >
                                                <SafeImage src={related.imageUrl} alt={related.title} width={1920} height={1080} className="w-full h-auto max-w-full object-contain" />
                                                <div className="p-3">
                                                    <h4 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">{related.title}</h4>
                                                    <span className="text-[10px] text-muted-foreground mt-1 block">{related.readTime || "8 Min "} {cmsRender(cms.text_13??" read")}</span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </motion.aside>
                        )}
                    </div>
                </div>
            </section>
        </>
    );
}
