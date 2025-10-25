import { ArrowLeft, ArrowRight, Calendar, Clock, Share2, User } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Navbar from '@/components/landing/Navbar'

type Props = {
  params: { slug: string }
}

// Mock data - in production this would come from a CMS or database
// Following the "server-first" principle, this data would typically come from a data access layer
const blogPosts = [
  {
    slug: 'eventi-ibridi-vs-fisici-guida-pmi-2025',
    title: 'Eventi Ibridi vs Fisici: Guida Completa per PMI 2025',
    seoTitle: 'Eventi Ibridi vs Fisici: Quale Scegliere per la Tua PMI? [Guida 2025]',
    metaDescription:
      'Confronto completo tra eventi fisici, online e ibridi: costi, ROI, engagement. Scopri quale formato genera più risultati per la tua azienda con budget 5-15k.',
    keywords: [
      'eventi ibridi',
      'eventi fisici vs online',
      'organizzare eventi aziendali',
      'costi eventi corporate',
      'ROI eventi',
      'eventi PMI Roma',
    ],
    category: 'Guide',
    readTime: '8 min',
    publishedAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
    author: 'Marco Bianchi',
    authorBio: 'Event Manager con 15+ anni di esperienza in eventi ECM e corporate',
    content: `
      <p class="lead">Nel 2025, le PMI hanno tre opzioni per i loro eventi aziendali: fisico, online o ibrido. Ma quale formato genera più ROI con budget 5-15k? In questa guida completa analizziamo costi, vantaggi e casi d'uso reali.</p>
      
      <h2>Cosa Sono gli Eventi Ibridi?</h2>
      <p>Gli eventi ibridi combinano la partecipazione fisica in una location con la trasmissione streaming per partecipanti remoti. Non sono semplicemente "eventi con una webcam", ma esperienze progettate per coinvolgere entrambe le audience.</p>
      
      <h3>Componenti di un Evento Ibrido Professionale</h3>
      <ul>
        <li><strong>Regia multi-camera:</strong> Almeno 2-3 telecamere per inquadrature dinamiche</li>
        <li><strong>Piattaforma interattiva:</strong> Q&A live, poll, chat moderata</li>
        <li><strong>Audio professionale:</strong> Microfoni lavalier, mixer, processori</li>
        <li><strong>Moderazione dedicata:</strong> Team separato per audience online</li>
        <li><strong>Contenuti on-demand:</strong> Registrazioni disponibili post-evento</li>
      </ul>
      
      <h2>Confronto Costi: Fisico vs Online vs Ibrido</h2>
      <p>Analizziamo i costi reali per un evento da 100 partecipanti a Roma, budget tipico PMI:</p>
      
      <table class="w-full border-collapse my-6">
        <thead>
          <tr class="bg-slate-100">
            <th class="border border-slate-200 p-3 text-left">Voce</th>
            <th class="border border-slate-200 p-3 text-left">Fisico</th>
            <th class="border border-slate-200 p-3 text-left">Online</th>
            <th class="border border-slate-200 p-3 text-left">Ibrido</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-slate-200 p-3">Location</td>
            <td class="border border-slate-200 p-3">€3.000</td>
            <td class="border border-slate-200 p-3">€0</td>
            <td class="border border-slate-200 p-3">€2.000</td>
          </tr>
          <tr>
            <td class="border border-slate-200 p-3">Tecnologia AV</td>
            <td class="border border-slate-200 p-3">€1.500</td>
            <td class="border border-slate-200 p-3">€800</td>
            <td class="border border-slate-200 p-3">€2.500</td>
          </tr>
          <tr>
            <td class="border border-slate-200 p-3">Catering</td>
            <td class="border border-slate-200 p-3">€2.500</td>
            <td class="border border-slate-200 p-3">€0</td>
            <td class="border border-slate-200 p-3">€1.500 (50 pax)</td>
          </tr>
          <tr>
            <td class="border border-slate-200 p-3">Personale</td>
            <td class="border border-slate-200 p-3">€1.500</td>
            <td class="border border-slate-200 p-3">€500</td>
            <td class="border border-slate-200 p-3">€2.000</td>
          </tr>
          <tr>
            <td class="border border-slate-200 p-3">Piattaforma streaming</td>
            <td class="border border-slate-200 p-3">€0</td>
            <td class="border border-slate-200 p-3">€600</td>
            <td class="border border-slate-200 p-3">€800</td>
          </tr>
          <tr class="bg-amber-50 font-bold">
            <td class="border border-slate-200 p-3">TOTALE</td>
            <td class="border border-slate-200 p-3">€8.500</td>
            <td class="border border-slate-200 p-3">€1.900</td>
            <td class="border border-slate-200 p-3">€8.800</td>
          </tr>
        </tbody>
      </table>
      
      <h2>ROI e Metriche di Successo</h2>
      <p>Il costo è solo una parte dell'equazione. Ecco come misurare il vero ritorno:</p>
      
      <h3>Metriche Evento Fisico</h3>
      <ul>
        <li>Networking faccia-a-faccia (valore alto per vendite complesse)</li>
        <li>Engagement medio: 85-90%</li>
        <li>Lead qualificati: 60-70% dei partecipanti</li>
        <li>Abbandoni: 5-10%</li>
      </ul>
      
      <h3>Metriche Evento Online</h3>
      <ul>
        <li>Reach 3-5x superiore (barriere geografiche azzerate)</li>
        <li>Engagement medio: 45-60%</li>
        <li>Lead qualificati: 30-40%</li>
        <li>Abbandoni: 35-50%</li>
        <li>Contenuti riutilizzabili (ROI a lungo termine)</li>
      </ul>
      
      <h3>Metriche Evento Ibrido</h3>
      <ul>
        <li>Best of both worlds: networking + reach</li>
        <li>Engagement fisico: 85%, online: 50-65%</li>
        <li>Lead qualificati: 50-60% totale</li>
        <li>Costo per partecipante ridotto del 40%</li>
      </ul>
      
      <h2>Quando Scegliere Quale Formato</h2>
      
      <h3>Scegli FISICO se:</h3>
      <ul>
        <li>Il networking è l'obiettivo primario</li>
        <li>Devi fare demo prodotto hands-on</li>
        <li>Target audience locale (Roma e provincia)</li>
        <li>Budget >€10k disponibile</li>
        <li>Evento premium/esclusivo</li>
      </ul>
      
      <h3>Scegli ONLINE se:</h3>
      <ul>
        <li>Budget limitato (<€3k)</li>
        <li>Target geograficamente disperso</li>
        <li>Contenuto didattico/formativo</li>
        <li>Vuoi contenuti riutilizzabili</li>
        <li>Necessiti di analytics dettagliati</li>
      </ul>
      
      <h3>Scegli IBRIDO se:</h3>
      <ul>
        <li>Vuoi massimizzare reach mantenendo networking</li>
        <li>Budget €8-15k</li>
        <li>Target misto (locale + nazionale)</li>
        <li>Evento annuale flagship</li>
        <li>Necessiti di backup (meteo, emergenze)</li>
      </ul>
      
      <h2>Case Study Reale: Lancio Prodotto Pharma</h2>
      <blockquote class="border-l-4 border-amber-500 bg-amber-50 p-6 my-6">
        <p><strong>Cliente:</strong> PMI farmaceutica, lancio nuovo dispositivo medico<br>
        <strong>Formato:</strong> Ibrido<br>
        <strong>Budget:</strong> €12.000<br>
        <strong>Risultati:</strong></p>
        <ul class="mt-2">
          <li>150 partecipanti in sala (medici, key opinion leaders)</li>
          <li>220 connessi online (farmacisti, distributori)</li>
          <li>Engagement medio 78%</li>
          <li>180 lead qualificati generati</li>
          <li>ROI: 4.2x (calcolato su vendite primo trimestre)</li>
        </ul>
      </blockquote>
      
      <h2>Tecnologie Consigliate per Eventi Ibridi</h2>
      
      <h3>Piattaforme Professionali</h3>
      <ul>
        <li><strong>Hopin:</strong> Ottima per networking virtuale, €600-1.200/evento</li>
        <li><strong>Airmeet:</strong> Interfaccia intuitiva, €400-800/evento</li>
        <li><strong>Zoom Webinar:</strong> Fino a 1.000 partecipanti, €800/anno</li>
        <li><strong>Microsoft Teams Live:</strong> Integrato Office 365, gratis-€200</li>
      </ul>
      
      <h3>Setup Tecnico Minimo</h3>
      <ul>
        <li>2 telecamere PTZ (motorizzate)</li>
        <li>Mixer video ATEM Mini Pro (€500)</li>
        <li>Sistema audio wireless professionale</li>
        <li>Computer dedicato streaming (no laptop relatori!)</li>
        <li>Connessione 50+ Mbps upload garantiti</li>
      </ul>
      
      <h2>Errori da Evitare</h2>
      
      <h3>1. Sottovalutare la Complessità Tecnica</h3>
      <p>Un evento ibrido NON è "mettere una webcam in sala". Serve:</p>
      <ul>
        <li>Regia dedicata per audience online</li>
        <li>Moderatore separato per chat/Q&A digitale</li>
        <li>Test tecnici 48h prima</li>
        <li>Backup connectivity (4G/5G)</li>
      </ul>
      
      <h3>2. Ignorare l'Audience Online</h3>
      <p>Partecipanti remoti si sentono "cittadini di serie B":</p>
      <ul>
        <li>❌ Non fanno domande (troppo difficile)</li>
        <li>❌ Non vedono slide/demo (inquadrature sbagliate)</li>
        <li>❌ Audio incomprensibile</li>
      </ul>
      <p><strong>Soluzione:</strong> Progetta l'evento per ENTRAMBE le audience.</p>
      
      <h3>3. Non Misurare i Risultati</h3>
      <p>Metriche essenziali da tracciare:</p>
      <ul>
        <li>Tempo medio visualizzazione</li>
        <li>Interazioni (domande, poll, chat)</li>
        <li>Download materiali</li>
        <li>Lead generati</li>
        <li>Follow-up conversions</li>
      </ul>
      
      <h2>Checklist Evento Ibrido [Scaricabile]</h2>
      <div class="bg-gradient-to-r from-amber-50 to-amber-100 border-l-4 border-amber-500 p-6 my-6">
        <h4 class="font-bold text-lg mb-3">6 Settimane Prima</h4>
        <ul class="list-disc pl-5 space-y-1">
          <li>Definisci obiettivi e KPI</li>
          <li>Scegli piattaforma streaming</li>
          <li>Prenota location ibrido-ready</li>
          <li>Ingaggia partner tecnico</li>
        </ul>
        
        <h4 class="font-bold text-lg mt-4 mb-3">4 Settimane Prima</h4>
        <ul class="list-disc pl-5 space-y-1">
          <li>Crea landing page registrazioni</li>
          <li>Configura piattaforma (branding, sessioni)</li>
          <li>Brief a speaker su formato ibrido</li>
          <li>Pianifica contenuti pre-evento</li>
        </ul>
        
        <h4 class="font-bold text-lg mt-4 mb-3">1 Settimana Prima</h4>
        <ul class="list-disc pl-5 space-y-1">
          <li>Test tecnico completo</li>
          <li>Prova generale con speaker</li>
          <li>Backup plan definito</li>
          <li>Team briefing finale</li>
        </ul>
        
        <h4 class="font-bold text-lg mt-4 mb-3">Giorno Dell'Evento</h4>
        <ul class="list-disc pl-5 space-y-1">
          <li>Setup 3 ore prima</li>
          <li>Test connettività</li>
          <li>Apertura piattaforma 30min prima</li>
          <li>Monitoraggio real-time metrics</li>
        </ul>
      </div>
      
      <h2>Conclusioni: Quale Formato per la Tua PMI?</h2>
      <p>Non esiste una risposta universale. La scelta dipende da:</p>
      <ul>
        <li><strong>Obiettivo:</strong> Lead generation? Networking? Formazione?</li>
        <li><strong>Budget:</strong> Fisico €8-15k, Online €2-4k, Ibrido €8-12k</li>
        <li><strong>Target:</strong> Locale, nazionale, internazionale?</li>
        <li><strong>Contenuto:</strong> Necessita interazione fisica?</li>
      </ul>
      
      <div class="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-lg my-8 text-center">
        <p class="text-lg">
          <strong>Hai bisogno di aiuto per scegliere il formato giusto?</strong><br>
          Offriamo consulenze gratuite per PMI romane. <a href="/contatti" class="text-amber-400 hover:text-amber-300 underline">Prenota una call strategica →</a>
        </p>
      </div>
      
      <h2>Domande Frequenti</h2>
      
      <h3>Quanto costa realmente un evento ibrido professionale?</h3>
      <p>Per 100 partecipanti (50 fisici + 50 online) a Roma: €8.000-12.000 all-inclusive. Include location, tecnologia, streaming, personale e piattaforma.</p>
      
      <h3>Posso fare un evento ibrido con budget ridotto?</h3>
      <p>Sì, con compromessi: location più piccola (30 pax fisici), streaming base (1 camera fissa), piattaforma gratuita (Zoom). Budget minimo: €3.500-4.000.</p>
      
      <h3>Gli eventi ibridi funzionano per formazione aziendale?</h3>
      <p>Assolutamente. Sono ideali per: onboarding, training tecnici, workshop soft skills. Permetti ai remoti di partecipare senza costi trasferta.</p>
      
      <h3>Quanto preavviso serve per organizzare un ibrido?</h3>
      <p>Minimo 6-8 settimane per risultati professionali. Con 4 settimane si può fare ma con meno personalizzazione.</p>
    `,
  },
  // Additional posts would be added here
]

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = blogPosts.find((post) => post.slug === params.slug)

  if (!post) {
    return {
      title: 'Articolo non trovato',
    }
  }

  return {
    title: `${post.seoTitle} | EventiPro Roma Blog`,
    description: post.metaDescription,
    keywords: post.keywords.join(', '),
  }
}

export default function BlogPostPage({ params }: Props) {
  const post = blogPosts.find((post) => post.slug === params.slug)

  if (!post) {
    notFound()
  }

  return (
    <article className="min-h-screen bg-white">
      <Navbar />
      {/* Hero Article */}
      <header className="bg-slate-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Torna al Blog
          </Link>

          <div className="mb-6">
            <span className="bg-amber-500 text-slate-900 px-3 py-1 rounded-full text-sm font-semibold">
              {post.category}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">{post.title}</h1>

          <div className="flex flex-wrap items-center gap-6 text-slate-300">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <time dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString('it-IT', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </time>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>{post.readTime} di lettura</span>
            </div>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div
          className="prose prose-lg prose-slate max-w-none
            prose-headings:font-bold prose-headings:text-slate-900
            prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
            prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
            prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-6
            prose-a:text-amber-600 prose-a:no-underline hover:prose-a:text-amber-700
            prose-strong:text-slate-900 prose-strong:font-semibold
            prose-ul:my-6 prose-li:my-2
            prose-blockquote:border-l-4 prose-blockquote:border-amber-500 prose-blockquote:bg-amber-50 prose-blockquote:p-6
            prose-table:border-collapse prose-table:w-full
            prose-th:bg-slate-100 prose-th:p-3 prose-th:text-left
            prose-td:border prose-td:border-slate-200 prose-td:p-3"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Author Bio */}
        <div className="mt-12 p-6 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {post.author[0]}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">{post.author}</h3>
              <p className="text-slate-600">{post.authorBio}</p>
            </div>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="mt-8 flex items-center gap-4 pt-8 border-t border-slate-200">
          <span className="font-semibold text-slate-700">Condividi:</span>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Share2 className="w-4 h-4" />
            LinkedIn
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Share2 className="w-4 h-4" />
            WhatsApp
          </button>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Hai Bisogno di Aiuto per il Tuo Evento?</h2>
          <p className="text-xl text-slate-300 mb-8">
            Offriamo consulenze gratuite per PMI romane. Parliamo del tuo progetto.
          </p>
          <Link
            href="/contatti"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-900 px-8 py-4 rounded-lg font-semibold transition-all"
          >
            Richiedi Consulenza Gratuita
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </article>
  )
}
