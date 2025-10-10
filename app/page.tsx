'use client'

import { useState } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import WorldGlobe from './components/Globe'
import TableView from './components/TableView'
import ExperiencesView from './components/ExperiencesView'

export default function Home() {
  const [currentView, setCurrentView] = useState('globe')

  const renderView = () => {
    switch (currentView) {
      case 'globe':
        return <WorldGlobe />
      case 'table':
        return <TableView onViewChange={setCurrentView} />
      case 'experiences':
        return <ExperiencesView />
      default:
        return <WorldGlobe />
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      <Header
        currentView={currentView}
        onViewChange={(view: string) => setCurrentView(view)}
      />
      <main className="flex-grow pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {renderView()}
        </div>
      </main>
      <Footer />
    </div>
  )
}
