// src/app/server-demo/page.tsx
// Demo page showing Server Components in action
'use client'

import React, { useEffect } from 'react'
import ContactFormSection from '@/components/landing/ContactFormSection' // This needs to remain a Client Component
import ContactUsOne from '@/components/landing/contact-us-1' // This needs to remain a Client Component
import HeroSection from '@/components/landing/HeroSection' // Using Client Component for animations
import ServerCaseStudiesSection from '@/components/landing/ServerCaseStudiesSection'
import ServerDifferentiatorsSection from '@/components/landing/ServerDifferentiatorsSection'
import ServerFAQSection from '@/components/landing/ServerFAQSection'
import ServerFooter from '@/components/landing/ServerFooter'
import ServerNavbar from '@/components/landing/ServerNavbar'
import ServerProcessSection from '@/components/landing/ServerProcessSection'
import ServerServicesSection from '@/components/landing/ServerServicesSection'
import ServerStatsSection from '@/components/landing/ServerStatsSection'
import ServerWhatsAppButton from '@/components/landing/ServerWhatsAppButton'

export default function ServerDemoPage() {
  // Handler functions for the hero section buttons
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
  )
}
