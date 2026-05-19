'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Header from './components/Header'
import Footer from './components/Footer'
import BottomNav from './components/BottomNav'

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

export default function Home() {
  const [currentView, setCurrentView] = useState('globe')

  useEffect(() => {
    if (window.innerWidth < 768) {
      setCurrentView('table')
    }
  }, [])

  const renderView = () => {
    switch (currentView) {
      case 'globe':
        return <WorldGlobe onViewChange={setCurrentView} />
      case 'table':
        return <TableView />
      case 'experiences':
        return <ExperiencesView />
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
