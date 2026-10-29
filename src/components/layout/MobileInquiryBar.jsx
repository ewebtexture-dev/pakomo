'use client';

/* cms:2910 */
import {useSiteSettings,useCmsBlock,cmsRender} from '@/components/cms/ContentProvider';
import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';

export default function MobileInquiryBar() {
  const cms=useCmsBlock("global","mobile");
  const contact=useSiteSettings("contact");
  

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-foreground border-t border-white/10 safe-area-bottom">
      <div className="flex">
        <a
          href={"tel:"+(contact.phones?.[0]?.number||"+918595362719")}
          className="flex-1 flex items-center justify-center gap-2 py-3 text-white text-sm font-medium active:bg-white/10 transition-colors"
        >
          <Phone className="w-4 h-4" />
          {cmsRender(cms.text_2??"Call Now")}</a>
        <div className="w-px bg-white/10" />
        <a
          href={"https://wa.me/"+(contact.whatsapp||"918595362719")+"?text="+encodeURIComponent(contact.whatsappMessage||"Hi, I need information about testing instruments")}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 py-3 text-green-400 text-sm font-medium active:bg-white/10 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          {cmsRender(cms.text_4??"WhatsApp")}</a>
      </div>
    </div>
  );
}