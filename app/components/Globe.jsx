import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { geoOrthographic, geoPath, geoGraticule10, geoContains, geoCentroid, geoArea, geoDistance } from 'd3-geo';
import { feature } from 'topojson-client';
import { STATUS_ORDER, STATUS_LABEL, reportLine } from '../lib/visa';
import { COUNTRIES, COUNTRY_BY_NAME, STATUS_COUNTS, resolveCountry } from '../lib/countries';
import { StatusPill, useReportSummary } from './CountryList';
import { ChevronIcon, ClearIcon } from './Icons';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json';

const AUTO_SPIN = 0.006;     // degrees per ms while idle (about 6°/s)
const RESUME_AFTER = 2500;   // ms without interaction before spinning resumes
const FLY_MS = 950;
const FRICTION_MS = 420;     // momentum half-life-ish after a flick
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
  const ch = (name) => cs.getPropertyValue(name).trim().split(/\s+/).join(',');
  const v = (name) => `rgb(${ch(name)})`;
  const out = {
    none: v('--map-none'), ocean: v('--map-ocean'), line: v('--line'), surface: v('--surface'), ink: v('--ink'),
    accent: ch('--accent'), bg: ch('--bg'),
    dark: window.matchMedia('(prefers-color-scheme: dark)').matches,
  };
  for (const [s, t] of Object.entries(STATUS_TOKEN)) out[s] = v(t);
  return out;
}

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const wrap180 = (d) => ((((d + 180) % 360) + 360) % 360) - 180;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

/* ─── Canvas globe ─────────────────────────────────────────────────────── */
function GlobeCanvas({ features, selected, focusStatus, onSelect, onHover, controlsRef }) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const state = useRef({
    rot: [-10, -18],   // [λ, φ] rotation in degrees
    k: 1,              // zoom factor
    lift: 0,           // 0..1, raises the globe above the detail sheet
    fly: null,         // { from, to, start }
    vel: null,         // momentum after a flick, degrees per ms
    lastInteract: 0,
    pointers: new Map(),
    drag: null,
    w: 0, h: 0,
    dirty: true,
    palette: null,
    reduced: false,
  });
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  const focusRef = useRef(focusStatus);
  focusRef.current = focusStatus;

  const projection = useMemo(() => geoOrthographic().clipAngle(90).precision(0.4), []);
  const graticule = useMemo(() => geoGraticule10(), []);

  /** Globe radius at zoom 1 for the current stage. */
  const baseRadius = () => {
    const s = state.current;
    return Math.min(s.w * 0.485, s.h * 0.43);
  };

  const flyTo = useCallback((rot, k) => {
    const s = state.current;
    const target = { rot: [rot[0], clamp(rot[1], -70, 70)], k: clamp(k, MIN_K, MAX_K) };
    s.lastInteract = performance.now();
    s.vel = null;
    if (s.reduced) {
      s.rot = target.rot; s.k = target.k; s.fly = null; s.dirty = true;
      return;
    }
    s.fly = { from: { rot: [...s.rot], k: s.k }, to: target, start: performance.now() };
  }, []);

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

  useEffect(() => { state.current.dirty = true; }, [focusStatus]);

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
      const w = Math.round(entry.contentRect.width);
      const h = Math.round(entry.contentRect.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const c = canvasRef.current;
      c.width = w * dpr; c.height = h * dpr;
      c.style.width = `${w}px`; c.style.height = `${h}px`;
      c.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
      s.w = w; s.h = h; s.dirty = true;
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
      } else if (s.vel && !s.drag) {
        s.rot = [s.rot[0] + s.vel[0] * dt, clamp(s.rot[1] + s.vel[1] * dt, -80, 80)];
        const decay = Math.exp(-dt / FRICTION_MS);
        s.vel = [s.vel[0] * decay, s.vel[1] * decay];
        if (Math.hypot(s.vel[0], s.vel[1]) < 0.002) s.vel = null;
        s.lastInteract = now;
        s.dirty = true;
      } else if (!selectedRef.current && !s.drag && !s.reduced && now - s.lastInteract > RESUME_AFTER) {
        s.rot = [s.rot[0] + AUTO_SPIN * dt, s.rot[1]];
        s.dirty = true;
      }

      // Ease the globe upward while the detail sheet is open.
      const liftTarget = selectedRef.current ? 1 : 0;
      if (Math.abs(s.lift - liftTarget) > 0.001) {
        s.lift = s.reduced ? liftTarget : s.lift + (liftTarget - s.lift) * (1 - Math.exp(-dt / 140));
        s.dirty = true;
      }

      if (s.dirty && s.w && s.palette) {
        s.dirty = false;
        const { w: W, h: H } = s;
        const p = s.palette;
        const sel = selectedRef.current;
        const focus = focusRef.current;
        const r = baseRadius() * s.k;
        const cx = W / 2;
        const cy = H / 2 - s.lift * H * 0.11;
        projection.translate([cx, cy]).scale(r).rotate([s.rot[0], s.rot[1]]);
        ctx.clearRect(0, 0, W, H);

        // Atmosphere: a soft halo of the accent just outside the limb.
        const halo = ctx.createRadialGradient(cx, cy, r * 0.96, cx, cy, r * 1.22);
        halo.addColorStop(0, `rgba(${p.accent},${p.dark ? 0.32 : 0.2})`);
        halo.addColorStop(0.45, `rgba(${p.accent},${p.dark ? 0.1 : 0.06})`);
        halo.addColorStop(1, `rgba(${p.accent},0)`);
        ctx.fillStyle = halo;
        ctx.beginPath(); ctx.arc(cx, cy, r * 1.22, 0, Math.PI * 2); ctx.fill();

        // Ocean, lit from the upper left.
        const sea = ctx.createRadialGradient(cx - r * 0.4, cy - r * 0.45, r * 0.05, cx, cy, r);
        sea.addColorStop(0, p.dark ? 'rgba(42,56,78,1)' : 'rgba(250,252,255,1)');
        sea.addColorStop(1, p.ocean);
        ctx.beginPath(); path({ type: 'Sphere' });
        ctx.fillStyle = sea; ctx.fill();

        ctx.globalAlpha = 0.6;
        ctx.beginPath(); path(graticule);
        ctx.strokeStyle = p.line; ctx.lineWidth = 0.5; ctx.stroke();
        ctx.globalAlpha = 1;

        for (const f of features) {
          const st = f.country && f.country.status;
          const isSel = sel && f.country && f.country.name === sel;
          const dim = (sel && !isSel) || (focus && !sel && st !== focus);
          ctx.globalAlpha = dim ? (focus && !sel ? 0.22 : 0.35) : 1;
          ctx.beginPath(); path(f);
          ctx.fillStyle = st ? p[st] : p.none;
          ctx.fill();
          ctx.strokeStyle = p.surface; ctx.lineWidth = 0.5; ctx.stroke();
        }
        ctx.globalAlpha = 1;

        const selF = sel && features.find(f => f.country && f.country.name === sel);
        if (selF) {
          ctx.beginPath(); path(selF);
          ctx.strokeStyle = p.ink; ctx.lineWidth = 1.6; ctx.stroke();
        }

        // Shading: a faint highlight top-left, falling off to a darker limb.
        const shade = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.4, r * 0.05, cx, cy, r);
        shade.addColorStop(0, 'rgba(255,255,255,0.16)');
        shade.addColorStop(0.55, 'rgba(255,255,255,0)');
        shade.addColorStop(1, `rgba(0,0,0,${p.dark ? 0.38 : 0.16})`);
        ctx.beginPath(); path({ type: 'Sphere' });
        ctx.fillStyle = shade; ctx.fill();
        ctx.strokeStyle = `rgba(${p.accent},${p.dark ? 0.35 : 0.18})`; ctx.lineWidth = 1; ctx.stroke();
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
    s.vel = null;
    s.lastInteract = performance.now();
    if (s.pointers.size === 1) {
      s.drag = { moved: 0, v: [0, 0], t: performance.now() };
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
    const now = performance.now();
    s.lastInteract = now;

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
    const degPerPx = 180 / (Math.PI * baseRadius() * s.k);
    const step = [dx * degPerPx, -dy * degPerPx];
    s.rot = [s.rot[0] + step[0], clamp(s.rot[1] + step[1], -80, 80)];
    // Smoothed velocity for the flick on release.
    const dt = Math.max(now - s.drag.t, 1);
    s.drag.v = [s.drag.v[0] * 0.6 + (step[0] / dt) * 0.4, s.drag.v[1] * 0.6 + (step[1] / dt) * 0.4];
    s.drag.t = now;
    s.dirty = true;
    onHover(null);
  };

  const onPointerUp = (e) => {
    const s = state.current;
    const d = s.drag;
    const wasTap = d && !d.pinch && d.moved < 6;
    s.pointers.delete(e.pointerId);
    if (s.pointers.size === 0) {
      // Keep spinning briefly after a flick, unless the finger paused before lifting.
      if (d && !d.pinch && !wasTap && !s.reduced && performance.now() - d.t < 80) {
        const sp = Math.hypot(d.v[0], d.v[1]);
        if (sp > 0.01) s.vel = sp > 0.6 ? [d.v[0] * 0.6 / sp, d.v[1] * 0.6 / sp] : d.v;
      }
      s.drag = null;
    }
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
    // Edges fade out so the zoomed map never ends in a hard frame.
    <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,transparent,#000_56px,#000_calc(100%-40px),transparent)]">
    <div ref={wrapRef} className="absolute inset-0 sm:[mask-image:linear-gradient(to_right,transparent,#000_64px,#000_calc(100%-64px),transparent)]">
      <canvas
        ref={canvasRef}
        className="block touch-none select-none"
        role="img"
        aria-label="Globe coloured by visa status for RTD holders. Use the country picker to select a country."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={(e) => { if (e.pointerType === 'mouse') onHover(null); }}
      />
    </div>
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

const FLOAT = 'bg-surface border border-line/70 shadow-[0_2px_8px_rgba(0,0,0,0.08)]';

const WorldMap = ({ onOpenCountry }) => {
  const [features, setFeatures] = useState(null);
  const [failed, setFailed] = useState(false);
  const [selected, setSelected] = useState(null);
  const [shown, setShown] = useState(null); // keeps the sheet's content while it slides away
  const [focusStatus, setFocusStatus] = useState(null);
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

  useEffect(() => { if (selected) setShown(selected); }, [selected]);

  const onSelect = useCallback((name) => setSelected(name), []);
  const onHover = useCallback((h) => setHover(h), []);

  const legend = useMemo(
    () => STATUS_ORDER.filter(s => STATUS_COUNTS[s]).map(s => ({ status: s, label: STATUS_LABEL[s], count: STATUS_COUNTS[s] })),
    []
  );

  const sel = shown ? COUNTRY_BY_NAME[shown.toLowerCase()] : null;
  const open = Boolean(selected);
  const swatch = (s) => ({ background: `rgb(var(${STATUS_TOKEN[s]}))` });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 md:pt-10 pb-2">
      <h1 className="text-[28px] md:text-[34px] leading-tight font-bold tracking-[-0.025em] text-ink">World map</h1>
      <p className="text-[15px] text-ink-2 mt-1 max-w-[60ch]">
        Where a US Refugee Travel Document is accepted, and on what terms. Drag to spin, tap a country to fly to it.
      </p>

      {/* Stage: the globe floats on the page; controls float over it. */}
      <div className="relative -mx-4 sm:mx-0 mt-3 h-[calc(100dvh-56px-56px-env(safe-area-inset-bottom)-150px)] min-h-[440px] max-h-[720px] md:h-[min(72vh,680px)]">
        {features ? (
          <GlobeCanvas
            features={features}
            selected={selected}
            focusStatus={focusStatus}
            onSelect={onSelect}
            onHover={onHover}
            controlsRef={controls}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-[14px] text-ink-3">
              {failed ? 'The map could not load. Check your connection, or use the Directory.' : 'Loading the globe…'}
            </p>
          </div>
        )}

        {/* Top: find a country, zoom */}
        <div className="absolute top-2 left-4 right-4 sm:left-0 sm:right-0 flex items-start gap-2 pointer-events-none">
          <label className={`pointer-events-auto relative flex-1 max-w-[260px] rounded-full ${FLOAT}`}>
            <span className="sr-only">Find a country</span>
            <select
              value={selected || ''}
              onChange={(e) => setSelected(e.target.value || null)}
              className="w-full h-10 pl-4 pr-9 rounded-full bg-transparent text-[15px] text-ink appearance-none outline-none focus:ring-2 focus:ring-accent/40"
            >
              <option value="">Find a country</option>
              {COUNTRIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
            <ChevronIcon className="absolute right-3.5 top-1/2 -translate-y-1/2 rotate-90 w-3.5 h-3.5 text-ink-3 pointer-events-none" />
          </label>
          <div className={`pointer-events-auto ml-auto flex flex-col rounded-full overflow-hidden ${FLOAT}`} role="group" aria-label="Zoom">
            <button onClick={() => controls.current?.zoomBy(1.6)} aria-label="Zoom in" className="w-10 h-10 flex items-center justify-center text-ink hover:bg-fill active:bg-fill">
              <PlusIcon />
            </button>
            <span className="h-px mx-2 bg-line" aria-hidden="true" />
            <button onClick={() => controls.current?.zoomBy(1 / 1.6)} aria-label="Zoom out" className="w-10 h-10 flex items-center justify-center text-ink hover:bg-fill active:bg-fill">
              <PlusIcon minus />
            </button>
          </div>
        </div>

        {/* Bottom: legend that doubles as a filter */}
        <div
          className={`absolute bottom-2 left-0 right-0 transition-[opacity,transform] duration-200 ${
            open ? 'opacity-0 translate-y-2 pointer-events-none' : 'opacity-100'
          }`}
          aria-hidden={open}
        >
          <ul className="flex gap-2 overflow-x-auto no-scrollbar px-4 sm:px-0 sm:flex-wrap sm:justify-center" aria-label="Highlight countries by status">
            {legend.map(({ status, label, count }) => {
              const on = focusStatus === status;
              return (
                <li key={status} className="flex-none">
                  <button
                    onClick={() => setFocusStatus(on ? null : status)}
                    aria-pressed={on}
                    tabIndex={open ? -1 : 0}
                    className={`h-9 pl-3 pr-3.5 rounded-full flex items-center gap-2 text-[14px] whitespace-nowrap transition-colors ${
                      on ? 'bg-ink text-surface border border-ink shadow-[0_2px_8px_rgba(0,0,0,0.08)]' : `${FLOAT} text-ink-2 hover:text-ink`
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={swatch(status)} aria-hidden="true" />
                    {label}
                    <span className={`tabular-nums ${on ? 'opacity-70' : 'text-ink-3'}`}>{count}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Detail sheet */}
        <div
          className={`absolute left-3 right-3 bottom-3 sm:left-auto sm:right-0 sm:bottom-2 sm:w-[380px] rounded-2xl bg-surface border border-line/70 shadow-[0_4px_16px_rgba(0,0,0,0.12)] p-4 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
          role="region"
          aria-label="Selected country"
          aria-live="polite"
          aria-hidden={!open}
        >
          {sel && (
            <>
              <div className="flex items-start gap-3">
                <span className="text-[30px] leading-none mt-0.5" aria-hidden="true">{sel.flag}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[17px] leading-snug font-semibold text-ink">{sel.name}</p>
                  <div className="mt-1"><StatusPill status={sel.status} /></div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  aria-label="Close and return to the globe"
                  tabIndex={open ? 0 : -1}
                  className="-mr-1 -mt-1 w-9 h-9 rounded-full flex items-center justify-center text-ink-3 hover:bg-fill hover:text-ink"
                >
                  <ClearIcon className="w-[18px] h-[18px]" />
                </button>
              </div>
              <p className="text-[14px] text-ink-2 mt-3">
                {[sel.duration && `Up to ${sel.duration}`, sel.notes, reportLine(summary[sel.name.toLowerCase()])].filter(Boolean).join(' · ')}
              </p>
              <button
                onClick={() => onOpenCountry && onOpenCountry(sel.name)}
                tabIndex={open ? 0 : -1}
                className="mt-4 w-full inline-flex items-center justify-center gap-1 h-11 rounded-full bg-accent text-accent-ink text-[15px] font-semibold"
              >
                Embassy and reports
                <ChevronIcon className="w-3.5 h-3.5" />
              </button>
            </>
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
