"use client";

import React from 'react';
import HeroSection from './landing/HeroSection';
import DifferentiatorsSection from './landing/DifferentiatorsSection';
import ServicesSection from './landing/ServicesSection';
import ProcessSection from './landing/ProcessSection';
import CaseStudiesSection from './landing/CaseStudiesSection';
import StatsSection from './landing/StatsSection';
import FAQSection from './landing/FAQSection';
import ContactFormSection from './landing/ContactFormSection';
import Footer from './landing/Footer';
import WhatsAppButton from './landing/WhatsAppButton';
import ContactUs1 from './mvpblocks/contact-us-1';

const EventManagementLanding = () => {
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
      <HeroSection onContactClick={handleContactClick} onServicesClick={handleServicesClick} />
      <DifferentiatorsSection />
      <ServicesSection />
      <ProcessSection />
      <CaseStudiesSection />
      <StatsSection />
      <FAQSection />
      <ContactFormSection />
      <ContactUs1 />
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default EventManagementLanding;