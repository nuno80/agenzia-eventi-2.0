'use client'

import React from 'react'
import CaseStudiesSection from './landing/CaseStudiesSection'
import ContactFormSection from './landing/ContactFormSection'
import ContactUs1 from './landing/contact-us-1'
import DifferentiatorsSection from './landing/DifferentiatorsSection'
import FAQSection from './landing/FAQSection'
import Footer from './landing/Footer'
import HeroSection from './landing/HeroSection'
import Navbar from './landing/Navbar'
import ProcessSection from './landing/ProcessSection'
import ServicesSection from './landing/ServicesSection'
import StatsSection from './landing/StatsSection'
import WhatsAppButton from './landing/WhatsAppButton'

const EventManagementLanding = () => {
  const handleContactClick = () => {
    const element = document.getElementById('contact-form')
    if (element) element.scrollIntoView({ behavior: 'smooth' })
  }

  const handleServicesClick = () => {
    const element = document.getElementById('services')
    if (element) element.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
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
  )
}

export default EventManagementLanding
