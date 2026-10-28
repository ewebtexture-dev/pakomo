import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

/**
 * @typedef {{ label: string; path?: string }} Breadcrumb
 */

/**
 * @typedef {{
 *   title: string;
 *   subtitle?: string;
 *   breadcrumbs?: Breadcrumb[];
 *   image?: string;
 * }} PageHeaderProps
 */

/**
 * @param {PageHeaderProps} props
 */
export default function PageHeader({ title, subtitle, breadcrumbs = [], image }) {
  return (
    <section className="relative bg-[#0a0f1e] py-20 sm:py-24 overflow-hidden">
      {/* Background image */}
      {image && (
        <div className="absolute inset-0">
          <img src={image} alt={title} className="w-full h-full object-cover opacity-20" />
        </div>
      )}
      {/* Default subtle bg */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-blue-600/10" />
      <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(rgba(59,130,246,0.06) 1px, transparent 1px)', backgroundSize: '28px 28px'}} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <div className="flex items-center gap-1.5 mb-4 flex-wrap">
            <Link href="/" className="text-xs text-white/40 hover:text-white/60 transition-colors flex items-center gap-1">
              <Home className="w-3 h-3" /> Home
            </Link>
            {breadcrumbs.map((crumb, i) => (
              <React.Fragment key={i}>
                <ChevronRight className="w-3 h-3 text-white/20" />
                {crumb.path ? (
                  <Link href={crumb.path} className="text-xs text-white/40 hover:text-white/60 transition-colors">{crumb.label}</Link>
                ) : (
                  <span className="text-xs text-white/60">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
        <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">{title}</h1>
        {subtitle && <p className="text-base text-white/50 mt-3 max-w-2xl leading-relaxed">{subtitle}</p>}
      </div>
    </section>
  );
}