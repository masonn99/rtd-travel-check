'use client'

import { useState, useMemo } from 'react'
import { resolveCountry, codeFor, type Country } from '../lib/countries'
import { flagEmoji } from '../lib/flagEmoji'
import ExperienceList from './ExperienceList'
import { CountryRow, useDisclosure } from './CountryList'
import { SearchIcon, ClearIcon } from './Icons'

/**
 * Every country holders have reported on, built from the per-country summary
 * (all published reports), not only the latest page of stories.
 */

const SORTS = [
  { value: 'recent', label: 'Most recent' },
  { value: 'count', label: 'Most reports' },
  { value: 'alpha', label: 'A to Z' },
]

export interface ReportSummaryRow { country_name: string; reports: number; latest: string }

interface Props {
  summary: Record<string, ReportSummaryRow>
  loaded: boolean
}

export default function CountryStoriesGrid({ summary, loaded }: Props) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('recent')
  const { openName, mounted, toggle } = useDisclosure()

  const rows = useMemo(() => {
    const list = Object.values(summary).map(s => {
      const known = resolveCountry(s.country_name)
      // Keep the report's own name so ExperienceList can find its rows,
      // but borrow the official status and flag when the country is known.
      const country: Country = known
        ? { ...known, name: s.country_name }
        : { name: s.country_name, status: null, duration: '', notes: '', flag: flagEmoji(codeFor(s.country_name)) }
      return { country, known: !!known, s }
    })
    const q = search.trim().toLowerCase()
    const filtered = q ? list.filter(r => r.country.name.toLowerCase().includes(q)) : list
    return filtered.sort((a, b) => {
      if (sort === 'count') return b.s.reports - a.s.reports || a.country.name.localeCompare(b.country.name)
      if (sort === 'alpha') return a.country.name.localeCompare(b.country.name)
      return new Date(b.s.latest).getTime() - new Date(a.s.latest).getTime()
    })
  }, [summary, search, sort])

  const total = Object.keys(summary).length
  const loading = !loaded

  return (
    <div>
      <div className="flex gap-2">
        <label className="relative flex-1">
          <span className="sr-only">Search countries with reports</span>
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-ink-3 pointer-events-none" />
          <input
            type="search"
            autoComplete="off"
            placeholder="Search countries"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-10 rounded-[10px] bg-fill text-[16px] text-ink placeholder:text-ink-3 outline-none focus-visible:outline-none focus:ring-2 focus:ring-accent/40 [&::-webkit-search-cancel-button]:hidden"
          />
          {search && (
            <button onClick={() => setSearch('')} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-ink-3 hover:text-ink-2">
              <ClearIcon className="w-[18px] h-[18px]" />
            </button>
          )}
        </label>
        <label className="relative">
          <span className="sr-only">Sort</span>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="h-11 pl-3 pr-8 rounded-[10px] bg-fill text-[15px] text-ink appearance-none outline-none focus:ring-2 focus:ring-accent/40 cursor-pointer"
          >
            {SORTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-3 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 10l5 5 5-5" /></svg>
        </label>
      </div>

      <p className="text-[13px] text-ink-3 mt-4 mb-2 px-1" aria-live="polite">
        {loading ? 'Loading countries…' : search ? `${rows.length} of ${total} countries` : `${total} countries with reports`}
      </p>

      {loading ? (
        <div className="bg-surface rounded-xl border border-line/70 divide-y divide-line" aria-busy="true">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-3 px-4 h-[60px] animate-pulse">
              <div className="w-7 h-5 bg-fill rounded" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-28 bg-fill rounded" />
                <div className="h-3 w-40 bg-fill rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl bg-surface border border-line px-6 py-10 text-center">
          <p className="text-[16px] font-medium text-ink">{search ? `No reports for “${search.trim()}” yet` : 'No reports yet'}</p>
          <p className="text-[14px] text-ink-3 mt-1">If you have traveled there on an RTD, your report would be the first.</p>
        </div>
      ) : (
        <ul className="bg-surface rounded-xl border border-line/70 overflow-hidden">
          {rows.map(({ country, s }, i) => (
            <CountryRow
              key={country.name}
              country={country}
              summary={s}
              open={openName === country.name}
              mounted={mounted.has(country.name)}
              onToggle={() => toggle(country.name)}
              first={i === 0}
              showStay={false}
            >
              <div className="px-4 pb-4 pt-1 md:pl-[60px] md:pr-6">
                <ExperienceList filterCountry={country.name} />
              </div>
            </CountryRow>
          ))}
        </ul>
      )}
    </div>
  )
}
