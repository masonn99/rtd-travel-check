import { useState, useMemo, useCallback, memo } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { STATUS_ORDER, STATUS_LABEL } from '../lib/visa';
import { COUNTRIES, COUNTRY_BY_NAME, STATUS_COUNTS, resolveCountry } from '../lib/countries';
import { StatusPill, useReportSummary } from './CountryList';
import { reportLine } from '../lib/visa';
import { ChevronIcon } from './Icons';

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json';

/* Map fills come from tokens so light and dark both read. */
const FILL = {
  free: 'rgb(var(--map-free))',
  evisa: 'rgb(var(--map-evisa))',
  voa: 'rgb(var(--map-voa))',
  required: 'rgb(var(--map-req))',
  notRecognized: 'rgb(var(--map-nr))',
  none: 'rgb(var(--map-none))',
};

// Map names that differ from data.json names.
const ALIASES = {
  'united kingdom': ['uk', 'united kingdom'],
  'south korea': ['korea', 'south korea'],
  turkey: ['türkiye', 'turkey'],
  vietnam: ['viet nam', 'vietnam'],
  laos: ['lao people', 'laos'],
};

function findCountry(mapName) {
  const m = mapName.toLowerCase();
  const exact = resolveCountry(mapName);
  if (exact) return exact;
  const aliases = ALIASES[m];
  return COUNTRIES.find(c => {
    const d = c.name.toLowerCase();
    if (aliases && aliases.some(a => d.includes(a))) return true;
    if (d.length > 3 && m.length > 3) {
      return new RegExp(`\\b${d}\\b`, 'i').test(m) || new RegExp(`\\b${m}\\b`, 'i').test(d);
    }
    return false;
  }) || null;
}

/* The geography layer only re-renders when the selection changes. */
const MapLayer = memo(function MapLayer({ selected, onSelect, onHover, position, onMoveEnd }) {
  return (
    <ComposableMap
      projection="geoNaturalEarth1"
      width={800}
      height={420}
      projectionConfig={{ scale: 155, center: [10, 4] }}
      className="w-full h-auto touch-none"
    >
      <ZoomableGroup center={position.coordinates} zoom={position.zoom} minZoom={1} maxZoom={8} onMoveEnd={onMoveEnd}>
      <Geographies geography={geoUrl}>
        {({ geographies }) =>
          geographies.map(geo => {
            const mapName = geo.properties.name;
            const country = findCountry(mapName);
            const fill = country ? FILL[country.status] : FILL.none;
            const isSel = country && selected === country.name;
            const dim = selected && !isSel;
            return (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                tabIndex={country ? 0 : -1}
                aria-label={country ? `${country.name}: ${STATUS_LABEL[country.status]}` : undefined}
                onClick={() => country && onSelect(country.name)}
                onKeyDown={(e) => { if (country && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onSelect(country.name); } }}
                onMouseMove={(e) => onHover({ name: country ? country.name : mapName, country, x: e.clientX, y: e.clientY })}
                onMouseLeave={() => onHover(null)}
                style={{
                  default: {
                    fill,
                    opacity: dim ? 0.35 : 1,
                    stroke: isSel ? 'rgb(var(--ink))' : 'rgb(var(--surface))',
                    strokeWidth: (isSel ? 1.6 : 0.4) / position.zoom,
                    outline: 'none',
                    transition: 'opacity 200ms ease-out',
                  },
                  hover: {
                    fill,
                    opacity: 1,
                    stroke: 'rgb(var(--ink))',
                    strokeWidth: (country ? 1 : 0.4) / position.zoom,
                    outline: 'none',
                    cursor: country ? 'pointer' : 'default',
                  },
                  pressed: { fill, outline: 'none' },
                }}
              />
            );
          })
        }
      </Geographies>
      </ZoomableGroup>
    </ComposableMap>
  );
});

const WorldMap = ({ onOpenCountry }) => {
  const [selected, setSelected] = useState(null);
  const [hover, setHover] = useState(null);
  const [position, setPosition] = useState({ coordinates: [10, 4], zoom: 1 });
  const onMoveEnd = useCallback((p) => setPosition(p), []);
  const zoomBy = (f) => setPosition(p => ({ ...p, zoom: Math.min(8, Math.max(1, p.zoom * f)) }));
  const summary = useReportSummary();

  const onSelect = useCallback((name) => setSelected(prev => (prev === name ? null : name)), []);
  const onHover = useCallback((h) => setHover(h), []);

  const legend = useMemo(
    () => STATUS_ORDER.filter(s => STATUS_COUNTS[s]).map(s => ({ status: s, label: STATUS_LABEL[s], count: STATUS_COUNTS[s] })),
    []
  );

  const sel = selected ? COUNTRY_BY_NAME[selected.toLowerCase()] : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 md:pt-10 pb-6">
      <h1 className="text-[30px] md:text-[34px] leading-tight font-bold tracking-[-0.025em] text-ink">World map</h1>
      <p className="text-[15px] text-ink-2 mt-1 max-w-[60ch]">
        Where a US Refugee Travel Document is accepted, and on what terms. Tap a country to see its rule; pinch or use + to zoom.
      </p>

      <ul className="flex flex-wrap gap-x-4 gap-y-2 mt-5" aria-label="Legend">
        {legend.map(({ status, label, count }) => (
          <li key={status} className="flex items-center gap-2 text-[14px] text-ink-2">
            <span className="w-3 h-3 rounded-[3px]" style={{ background: FILL[status] }} aria-hidden="true" />
            {label}
            <span className="text-ink-3 tabular-nums">{count}</span>
          </li>
        ))}
        <li className="flex items-center gap-2 text-[14px] text-ink-3">
          <span className="w-3 h-3 rounded-[3px]" style={{ background: FILL.none }} aria-hidden="true" />
          No data
        </li>
      </ul>

      <div className="mt-4 bg-surface border border-line/70 rounded-xl overflow-hidden">
        <div className="relative px-1 sm:px-4 py-2 sm:py-4">
          <MapLayer selected={selected} onSelect={onSelect} onHover={onHover} position={position} onMoveEnd={onMoveEnd} />
          <div className="absolute right-3 top-3 flex flex-col rounded-[10px] bg-surface border border-line shadow-[0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden">
            <button onClick={() => zoomBy(1.6)} aria-label="Zoom in" className="w-10 h-10 text-[20px] leading-none text-ink hover:bg-fill">+</button>
            <span className="h-px bg-line" aria-hidden="true" />
            <button onClick={() => zoomBy(1 / 1.6)} aria-label="Zoom out" disabled={position.zoom <= 1} className="w-10 h-10 text-[20px] leading-none text-ink hover:bg-fill disabled:text-ink-3">−</button>
          </div>
        </div>

        <div className="border-t border-line px-4 py-4 min-h-[92px]" aria-live="polite">
          {sel ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <span className="text-[28px] leading-none" aria-hidden="true">{sel.flag}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[17px] font-semibold text-ink">{sel.name}</p>
                    <StatusPill status={sel.status} />
                  </div>
                  <p className="text-[14px] text-ink-2 mt-1">
                    {[sel.duration && `Up to ${sel.duration}`, sel.notes, reportLine(summary[sel.name.toLowerCase()])].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onOpenCountry && onOpenCountry(sel.name)}
                className="flex-none self-start sm:self-auto inline-flex items-center gap-1 h-9 pl-4 pr-3 rounded-full bg-accent text-accent-ink text-[14px] font-semibold"
              >
                Embassy and reports
                <ChevronIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <p className="text-[15px] text-ink-3">
              Select a country on the map for its entry rule, or browse all {COUNTRIES.length} in the Directory.
            </p>
          )}
        </div>
      </div>

      {/* Desktop hover label; touch users get the panel above instead */}
      {hover && (
        <div
          className="hidden md:block fixed pointer-events-none z-[100] bg-surface border border-line rounded-lg px-3 py-2 shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
          style={{ left: hover.x + 14, top: hover.y + 14 }}
        >
          <p className="text-[13px] font-semibold text-ink">{hover.name}</p>
          <p className="text-[12px] text-ink-2">{hover.country ? STATUS_LABEL[hover.country.status] : 'No data yet'}</p>
        </div>
      )}
    </div>
  );
};

export default WorldMap;
