'use client';

/* cms:2910 */
import {useSiteSettings,useCmsBlock} from '@/components/cms/ContentProvider';
import React from 'react';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
  const cms=useCmsBlock("global","whatsapp");
  const contact=useSiteSettings("contact");
  

  return (
    <a
      href={"https://wa.me/"+(contact.whatsapp||"918595362719")+"?text="+encodeURIComponent(contact.whatsappMessage||"Hi, I need information about testing instruments")}
      target="_blank"
      rel="noopener noreferrer"
      className="hidden lg:flex fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105"
      aria-label={cms.aria_label_2??"Chat on WhatsApp"}
    >
      <MessageCircle className="w-6 h-6" />
    </a>
  );
}