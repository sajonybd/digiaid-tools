"use client";

import React, { useState } from "react";
import { MessageCircle, Phone, X, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSiteSettings } from "@/components/providers/site-settings-provider";

export function FloatingContact() {
  const [isOpen, setIsOpen] = useState(false);
  const siteSettings = useSiteSettings();

  const phoneNumber = siteSettings.supportPhone;
  const whatsappNumber = siteSettings.whatsappNumber;
  const whatsappMessage = encodeURIComponent(
    siteSettings.whatsappMessage || `Hello! I need some support with ${siteSettings.siteName}.`
  );

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 pointer-events-none">
      {/* Contact Options */}
      <div
        className={cn(
          "flex flex-col gap-3 transition-all duration-300 ease-in-out transform origin-bottom",
          isOpen 
            ? "translate-y-0 opacity-100 pointer-events-auto" 
            : "translate-y-4 opacity-0 pointer-events-none"
        )}
      >

        {/* Facebook Button */}
        {siteSettings.facebookChatUrl && (
          <a
            href={siteSettings.facebookChatUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-[#1877F2] text-white px-4 py-3 rounded-full shadow-lg hover:bg-[#165ec9] transition-all hover:scale-105 active:scale-95 group"
            title="Chat on Facebook"
          >
            <span className="text-sm font-medium whitespace-nowrap">Facebook Chat</span>
            <MessageCircle className="w-5 h-5 fill-current" />
          </a>
        )}

        {/* WhatsApp Button */}
        {whatsappNumber && (
          <a
            href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-[#25D366] text-white px-4 py-3 rounded-full shadow-lg hover:bg-[#20ba59] transition-all hover:scale-105 active:scale-95 group"
            title="Chat on WhatsApp"
          >
            <span className="text-sm font-medium whitespace-nowrap">WhatsApp Chat</span>
            <MessageCircle className="w-5 h-5 fill-current" />
          </a>
        )}

        {/* Call Button */}
        {phoneNumber && (
          <a
            href={`tel:${phoneNumber}`}
            className="flex items-center gap-3 bg-blue-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 group"
            title="Call Support"
          >
            <span className="text-sm font-medium whitespace-nowrap">Call: {phoneNumber}</span>
            <Phone className="w-5 h-5 fill-current" />
          </a>
        )}
      </div>

      {/* Main Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "pointer-events-auto w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-90",
          isOpen 
            ? "bg-red-500 rotate-90 text-white" 
            : "bg-primary text-primary-foreground"
        )}
        aria-label="Toggle contact options"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageSquare className="w-6 h-6 animate-pulse" />
        )}
      </button>
    </div>
  );
}
