'use client';

import React from 'react';
import PageHeader from '@/components/shared/PageHeader';
import { Calendar, ArrowRight, User } from 'lucide-react';
import { motion } from 'framer-motion';
import blog_1 from '@assets/Unsplash/blog-1.jpg';


import Link from 'next/link';

export default function BlogListing({ blogsData }) {
  const getDate = (timestamp) => {
    const date = new Date(timestamp.seconds * 1000);
    const formattedDate = date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    return formattedDate;
  }

  return (
    <>
      <PageHeader
        title="Blog & Insights"
        subtitle="Industry insights, testing standards guides, and product updates from our experts."
        breadcrumbs={[{ label: 'Blog' }]}
        image={blog_1?.src}
      />

      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* <div className="lg:w-60 shrink-0">
              <div className="sticky top-24 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search articles..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-9 text-sm"
                  />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2 block">Categories</span>
                  {blogCategories.map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => setActiveCategory(cat.key)}
                      className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors ${
                        activeCategory === cat.key ? 'bg-primary text-primary-foreground rounded-lg' : 'text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div> */}

            <div className="flex-1">
              <p className="text-xs text-muted-foreground font-mono">{blogsData.length} articles found</p>
              <div className="space-y-4">
                {blogsData.map((post, i) => (
                  <Link href={`/blog/${post.id}`} key={i} className="block">
                    <motion.article
                      key={i}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.03 }}
                      className="group flex flex-col sm:flex-row gap-5 p-5 rounded-2xl border border-border bg-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
                    >
                      <div className="sm:w-52 shrink-0 aspect-[4/3] sm:aspect-auto sm:h-full bg-secondary overflow-hidden rounded-xl">
                        <img src={post.imageUrl} alt={post.imageAlt || post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {getDate(post.date)}
                          </span>
                        </div>
                        <h3 className="font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-2">{post.shortDescription}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <User className="w-3 h-3" /> {post.author || 'Pakmoo'} · {post.readTime || '10 Min'} read
                          </span>
                          <span className="text-xs font-medium text-primary flex items-center gap-1">
                            Read More <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </motion.article>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
