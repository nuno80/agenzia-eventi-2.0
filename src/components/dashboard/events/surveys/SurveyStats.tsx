/**
 * FILE: src/components/dashboard/events/surveys/SurveyStats.tsx
 *
 * VERSION: 1.0
 *
 * COMPONENT: SurveyStats
 * TYPE: Client Component
 *
 * PROPS:
 * - stats: SurveyStatsDTO - Aggregated survey statistics
 * - questionsStats: QuestionStatsDTO[] - Statistics for each question
 *
 * FEATURES:
 * - Overview cards (Responses, Completion Rate, etc.)
 * - Charts for multiple choice/rating questions (Recharts)
 * - Text response lists
 * - Export functionality
 */

'use client'

import { Download } from 'lucide-react'
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import * as XLSX from 'xlsx'
import type { QuestionStatsDTO, SurveyStatsDTO } from '@/lib/dal/surveys'

interface SurveyStatsProps {
  stats: SurveyStatsDTO
  questionsStats: QuestionStatsDTO[]
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1']

export function SurveyStats({ stats, questionsStats }: SurveyStatsProps) {
  const handleExport = () => {
    // Prepare data for Excel
    const wb = XLSX.utils.book_new()

    // Sheet 1: Overview
    const overviewData = [
      ['Titolo', stats.title],
      ['Stato', stats.status],
      ['Totale Risposte', stats.totalResponses],
      ['Risposte Complete', stats.completeResponses],
      ['Tasso Completamento', `${stats.completionRate.toFixed(1)}%`],
      ['Tasso Risposta', `${stats.responseRate.toFixed(1)}%`],
    ]
    const wsOverview = XLSX.utils.aoa_to_sheet(overviewData)
    XLSX.utils.book_append_sheet(wb, wsOverview, 'Overview')

    // Sheet 2: Questions Stats
    // This is a simplified export. Ideally we'd export raw responses too.
    const questionsData = questionsStats.map((q) => ({
      Domanda: q.question,
      Tipo: q.type,
      Risposte: q.totalAnswers,
      Media: (q as any).average || '-',
    }))
    const wsQuestions = XLSX.utils.json_to_sheet(questionsData)
    XLSX.utils.book_append_sheet(wb, wsQuestions, 'Statistiche Domande')

    XLSX.writeFile(wb, `Sondaggio_${stats.title.replace(/\s+/g, '_')}_Stats.xlsx`)
  }

  return (
    <div className="space-y-8">
      {/* Header & Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Analisi Risultati</h2>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          Esporta Excel
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Totale Risposte"
          value={stats.totalResponses}
          subtext={`${stats.identifiedResponses} identificati, ${stats.anonymousResponses} anonimi`}
        />
        <StatCard
          label="Tasso Completamento"
          value={`${stats.completionRate.toFixed(0)}%`}
          subtext={`${stats.completeResponses} completati su ${stats.totalResponses}`}
        />
        <StatCard
          label="Tasso di Risposta"
          value={`${stats.responseRate.toFixed(0)}%`}
          subtext={`Su ${stats.totalParticipants} partecipanti totali`}
        />
        <StatCard label="Domande" value={stats.totalQuestions} subtext="Numero totale di domande" />
      </div>

      {/* Questions Analysis */}
      <div className="space-y-6">
        {questionsStats.map((qStats, index) => (
          <div
            key={qStats.questionId}
            className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm"
          >
            <div className="mb-4">
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                Domanda {index + 1} • {formatType(qStats.type)}
              </span>
              <h3 className="text-lg font-semibold text-gray-900 mt-1">{qStats.question}</h3>
              <p className="text-sm text-gray-600 mt-1">{qStats.totalAnswers} risposte</p>
            </div>

            <div className="mt-6">{renderChart(qStats)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  subtext,
}: {
  label: string
  value: string | number
  subtext: string
}) {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{subtext}</p>
    </div>
  )
}

function formatType(type: string) {
  switch (type) {
    case 'multiple_choice':
      return 'Scelta Multipla'
    case 'checkboxes':
      return 'Caselle di Controllo'
    case 'text':
      return 'Testo Breve'
    case 'textarea':
      return 'Testo Lungo'
    case 'rating':
      return 'Valutazione'
    case 'scale':
      return 'Scala'
    default:
      return type
  }
}

function renderChart(stats: QuestionStatsDTO) {
  if (stats.totalAnswers === 0) {
    return <p className="text-gray-500 italic text-center py-8">Nessuna risposta ancora.</p>
  }

  switch (stats.type) {
    case 'multiple_choice':
    case 'checkboxes': {
      const data = (stats as any).distribution || []
      return (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent = 0 }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
                nameKey="option"
              >
                {data.map((_entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )
    }

    case 'rating':
    case 'scale': {
      const data = (stats as any).distribution || []
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="bg-blue-50 px-3 py-1 rounded text-blue-700">
              Media: <span className="font-bold">{(stats as any).average}</span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="value" />
                <YAxis allowDecimals={false} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="count" name="Risposte" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )
    }

    case 'text':
    case 'textarea': {
      const responses = (stats as any).responses || []
      return (
        <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto space-y-3">
          {responses.map((r: any, i: number) => (
            <div
              key={i}
              className="bg-white p-3 rounded border border-gray-200 text-sm text-gray-700"
            >
              {r.answer}
            </div>
          ))}
        </div>
      )
    }

    default:
      return null
  }
}
