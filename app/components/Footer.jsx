const Footer = ({ onViewChange }) => {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-zinc-800/60 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Main grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">

          {/* Col 1 — Brand + mission */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm shadow-blue-600/30 flex-shrink-0">
                <span className="text-xs">✈️</span>
              </div>
              <span className="text-sm font-bold text-white">RTD Travel Check</span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-[220px]">
              Visa information for US Refugee Travel Document (I-131 / I-571) holders, built by the community — for the community.
            </p>
            <div className="flex items-center gap-1.5 mt-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[11px] text-zinc-600">Data updated June 2026</span>
            </div>
          </div>

          {/* Col 2 — Navigate */}
          <div>
            <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest mb-3">Explore</p>
            <ul className="space-y-2">
              {[
                { label: '🌍  Visa Map', view: 'globe' },
                { label: '🗂️  Country Directory', view: 'table' },
                { label: '💬  Community Stories', view: 'experiences' },
                { label: '✨  AI Assistant', view: 'chat' },
              ].map(item => (
                <li key={item.view}>
                  <button
                    onClick={() => onViewChange?.(item.view)}
                    className="text-xs text-zinc-500 hover:text-zinc-200 transition-colors"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Community + disclaimer */}
          <div>
            <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest mb-3">Community</p>
            <a
              href="https://t.me/+hgENDIRxoTs0NGQx"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 rounded-lg text-xs text-blue-400 font-medium transition-colors mb-4"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-1.97 9.269c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.08 14.63l-2.948-.924c-.64-.203-.653-.64.136-.953l11.5-4.432c.535-.194 1.003.13.795.927z"/>
              </svg>
              Join our Telegram group
            </a>
            <div className="p-2.5 bg-zinc-900/50 border border-zinc-800/60 rounded-lg">
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                <span className="text-amber-400 font-semibold">Important:</span> This site is community-sourced and not affiliated with any government agency. Visa policies change — always verify with the official embassy or consulate before making travel plans.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-zinc-800/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-zinc-700">
            © {year} RTD Travel Check · Community project · Not legal or immigration advice
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/masonn99/rtd-travel-check"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-zinc-700 hover:text-zinc-400 transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://t.me/+hgENDIRxoTs0NGQx"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-zinc-700 hover:text-zinc-400 transition-colors"
            >
              Telegram
            </a>
          </div>
        </div>

      </div>
    </footer>
  )
}

export default Footer
