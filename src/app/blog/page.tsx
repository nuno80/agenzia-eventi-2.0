import { ArrowRight, Calendar, Clock } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import Footer from '@/components/landing/Footer'
import Navbar from '@/components/landing/Navbar'

export const metadata: Metadata = {
  title: 'Blog StarterKit | Guide e Consigli per Sviluppatori',
  description:
    'Guide pratiche, tutorial e best practices per lo sviluppo con Next.js 16. Impara a costruire app moderne e performanti.',
}

// Mock data - in production this would come from a CMS or database
// Following the "server-first" principle, this data would typically come from a data access layer
const blogPosts = [
  {
    slug: 'eventi-ibridi-vs-fisici-guida-pmi-2025',
    title: 'Eventi Ibridi vs Fisici: Guida Completa per PMI 2025',
    excerpt:
      'Scopri quale formato evento genera più ROI per la tua azienda: confronto costi, reach e engagement tra eventi fisici, online e ibridi.',
    category: 'Guide',
    readTime: '8 min',
    publishedAt: '2025-01-15',
    author: 'Team EventiPro',
  },
  {
    slug: 'organizzare-congresso-aziendale-checklist',
    title: 'Come Organizzare un Congresso Aziendale: Checklist in 30 Punti',
    excerpt:
      'La guida definitiva per pianificare congressi aziendali di successo: dalla scelta location al follow-up, zero imprevisti garantiti.',
    category: 'Checklist',
    readTime: '10 min',
    publishedAt: '2025-01-10',
    author: 'Team EventiPro',
  },
  {
    slug: 'formazione-corporate-roi-eventi',
    title: 'Formazione Corporate: Come Calcolare il ROI dei Tuoi Eventi',
    excerpt:
      "Public speaking, portamento e business etiquette: scopri perché integrare la formazione aumenta del 40% l'efficacia dei tuoi eventi.",
    category: 'ROI & Metriche',
    readTime: '7 min',
    publishedAt: '2025-01-05',
    author: 'Team EventiPro',
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Guide per Eventi Corporate di Successo
          </h1>
          <p className="text-xl text-slate-300">
            Strategie, checklist e best practices per organizzare eventi aziendali che generano
            risultati
          </p>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <article
              key={post.slug}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group"
            >
              <div className="aspect-video bg-slate-200 relative overflow-hidden">
                {/* Placeholder for image */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-slate-700 opacity-80" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">Immagine articolo</span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-semibold">
                    {post.category}
                  </span>
                  <div className="flex items-center gap-1 text-slate-500 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{post.readTime}</span>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-amber-600 transition-colors">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>

                <p className="text-slate-600 mb-4 line-clamp-3">{post.excerpt}</p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Calendar className="w-4 h-4" />
                    <time dateTime={post.publishedAt}>
                      {new Date(post.publishedAt).toLocaleDateString('it-IT', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </time>
                  </div>

                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1 text-sm"
                  >
                    Leggi
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  )
}
