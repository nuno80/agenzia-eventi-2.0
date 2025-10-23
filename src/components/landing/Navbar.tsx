"use client";

import React, { useState } from 'react';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenuToggle, NavbarMenu, NavbarMenuItem } from "@heroui/navbar";
import { ArrowRight, Phone } from 'lucide-react';

const CustomNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { name: "Servizi", id: "services" },
    { name: "Processo", id: "process" },
    { name: "Casi Studio", id: "case-studies" },
    { name: "FAQ", id: "faq" },
    { name: "Contatti", id: "contact-form" },
  ];

  const handleScrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <Navbar 
      onMenuOpenChange={setIsMenuOpen}
      maxWidth="xl"
      className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50"
    >
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
        />
        <NavbarBrand>
          <p className="font-bold text-inherit text-slate-900">EventiPro</p>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {menuItems.map((item, index) => (
          <NavbarItem key={index}>
            <button
              onClick={() => handleScrollToSection(item.id)}
              className="text-slate-700 hover:text-amber-600 transition-colors"
            >
              {item.name}
            </button>
          </NavbarItem>
        ))}
      </NavbarContent>
      
      <NavbarContent justify="end">
        <NavbarItem className="hidden lg:flex">
          <button 
            onClick={() => handleScrollToSection('contact-form')}
            className="bg-amber-500 hover:bg-amber-600 text-slate-900 px-4 py-2 rounded-md font-medium transition-colors"
          >
            Preventivo Gratuito
          </button>
        </NavbarItem>
        <NavbarItem>
          <a
            href="tel:+393401234567"
            className="bg-amber-500 hover:bg-amber-600 text-slate-900 p-2 rounded-md transition-colors inline-flex items-center justify-center"
          >
            <Phone size={18} className="block" />
          </a>
        </NavbarItem>
      </NavbarContent>
      
      <NavbarMenu>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`}>
            <button
              onClick={() => handleScrollToSection(item.id)}
              className="w-full text-left py-2 text-slate-700 hover:text-amber-600 transition-colors"
            >
              {item.name}
            </button>
          </NavbarMenuItem>
        ))}
        <NavbarMenuItem>
          <button 
            onClick={() => handleScrollToSection('contact-form')}
            className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-slate-900 px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center"
          >
            Preventivo Gratuito
            <ArrowRight size={16} className="ml-2" />
          </button>
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  );
};

export default CustomNavbar;