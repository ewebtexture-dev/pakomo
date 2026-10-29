import GallerySection from '@/components/gallery/GallerySection';
import React from 'react';
import HeroSection from '@/components/home/HeroSection';
import StatsSection from '@/components/home/StatsSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import WhyChooseSection from '@/components/home/WhyChooseSection';
import StandardsSection from '@/components/home/StandardsSection';
import ServicesPreview from '@/components/home/ServicesPreview';
import ClientsPreview from '@/components/home/ClientsPreview';
import CTABanner from '@/components/home/CTABanner';
import BlogPreview from '@/components/home/BlogPreview';

export default function Page() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <FeaturedProducts />
      <WhyChooseSection />
      <StandardsSection />
      <ServicesPreview />
      {/* <ApplicationsPreview /> */}
      <ClientsPreview />
      <CTABanner />
      <GallerySection /><BlogPreview />
    </>
  );
}
