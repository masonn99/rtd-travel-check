'use client'

import { useState, useEffect } from 'react'
import { getExperienceStats } from '../actions/experiences'
import ExperienceForm from './ExperienceForm'
import ExperienceList from './ExperienceList'

const ExperiencesView = () => {
  const [refreshKey, setRefreshKey] = useState(0)
  const [stats, setStats] = useState({
    total: 0,
    countries: 0,
    helpfulVotes: 0,
    thisMonth: 0
  })

  useEffect(() => {
    // Fetch stats from server
    const fetchStats = async () => {
      try {
        const data = await getExperienceStats()
        setStats(data)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
        // Set default stats when database is unavailable
        setStats({
          total: 0,
          countries: 0,
          helpfulVotes: 0,
          thisMonth: 0
        })
      }
    }

    fetchStats()
  }, [refreshKey])

  const handleSubmitSuccess = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-white">
      {/* Header */}
      <div className="text-center mb-8 animate-fadeIn">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">
          Community Travel Experiences
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto">
          Real experiences from RTD holders like you. Share your journey and help others plan their travels.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 animate-slideUp">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-4 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
          <div className="text-2xl sm:text-3xl font-bold text-blue-400 mb-1">
            {stats.total}
          </div>
          <div className="text-xs text-blue-300/70">Total Experiences</div>
        </div>
        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-xl p-4 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
          <div className="text-2xl sm:text-3xl font-bold text-emerald-400 mb-1">
            {stats.countries}
          </div>
          <div className="text-xs text-emerald-300/70">Countries Covered</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-4 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
          <div className="text-2xl sm:text-3xl font-bold text-purple-400 mb-1">
            {stats.helpfulVotes}
          </div>
          <div className="text-xs text-purple-300/70">Helpful Votes</div>
        </div>
        <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-xl p-4 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300">
          <div className="text-2xl sm:text-3xl font-bold text-amber-400 mb-1">
            {stats.thisMonth}
          </div>
          <div className="text-xs text-amber-300/70">This Month</div>
        </div>
      </div>

      {/* Submission Form */}
      <div className="mb-8 animate-slideUp">
        <ExperienceForm onSuccess={handleSubmitSuccess} />
      </div>

      {/* Experience List */}
      <div className="animate-slideUp">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Recent Experiences</h2>
          <div className="text-sm text-zinc-500">
            Sorted by newest first
          </div>
        </div>
        <ExperienceList key={refreshKey} />
      </div>
    </div>
  )
}

export default ExperiencesView
