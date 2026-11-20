import { useState, useMemo, useEffect, useRef } from 'react';
import embassyData from '../../embassies.json';
import { STATUS_ORDER, STATUS_LABEL } from '../lib/visa';
import { COUNTRIES, STATUS_COUNTS } from '../lib/countries';
import ExperienceList from './ExperienceList';
import { CountryRow, SectionTitle, useDisclosure, useReportSummary, panelIdFor } from './CountryList';
import { SearchIcon, ClearIcon, ExternalIcon, PhoneIcon, PinIcon } from './Icons';

const embassyIndex = Object.fromEntries(embassyData.map(e => [e.country, e]));

// ─── Country detail ────────────────────────────────────────────────────────
const EmbassyRows = ({ embassy }) => {
  const rows = [
    embassy.website && {
      key: 'web',
      href: embassy.website,
      external: true,
      Icon: ExternalIcon,
      text: embassy.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''),
      accent: true,
    },
    embassy.phone && { key: 'tel', href: `tel:${embassy.phone}`, Icon: PhoneIcon, text: embassy.phone, accent: true },
    embassy.address && { key: 'addr', Icon: PinIcon, text: embassy.address },
  ].filter(Boolean);

  return (
    <div className="border-t border-line">
      <p className="pt-2.5 pb-2 text-[15px] font-medium text-ink leading-snug">{embassy.embassy_name}</p>
      {embassy.note && (
        <p className="pb-2.5 text-[14px] leading-relaxed text-ink-2">{embassy.note}</p>
      )}
      {rows.map(({ key, href, external, Icon, text, accent }) => {
        const inner = (
          <>
            <Icon className="w-4 h-4 flex-none mt-[2px] text-ink-3" />
            <span className={`min-w-0 break-words ${accent ? 'text-accent' : 'text-ink-2'}`}>{text}</span>
          </>
        );
        const cls = 'flex items-start gap-2.5 py-2.5 border-t border-line text-[15px] leading-snug';
        return href ? (
          <a key={key} href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} className={`${cls} hover:text-ink transition-colors`}>
            {inner}
          </a>
        ) : (
          <div key={key} className={cls}>{inner}</div>
        );
      })}
    </div>
  );
};

const CountryDetail = ({ country, summary }) => {
  const embassy = embassyIndex[country.name];
  const hasEmbassy = embassy && (embassy.website || embassy.phone || embassy.address);

  return (
    <div className="px-4 pb-5 pt-1 md:pl-[60px] md:pr-6 space-y-5">
      <section>
        <SectionTitle aside="Official baseline">Entry rule</SectionTitle>
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-[15px]">
          <dt className="text-ink-3">Status</dt>
          <dd className="text-ink font-medium">{STATUS_LABEL[country.status]}</dd>
          <dt className="text-ink-3">Max stay</dt>
          <dd className="text-ink">{country.duration || 'Not listed'}</dd>
          {country.notes && (
            <>
              <dt className="text-ink-3">Notes</dt>
              <dd className="text-ink leading-relaxed">{country.notes}</dd>
            </>
          )}
        </dl>
      </section>

      {hasEmbassy && (
        <section>
          <SectionTitle>Embassy in the US</SectionTitle>
          <EmbassyRows embassy={embassy} />
        </section>
      )}

      <section>
        <SectionTitle aside={summary?.reports ? `${summary.reports} from holders` : undefined}>Traveler reports</SectionTitle>
        <ExperienceList filterCountry={country.name} />
      </section>

      <p className="text-[13px] leading-relaxed text-ink-3">
        Rules for RTD holders change and can depend on your case. Confirm with the embassy or your airline before you book.
      </p>
    </div>
  );
};

// ─── View ──────────────────────────────────────────────────────────────────
/** @param {{ focusCountry?: string | null }} props */
const TableView = ({ focusCountry = null }) => {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const { openName, mounted, toggle, openOnly } = useDisclosure(focusCountry);
  const summary = useReportSummary();

  // Show an edge under the search bar only once it is stuck.
  const sentinel = useRef(null);
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting), { rootMargin: '-57px 0px 0px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Arriving from the map: open that country and bring it into view.
  useEffect(() => {
    if (!focusCountry) return;
    openOnly(focusCountry);
    const t = setTimeout(() => {
      document.getElementById(`row-${panelIdFor(focusCountry)}`)?.scrollIntoView({ block: 'start' });
    }, 60);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusCountry]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return COUNTRIES.filter(c =>
      (filter === 'all' || c.status === filter) && (!q || c.name.toLowerCase().includes(q))
    );
  }, [query, filter]);

  const groups = useMemo(() => {
    const out = [];
    for (const c of filtered) {
      const letter = c.name[0].toUpperCase();
      const last = out[out.length - 1];
      if (last && last.letter === letter) last.items.push(c);
      else out.push({ letter, items: [c] });
    }
    return out;
  }, [filtered]);

  const chips = [
    { id: 'all', label: 'All', count: COUNTRIES.length },
    ...STATUS_ORDER.filter(s => STATUS_COUNTS[s]).map(s => ({ id: s, label: STATUS_LABEL[s], count: STATUS_COUNTS[s] })),
  ];

  const reset = () => { setQuery(''); setFilter('all'); };

  return (
    <div className="max-w-3xl mx-auto pb-6">
      <div className="px-4 sm:px-6 pt-5 md:pt-10">
        <h1 className="text-[28px] md:text-[34px] leading-tight font-bold tracking-[-0.025em] text-ink">Directory</h1>
        <p className="text-[15px] text-ink-2 mt-0.5">
          <span className="md:hidden">Visa rules for RTD holders</span>
          <span className="hidden md:inline">Visa rules for US Refugee Travel Document holders in {COUNTRIES.length} countries</span>
        </p>
      </div>

      <div ref={sentinel} aria-hidden="true" />
      {/* Search and filters stay reachable while the list scrolls */}
      <div className={`sticky top-14 z-30 bg-bg px-4 sm:px-6 pt-3 pb-3 transition-shadow ${stuck ? 'shadow-[0_1px_0_rgb(var(--line))]' : ''}`}>
        <label className="relative block">
          <span className="sr-only">Search countries</span>
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-ink-3 pointer-events-none" />
          <input
            type="search"
            inputMode="search"
            autoComplete="off"
            placeholder="Search countries"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-10 rounded-[10px] bg-fill text-[16px] text-ink placeholder:text-ink-3 outline-none focus-visible:outline-none focus:ring-2 focus:ring-accent/40 [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-ink-3 hover:text-ink-2"
            >
              <ClearIcon className="w-[18px] h-[18px]" />
            </button>
          )}
        </label>

        <div className="flex gap-2 overflow-x-auto no-scrollbar mt-3 -mx-4 px-4 sm:mx-0 sm:px-0" role="group" aria-label="Filter by visa status">
          {chips.map(({ id, label, count }) => {
            const active = filter === id;
            return (
              <button
                key={id}
                onClick={() => setFilter(id)}
                aria-pressed={active}
                className={`flex-none flex items-center gap-1.5 h-8 px-3 rounded-full text-[14px] font-medium border transition-colors ${
                  active
                    ? 'bg-accent text-accent-ink border-accent'
                    : 'bg-surface text-ink-2 border-line hover:text-ink'
                }`}
              >
                {label}
                <span className={`tabular-nums ${active ? 'opacity-70' : 'text-ink-3'}`}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 sm:px-6">
        {filtered.length === 0 ? (
          <div className="mt-6 rounded-xl bg-surface border border-line px-6 py-12 text-center">
            <p className="text-[16px] font-medium text-ink">
              No countries match{query ? ` “${query.trim()}”` : ''}
            </p>
            <p className="text-[14px] text-ink-3 mt-1">
              The directory covers {COUNTRIES.length} countries so far. Holders add more through the Telegram group.
            </p>
            <button onClick={reset} className="mt-4 h-9 px-4 rounded-full bg-accent text-accent-ink text-[14px] font-semibold">
              Show all countries
            </button>
          </div>
        ) : (
          <>
            <p className="sr-only md:not-sr-only text-[13px] text-ink-3 mb-2 px-1" aria-live="polite">
              {filtered.length === COUNTRIES.length
                ? `${filtered.length} countries`
                : `${filtered.length} of ${COUNTRIES.length} countries`}
            </p>
            {filtered.length !== COUNTRIES.length && (
              <p className="md:hidden text-[13px] text-ink-3 mb-2 px-1">{filtered.length} of {COUNTRIES.length} countries</p>
            )}
            {groups.map(({ letter, items }) => (
              <section key={letter} aria-labelledby={`letter-${letter}`} className="mb-4 scroll-mt-48">
                <h2 id={`letter-${letter}`} className="text-[13px] font-semibold text-ink-3 px-1 mb-1">{letter}</h2>
                <ul className="bg-surface rounded-xl border border-line/70 overflow-hidden">
                  {items.map((c, i) => (
                    <CountryRow
                      key={c.name}
                      country={c}
                      summary={summary[c.name.toLowerCase()]}
                      open={openName === c.name}
                      mounted={mounted.has(c.name)}
                      onToggle={() => toggle(c.name)}
                      first={i === 0}
                    >
                      <CountryDetail country={c} summary={summary[c.name.toLowerCase()]} />
                    </CountryRow>
                  ))}
                </ul>
              </section>
            ))}
            <p className="text-[13px] text-ink-3 px-1 pt-1 md:hidden">
              Community-driven information. Always verify with the embassy or your airline.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default TableView;
