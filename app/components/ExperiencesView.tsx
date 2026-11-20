'use client'

import { useState } from 'react'
import { type Experience } from '../actions/experiences'
import ExperienceForm from './ExperienceForm'
import CountryStoriesGrid, { type ReportSummaryRow } from './CountryStoriesGrid'
import { useReportSummaryState } from './CountryList'

interface Props {
  initialData: {
    experiences: Experience[]
    stats: { total: number; countries: number; helpfulVotes: number; thisMonth: number }
  } | null
  loading: boolean
  onRefresh: () => void
}

const ExperiencesView = ({ onRefresh }: Props) => {
  const [refreshKey, setRefreshKey] = useState(0)
  const { summary: raw, loaded } = useReportSummaryState(refreshKey)
  const summary = raw as Record<string, ReportSummaryRow>
  // Counts come from the same published reports the list shows, so they always agree.
  const rows = Object.values(summary)
  const reportTotal = rows.reduce((n, r) => n + r.reports, 0)

  const handleSubmitSuccess = () => {
    // Re-fetch page data and the per-country summary; the action busts the server cache.
    onRefresh()
    setRefreshKey(k => k + 1)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 md:pt-10 pb-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-[30px] md:text-[34px] leading-tight font-bold tracking-[-0.025em] text-ink">Stories</h1>
          <p className="text-[15px] text-ink-2 mt-1 max-w-[60ch]">
            {loaded && reportTotal > 0
              ? `${reportTotal} reports from RTD holders about ${rows.length} countries. Each one is dated, so you can see how current it is.`
              : 'First-hand reports from RTD holders, dated so you can see how current they are.'}
          </p>
        </div>
        <a
          href="#experience-form"
          className="lg:hidden self-start sm:self-auto inline-flex items-center h-9 px-4 rounded-full bg-accent text-accent-ink text-[14px] font-semibold"
        >
          Share your trip
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        <div className="lg:col-span-7">
          <CountryStoriesGrid summary={summary} loaded={loaded} />
        </div>

        <aside className="lg:col-span-5">
          <div id="experience-form" className="lg:sticky lg:top-20 scroll-mt-20">
            <div className="bg-surface border border-line/70 rounded-xl">
              <div className="px-5 pt-5">
                <h2 className="text-[19px] font-semibold tracking-[-0.01em] text-ink">Share your trip</h2>
                <p className="text-[14px] text-ink-2 mt-1">
                  Name the embassy you applied at and when you traveled. Specifics help the next holder most.
                </p>
              </div>
              <div className="p-5">
                <ExperienceForm onSuccess={handleSubmitSuccess} embedded={true} />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default ExperiencesView
