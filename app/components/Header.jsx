'use client'

import { useEffect, useRef, useState } from 'react'

const TABS = [
  { id: 'globe',       label: 'Globe' },
  { id: 'table',       label: 'Directory' },
  { id: 'experiences', label: 'Community' },
  { id: 'chat',        label: 'AI Chat' },
]

const Header = ({ onViewChange, currentView }) => {
  const tabRefs = useRef([])
  const [line, setLine] = useState({ left: 0, width: 0, ready: false })

  useEffect(() => {
    const idx = TABS.findIndex(t => t.id === currentView)
    const el = tabRefs.current[idx]
    if (el) {
      setLine({ left: el.offsetLeft, width: el.offsetWidth, ready: true })
    }
  }, [currentView])

  return (
    <header className="w-full bg-zinc-950/60 backdrop-blur-xl border-b border-zinc-800/40 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-stretch justify-between h-14 sm:h-16">

          {/* Logo */}
          <button
            onClick={() => onViewChange('globe')}
            className="flex items-center gap-3 group flex-shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center animate-glow-pulse">
              <span className="text-sm">✈️</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-bold text-white tracking-tight">RTD</span>
              <span className="text-sm font-bold text-blue-400 tracking-tight"> Travel</span>
              <span className="text-sm font-bold text-zinc-400 tracking-tight"> Check</span>
            </div>
          </button>

          {/* Desktop nav — bare text, no container */}
          <nav className="hidden md:flex items-stretch relative">
            {/* Sliding glow underline */}
            {line.ready && (
              <div
                className="absolute bottom-0 h-px bg-blue-400 transition-all duration-300 ease-out"
                style={{
                  left: line.left,
                  width: line.width,
                  boxShadow: '0 0 12px 3px rgba(96, 165, 250, 0.8)',
                }}
              />
            )}

            {TABS.map((tab, i) => (
              <button
                key={tab.id}
                ref={el => { tabRefs.current[i] = el }}
                onClick={() => onViewChange(tab.id)}
                className={`px-5 text-sm font-medium tracking-wide transition-colors duration-200 ${
                  currentView === tab.id
                    ? 'text-white'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Spacer keeps logo left + nav centered */}
          <div className="hidden md:block w-28 flex-shrink-0" />

        </div>
      </div>
    </header>
  )
}

export default Header
