'use client'

import { useState, useEffect } from 'react'
import { getExperienceStats } from '../actions/experiences'
import ExperienceForm from './ExperienceForm'
import ExperienceList from './ExperienceList'

const ExperiencesView = () => {
  const [refreshKey, setRefreshKey] = useState(0)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    countries: 0,
    helpfulVotes: 0,
    thisMonth: 0
  })

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      try {
        const data = await getExperienceStats()
        setStats(data)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [refreshKey])

  const handleSubmitSuccess = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="py-8 text-white animate-fadeIn">
      {/* Modern Bento Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="md:col-span-2 bg-gradient-to-br from-zinc-800/40 to-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-3xl p-8 flex flex-col justify-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Community <span className="text-blue-500">Experiences</span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 max-w-xl leading-relaxed">
            Real stories from RTD holders worldwide. Discover travel tips, visa hurdles, and success stories shared by the community.
          </p>
        </div>
        
        <div className="bg-blue-600 rounded-3xl p-8 flex flex-col justify-between items-start overflow-hidden relative group transition-transform hover:scale-[1.02] duration-300 shadow-xl shadow-blue-600/20">
          <div className="absolute -right-8 -bottom-8 text-blue-500/20 group-hover:scale-110 transition-transform duration-500">
             <svg width="160" height="160" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
             </svg>
          </div>
          <div>
            <h3 className="text-blue-100 font-medium mb-1 uppercase tracking-wider text-xs">Join the Community</h3>
            <p className="text-white text-xl font-bold leading-tight">Share your journey to help fellow travelers.</p>
          </div>
          <button 
            onClick={() => document.getElementById('experience-form')?.scrollIntoView({ behavior: 'smooth' })}
            className="mt-6 bg-white text-blue-600 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors shadow-xl"
          >
            Submit Story
          </button>
        </div>
      </div>

      {/* Bento Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {[
          { label: 'Total Stories', value: stats.total, color: 'blue', icon: '📝' },
          { label: 'Countries', value: stats.countries, color: 'emerald', icon: '🌍' },
          { label: 'Helpful Votes', value: stats.helpfulVotes, color: 'purple', icon: '✨' },
          { label: 'New This Month', value: stats.thisMonth, color: 'amber', icon: '📈' },
        ].map((stat, i) => (
          <div 
            key={stat.label} 
            className="bg-zinc-800/30 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-5 hover:bg-zinc-800/50 transition-all duration-300 animate-slideUp"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xl">{stat.icon}</span>
              {loading && <div className="h-4 w-4 rounded-full border-2 border-zinc-700 border-t-blue-500 animate-spin"></div>}
            </div>
            <div className={`text-2xl sm:text-3xl font-black text-white mb-1`}>
              {loading ? '...' : stat.value}
            </div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: List */}
        <div className="lg:col-span-8 order-2 lg:order-1">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              Recent Stories
              <span className="bg-zinc-800 text-zinc-400 text-xs px-2 py-1 rounded-md font-normal">Newest first</span>
            </h2>
          </div>
          <ExperienceList key={refreshKey} />
        </div>

        {/* Right Column: Form Sticky */}
        <div className="lg:col-span-4 order-1 lg:order-2">
          <div id="experience-form" className="lg:sticky lg:top-24 space-y-6">
            <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-[2rem] overflow-hidden shadow-2xl">
              <div className="bg-zinc-800/50 px-6 py-5 border-b border-zinc-800/50 flex items-center justify-between">
                <h3 className="font-bold text-lg">Share Experience</h3>
                <span className="text-blue-500 text-xs font-black uppercase tracking-widest">v2.0</span>
              </div>
              <div className="p-6">
                <ExperienceForm onSuccess={handleSubmitSuccess} embedded={true} />
              </div>
            </div>
            
            <div className="p-6 bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 rounded-[2rem]">
              <h4 className="text-amber-400 font-bold text-sm mb-2 flex items-center gap-2">
                <span>💡</span> Pro Tip
              </h4>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Be specific about which Embassy you applied at and the exact date of travel. This helps others identify current trends!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExperiencesView
