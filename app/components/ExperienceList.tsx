'use client'

import { useState, useEffect } from 'react'
import { getExperiences, getExperiencesForCountry, loadMoreExperiences, incrementHelpful, type Experience } from '../actions/experiences'
import { EXPERIENCES_PAGE_SIZE as PAGE_SIZE } from '../lib/constants'
import { flagEmoji } from '../lib/flagEmoji'
import { codeFor } from '../lib/countries'

interface ExperienceListProps {
  filterCountry?: string | null
  // When provided by a parent that already fetched, skip the redundant fetch
  initialExperiences?: Experience[] | null
}

const LS_KEY = 'rtd_voted_experiences'

function loadVotedSet(): Set<number> {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? new Set(JSON.parse(raw) as number[]) : new Set()
  } catch {
    return new Set()
  }
}

function saveVotedSet(set: Set<number>) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify([...set]))
  } catch { /* storage full or unavailable — ignore */ }
}

const ExperienceList = ({ filterCountry = null, initialExperiences = null }: ExperienceListProps) => {
  const [experiences, setExperiences] = useState<Experience[]>(initialExperiences ?? [])
  const [loading, setLoading] = useState(initialExperiences === null)
  const [filterVisaType, setFilterVisaType] = useState('all')
  const [votedExperiences, setVotedExperiences] = useState(new Set<number>())
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState((initialExperiences?.length ?? 0) >= PAGE_SIZE)

  // Hydrate voted set from localStorage once on mount (client only)
  useEffect(() => {
    setVotedExperiences(loadVotedSet())
  }, [])

  useEffect(() => {
    // Skip fetch if parent already supplied data
    if (initialExperiences !== null) return
    const fetchExperiences = async () => {
      setLoading(true)
      const data = filterCountry ? await getExperiencesForCountry(filterCountry) : await getExperiences()
      setExperiences(data)
      setHasMore(!filterCountry && data.length >= PAGE_SIZE)
      setLoading(false)
    }
    fetchExperiences()
  }, [])

  const handleLoadMore = async () => {
    if (loadingMore || experiences.length === 0) return
    setLoadingMore(true)
    const oldest = experiences[experiences.length - 1]
    const more = await loadMoreExperiences(oldest.id)
    setExperiences(prev => [...prev, ...more])
    setHasMore(more.length >= PAGE_SIZE)
    setLoadingMore(false)
  }

  const handleVote = async (experienceId: number) => {
    if (votedExperiences.has(experienceId)) return

    // Optimistic UI update
    const next = new Set([...votedExperiences, experienceId])
    setVotedExperiences(next)
    setExperiences(prev => prev.map(exp =>
      exp.id === experienceId ? { ...exp, helpful_count: exp.helpful_count + 1 } : exp
    ))

    try {
      const result = await incrementHelpful(experienceId)
      if (result.success) {
        // Persist to localStorage so the vote survives page reloads
        saveVotedSet(next)
      } else if (result.alreadyVoted) {
        // Server says already voted (different device/session) — keep button greyed
        saveVotedSet(next)
      } else {
        // Unexpected failure — roll back optimistic update
        const rolled = new Set(votedExperiences)
        setVotedExperiences(rolled)
        setExperiences(prev => prev.map(exp =>
          exp.id === experienceId ? { ...exp, helpful_count: exp.helpful_count - 1 } : exp
        ))
      }
    } catch (error) {
      console.error('Error voting:', error)
    }
  }

  const extractField = (description: string, field: string) => {
    const regex = new RegExp(`${field}: ([^\\n]+)`)
    const match = description.match(regex)
    return match ? match[1] : ''
  }

  const formatDate = (value: Date | string, withDay = true) =>
    new Date(value).toLocaleDateString('en-US', withDay
      ? { day: 'numeric', month: 'short', year: 'numeric' }
      : { month: 'short', year: 'numeric' })

  const filteredExperiences = experiences.filter(exp => {
    if (filterCountry && exp.country_name.toLowerCase() !== filterCountry.toLowerCase()) return false
    if (filterVisaType !== 'all' && exp.experience_type !== filterVisaType) return false
    return true
  })

  if (loading) {
    return (
      <div className="border-y border-line divide-y divide-line" aria-busy="true" aria-label="Loading reports">
        {[1, 2].map(i => (
          <div key={i} className="py-3 space-y-2 animate-pulse">
            <div className="h-3.5 w-40 bg-fill rounded" />
            <div className="h-3 w-full bg-fill rounded" />
            <div className="h-3 w-3/4 bg-fill rounded" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {!filterCountry && (
        <div className="flex flex-wrap gap-2">
          {['all', 'Visa Free', 'E-Visa', 'Visa Required'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterVisaType(type)}
              aria-pressed={filterVisaType === type}
              className={`h-8 px-3 rounded-full text-[14px] font-medium border transition-colors ${
                filterVisaType === type ? 'bg-accent text-accent-ink border-accent' : 'bg-surface text-ink-2 border-line hover:text-ink'
              }`}
            >
              {type === 'all' ? 'All stories' : type}
            </button>
          ))}
        </div>
      )}

      {filteredExperiences.length === 0 ? (
        <div className="border-y border-line py-4">
          <p className="text-[15px] font-medium text-ink">No reports for {filterCountry || 'this filter'} yet</p>
          <p className="text-[14px] text-ink-3 mt-0.5">
            Been there on an RTD? Share how entry went in the Stories tab or the Telegram group.
          </p>
        </div>
      ) : (
        <ul className="border-y border-line divide-y divide-line">
          {filteredExperiences.map((exp) => {
            const travelDate = extractField(exp.description, 'Travel Date')
            const visaType = extractField(exp.description, 'Visa Type')
            const processingTime = extractField(exp.description, 'Processing Time')
            const hasGreenCard = exp.description.includes('Has Green Card: Yes')
            const difficultyStr = extractField(exp.description, 'Difficulty')
            const difficultyNum = difficultyStr ? parseInt(difficultyStr.split('/')[0]) : 0

            const experienceMatch = exp.description.match(/Entry\/Exit Experience:\n([\s\S]+?)(?:\n\nTips & Advice:|$)/)
            const entryExperience = experienceMatch ? experienceMatch[1].trim() : ''

            const tipsMatch = exp.description.match(/Tips & Advice:\n([\s\S]+)$/)
            const tips = tipsMatch ? tipsMatch[1].trim() : ''

            // Telegram stories are plain text with no structured fields.
            const isUnstructured = !entryExperience && !travelDate && !visaType
            const body = isUnstructured
              ? exp.description.replace(/\n\n— .+ \(via Telegram\)$/, '').trim()
              : entryExperience
            const viaTelegram = /\(via Telegram\)\s*$/.test(exp.description)

            const isExpanded = expandedId === exp.id
            const isLong = body.length > 220 || !!tips
            const voted = votedExperiences.has(exp.id)

            const facts = [
              visaType,
              travelDate && `Traveled ${formatDate(travelDate + '-01', false)}`,
              processingTime && processingTime !== 'N/A' && `Wait ${processingTime}`,
              difficultyNum > 0 && `Difficulty ${difficultyNum}/5`,
              hasGreenCard && 'Has green card',
            ].filter(Boolean) as string[]

            return (
              <li key={exp.id} className="py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-[14px] font-semibold text-ink truncate">
                    {exp.author_name || 'Anonymous holder'}
                  </p>
                  <p className="flex-none text-[12px] text-ink-3 tabular-nums">
                    {viaTelegram ? 'Telegram · ' : ''}{formatDate(exp.created_at)}
                  </p>
                </div>

                {!filterCountry && (
                  <p className="text-[13px] text-ink-2 mt-0.5">
                    <span aria-hidden="true">{flagEmoji(codeFor(exp.country_name))} </span>{exp.country_name}
                  </p>
                )}

                {facts.length > 0 && (
                  <p className="text-[13px] text-ink-2 mt-1">{facts.join(' · ')}</p>
                )}

                {body && (
                  <p className={`text-[14px] leading-relaxed text-ink mt-2 whitespace-pre-line ${!isExpanded && isLong ? 'line-clamp-4' : ''}`}>
                    {body}
                  </p>
                )}

                {isExpanded && tips && (
                  <div className="mt-2">
                    <p className="text-[13px] font-semibold text-ink-2">Tips</p>
                    <p className="text-[14px] leading-relaxed text-ink mt-0.5 whitespace-pre-line">{tips}</p>
                  </div>
                )}

                <div className="flex items-center gap-4 mt-2">
                  {isLong && (
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : exp.id)}
                      className="text-[13px] font-semibold text-accent"
                      aria-expanded={isExpanded}
                    >
                      {isExpanded ? 'Show less' : tips && !isExpanded ? 'Read more and tips' : 'Read more'}
                    </button>
                  )}
                  <button
                    onClick={() => handleVote(exp.id)}
                    disabled={voted}
                    aria-pressed={voted}
                    className={`ml-auto inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[13px] font-medium transition-colors ${
                      voted ? 'bg-status-free-bg text-status-free-fg' : 'bg-fill text-ink-2 hover:text-ink'
                    }`}
                  >
                    {voted ? 'Helpful' : 'Mark helpful'}
                    <span className="tabular-nums">{exp.helpful_count || 0}</span>
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {!filterCountry && hasMore && (
        <div className="flex justify-center pt-1">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="h-9 px-4 rounded-full bg-surface border border-line text-ink text-[14px] font-semibold disabled:opacity-60"
          >
            {loadingMore ? 'Loading…' : 'Load more stories'}
          </button>
        </div>
      )}
    </div>
  )
}

export default ExperienceList
