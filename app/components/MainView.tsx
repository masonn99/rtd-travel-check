'use client'

import { useState } from 'react'
import Header from './Header'
import Footer from './Footer'
import WorldGlobe from './Globe'
import TableView from './TableView'
import ExperiencesView from './ExperiencesView'
import { Experience, ExperienceStats } from '../actions/experiences'
import { CountryData } from '../actions/countries'

interface MainViewProps {
  initialExperiences: Experience[]
  initialStats: ExperienceStats
  initialCountries: CountryData[]
}

export default function MainView({ initialExperiences, initialStats, initialCountries }: MainViewProps) {
  const [currentView, setCurrentView] = useState('globe')

  const renderView = () => {
    switch (currentView) {
      case 'globe':
        return <WorldGlobe countries={initialCountries} />
      case 'table':
        return <TableView onViewChange={setCurrentView} countries={initialCountries} />
      case 'experiences':
        return <ExperiencesView initialExperiences={initialExperiences} initialStats={initialStats} />
      default:
        return <WorldGlobe countries={initialCountries} />
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
