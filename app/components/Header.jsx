import { GlobeIcon, TableIcon, TelegramIcon, ExperiencesIcon } from './Icons';

const Header = ({ onViewChange, currentView }) => {
  return (
    <header className="w-full bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <button
            onClick={() => onViewChange('globe')}
            className="flex items-center gap-3 group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30 group-hover:shadow-blue-600/50 transition-shadow">
              <span className="text-sm">✈️</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-bold text-white tracking-tight">RTD</span>
              <span className="text-sm font-bold text-blue-400 tracking-tight"> Travel</span>
              <span className="text-sm font-bold text-zinc-400 tracking-tight"> Check</span>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center">
            <div className="flex p-1 bg-zinc-900/60 border border-zinc-800/60 rounded-xl gap-0.5">
              {[
                { id: 'globe', label: 'Globe', icon: GlobeIcon },
                { id: 'table', label: 'Directory', icon: TableIcon },
                { id: 'experiences', label: 'Community', icon: ExperiencesIcon },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onViewChange(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    currentView === tab.id
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                  }`}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>

          {/* CTA */}
          <a
            href="https://t.me/+hgENDIRxoTs0NGQx"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3 py-2 sm:px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-all duration-200 shadow-sm shadow-blue-600/30 hover:shadow-blue-600/50"
          >
            <TelegramIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Join Community</span>
            <span className="sm:hidden">Join</span>
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
