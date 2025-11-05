/** CSV export helper for /persone/partecipanti */
'use server'

export async function exportParticipantsCSV(
  rows: Array<Record<string, string | number | boolean | null>>
) {
  const headers = Object.keys(rows[0] ?? {})
  const esc = (v: unknown) =>
    typeof v === 'string' ? `"${v.replaceAll('"', '""')}"` : String(v ?? '')
  const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => esc(r[h])).join(','))].join(
    '\n'
  )
  return new Response(csv, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': 'attachment; filename="participants.csv"',
    },
  })
}
