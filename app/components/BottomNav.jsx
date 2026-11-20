'use client'

import { NAV_TABS } from './Header';

const BottomNav = ({ currentView, onViewChange }) => {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-line"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Main"
    >
      <div className="flex items-stretch justify-around h-[56px]">
        {NAV_TABS.map(({ id, label, Icon }) => {
          const active = currentView === id;
          return (
            <button
              key={id}
              onClick={() => onViewChange(id)}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-col items-center justify-center gap-[3px] flex-1 transition-colors ${
                active ? 'text-accent' : 'text-ink-3'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-[11px] font-medium leading-none">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
