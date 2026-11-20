import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { geoOrthographic, geoPath, geoGraticule10, geoContains, geoCentroid, geoArea, geoDistance } from 'd3-geo';
import { feature } from 'topojson-client';
import { STATUS_ORDER, STATUS_LABEL, reportLine } from '../lib/visa';
import { COUNTRIES, COUNTRY_BY_NAME, STATUS_COUNTS, resolveCountry } from '../lib/countries';
import { StatusPill, useReportSummary } from './CountryList';
import { ChevronIcon } from './Icons';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json';

const AUTO_SPIN = 0.006;     // degrees per ms while idle (about 6°/s)
const RESUME_AFTER = 2500;   // ms without interaction before spinning resumes
const FLY_MS = 950;
const MIN_K = 1;
const MAX_K = 8;

// Map names that differ from data.json names.
const ALIASES = {
  'united kingdom': ['uk', 'united kingdom'],
  'south korea': ['korea', 'south korea'],
  turkey: ['türkiye', 'turkey'],
  vietnam: ['viet nam', 'vietnam'],
  laos: ['lao people', 'laos'],
};

function findCountry(mapName) {
  const exact = resolveCountry(mapName);
  if (exact) return exact;
  const m = mapName.toLowerCase();
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

const STATUS_TOKEN = {
  free: '--map-free', evisa: '--map-evisa', voa: '--map-voa',
  required: '--map-req', notRecognized: '--map-nr',
};

/** Resolve the theme's map colours from CSS tokens (re-read on theme change). */
function readPalette() {
  const cs = getComputedStyle(document.documentElement);
  const v = (name) => `rgb(${cs.getPropertyValue(name).trim()})`;
  const out = { none: v('--map-none'), ocean: v('--map-ocean'), line: v('--line'), surface: v('--surface'), ink: v('--ink') };
  for (const [s, t] of Object.entries(STATUS_TOKEN)) out[s] = v(t);
  return out;
}

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const wrap180 = (d) => ((((d + 180) % 360) + 360) % 360) - 180;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

/* ─── Canvas globe ─────────────────────────────────────────────────────── */
function GlobeCanvas({ features, selected, onSelect, onHover, controlsRef }) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const state = useRef({
    rot: [-10, -18],   // [λ, φ] rotation in degrees
    k: 1,              // zoom factor
    fly: null,         // { from, to, start }
    lastInteract: 0,
    pointers: new Map(),
    drag: null,
    size: 0,
    dirty: true,
    palette: null,
    reduced: false,
  });
  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  const projection = useMemo(() => geoOrthographic().clipAngle(90).precision(0.4), []);
  const graticule = useMemo(() => geoGraticule10(), []);

  const flyTo = useCallback((rot, k) => {
    const s = state.current;
    const target = { rot: [rot[0], clamp(rot[1], -70, 70)], k: clamp(k, MIN_K, MAX_K) };
    s.lastInteract = performance.now();
    if (s.reduced) {
      s.rot = target.rot; s.k = target.k; s.fly = null; s.dirty = true;
      return;
    }
    s.fly = { from: { rot: [...s.rot], k: s.k }, to: target, start: performance.now() };
  }, []);

  // Zoom buttons live in the parent.
  useEffect(() => {
    controlsRef.current = { zoomBy: (f) => flyTo(state.current.rot, state.current.k * f) };
  }, [controlsRef, flyTo]);

  // Selecting a country (tap or picker) stops the spin and flies to it.
  useEffect(() => {
    if (!selected) {
      flyTo(state.current.rot, 1);
      return;
    }
    const f = features.find(ft => ft.country && ft.country.name === selected);
    if (!f) return;
    const [lon, lat] = geoCentroid(f);
    const k = 0.35 / Math.sqrt(Math.max(geoArea(f), 1e-6)); // small countries zoom closer
    flyTo([-lon, -lat], clamp(k, 1.6, 6));
  }, [selected, features, flyTo]);

  // Theme, motion preference and size.
  useEffect(() => {
    const s = state.current;
    const mqDark = window.matchMedia('(prefers-color-scheme: dark)');
    const mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const refresh = () => { s.palette = readPalette(); s.reduced = mqMotion.matches; s.dirty = true; };
    refresh();
    mqDark.addEventListener('change', refresh);
    mqMotion.addEventListener('change', refresh);

    const ro = new ResizeObserver(([entry]) => {
      const size = Math.round(entry.contentRect.width);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const c = canvasRef.current;
      c.width = size * dpr; c.height = size * dpr;
      c.style.width = `${size}px`; c.style.height = `${size}px`;
      c.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
      s.size = size; s.dirty = true;
    });
    ro.observe(wrapRef.current);
    return () => {
      mqDark.removeEventListener('change', refresh);
      mqMotion.removeEventListener('change', refresh);
      ro.disconnect();
    };
  }, []);

  // Render loop: draws only when something changed.
  useEffect(() => {
    const s = state.current;
    const ctx = canvasRef.current.getContext('2d');
    const path = geoPath(projection, ctx);
    let raf;
    let last = performance.now();

    const frame = (now) => {
      const dt = Math.min(now - last, 64);
      last = now;

      if (s.fly) {
        const t = clamp((now - s.fly.start) / FLY_MS, 0, 1);
        const e = easeInOut(t);
        const { from, to } = s.fly;
        s.rot = [from.rot[0] + wrap180(to.rot[0] - from.rot[0]) * e, from.rot[1] + (to.rot[1] - from.rot[1]) * e];
        s.k = from.k + (to.k - from.k) * e;
        s.dirty = true;
        if (t === 1) s.fly = null;
      } else if (!selectedRef.current && !s.drag && !s.reduced && now - s.lastInteract > RESUME_AFTER) {
        s.rot = [s.rot[0] + AUTO_SPIN * dt, s.rot[1]];
        s.dirty = true;
      }

      if (s.dirty && s.size && s.palette) {
        s.dirty = false;
        const S = s.size;
        const p = s.palette;
        const sel = selectedRef.current;
        const r = (S / 2) * 0.94 * s.k;
        projection.translate([S / 2, S / 2]).scale(r).rotate([s.rot[0], s.rot[1]]);
        ctx.clearRect(0, 0, S, S);

        ctx.beginPath(); path({ type: 'Sphere' });
        ctx.fillStyle = p.ocean; ctx.fill();

        ctx.beginPath(); path(graticule);
        ctx.strokeStyle = p.line; ctx.lineWidth = 0.5; ctx.stroke();

        for (const f of features) {
          const isSel = sel && f.country && f.country.name === sel;
          ctx.globalAlpha = sel && !isSel ? 0.35 : 1;
          ctx.beginPath(); path(f);
          ctx.fillStyle = f.country ? p[f.country.status] : p.none;
          ctx.fill();
          ctx.strokeStyle = p.surface; ctx.lineWidth = 0.5; ctx.stroke();
        }
        ctx.globalAlpha = 1;

        const selF = sel && features.find(f => f.country && f.country.name === sel);
        if (selF) {
          ctx.beginPath(); path(selF);
          ctx.strokeStyle = p.ink; ctx.lineWidth = 1.6; ctx.stroke();
        }

        // Soft limb shading so the disc reads as a sphere, plus its edge.
        const g = ctx.createRadialGradient(S / 2 - r * 0.3, S / 2 - r * 0.35, r * 0.2, S / 2, S / 2, r);
        g.addColorStop(0, 'rgba(255,255,255,0)');
        g.addColorStop(1, 'rgba(0,0,0,0.10)');
        ctx.beginPath(); path({ type: 'Sphere' });
        ctx.fillStyle = g; ctx.fill();
        ctx.strokeStyle = p.line; ctx.lineWidth = 1; ctx.stroke();
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [features, projection, graticule]);

  const hitTest = (x, y) => {
    const s = state.current;
    const ll = projection.invert([x, y]);
    if (!ll || geoDistance(ll, [-s.rot[0], -s.rot[1]]) > Math.PI / 2) return { onGlobe: false, f: null };
    return { onGlobe: true, f: features.find(f => geoContains(f, ll)) || null };
  };

  const local = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };

  const onPointerDown = (e) => {
    const s = state.current;
    canvasRef.current.setPointerCapture(e.pointerId);
    s.pointers.set(e.pointerId, local(e));
    s.fly = null;
    s.lastInteract = performance.now();
    if (s.pointers.size === 1) {
      s.drag = { moved: 0 };
    } else if (s.pointers.size === 2) {
      const [a, b] = [...s.pointers.values()];
      s.drag = { pinch: Math.hypot(a[0] - b[0], a[1] - b[1]), k0: s.k, moved: 99 };
    }
  };

  const onPointerMove = (e) => {
    const s = state.current;
    const pt = local(e);
    if (!s.pointers.has(e.pointerId)) {
      if (e.pointerType === 'mouse') {
        const { f } = hitTest(pt[0], pt[1]);
        onHover(f ? { name: f.country ? f.country.name : f.properties.name, country: f.country, x: e.clientX, y: e.clientY } : null);
        canvasRef.current.style.cursor = f && f.country ? 'pointer' : 'grab';
      }
      return;
    }
    const prev = s.pointers.get(e.pointerId);
    s.pointers.set(e.pointerId, pt);
    s.lastInteract = performance.now();

    if (s.drag && s.drag.pinch) {
      const [a, b] = [...s.pointers.values()];
      s.k = clamp(s.drag.k0 * (Math.hypot(a[0] - b[0], a[1] - b[1]) / s.drag.pinch), MIN_K, MAX_K);
      s.dirty = true;
      return;
    }
    if (!s.drag) return;
    const dx = pt[0] - prev[0];
    const dy = pt[1] - prev[1];
    s.drag.moved += Math.abs(dx) + Math.abs(dy);
    // One pixel of drag moves the surface under the finger by one pixel.
    const degPerPx = 180 / (Math.PI * (s.size / 2) * 0.94 * s.k);
    s.rot = [s.rot[0] + dx * degPerPx, clamp(s.rot[1] - dy * degPerPx, -80, 80)];
    s.dirty = true;
    onHover(null);
  };

  const onPointerUp = (e) => {
    const s = state.current;
    const wasTap = s.drag && !s.drag.pinch && s.drag.moved < 6;
    s.pointers.delete(e.pointerId);
    if (s.pointers.size === 0) s.drag = null;
    s.lastInteract = performance.now();
    if (wasTap) {
      const [x, y] = local(e);
      const { f } = hitTest(x, y);
      onSelect(f && f.country ? f.country.name : null);
    }
  };

  // Trackpad pinch (ctrl + wheel) zooms; plain scrolling keeps scrolling the page.
  useEffect(() => {
    const c = canvasRef.current;
    const onWheel = (e) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      const s = state.current;
      s.fly = null;
      s.k = clamp(s.k * Math.exp(-e.deltaY * 0.01), MIN_K, MAX_K);
      s.lastInteract = performance.now();
      s.dirty = true;
    };
    c.addEventListener('wheel', onWheel, { passive: false });
    return () => c.removeEventListener('wheel', onWheel);
  }, []);

  return (
    <div ref={wrapRef} className="w-full max-w-[560px] mx-auto aspect-square">
      <canvas
        ref={canvasRef}
        className="block touch-none select-none rounded-xl"
        role="img"
        aria-label="Globe coloured by visa status for RTD holders. Use the country picker to select a country."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={(e) => { if (e.pointerType === 'mouse') onHover(null); }}
      />
    </div>
  );
}

/* ─── View ─────────────────────────────────────────────────────────────── */
const PlusIcon = ({ minus }) => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
    {!minus && <path d="M12 5v14" />}
    <path d="M5 12h14" />
  </svg>
);

const WorldMap = ({ onOpenCountry }) => {
  const [features, setFeatures] = useState(null);
  const [failed, setFailed] = useState(false);
  const [selected, setSelected] = useState(null);
  const [hover, setHover] = useState(null);
  const summary = useReportSummary();
  const controls = useRef(null);

  useEffect(() => {
    let alive = true;
    fetch(GEO_URL)
      .then(r => r.json())
      .then(topo => {
        if (!alive) return;
        const fc = feature(topo, topo.objects.countries);
        setFeatures(fc.features.map(f => ({ ...f, country: findCountry(f.properties.name) })));
      })
      .catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, []);

  const onSelect = useCallback((name) => setSelected(name), []);
  const onHover = useCallback((h) => setHover(h), []);

  const legend = useMemo(
    () => STATUS_ORDER.filter(s => STATUS_COUNTS[s]).map(s => ({ status: s, label: STATUS_LABEL[s], count: STATUS_COUNTS[s] })),
    []
  );

  const sel = selected ? COUNTRY_BY_NAME[selected.toLowerCase()] : null;
  const swatch = (s) => ({ background: `rgb(var(${s === 'none' ? '--map-none' : STATUS_TOKEN[s]}))` });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 md:pt-10 pb-6">
      <h1 className="text-[28px] md:text-[34px] leading-tight font-bold tracking-[-0.025em] text-ink">World map</h1>
      <p className="text-[15px] text-ink-2 mt-1 max-w-[60ch]">
        Where a US Refugee Travel Document is accepted, and on what terms. Tap a country to fly to it.
      </p>

      <ul className="flex flex-wrap gap-x-4 gap-y-2 mt-5" aria-label="Legend">
        {legend.map(({ status, label, count }) => (
          <li key={status} className="flex items-center gap-2 text-[14px] text-ink-2">
            <span className="w-3 h-3 rounded-[3px]" style={swatch(status)} aria-hidden="true" />
            {label}
            <span className="text-ink-3 tabular-nums">{count}</span>
          </li>
        ))}
        <li className="flex items-center gap-2 text-[14px] text-ink-3">
          <span className="w-3 h-3 rounded-[3px]" style={swatch('none')} aria-hidden="true" />
          No data
        </li>
      </ul>

      <div className="mt-4 bg-surface border border-line/70 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 pt-3">
          <label className="relative flex-1 max-w-xs">
            <span className="sr-only">Find a country</span>
            <select
              value={selected || ''}
              onChange={(e) => setSelected(e.target.value || null)}
              className="w-full h-10 pl-3 pr-8 rounded-[10px] bg-fill text-[15px] text-ink appearance-none outline-none focus:ring-2 focus:ring-accent/40"
            >
              <option value="">Find a country</option>
              {COUNTRIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
            <ChevronIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 w-3.5 h-3.5 text-ink-3 pointer-events-none" />
          </label>
          <div className="ml-auto flex rounded-[10px] bg-fill overflow-hidden" role="group" aria-label="Zoom">
            <button onClick={() => controls.current?.zoomBy(1.6)} aria-label="Zoom in" className="w-10 h-10 flex items-center justify-center text-ink hover:bg-line">
              <PlusIcon />
            </button>
            <span className="w-px bg-line" aria-hidden="true" />
            <button onClick={() => controls.current?.zoomBy(1 / 1.6)} aria-label="Zoom out" className="w-10 h-10 flex items-center justify-center text-ink hover:bg-line">
              <PlusIcon minus />
            </button>
          </div>
        </div>

        <div className="px-2 sm:px-6 py-3">
          {features ? (
            <GlobeCanvas features={features} selected={selected} onSelect={onSelect} onHover={onHover} controlsRef={controls} />
          ) : (
            <div className="w-full max-w-[560px] mx-auto aspect-square flex items-center justify-center">
              <p className="text-[14px] text-ink-3">
                {failed ? 'The map could not load. Check your connection, or use the Directory.' : 'Loading the globe…'}
              </p>
            </div>
          )}
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
              <div className="flex gap-2 flex-none">
                <button onClick={() => setSelected(null)} className="h-9 px-4 rounded-full bg-fill text-ink text-[14px] font-semibold">
                  Back to globe
                </button>
                <button
                  onClick={() => onOpenCountry && onOpenCountry(sel.name)}
                  className="inline-flex items-center gap-1 h-9 pl-4 pr-3 rounded-full bg-accent text-accent-ink text-[14px] font-semibold"
                >
                  Embassy and reports
                  <ChevronIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <p className="text-[15px] text-ink-3">
              Drag to spin, pinch to zoom, tap a country for its entry rule. Or browse all {COUNTRIES.length} in the Directory.
            </p>
          )}
        </div>
      </div>

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
