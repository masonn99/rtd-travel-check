import { GlobeIcon, TableIcon, TelegramIcon } from './Icons';

const Header = ({ onViewChange, currentView }) => {
  return (
    <header className="w-full bg-gradient-to-b from-zinc-900 to-zinc-950/80 backdrop-blur-sm border-b border-zinc-800/50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between py-3 sm:py-4">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-xl font-bold text-white flex items-center gap-1 sm:gap-2">
              <span className="bg-blue-600/20 p-1 rounded-lg">✈️</span>
              <span className="hidden sm:inline">Visa Requirements for Refugee Travel Document Holders</span>
              <span className="sm:hidden">RTD Visa Info</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex bg-zinc-800 rounded-lg p-1">
              <button
                onClick={() => onViewChange('globe')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs ${currentView === 'globe' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:bg-zinc-700'}`}
              >
                <GlobeIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Globe</span>
              </button>
              <button
                onClick={() => onViewChange('table')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs ${currentView === 'table' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:bg-zinc-700'}`}
              >
                <TableIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>
            <a
              href="https://t.me/+hgENDIRxoTs0NGQx"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs text-white"
            >
              <TelegramIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Telegram</span>
            </a>
          </div>
        </div>

        <div className="py-3 sm:py-6 md:py-8 text-center">
          <p className="text-xs sm:text-base md:text-lg text-zinc-300 max-w-2xl mx-auto px-2">
            Visa requirements for I-571 Holders 🇺🇸
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;
