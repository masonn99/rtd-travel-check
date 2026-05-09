'use client'

import { useState, useEffect } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import BottomNav from './components/BottomNav'
import WorldGlobe from './components/Globe'
import TableView from './components/TableView'
import ExperiencesView from './components/ExperiencesView'

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
