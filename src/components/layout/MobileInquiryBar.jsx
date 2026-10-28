import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';

export default function MobileInquiryBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-foreground border-t border-white/10 safe-area-bottom">
      <div className="flex">
        <a
          href="tel:+918595362719"
          className="flex-1 flex items-center justify-center gap-2 py-3 text-white text-sm font-medium active:bg-white/10 transition-colors"
        >
          <Phone className="w-4 h-4" />
          Call Now
        </a>
        <div className="w-px bg-white/10" />
        <a
          href="https://wa.me/918595362719?text=Hi%2C%20I%20need%20information%20about%20testing%20instruments"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 py-3 text-green-400 text-sm font-medium active:bg-white/10 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </a>
      </div>
    </div>
  );
}