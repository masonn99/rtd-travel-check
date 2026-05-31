'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import Header from './components/Header'
import Footer from './components/Footer'
import BottomNav from './components/BottomNav'
import { getExperiencesWithStats, type Experience } from './actions/experiences'

// Lazy-load each view — they are only downloaded when the user navigates to that tab.
// This keeps the initial bundle small (the map library alone is ~1 MB).
const WorldGlobe = dynamic(() => import('./components/Globe'), {
  ssr: false,
  loading: () => <ViewLoader />,
})
const TableView = dynamic(() => import('./components/TableView'), {
  ssr: false,
  loading: () => <ViewLoader />,
})
const ExperiencesView = dynamic(() => import('./components/ExperiencesView'), {
  ssr: false,
  loading: () => <ViewLoader />,
})

function ViewLoader() {
  return (
    <div className="flex items-center justify-center py-32">
      <div className="h-6 w-6 rounded-full border-2 border-zinc-700 border-t-blue-500 animate-spin" />
    </div>
  )
}

interface ExperienceData {
  experiences: Experience[]
  stats: { total: number; countries: number; helpfulVotes: number; thisMonth: number }
}

export default function Home() {
  const [currentView, setCurrentView] = useState('globe')

  // Fetched once on first Community visit — survives tab switching.
  // ExperiencesView receives this as props instead of fetching itself.
  const [experienceData, setExperienceData] = useState<ExperienceData | null>(null)
  const [experienceLoading, setExperienceLoading] = useState(false)

  useEffect(() => {
    if (window.innerWidth < 768) {
      setCurrentView('table')
    }
  }, [])

  // Fetch (or re-fetch) experience data. Called on page load and after new submissions.
  const fetchExperienceData = useCallback(async () => {
    setExperienceLoading(true)
    try {
      const data = await getExperiencesWithStats()
      setExperienceData(data)
    } catch (e) {
      console.error('Failed to fetch experiences:', e)
    } finally {
      setExperienceLoading(false)
    }
  }, [])

  // Prefetch in the background as soon as the page loads — data is tiny (~50 rows)
  // and will be ready in state before the user ever clicks the Community tab.
  useEffect(() => {
    fetchExperienceData()
  }, [])

  const renderView = () => {
    switch (currentView) {
      case 'globe':
        return <WorldGlobe onViewChange={setCurrentView} />
      case 'table':
        return <TableView />
      case 'experiences':
        return (
          <ExperiencesView
            initialData={experienceData}
            loading={experienceLoading}
            onRefresh={fetchExperienceData}
          />
        )
      default:
        return <WorldGlobe onViewChange={setCurrentView} />
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      <Header
        currentView={currentView}
        onViewChange={(view: string) => setCurrentView(view)}
      />
      <main className="flex-grow pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {renderView()}
        </div>
      </main>
      <div className="hidden md:block">
        <Footer />
      </div>
      <BottomNav currentView={currentView} onViewChange={setCurrentView} />
    </div>
  )
}
