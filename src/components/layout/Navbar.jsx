'use client';
import SafeImage from '@/components/shared/SafeImage';


/* cms:2910 */
import MenuBranch from '@/components/cms/MenuBranch';
import {useCmsBlock,cmsArray,cmsRender} from '@/components/cms/ContentProvider';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '@assets/Logo.jpeg';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'About Us', path: '/about' },
  { label: 'Products', path: '/products' },
  { label: 'Applications', path: '/applications' },
  { label: 'Services', path: '/services' },
  { label: 'Standards', path: '/testing-standards' },
  { label: 'Clients', path: '/clients' },
  { label: 'Why Us', path: '/why-choose-us' },
  { label: 'Blog', path: '/blog' },
  { label: 'Contact', path: '/contact' },
];

const cmsSeed_header_navLinks=navLinks;
export default function Navbar({ onRequestQuote }) {
  const cms=useCmsBlock("global","header");
  const navLinks=cmsArray(cmsSeed_header_navLinks,cms.items_navLinks);

  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${'bg-white backdrop-blur-xl shadow-xl shadow-black/8 border-b border-border'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 lg:h-[72px]">
          {/* Logo */}
          <Link href={cms.href_1??"/"} className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary/40">
              <SafeImage
                src={cms.image_2??(Logo?.src)}
                alt={cms.alt_3??"Pakmoo team"}
                height={100}
                width={100}
              />
            </div>
            {/* <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary/40">
              <span className="text-white font-extrabold text-lg tracking-tight">P</span>
            </div> */}
            <div className="hidden sm:block">
              <span className="font-extrabold text-lg tracking-tight" style={{ color: 'hsl(var(--foreground))' }}>{cmsRender(cms.text_4??"PAKMOO")}</span>
              <span className="block text-[9px] tracking-[0.2em] uppercase font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>{cmsRender(cms.text_5??"Testing Instruments")}</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden xl:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <MenuBranch key={link.path} item={link}><Link
                key={link.path}
                href={link.path}
                className={`px-3 py-2 text-[13px] font-medium transition-colors relative ${pathname === link.path
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
               target={link.newTab?"_blank":undefined} rel={link.newTab?"noopener noreferrer":undefined}>
                {link.label}
                {link.path === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.path) && (
                    <motion.div
                      layoutId="nav-indicator"
                      className={`absolute bottom-0 left-3 right-3 h-0.5 ${'bg-primary'}`}
                    />
                  )}
              </Link></MenuBranch>
            ))}
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Button
              onClick={cms.button_link_1?()=>window.location.assign(cms.button_link_1):onRequestQuote}
              className={`hidden sm:flex items-center gap-2 text-xs font-semibold px-5 h-9 transition-all ${'bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/25'
                }`}
            >
              <FileText className="w-3.5 h-3.5" />
              {cmsRender(cms.text_6??"Request a Quote")}</Button>
            <button
              className={`xl:hidden p-2 ${'text-foreground'}`}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="xl:hidden bg-white border-t border-border overflow-hidden"
          >
            <nav className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <MenuBranch key={link.path} item={link}><Link
                  key={link.path}
                  href={link.path}
                  className={`block px-4 py-2.5 text-sm font-medium transition-colors ${pathname === link.path
                    ? 'text-primary bg-primary/5'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                 target={link.newTab?"_blank":undefined} rel={link.newTab?"noopener noreferrer":undefined}>
                  {link.label}
                </Link></MenuBranch>
              ))}
              <div className="pt-3 px-4">
                <Button
                  onClick={() => { onRequestQuote(); setMobileOpen(false); }}
                  className="w-full bg-primary text-primary-foreground text-sm"
                >
                  {cmsRender(cms.text_7??"Request a Quote")}</Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}