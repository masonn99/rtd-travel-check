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
      const data = await getExperiences()
      setExperiences(data)
      setLoading(false)
    }

    fetchExperiences()
  }, [])

  const handleVote = async (experienceId: number) => {
    if (votedExperiences.has(experienceId)) {
      alert('You have already voted on this experience')
      return
    }

    try {
      const result = await incrementHelpful(experienceId)

      if (result.success) {
        setVotedExperiences(new Set([...votedExperiences, experienceId]))
        // Refresh the experiences list
        const data = await getExperiences()
        setExperiences(data)
      } else {
        alert('Failed to vote. Please try again.')
      }
    } catch (error) {
      console.error('Error voting:', error)
      alert('Failed to vote. Please try again.')
    }
  }

  const getDifficultyColor = (description: string) => {
    // Try to extract difficulty from description
    const match = description.match(/Difficulty: (\d)\/5/)
    if (!match) return 'text-yellow-400'

    const difficulty = parseInt(match[1])
    if (difficulty <= 2) return 'text-emerald-400'
    if (difficulty === 3) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getDifficultyLabel = (description: string) => {
    const match = description.match(/Difficulty: (\d)\/5/)
    if (!match) return 'Moderate'

    const difficulty = parseInt(match[1])
    if (difficulty === 1) return 'Very Easy'
    if (difficulty === 2) return 'Easy'
    if (difficulty === 3) return 'Moderate'
    if (difficulty === 4) return 'Difficult'
    return 'Very Difficult'
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
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-zinc-700 border-t-blue-500"></div>
        <p className="text-zinc-400 mt-4">Loading experiences...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      {!filterCountry && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterVisaType('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              filterVisaType === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700/50 hover:text-white border border-zinc-700/50'
            }`}
          >
            All
          </button>
          {['Visa Free', 'E-Visa', 'Visa Required'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterVisaType(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filterVisaType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700/50 hover:text-white border border-zinc-700/50'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      )}

      {/* Experience Cards */}
      {filteredExperiences.length === 0 ? (
        <div className="text-center py-12 bg-zinc-800/30 backdrop-blur-sm border border-zinc-700/50 rounded-2xl">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-zinc-400 text-lg mb-2">No experiences yet</p>
          <p className="text-zinc-500 text-sm">Be the first to share your travel experience!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredExperiences.map((exp) => {
            const travelDate = extractField(exp.description, 'Travel Date')
            const visaType = extractField(exp.description, 'Visa Type')
            const processingTime = extractField(exp.description, 'Processing Time')
            const hasGreenCard = exp.description.includes('Has Green Card: Yes')
            const difficulty = extractField(exp.description, 'Difficulty')

            // Extract the main experience text (after the metadata)
            const experienceMatch = exp.description.match(/Entry\/Exit Experience:\n([\s\S]+?)(?:\n\nTips & Advice:|$)/)
            const entryExperience = experienceMatch ? experienceMatch[1].trim() : ''

            const tipsMatch = exp.description.match(/Tips & Advice:\n([\s\S]+)$/)
            const tips = tipsMatch ? tipsMatch[1].trim() : ''

            return (
              <div
                key={exp.id}
                className="bg-zinc-800/40 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-6 hover:border-zinc-600/50 transition-all duration-200 animate-fadeIn"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getCode(exp.country_name) && (
                      <Flag code={getCode(exp.country_name)} className="h-6 w-9 rounded shadow-sm" />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-white">{exp.country_name}</h3>
                      {travelDate && (
                        <p className="text-xs text-zinc-500">
                          {new Date(travelDate + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasGreenCard && (
                      <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-lg border border-emerald-500/20">
                        Green Card
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                  {visaType && (
                    <div className="bg-zinc-900/50 rounded-xl p-3">
                      <p className="text-xs text-zinc-500 mb-1">Visa Type</p>
                      <p className="text-sm font-medium text-white">{visaType}</p>
                    </div>
                  )}
                  {difficulty && (
                    <div className="bg-zinc-900/50 rounded-xl p-3">
                      <p className="text-xs text-zinc-500 mb-1">Difficulty</p>
                      <p className={`text-sm font-medium ${getDifficultyColor(exp.description)}`}>
                        {difficulty} • {getDifficultyLabel(exp.description)}
                      </p>
                    </div>
                  )}
                  {processingTime && processingTime !== 'N/A' && (
                    <div className="bg-zinc-900/50 rounded-xl p-3">
                      <p className="text-xs text-zinc-500 mb-1">Processing Time</p>
                      <p className="text-sm font-medium text-white">{processingTime}</p>
                    </div>
                  )}
                </div>

                {/* Experience Text */}
                <div className="space-y-3 mb-4">
                  {entryExperience && (
                    <div>
                      <p className="text-xs font-semibold text-zinc-400 mb-1">Entry/Exit Experience</p>
                      <p className="text-sm text-zinc-300 leading-relaxed">{entryExperience}</p>
                    </div>
                  )}
                  {tips && (
                    <div>
                      <p className="text-xs font-semibold text-zinc-400 mb-1">Tips & Advice</p>
                      <p className="text-sm text-zinc-300 leading-relaxed">{tips}</p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-zinc-700/50">
                  <div className="text-xs text-zinc-500">
                    by {exp.author_name || 'Anonymous'}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVote(exp.id)}
                      disabled={votedExperiences.has(exp.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-zinc-900/50 hover:bg-emerald-500/10 text-zinc-400 hover:text-emerald-400 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                      </svg>
                      <span>{exp.helpful_count || 0} Helpful</span>
                    </button>
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
