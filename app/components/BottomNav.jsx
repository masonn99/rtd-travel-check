'use client'

import { GlobeIcon, TableIcon, ExperiencesIcon } from './Icons';

const tabs = [
  { id: 'globe', label: 'Globe', icon: GlobeIcon },
  { id: 'table', label: 'Directory', icon: TableIcon },
  { id: 'experiences', label: 'Stories', icon: ExperiencesIcon },
];

const BottomNav = ({ currentView, onViewChange }) => {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800/70"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const active = currentView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onViewChange(tab.id)}
              className="flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all duration-200"
            >
              <div className={`flex items-center justify-center w-10 h-7 rounded-lg transition-all duration-200 ${active ? 'bg-blue-600/20' : ''}`}>
                <tab.icon className={`h-5 w-5 transition-colors duration-200 ${active ? 'text-blue-400' : 'text-zinc-500'}`} />
              </div>
              <span className={`text-[10px] font-semibold tracking-wide transition-colors duration-200 ${active ? 'text-blue-400' : 'text-zinc-600'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
