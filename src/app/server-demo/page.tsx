// src/app/server-demo/page.tsx
// Demo page showing Server Components in action
"use client";

import React, { useEffect } from 'react';
import ServerNavbar from '@/components/landing/ServerNavbar';
import HeroSection from '@/components/landing/HeroSection'; // Using Client Component for animations
import ServerDifferentiatorsSection from '@/components/landing/ServerDifferentiatorsSection';
import ServerServicesSection from '@/components/landing/ServerServicesSection';
import ServerProcessSection from '@/components/landing/ServerProcessSection';
import ServerCaseStudiesSection from '@/components/landing/ServerCaseStudiesSection';
import ServerStatsSection from '@/components/landing/ServerStatsSection';
import ServerFAQSection from '@/components/landing/ServerFAQSection';
import ContactFormSection from '@/components/landing/ContactFormSection'; // This needs to remain a Client Component
import ContactUsOne from '@/components/mvpblocks/contact-us-1'; // This needs to remain a Client Component
import ServerFooter from '@/components/landing/ServerFooter';
import ServerWhatsAppButton from '@/components/landing/ServerWhatsAppButton';

export default function ServerDemoPage() {
  // Handler functions for the hero section buttons
  const handleContactClick = () => {
    const element = document.getElementById('contact-form');
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  const handleServicesClick = () => {
    const element = document.getElementById('services');
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <ServerNavbar />
      <HeroSection onContactClick={handleContactClick} onServicesClick={handleServicesClick} />
      <ServerDifferentiatorsSection />
      <ServerServicesSection />
      <ServerProcessSection />
      <ServerCaseStudiesSection />
      <ServerStatsSection />
      <ServerFAQSection />
      <ContactFormSection />
      <ContactUsOne />
      <ServerFooter />
      <ServerWhatsAppButton />
    </div>
  );
}