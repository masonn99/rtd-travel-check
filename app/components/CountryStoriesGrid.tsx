'use client'

import { useState, useMemo } from 'react'
import { type Experience } from '../actions/experiences'
import { getCode } from 'country-list'
import { flagEmoji } from '../lib/flagEmoji'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface CountryGroup {
  country: string
  stories: Experience[]
  latestDate: Date
  primaryType: string
  helpfulTotal: number
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const VISA_STYLES: Record<string, { bg: string; dot: string; text: string; label: string }> = {
  'Visa Free':      { bg: 'bg-emerald-500/10 border-emerald-500/20', dot: 'bg-emerald-400', text: 'text-emerald-400', label: 'Visa Free' },
  'E-Visa':         { bg: 'bg-blue-500/10 border-blue-500/20',       dot: 'bg-blue-400',    text: 'text-blue-400',    label: 'E-Visa' },
  'Visa Required':  { bg: 'bg-amber-500/10 border-amber-500/20',     dot: 'bg-amber-400',   text: 'text-amber-400',   label: 'Visa Required' },
  'Not Recognized': { bg: 'bg-red-500/10 border-red-500/20',         dot: 'bg-red-400',     text: 'text-red-400',     label: 'Not Recognized' },
}
const DEFAULT_STYLE = { bg: 'bg-zinc-800/40 border-zinc-700/30', dot: 'bg-zinc-500', text: 'text-zinc-400', label: 'Unknown' }

function getVisaStyle(type: string) {
  return VISA_STYLES[type] ?? DEFAULT_STYLE
}

function primaryType(stories: Experience[]): string {
  const counts: Record<string, number> = {}
  for (const s of stories) counts[s.experience_type] = (counts[s.experience_type] ?? 0) + 1
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Unknown'
}

function timeAgo(date: Date): string {
  const secs = (Date.now() - date.getTime()) / 1000
  if (secs < 3600)   return `${Math.floor(secs / 60)}m ago`
  if (secs < 86400)  return `${Math.floor(secs / 3600)}h ago`
  if (secs < 604800) return `${Math.floor(secs / 86400)}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

// ─── Story card (inside expanded country) ──────────────────────────────────────

function StoryCard({ exp, voted, onVote }: {
  exp: Experience
  voted: boolean
  onVote: (id: number) => void
}) {
  const [expanded, setExpanded] = useState(false)

  function extractField(desc: string, field: string) {
    const m = desc.match(new RegExp(`${field}: ([^\\n]+)`))
    return m ? m[1] : ''
  }

  const travelDate    = extractField(exp.description, 'Travel Date')
  const visaType      = extractField(exp.description, 'Visa Type')
  const processingTime = extractField(exp.description, 'Processing Time')
  const hasGreenCard  = exp.description.includes('Has Green Card: Yes')
  const diffStr       = extractField(exp.description, 'Difficulty')
  const diffNum       = diffStr ? parseInt(diffStr) : 0

  const entryMatch = exp.description.match(/Entry\/Exit Experience:\n([\s\S]+?)(?:\n\nTips & Advice:|$)/)
  const entryText  = entryMatch ? entryMatch[1].trim() : ''
  const tipsMatch  = exp.description.match(/Tips & Advice:\n([\s\S]+)$/)
  const tipsText   = tipsMatch ? tipsMatch[1].trim() : ''
  const isPlain    = !entryText && !travelDate && !visaType
  const plainText  = isPlain ? exp.description.replace(/\n\n— .+ \(via Telegram\)$/, '').trim() : ''

  const diffColor = diffNum <= 2 ? 'text-emerald-400 bg-emerald-500/10'
                  : diffNum === 3 ? 'text-amber-400 bg-amber-500/10'
                  : 'text-red-400 bg-red-500/10'

  return (
    <div className="border border-zinc-800/50 rounded-xl overflow-hidden bg-zinc-900/30 hover:border-zinc-700/60 transition-colors">
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-800/20 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {travelDate && (
              <span className="text-[11px] text-zinc-500">
                {new Date(travelDate + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
            )}
            {visaType && <span className="text-[11px] text-blue-400 font-medium">{visaType}</span>}
            {hasGreenCard && <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md font-medium">GC</span>}
            {diffNum > 0 && <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${diffColor}`}>{diffNum}/5</span>}
            {isPlain && <span className="text-[11px] text-zinc-400 truncate">{plainText.substring(0, 60)}{plainText.length > 60 ? '…' : ''}</span>}
          </div>
          {exp.author_name && (
            <span className="text-[11px] text-zinc-600 mt-0.5 block">{exp.author_name}</span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={e => { e.stopPropagation(); onVote(exp.id) }}
            disabled={voted}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
              voted ? 'bg-emerald-500/15 text-emerald-400' : 'bg-zinc-800/60 text-zinc-400 hover:bg-emerald-500/10 hover:text-emerald-400'
            }`}
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" />
            </svg>
            {exp.helpful_count || 0}
          </button>
          <svg className={`w-3.5 h-3.5 text-zinc-600 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-zinc-800/40 animate-fadeIn">
          {plainText ? (
            <p className="text-zinc-300 text-xs leading-relaxed mt-3">{plainText}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              {entryText && (
                <div>
                  <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Entry Experience</p>
                  <p className="text-zinc-300 text-xs leading-relaxed">{entryText}</p>
                  {processingTime && processingTime !== 'N/A' && (
                    <div className="mt-2 inline-flex items-center gap-1.5 bg-zinc-800/50 px-2 py-1 rounded-lg">
                      <span className="text-[10px] text-zinc-500">Wait:</span>
                      <span className="text-[10px] text-white font-semibold">{processingTime}</span>
                    </div>
                  )}
                </div>
              )}
              {tipsText && (
                <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-3">
                  <p className="text-[11px] font-semibold text-amber-400/80 uppercase tracking-wider mb-2">Tips</p>
                  <p className="text-zinc-400 text-xs leading-relaxed italic">"{tipsText}"</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Country card ───────────────────────────────────────────────────────────────

function CountryCard({ group, voted, onVote }: {
  group: CountryGroup
  voted: Set<number>
  onVote: (id: number) => void
}) {
  const [open, setOpen] = useState(false)
  const style = getVisaStyle(group.primaryType)
  const code  = getCode(group.country)

  return (
    <div className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
      open ? 'border-zinc-700/70 bg-zinc-900/60' : 'border-zinc-800/60 bg-zinc-900/40 hover:border-zinc-700/50'
    }`}>
      {/* Card header */}
      <button
        className="w-full flex items-center gap-3 p-4 text-left"
        onClick={() => setOpen(o => !o)}
      >
        <span className="text-2xl leading-none flex-shrink-0">{flagEmoji(code)}</span>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm truncate">{group.country}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {/* Visa type badge */}
            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${style.bg} ${style.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
              {group.primaryType}
            </span>
            {/* Story count */}
            <span className="text-[11px] text-zinc-500">
              {group.stories.length} {group.stories.length === 1 ? 'story' : 'stories'}
            </span>
            {/* Latest date */}
            <span className="text-[11px] text-zinc-600">{timeAgo(group.latestDate)}</span>
          </div>
        </div>

        <svg className={`w-4 h-4 text-zinc-500 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded stories */}
      {open && (
        <div className="px-4 pb-4 border-t border-zinc-800/50 space-y-2 pt-3 animate-fadeIn">
          {group.stories.map(exp => (
            <StoryCard
              key={exp.id}
              exp={exp}
              voted={voted.has(exp.id)}
              onVote={onVote}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main grid ─────────────────────────────────────────────────────────────────

interface Props {
  experiences: Experience[]
  loading: boolean
}

const SORT_OPTIONS = [
  { value: 'count',  label: 'Most stories' },
  { value: 'recent', label: 'Most recent' },
  { value: 'alpha',  label: 'A → Z' },
]

const FILTER_OPTIONS = ['All', 'Visa Free', 'E-Visa', 'Visa Required']

export default function CountryStoriesGrid({ experiences, loading }: Props) {
  const [search, setSearch]   = useState('')
  const [sort, setSort]       = useState('count')
  const [filter, setFilter]   = useState('All')
  const [voted, setVoted]     = useState<Set<number>>(new Set())

  // Build country groups
  const groups = useMemo<CountryGroup[]>(() => {
    const map: Record<string, Experience[]> = {}
    for (const exp of experiences) {
      if (!map[exp.country_name]) map[exp.country_name] = []
      map[exp.country_name].push(exp)
    }

    return Object.entries(map).map(([country, stories]) => ({
      country,
      stories: [...stories].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
      latestDate: new Date(Math.max(...stories.map(s => new Date(s.created_at).getTime()))),
      primaryType: primaryType(stories),
      helpfulTotal: stories.reduce((s, e) => s + (e.helpful_count ?? 0), 0),
    }))
  }, [experiences])

  // Filter + search + sort
  const visible = useMemo(() => {
    let g = groups
    if (filter !== 'All') g = g.filter(x => x.primaryType === filter)
    if (search.trim())    g = g.filter(x => x.country.toLowerCase().includes(search.toLowerCase()))
    if (sort === 'count')  g = [...g].sort((a, b) => b.stories.length - a.stories.length)
    if (sort === 'recent') g = [...g].sort((a, b) => b.latestDate.getTime() - a.latestDate.getTime())
    if (sort === 'alpha')  g = [...g].sort((a, b) => a.country.localeCompare(b.country))
    return g
  }, [groups, filter, search, sort])

  const handleVote = async (expId: number) => {
    if (voted.has(expId)) return
    const next = new Set([...voted, expId])
    setVoted(next)
    try {
      const { incrementHelpful } = await import('../actions/experiences')
      await incrementHelpful(expId)
    } catch {}
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-zinc-800 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-zinc-800 rounded" />
                <div className="h-3 w-48 bg-zinc-800 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search + controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search country…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-900/60 border border-zinc-800/60 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="px-3 py-2 bg-zinc-900/60 border border-zinc-800/60 rounded-xl text-sm text-zinc-300 focus:outline-none focus:border-blue-500/50 transition-colors cursor-pointer"
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Visa type filter pills */}
      <div className="flex flex-wrap gap-1.5">
        {FILTER_OPTIONS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === f
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                : 'bg-zinc-800/50 text-zinc-400 hover:text-zinc-200 border border-zinc-700/50'
            }`}
          >
            {f === 'All' ? `All Countries (${groups.length})` : f}
          </button>
        ))}
      </div>

      {/* Cards */}
      {visible.length === 0 ? (
        <div className="text-center py-12 bg-zinc-800/20 border border-zinc-700/40 rounded-2xl border-dashed">
          <div className="text-4xl mb-3 opacity-20">🌍</div>
          <p className="text-zinc-400 font-medium text-sm">
            {search ? `No results for "${search}"` : 'No stories yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {visible.map(group => (
            <CountryCard
              key={group.country}
              group={group}
              voted={voted}
              onVote={handleVote}
            />
          ))}
        </div>
      )}
    </div>
  )
}
