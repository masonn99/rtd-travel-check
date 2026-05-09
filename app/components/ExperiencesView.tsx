'use client'

import { useState, useEffect } from 'react'
import { getExperiencesWithStats, type Experience } from '../actions/experiences'
import ExperienceForm from './ExperienceForm'
import ExperienceList from './ExperienceList'

const ExperiencesView = () => {
  const [refreshKey, setRefreshKey] = useState(0)
  const [loading, setLoading] = useState(true)
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [stats, setStats] = useState({
    total: 0,
    countries: 0,
    helpfulVotes: 0,
    thisMonth: 0
  })

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        // Single round-trip: stats + experiences fetched in parallel on the server
        const data = await getExperiencesWithStats()
        setStats(data.stats)
        setExperiences(data.experiences)
      } catch (error) {
        console.error('Failed to fetch experiences:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [refreshKey])

  const handleSubmitSuccess = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="py-6 text-white animate-fadeIn">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Community <span className="text-blue-400">Stories</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Real experiences from RTD holders worldwide
          </p>
        </div>
        <button
          onClick={() => document.getElementById('experience-form')?.scrollIntoView({ behavior: 'smooth' })}
          className="flex-shrink-0 self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all shadow-sm shadow-blue-600/30"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Share Story
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Stories', value: stats.total, icon: '📝' },
          { label: 'Countries', value: stats.countries, icon: '🌍' },
          { label: 'Helpful Votes', value: stats.helpfulVotes, icon: '👍' },
          { label: 'This Month', value: stats.thisMonth, icon: '📈' },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-4 animate-slideUp"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg">{stat.icon}</span>
              {loading && <div className="h-3 w-3 rounded-full border-2 border-zinc-700 border-t-blue-500 animate-spin" />}
            </div>
            <div className="text-2xl font-bold text-white">{loading ? '—' : stat.value}</div>
            <div className="text-[11px] text-zinc-500 font-medium mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Story list — receives experiences as props, no second fetch needed */}
        <div className="lg:col-span-8 order-2 lg:order-1">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              Recent Stories
              <span className="text-[11px] text-zinc-500 font-normal bg-zinc-800/60 px-2 py-0.5 rounded-md">Newest first</span>
            </h2>
          </div>
          <ExperienceList
            key={refreshKey}
            initialExperiences={loading ? null : experiences}
          />
        </div>

        {/* Share form */}
        <div className="lg:col-span-4 order-1 lg:order-2">
          <div id="experience-form" className="lg:sticky lg:top-20 space-y-4">
            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-800/60 flex items-center justify-between bg-zinc-900/60">
                <h3 className="font-semibold text-white">Share Your Experience</h3>
              </div>
              <div className="p-5">
                <ExperienceForm onSuccess={handleSubmitSuccess} embedded={true} />
              </div>
            </div>

            <div className="p-4 bg-amber-500/5 border border-amber-500/15 rounded-xl">
              <p className="text-amber-400 font-semibold text-xs mb-1.5 flex items-center gap-1.5">
                <span>💡</span> Pro Tip
              </p>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Be specific about which Embassy you applied at and the exact date. This helps identify current trends.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExperiencesView
