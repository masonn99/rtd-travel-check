import { GlobeIcon, TableIcon, TelegramIcon, ExperiencesIcon } from './Icons';

const Header = ({ onViewChange, currentView }) => {
  return (
    <header className="w-full bg-gradient-to-b from-zinc-900/95 via-zinc-900/90 to-transparent backdrop-blur-xl border-b border-zinc-800/50 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4 sm:py-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 sm:p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
              <span className="text-xl sm:text-2xl">✈️</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm sm:text-lg md:text-xl font-bold text-white leading-tight">
                <span className="hidden md:inline">Visa Requirements for RTD Holders</span>
                <span className="md:hidden">RTD Visa Guide</span>
              </h1>
              <p className="text-[10px] sm:text-xs text-zinc-400 hidden sm:block">I-571 Travel Document (US)</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="https://t.me/+hgENDIRxoTs0NGQx"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-zinc-800/50 backdrop-blur-sm hover:bg-zinc-700/50 rounded-xl text-xs sm:text-sm font-medium text-white border border-zinc-700/50 shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
            >
              <TelegramIcon className="h-4 w-4" />
              <span className="hidden md:inline">Join Community</span>
              <span className="md:hidden hidden sm:inline">Join</span>
            </a>
          </div>
        </div>

        <div className="pb-4 sm:pb-6 text-center">
          <div className="inline-flex flex-col items-center gap-3 sm:gap-4 px-4 py-3 sm:py-4 rounded-2xl bg-zinc-800/30 backdrop-blur-sm border border-zinc-700/30">
            <p className="text-xs sm:text-sm md:text-base text-zinc-300 font-medium">
              Community-sourced visa information for US Refugee Travel Document holders
            </p>
            <div className="flex items-center gap-2 text-[10px] sm:text-xs text-zinc-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Updated regularly
              </span>
              <span className="hidden sm:inline">•</span>
              <span>Always verify with official sources</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="pb-4 sm:pb-6">
          <div className="flex items-center justify-center overflow-x-auto">
            <div className="inline-flex bg-zinc-900/50 backdrop-blur-sm rounded-xl p-1.5 border border-zinc-700/50 shadow-lg">
              <button
                onClick={() => onViewChange('globe')}
                className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  currentView === 'globe'
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                <GlobeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Globe</span>
              </button>
              <button
                onClick={() => onViewChange('table')}
                className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  currentView === 'table'
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                <TableIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Table</span>
              </button>
              <button
                onClick={() => onViewChange('experiences')}
                className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  currentView === 'experiences'
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                <ExperiencesIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Experiences</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
