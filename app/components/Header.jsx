import { TelegramIcon, GlobeIcon, TableIcon, ExperiencesIcon, ChatIcon, PlaneIcon } from './Icons';

export const NAV_TABS = [
  { id: 'globe',       label: 'Globe',     Icon: GlobeIcon },
  { id: 'table',       label: 'Directory', Icon: TableIcon },
  { id: 'experiences', label: 'Stories',   Icon: ExperiencesIcon },
  { id: 'chat',        label: 'AI Chat',   Icon: ChatIcon },
];

const Header = ({ onViewChange, currentView }) => {
  return (
    <header className="w-full bg-surface border-b border-line sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 gap-4">
          <button
            onClick={() => onViewChange('globe')}
            className="flex items-center gap-2.5 rounded-md -ml-1 px-1 py-1"
            aria-label="RTD Travel Check home"
          >
            <span className="w-7 h-7 rounded-[7px] bg-accent text-accent-ink flex items-center justify-center">
              <PlaneIcon className="w-[18px] h-[18px]" />
            </span>
            <span className="text-[15px] font-semibold tracking-[-0.01em] text-ink">RTD Travel Check</span>
          </button>

          <nav className="hidden md:flex items-center self-stretch gap-1" aria-label="Main">
            {NAV_TABS.map(({ id, label, Icon }) => {
              const active = currentView === id;
              return (
                <button
                  key={id}
                  onClick={() => onViewChange(id)}
                  aria-current={active ? 'page' : undefined}
                  className={`relative flex items-center gap-1.5 px-3 h-full text-sm font-medium transition-colors ${
                    active ? 'text-ink' : 'text-ink-3 hover:text-ink'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                  <span
                    className={`absolute left-3 right-3 -bottom-px h-[2px] rounded-full transition-colors ${active ? 'bg-accent' : 'bg-transparent'}`}
                  />
                </button>
              );
            })}
          </nav>

          <a
            href="https://t.me/+hgENDIRxoTs0NGQx"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 h-8 px-3 rounded-full bg-fill text-ink text-[13px] font-semibold hover:bg-line transition-colors"
          >
            <TelegramIcon className="h-4 w-4 text-[#229ED9]" />
            <span className="hidden sm:inline">Join the group</span>
            <span className="sm:hidden">Join</span>
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
