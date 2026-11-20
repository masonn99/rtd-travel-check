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
const ChatView = dynamic(() => import('./components/ChatView'), {
  ssr: false,
  loading: () => <ViewLoader />,
})

function ViewLoader() {
  return (
    <div className="flex items-center justify-center py-32">
      <div className="h-6 w-6 rounded-full border-2 border-line border-t-accent animate-spin" role="status" aria-label="Loading" />
    </div>
  )
}

interface ExperienceData {
  experiences: Experience[]
  stats: { total: number; countries: number; helpfulVotes: number; thisMonth: number }
}

export default function Home() {
  const [currentView, setCurrentView] = useState('globe')
  // Country to open when arriving in the Directory from the map
  const [focusCountry, setFocusCountry] = useState<string | null>(null)

  const changeView = useCallback((view: string) => {
    setFocusCountry(null)
    setCurrentView(view)
    window.scrollTo({ top: 0 })
  }, [])

  const openCountry = useCallback((name: string) => {
    setFocusCountry(name)
    setCurrentView('table')
  }, [])

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
        return <WorldGlobe onOpenCountry={openCountry} />
      case 'table':
        return <TableView focusCountry={focusCountry} />
      case 'experiences':
        return (
          <ExperiencesView
            initialData={experienceData}
            loading={experienceLoading}
            onRefresh={fetchExperienceData}
          />
        )
      case 'chat':
        return <ChatView />
      default:
        return <WorldGlobe onOpenCountry={openCountry} />
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <Header
        currentView={currentView}
        onViewChange={changeView}
      />
      <main className={`flex-grow ${currentView === 'chat' ? 'pb-[calc(56px+env(safe-area-inset-bottom))] md:pb-0' : 'pb-24 md:pb-8'}`}>
        {renderView()}
      </main>
      {currentView !== 'chat' && (
        <div className="hidden md:block">
          <Footer />
        </div>
      )}
      <BottomNav currentView={currentView} onViewChange={changeView} />
    </div>
  )
}
