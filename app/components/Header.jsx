import { GlobeIcon, TableIcon, TelegramIcon, ExperiencesIcon } from './Icons';

const Header = ({ onViewChange, currentView }) => {
  return (
    <header className="w-full bg-zinc-950/50 backdrop-blur-2xl border-b border-zinc-800/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Title */}
          <div className="flex items-center gap-4">
            <div className="relative group cursor-pointer" onClick={() => onViewChange('globe')}>
               <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
               <div className="relative bg-zinc-900 ring-1 ring-zinc-800 rounded-xl p-2.5 flex items-center justify-center shadow-2xl">
                  <span className="text-xl">✈️</span>
               </div>
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black text-white tracking-tight uppercase leading-none">
                RTD <span className="text-blue-500">Travel</span> Check
              </h1>
            </div>
          </div>

          {/* Centered Navigation Tabs - Desktop */}
          <nav className="hidden md:flex items-center">
            <div className="flex p-1 bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-zinc-800/50 shadow-inner">
              {[
                { id: 'globe', label: 'Globe', icon: GlobeIcon },
                { id: 'table', label: 'Directory', icon: TableIcon },
                { id: 'experiences', label: 'Community', icon: ExperiencesIcon },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onViewChange(tab.id)}
                  className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                    currentView === tab.id
                      ? 'bg-blue-600 text-white shadow-[0_0_20px_-5px_rgba(37,99,235,0.5)]'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <tab.icon className={`h-4 w-4 ${currentView === tab.id ? 'text-white' : 'text-zinc-500'}`} />
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>

          {/* Social / CTA */}
          <div className="flex items-center">
            <a
              href="https://t.me/+hgENDIRxoTs0NGQx"
              target="_blank"
              rel="noreferrer"
              className="group relative inline-flex items-center justify-center p-0.5 overflow-hidden rounded-xl font-bold transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-600 to-cyan-500 group-hover:from-blue-500 group-hover:to-cyan-400"></span>
              <span className="relative px-4 py-2 bg-zinc-950 rounded-[10px] transition-all duration-200 group-hover:bg-opacity-0">
                <div className="flex items-center gap-2">
                  <TelegramIcon className="h-3.5 w-3.4 text-white" />
                  <span className="text-[10px] sm:text-xs font-black text-white uppercase tracking-widest">Join Community</span>
                </div>
              </span>
            </a>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="md:hidden flex items-center justify-center pb-4 pt-1">
          <div className="flex w-full p-1 bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-zinc-800/50 shadow-inner">
            {[
              { id: 'globe', label: 'Globe', icon: GlobeIcon },
              { id: 'table', label: 'List', icon: TableIcon },
              { id: 'experiences', label: 'Stories', icon: ExperiencesIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => onViewChange(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                  currentView === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-zinc-500'
                }`}
              >
                <tab.icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
