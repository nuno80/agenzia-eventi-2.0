'use client'

import CaseStudiesSection from './landing/CaseStudiesSection'
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
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <HeroSection />
      <DifferentiatorsSection />
      <ServicesSection />
      <ProcessSection />
      <CaseStudiesSection />
      <StatsSection />
      <FAQSection />
      {/* <ContactFormSection /> */}
      <ContactUs1 />
      <Footer />
      <WhatsAppButton />
    </div>
  )
}

export default EventManagementLanding
