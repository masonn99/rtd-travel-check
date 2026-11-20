import { useEffect, useState } from 'react';
import { STATUS_LABEL, STATUS_PILL, reportLine } from '../lib/visa';
import { getCountryReportSummary } from '../actions/experiences';
import { ChevronIcon } from './Icons';

/* Shared building blocks for every country list: Directory, Stories, Globe. */

export const StatusPill = ({ status }) =>
  status ? (
    <span className={`inline-flex items-center h-6 px-2 rounded-md text-[12px] font-semibold whitespace-nowrap ${STATUS_PILL[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  ) : (
    <span className="inline-flex items-center h-6 px-2 rounded-md text-[12px] font-medium whitespace-nowrap bg-fill text-ink-2">
      No official data
    </span>
  );

/** Per-country report counts, keyed by lower-case country name. */
export function useReportSummaryState(refreshKey = 0) {
  const [state, setState] = useState({ summary: {}, loaded: false });
  useEffect(() => {
    let alive = true;
    getCountryReportSummary()
      .then(rows => {
        if (alive) setState({ summary: Object.fromEntries(rows.map(r => [r.country_name.toLowerCase(), r])), loaded: true });
      })
      .catch(() => { if (alive) setState(prev => ({ ...prev, loaded: true })); });
    return () => { alive = false; };
  }, [refreshKey]);
  return state;
}

export const useReportSummary = (refreshKey = 0) => useReportSummaryState(refreshKey).summary;

export const panelIdFor = (name) => `country-${name.replace(/\W+/g, '-').toLowerCase()}`;

/**
 * One row in an inset-grouped list. Grows open in place; the detail mounts on
 * first open and stays mounted so closing animates too.
 */
export const CountryRow = ({ country, summary, open, mounted, onToggle, first, children, showStay = true }) => {
  const panelId = panelIdFor(country.name);
  return (
    <li className="relative scroll-mt-48" id={`row-${panelId}`}>
      {!first && <span aria-hidden="true" className="absolute top-0 right-0 left-[52px] h-px bg-line" />}
      <button
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className={`w-full grid grid-cols-[28px_minmax(0,1fr)_auto_14px] ${
          showStay ? 'md:grid-cols-[28px_minmax(0,1fr)_88px_200px_124px_14px]' : 'md:grid-cols-[28px_minmax(0,1fr)_170px_128px_14px]'
        } items-center gap-x-3 px-4 min-h-[52px] py-[7px] text-left transition-colors ${
          open ? 'bg-fill/60' : 'hover:bg-fill/50 active:bg-fill'
        }`}
      >
        <span className="text-[22px] leading-none text-center" aria-hidden="true">{country.flag}</span>
        <span className="min-w-0">
          <span className={`block text-[16px] leading-[21px] font-medium truncate ${country.status === 'notRecognized' ? 'text-ink-2' : 'text-ink'}`}>
            {country.name}
          </span>
          <span className="block md:hidden text-[13px] leading-[18px] text-ink-3 truncate">
            {[showStay && country.duration, reportLine(summary)].filter(Boolean).join(' · ')}
          </span>
        </span>
        {showStay && <span className="hidden md:block text-[14px] text-ink-2 tabular-nums">{country.duration || '—'}</span>}
        <span className="hidden md:block text-[13px] text-ink-3 truncate">{reportLine(summary)}</span>
        <span className="justify-self-end"><StatusPill status={country.status} /></span>
        <ChevronIcon className={`w-3.5 h-3.5 text-ink-3 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
      </button>
      <div id={panelId} className="disclosure" data-open={open} role="region" aria-label={`${country.name} details`}>
        <div>{mounted && children}</div>
      </div>
    </li>
  );
};

/** One-open-at-a-time disclosure state shared by list views. */
/** @param {string | null} [initial] */
export function useDisclosure(initial = null) {
  const [openName, setOpenName] = useState(/** @type {string | null} */ (initial));
  const [mounted, setMounted] = useState(() => new Set(/** @type {string[]} */ (initial ? [initial] : [])));
  /** @param {string} name */
  const toggle = (name) => {
    setOpenName(prev => (prev === name ? null : name));
    setMounted(prev => (prev.has(name) ? prev : new Set(prev).add(name)));
  };
  /** @param {string} name */
  const openOnly = (name) => {
    setOpenName(name);
    setMounted(prev => (prev.has(name) ? prev : new Set(prev).add(name)));
  };
  return { openName, mounted, toggle, openOnly };
}

export const SectionTitle = ({ children, aside }) => (
  <div className="flex items-baseline justify-between mb-2">
    <h3 className="text-[13px] font-semibold text-ink-2">{children}</h3>
    {aside && <span className="text-[12px] text-ink-3">{aside}</span>}
  </div>
);
