import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Organizzazione Eventi Aziendali Roma | EventiPro - Event Management Professionale',
  description: 'Organizzazione eventi corporate a Roma: congressi, formazione, hostess ed eventi online. Esperienza in eventi complessi ECM. Preventivo gratuito per PMI.',
  keywords: 'organizzazione eventi roma, eventi aziendali roma, congressi roma, eventi ibridi, formazione corporate',
  openGraph: {
    title: 'EventiPro Roma - Eventi Corporate che Generano Risultati',
    description: 'Congressi, formazione aziendale ed eventi ibridi per PMI a Roma',
    type: 'website',
    locale: 'it_IT',
    url: 'https://tuosito.it',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "EventiPro Roma",
              "description": "Agenzia organizzazione eventi corporate a Roma",
              "image": "https://tuosito.it/logo.png",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Roma",
                "addressRegion": "Lazio",
                "addressCountry": "IT"
              },
              "telephone": "+393401234567",
              "email": "info@eventipro-roma.it",
              "priceRange": "€€",
              "areaServed": "Roma",
              "serviceType": ["Event Management", "Congressi", "Formazione Corporate", "Eventi Online"]
            })
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}