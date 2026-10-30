'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useQuote } from '@/lib/QuoteContext';
import Navbar from './Navbar';
import RouteFaqSection from '@/components/shared/RouteFaqSection';
import ImageSafety from '@/components/shared/ImageSafety';
import Footer from './Footer';
import QuoteModal from './QuoteModal';
import WhatsAppButton from './WhatsAppButton';
import MobileInquiryBar from './MobileInquiryBar';

export default function SiteLayout({ children }) {
  const pathname = usePathname();
  const { isQuoteOpen, openQuote, closeQuote } = useQuote();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  if (/^\/(admin|login)(\/|$)/.test(pathname)) return <>{children}</>;

  return (
    <div className="min-h-screen flex flex-col">
      <ImageSafety/><Navbar onRequestQuote={openQuote} />
      <main className="flex-1 pt-16 lg:pt-18 pb-14 lg:pb-0">
        {children}
      <RouteFaqSection/></main>
      <Footer />
      <QuoteModal
        open={isQuoteOpen}
        onOpenChange={(open) => {
          if (open) {
            openQuote();
          } else {
            closeQuote();
          }
        }}
      />
      <WhatsAppButton />
      <MobileInquiryBar />
    </div>
  );
}
