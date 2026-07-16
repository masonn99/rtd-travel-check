'use client'

const TABS = [
  {
    id: 'globe',
    label: 'Globe',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 004 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'table',
    label: 'Directory',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M3 10h18M3 14h18M10 3v18M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6z" />
      </svg>
    ),
  },
  {
    id: 'experiences',
    label: 'Community',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
      </svg>
    ),
  },
  {
    id: 'chat',
    label: 'AI Chat',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
]

const FloatingDock = ({ currentView, onViewChange }) => {
  return (
    <nav
      className="hidden md:flex fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
      aria-label="Main navigation"
    >
      {/* Outer glow ring */}
      <div className="absolute inset-0 rounded-2xl bg-blue-500/10 blur-xl scale-110 pointer-events-none" />

      {/* Dock pill */}
      <div className="relative flex items-center gap-1 px-2 py-2 bg-zinc-900/80 backdrop-blur-2xl border border-zinc-700/50 rounded-2xl shadow-2xl shadow-black/60"
        style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.04) inset, 0 25px 50px -10px rgba(0,0,0,0.7)' }}
      >
        {TABS.map((tab) => {
          const active = currentView === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onViewChange(tab.id)}
              className={`relative flex flex-col items-center gap-1.5 px-6 py-2.5 rounded-xl transition-all duration-200 group ${
                active ? 'text-blue-400' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {/* Active background */}
              {active && (
                <div className="absolute inset-0 rounded-xl bg-blue-500/10 border border-blue-500/20" />
              )}

              {/* Icon */}
              <div className={`relative z-10 transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-105'}`}>
                {tab.icon}
              </div>

              {/* Label */}
              <span className={`relative z-10 text-[10px] font-semibold tracking-wide transition-colors duration-200 ${
                active ? 'text-white' : 'text-zinc-600 group-hover:text-zinc-400'
              }`}>
                {tab.label}
              </span>

              {/* Active glow dot */}
              {active && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-400 shadow-sm shadow-blue-400/80" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default FloatingDock
