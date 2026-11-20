/**
 * Canonical visa status vocabulary (see PRODUCT.md).
 * data.json still stores older wording; everything in the UI goes through here.
 */
export type VisaStatus = 'free' | 'evisa' | 'voa' | 'required' | 'notRecognized'

export const STATUS_ORDER: VisaStatus[] = ['free', 'evisa', 'voa', 'required', 'notRecognized']

export const STATUS_LABEL: Record<VisaStatus, string> = {
  free: 'Visa Free',
  evisa: 'E-Visa',
  voa: 'Visa on Arrival',
  required: 'Visa Required',
  notRecognized: 'Not Recognized',
}

/** Tailwind classes for the status pill (tinted ground + AA text, both themes). */
export const STATUS_PILL: Record<VisaStatus, string> = {
  free: 'bg-status-free-bg text-status-free-fg',
  evisa: 'bg-status-evisa-bg text-status-evisa-fg',
  voa: 'bg-status-voa-bg text-status-voa-fg',
  required: 'bg-status-req-bg text-status-req-fg',
  notRecognized: 'bg-status-nr-bg text-status-nr-fg',
}

export function toStatus(requirement: string): VisaStatus {
  const r = requirement.toLowerCase()
  if (r.includes('not recogni') || r.includes('does not recognize')) return 'notRecognized'
  if (r.includes('not required') || r.includes('visa free')) return 'free'
  if (r.includes('e-visa')) return 'evisa'
  if (r.includes('on arrival')) return 'voa'
  return 'required'
}

/** "N/A" and empty durations carry no information; hide them. */
export function cleanDuration(duration?: string | null): string {
  if (!duration) return ''
  const d = duration.trim()
  return d === 'N/A' || d === '-' ? '' : d
}

/** Short, honest age of a report: "3 days ago", "2 wk ago", "Mar 2025". */
export function recency(iso: string | Date): string {
  const then = new Date(iso)
  const days = Math.floor((Date.now() - then.getTime()) / 86_400_000)
  if (days < 1) return 'today'
  if (days < 2) return 'yesterday'
  if (days < 14) return `${days} days ago`
  if (days < 60) return `${Math.round(days / 7)} wk ago`
  if (days < 365) return `${Math.round(days / 30)} mo ago`
  return then.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export function reportLine(summary?: { reports: number; latest: string } | null): string {
  if (!summary || summary.reports === 0) return 'No reports yet'
  const n = summary.reports
  return `${n} ${n === 1 ? 'report' : 'reports'} · ${recency(summary.latest)}`
}
