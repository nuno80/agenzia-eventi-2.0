import EventManagementLanding from '@/components/EventManagementLanding';

export const metadata = {
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

export default function Home() {
  return (
    <div>
      <div className="p-4 bg-red-500 text-white">Test Tailwind CSS</div>
      <EventManagementLanding />
    </div>
  );
}