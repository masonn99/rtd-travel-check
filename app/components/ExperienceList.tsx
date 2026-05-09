'use client'

import { useState, useEffect } from 'react'
import { getExperiences, incrementHelpful, type Experience } from '../actions/experiences'
import Flag from 'react-world-flags'
import { getCode } from 'country-list'

interface ExperienceListProps {
  filterCountry?: string | null
}

const ExperienceList = ({ filterCountry = null }: ExperienceListProps) => {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)
  const [filterVisaType, setFilterVisaType] = useState('all')
  const [votedExperiences, setVotedExperiences] = useState(new Set<number>())
  const [expandedId, setExpandedId] = useState<number | null>(null)

  useEffect(() => {
    const fetchExperiences = async () => {
      setLoading(true)
      const data = await getExperiences()
      setExperiences(data)
      setLoading(false)
    }
    fetchExperiences()
  }, [])

  const handleVote = async (experienceId: number) => {
    if (votedExperiences.has(experienceId)) return
    try {
      const result = await incrementHelpful(experienceId)
      if (result.success) {
        setVotedExperiences(new Set([...votedExperiences, experienceId]))
        setExperiences(prev => prev.map(exp =>
          exp.id === experienceId ? { ...exp, helpful_count: exp.helpful_count + 1 } : exp
        ))
      }
    } catch (error) {
      console.error('Error voting:', error)
    }
  }

  const getDifficultyColor = (score: number) => {
    if (score <= 2) return 'text-emerald-400 bg-emerald-500/10'
    if (score === 3) return 'text-amber-400 bg-amber-500/10'
    return 'text-red-400 bg-red-500/10'
  }

  const extractField = (description: string, field: string) => {
    const regex = new RegExp(`${field}: ([^\\n]+)`)
    const match = description.match(regex)
    return match ? match[1] : ''
  }

  const filteredExperiences = experiences.filter(exp => {
    if (filterCountry && exp.country_name !== filterCountry) return false
    if (filterVisaType !== 'all' && exp.experience_type !== filterVisaType) return false
    return true
  })

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-4 animate-pulse">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-6 bg-zinc-800 rounded-md" />
              <div className="h-4 w-28 bg-zinc-800 rounded-md" />
              <div className="h-5 w-16 bg-zinc-800 rounded-lg ml-auto" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full bg-zinc-800 rounded-md" />
              <div className="h-3 w-4/5 bg-zinc-800 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      {!filterCountry && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {['all', 'Visa Free', 'E-Visa', 'Visa Required'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterVisaType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                filterVisaType === type
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                  : 'bg-zinc-800/50 text-zinc-400 hover:text-zinc-200 border border-zinc-700/50'
              }`}
            >
              {type === 'all' ? 'All Stories' : type}
            </button>
          ))}
        </div>
      )}

      {filteredExperiences.length === 0 ? (
        <div className="text-center py-12 bg-zinc-800/20 border border-zinc-700/40 rounded-2xl border-dashed">
          <div className="text-4xl mb-3 opacity-20">📮</div>
          <p className="text-zinc-400 font-medium text-sm">No stories yet</p>
          <p className="text-zinc-600 text-xs mt-1">
            Be the first to share for {filterCountry || 'this category'}.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredExperiences.map((exp, i) => {
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

            const isExpanded = expandedId === exp.id

            return (
              <div
                key={exp.id}
                className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl overflow-hidden hover:border-zinc-700/60 transition-all duration-200 animate-slideUp"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* Card header — always visible */}
                <button
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-zinc-800/20 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : exp.id)}
                >
                  <div className="flex-shrink-0">
                    {getCode(exp.country_name) ? (
                      <Flag code={getCode(exp.country_name)} className="h-6 w-9 rounded-[4px] shadow-sm object-cover" />
                    ) : (
                      <div className="h-6 w-9 bg-zinc-800 rounded-[4px]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-white text-sm">{exp.country_name}</span>
                      {travelDate && (
                        <span className="text-[11px] text-zinc-500">
                          {new Date(travelDate + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {visaType && (
                        <span className="text-[11px] text-blue-400 font-medium">{visaType}</span>
                      )}
                      {hasGreenCard && (
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md font-medium">GC</span>
                      )}
                      {difficultyNum > 0 && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${getDifficultyColor(difficultyNum)}`}>
                          {difficultyNum}/5
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleVote(exp.id); }}
                      disabled={votedExperiences.has(exp.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        votedExperiences.has(exp.id)
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-zinc-800/60 text-zinc-400 hover:bg-emerald-500/10 hover:text-emerald-400'
                      }`}
                    >
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" />
                      </svg>
                      {exp.helpful_count || 0}
                    </button>
                    <svg
                      className={`w-4 h-4 text-zinc-600 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-zinc-800/50 animate-fadeIn">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      {entryExperience && (
                        <div>
                          <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-blue-400 inline-block" />
                            Entry Experience
                          </p>
                          <p className="text-zinc-300 text-xs leading-relaxed">{entryExperience}</p>
                          {processingTime && processingTime !== 'N/A' && (
                            <div className="mt-3 inline-flex items-center gap-1.5 bg-zinc-800/50 px-2.5 py-1.5 rounded-lg">
                              <span className="text-[10px] text-zinc-500 font-medium">Wait time:</span>
                              <span className="text-[10px] text-white font-semibold">{processingTime}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {tips && (
                        <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-3">
                          <p className="text-[11px] font-semibold text-amber-400/80 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-amber-400 inline-block" />
                            Tips
                          </p>
                          <p className="text-zinc-400 text-xs leading-relaxed italic">"{tips}"</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-zinc-800/40">
                      <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-semibold text-zinc-400">
                        {exp.author_name ? exp.author_name[0].toUpperCase() : 'A'}
                      </div>
                      <span className="text-xs text-zinc-500">{exp.author_name || 'Anonymous'}</span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ExperienceList
