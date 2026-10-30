'use client';
import SafeImage from '@/components/shared/SafeImage';


/* cms:2910 */
import {useCmsBlock,cmsRender} from '@/components/cms/ContentProvider';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';



export default function BlogPreview() {
  const cms=useCmsBlock("home","blog");
  

  const [blogPosts, setBlogs] = useState([])
  const fetchBlogs = async () => {
    try {
      const response = await fetch('/api/blog/posts', {cache:'no-store'});
      if(!response.ok) throw new Error('Unable to load blog articles.');
      const { posts: data } = await response.json();
      setBlogs(data);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    fetchBlogs();
  }, []);

  const getDate = (timestamp) => {
    const date = new Date(timestamp.seconds * 1000);
    const formattedDate = date.toLocaleDateString("en-US", {
      month: "long",day:"numeric",
      year: "numeric",
    });
    return formattedDate;
  }
  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <span className="section-label">{cmsRender(cms.text_1??"Latest Insights")}</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-1">{cmsRender(cms.text_2??"From Our Blog")}</h2>
            <p className="text-muted-foreground mt-2 text-sm max-w-md">{cmsRender(cms.text_3??"Stay updated with testing standards, industry insights and product news.")}</p>
          </div>
          <Link href={cms.href_4??"/blog"} className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all">
            {cmsRender(cms.text_5??"All Articles ")}<ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Link href={`/blog/${post.id}`} className="group block rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="relative overflow-hidden aspect-[16/9]">
                  <SafeImage
                    src={post.imageUrl}
                    alt={post.title}
                    width={1920} height={1080} className="w-full h-auto max-w-full object-contain"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 text-[11px] font-bold rounded-full ${post.color}`}>
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-4 text-[11px] text-muted-foreground mb-3">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {getDate(post.date)}</span>
                    {/* <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime} read</span> */}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">{post.categoryProfiles?.map(c=><span key={c.key} className="text-xs text-primary">{c.name}</span>)}</div><h3 className="font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center gap-1 mt-4 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                    {cmsRender(cms.text_6??"Read more ")}<ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
