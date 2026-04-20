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

  const getDifficultyColor = (description: string) => {
    const match = description.match(/Difficulty: (\d)\/5/)
    if (!match) return 'text-zinc-400'
    const difficulty = parseInt(match[1])
    if (difficulty <= 2) return 'text-emerald-400'
    if (difficulty === 3) return 'text-amber-400'
    return 'text-red-400'
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

  // Skeleton Loader Component
  const SkeletonCard = () => (
    <div className="bg-zinc-800/20 border border-zinc-700/30 rounded-3xl p-6 animate-pulse">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-10 h-7 bg-zinc-700 rounded-md"></div>
        <div className="h-6 w-32 bg-zinc-700 rounded-md"></div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="h-12 bg-zinc-700 rounded-2xl"></div>
        <div className="h-12 bg-zinc-700 rounded-2xl"></div>
        <div className="h-12 bg-zinc-700 rounded-2xl"></div>
      </div>
      <div className="space-y-3">
        <div className="h-4 w-full bg-zinc-700 rounded-md"></div>
        <div className="h-4 w-5/6 bg-zinc-700 rounded-md"></div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      {!filterCountry && (
        <div className="flex flex-wrap gap-2 p-1 bg-zinc-800/30 border border-zinc-700/50 rounded-2xl w-fit mb-4">
          {['all', 'Visa Free', 'E-Visa', 'Visa Required'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterVisaType(type)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                filterVisaType === type
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              {type === 'all' ? 'All Stories' : type}
            </button>
          ))}
        </div>
      )}

      {/* Experience Cards */}
      {filteredExperiences.length === 0 ? (
        <div className="text-center py-20 bg-zinc-800/20 backdrop-blur-sm border border-zinc-700/50 rounded-[3rem]">
          <div className="text-5xl mb-6 grayscale opacity-50">📮</div>
          <h3 className="text-xl font-bold text-white mb-2">No stories yet</h3>
          <p className="text-zinc-500 text-sm max-w-xs mx-auto">
            Be the first to share your journey for {filterCountry || 'this category'}.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredExperiences.map((exp, i) => {
            const travelDate = extractField(exp.description, 'Travel Date')
            const visaType = extractField(exp.description, 'Visa Type')
            const processingTime = extractField(exp.description, 'Processing Time')
            const hasGreenCard = exp.description.includes('Has Green Card: Yes')
            const difficulty = extractField(exp.description, 'Difficulty')

            const experienceMatch = exp.description.match(/Entry\/Exit Experience:\n([\s\S]+?)(?:\n\nTips & Advice:|$)/)
            const entryExperience = experienceMatch ? experienceMatch[1].trim() : ''

            const tipsMatch = exp.description.match(/Tips & Advice:\n([\s\S]+)$/)
            const tips = tipsMatch ? tipsMatch[1].trim() : ''

            return (
              <div
                key={exp.id}
                className="group bg-zinc-800/40 backdrop-blur-md border border-zinc-700/50 rounded-[2.5rem] p-8 hover:bg-zinc-800/60 hover:border-zinc-600/50 transition-all duration-500 animate-slideUp"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {getCode(exp.country_name) ? (
                        <Flag code={getCode(exp.country_name)} className="h-8 w-11 rounded-lg shadow-xl object-cover" />
                      ) : (
                        <div className="h-8 w-11 bg-zinc-700 rounded-lg flex items-center justify-center text-[10px]">FLAG</div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white group-hover:text-blue-400 transition-colors">{exp.country_name}</h3>
                      {travelDate && (
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                          {new Date(travelDate + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasGreenCard && (
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">
                        GC Holder
                      </span>
                    )}
                    <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-500/20">
                      {visaType || 'Unknown'}
                    </span>
                  </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    {entryExperience && (
                      <div>
                        <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                          Entry Experience
                        </h4>
                        <p className="text-zinc-300 text-sm leading-relaxed font-medium">
                          {entryExperience}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-4 pt-4">
                      {difficulty && (
                        <div className="bg-zinc-900/40 rounded-2xl px-4 py-3 border border-zinc-700/30">
                          <p className="text-[9px] font-bold text-zinc-500 uppercase mb-1">Complexity</p>
                          <p className={`text-xs font-black ${getDifficultyColor(exp.description)}`}>
                            {difficulty}
                          </p>
                        </div>
                      )}
                      {processingTime && processingTime !== 'N/A' && (
                        <div className="bg-zinc-900/40 rounded-2xl px-4 py-3 border border-zinc-700/30">
                          <p className="text-[9px] font-bold text-zinc-500 uppercase mb-1">Wait Time</p>
                          <p className="text-xs font-black text-white">{processingTime}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-zinc-900/30 rounded-3xl p-6 border border-zinc-700/20">
                    <h4 className="text-[10px] font-black text-amber-500/80 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <span className="w-1 h-1 bg-amber-500 rounded-full"></span>
                      Advice & Tips
                    </h4>
                    <p className="text-zinc-400 text-sm leading-relaxed italic">
                      "{tips || 'No specific tips provided for this journey.'}"
                    </p>
                    
                    <div className="mt-8 flex items-center justify-between border-t border-zinc-700/30 pt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-600 flex items-center justify-center text-[10px] font-bold">
                          {exp.author_name ? exp.author_name[0].toUpperCase() : 'A'}
                        </div>
                        <span className="text-[11px] font-bold text-zinc-500 italic">
                          {exp.author_name || 'Anonymous'}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => handleVote(exp.id)}
                        disabled={votedExperiences.has(exp.id)}
                        className={`group/vote flex items-center gap-2 px-4 py-2 rounded-2xl transition-all duration-300 ${
                          votedExperiences.has(exp.id)
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-zinc-800 text-zinc-400 hover:bg-emerald-500/10 hover:text-emerald-400'
                        }`}
                      >
                        <svg className={`w-4 h-4 transition-transform ${!votedExperiences.has(exp.id) && 'group-hover/vote:-translate-y-0.5'}`} fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z"/>
                        </svg>
                        <span className="text-xs font-black">{exp.helpful_count || 0}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ExperienceList
