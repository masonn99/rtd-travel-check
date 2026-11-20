import data from '../../data.json'
import { getCode } from 'country-list'
import { flagEmoji } from './flagEmoji'
import { toStatus, cleanDuration, type VisaStatus } from './visa'

export interface Country {
  name: string
  status: VisaStatus | null
  duration: string
  notes: string
  flag: string
}

/** A country from data.json, which always carries an official status. */
export type OfficialCountry = Country & { status: VisaStatus }

// Names the country-list package does not resolve to an ISO code.
const CODE_OVERRIDES: Record<string, string> = {
  kosovo: 'XK',
  'czech republic': 'CZ',
  czechia: 'CZ',
  turkey: 'TR',
  türkiye: 'TR',
  'south korea': 'KR',
  russia: 'RU',
  vietnam: 'VN',
  laos: 'LA',
  iran: 'IR',
  syria: 'SY',
  bolivia: 'BO',
  venezuela: 'VE',
  tanzania: 'TZ',
  moldova: 'MD',
  uk: 'GB',
  'united kingdom': 'GB',
  usa: 'US',
  'united states': 'US',
}

export function codeFor(name: string): string | undefined {
  return CODE_OVERRIDES[name.trim().toLowerCase()] ?? getCode(name.trim())
}

export const COUNTRIES: OfficialCountry[] = (data as { country: string; visaRequirement: string; duration?: string; notes?: string }[])
  .map(c => ({
    name: c.country,
    status: toStatus(c.visaRequirement),
    duration: cleanDuration(c.duration),
    notes: (c.notes || '').trim(),
    flag: flagEmoji(codeFor(c.country)),
  }))
  .sort((a, b) => a.name.localeCompare(b.name))

export const COUNTRY_BY_NAME: Record<string, OfficialCountry> = Object.fromEntries(
  COUNTRIES.map(c => [c.name.toLowerCase(), c])
)

export const STATUS_COUNTS = COUNTRIES.reduce(
  (acc, c) => ({ ...acc, [c.status]: (acc[c.status] || 0) + 1 }),
  {} as Partial<Record<VisaStatus, number>>
)

const COUNTRY_BY_CODE: Record<string, OfficialCountry> = Object.fromEntries(
  COUNTRIES.map(c => [codeFor(c.name), c]).filter(([code]) => !!code) as [string, OfficialCountry][]
)

/**
 * Resolve a free-text country name (e.g. from a Telegram report) to the
 * official entry, matching by name first and ISO code second.
 */
export function resolveCountry(name: string): OfficialCountry | null {
  const byName = COUNTRY_BY_NAME[name.trim().toLowerCase()]
  if (byName) return byName
  const code = codeFor(name)
  return (code && COUNTRY_BY_CODE[code]) || null
}
