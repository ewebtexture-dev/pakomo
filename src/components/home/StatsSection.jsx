'use client';

/* cms:2910 */
import {useCmsBlock,cmsArray} from '@/components/cms/ContentProvider';
import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const stats = [
  { value: 100, suffix: '%', label: 'Client Satisfaction', desc: 'Trusted by industry leaders', icon: '🏆' },
  { value: 445, suffix: '+', label: 'Industries Served', desc: 'Across the globe', icon: '🏭' },
  { value: 525, suffix: '+', label: 'Applications', desc: 'Diverse testing solutions', icon: '⚙️' },
  { value: 200, suffix: '+', label: 'Products', desc: 'Precision instruments', icon: '🔬' },
];

function AnimatedCounter({ value, suffix, inView }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const increment = value / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) { setCount(value); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, value]);

  return <span className="font-bold text-4xl sm:text-5xl text-foreground tabular-nums">{count}{suffix}</span>;
}

const cmsSeed_counters_stats=stats;
export default function StatsSection() {
  const cms=useCmsBlock("home","counters");
  const stats=cmsArray(cmsSeed_counters_stats,cms.items_stats);

  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-14 sm:py-12 bg-secondary/50 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <span className="text-3xl mb-2 block">{stat.icon}</span>
              <AnimatedCounter value={stat.value} suffix={stat.suffix} inView={inView} />
              <p className="font-semibold text-foreground text-sm mt-2">{stat.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}