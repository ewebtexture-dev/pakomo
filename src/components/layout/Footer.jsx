import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Facebook, Instagram } from 'lucide-react';
import Logo from '@assets/Logo.jpeg';

const quickLinks = [
  { label: 'About Us', path: '/about' },
  { label: 'Products', path: '/products' },
  { label: 'Services', path: '/services' },
  { label: 'Applications', path: '/applications' },
  { label: 'Contact Us', path: '/contact' },
  { label: 'Manage Organization', path: '/admin' },
];

const productLinks = [
  { label: 'Packaging Testing', path: '/products' },
  { label: 'Material Testing', path: '/products' },
  { label: 'Lab Testing', path: '/products' },
  { label: 'Quality Testing', path: '/products' },
  { label: 'Environmental Testing', path: '/products' },
];

const standards = ['ASTM', 'ISO', 'BIS', 'TAPPI', 'DIN', 'IEC', 'JIS', 'GEM'];

export default function Footer() {
  return (
    <footer className="bg-foreground text-white/80">
      {/* Standards Bar */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[11px] font-mono uppercase tracking-widest text-white/40 mr-4">
              Global Standards Compliance
            </span>
            {standards.map((s) => (
              <span key={s} className="px-3 py-1 text-[11px] font-mono font-semibold border border-white/10 text-white/50">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-12 h-11 bg-gradient-to-br from-primary to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary/40">
                <img
                  src={Logo?.src}
                  alt="Pakmoo"
                  height={100}
                  width={200}
                />
              </div>
              {/* <div className="w-8 h-8 bg-primary flex items-center justify-center">
                <span className="text-white font-mono font-bold text-sm">P</span>
              </div> */}
              <div>
                <span className="font-bold text-white text-sm">PAKMOO</span>
                <span className="block text-[10px] text-white/40 tracking-widest uppercase">Testing Instruments</span>
              </div>
            </div>
            <p className="text-sm text-white/50 leading-relaxed mb-6 max-w-sm">
              Elevate Your Product Standards
              With Our Premium Lab Testing Instruments &
              Equipments
            </p>
            <div className="space-y-2.5">
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <span className="text-white/50">Plot No. 574, Aasharam Marg, Siddiq Nagar, Sihani Road, Ghaziabad 201001</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <a className="text-white/50" href="tel:+918595362719">8595362719</a>
                <a className="text-white/50" href="tel:+918586962719">8586962719</a>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <a className="text-white/50" href="mailto:info@pakmoo.in">info@pakmoo.in</a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-white/40 mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link href={link.path} className="text-sm text-white/50 hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-white/40 mb-4">Products</h4>
            <ul className="space-y-2.5">
              {productLinks.map((link, i) => (
                <li key={i}>
                  <Link href={link.path} className="text-sm text-white/50 hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-white/40 mb-4">Stay Updated</h4>
            <p className="text-sm text-white/40 mb-4">Get the latest updates on testing standards and new products.</p>
            {/* <div className="flex gap-2">
              <Input
                placeholder="Email address"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-sm h-9"
              />
              <Button size="sm" className="bg-primary hover:bg-primary/90 h-9 px-3 shrink-0">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div> */}
            <div className="flex items-center gap-3 mt-6">
              <a href="https://www.facebook.com/share/1DmcSx8XwQ/" target='/blank' className="w-8 h-8 flex items-center justify-center border border-white/10 text-white/40 hover:text-primary hover:border-primary/30 transition-colors">
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a href="https://www.instagram.com/pakmootesting?igsh=dnl6dTNkbnQ2cTYw" target='/blank' className="w-8 h-8 flex items-center justify-center border border-white/10 text-white/40 hover:text-primary hover:border-primary/30 transition-colors">
                <Instagram className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} Pakmoo Testing Instruments All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-white/30">
            <a href="#" className="hover:text-white/50 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white/50 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}