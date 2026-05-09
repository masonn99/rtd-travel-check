import { useState, useEffect, useMemo } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import visaData from '/data.json';

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json';

const VISA_COLORS = {
  free:         '#10b981', // emerald
  evisa:        '#3b82f6', // blue
  required:     '#f59e0b', // amber
  notRecognized:'#ef4444', // red
  noData:       '#3f3f46', // zinc-700
  hover:        '#a1a1aa', // zinc-400 — clearly neutral, never mistaken for data
};

const WorldMap = ({ onViewChange }) => {
  const [loading, setLoading] = useState(true);

  const findVisaInfo = (countryName) => {
    return visaData.find(item => {
      const dataCountry = item.country.toLowerCase();
      const mapCountry = countryName.toLowerCase();
      if (mapCountry === 'united kingdom' && dataCountry.includes('uk')) return true;
      if (mapCountry === 'south korea' && dataCountry.includes('korea')) return true;
      if (mapCountry === 'turkey' && dataCountry.includes('türkiye')) return true;
      if (mapCountry === 'vietnam' && dataCountry.includes('viet nam')) return true;
      if (mapCountry === 'laos' && dataCountry.includes('lao people')) return true;
      if (mapCountry === dataCountry) return true;
      if (dataCountry.length > 3 && mapCountry.length > 3) {
        const dataRegex = new RegExp(`\\b${dataCountry}\\b`, 'i');
        const mapRegex = new RegExp(`\\b${mapCountry}\\b`, 'i');
        return dataRegex.test(mapCountry) || mapRegex.test(dataCountry);
      }
      return false;
    });
  };

  const getColor = (requirement) => {
    if (requirement.includes('not required')) return VISA_COLORS.free;
    if (requirement.includes('E-Visa') || requirement.includes('E-visa')) return VISA_COLORS.evisa;
    if (requirement.includes('Does not recognize')) return VISA_COLORS.notRecognized;
    return VISA_COLORS.required;
  };

  const stats = useMemo(() => ({
    total: visaData.length,
    visaFree: visaData.filter(c => c.visaRequirement.includes('not required')).length,
    eVisa: visaData.filter(c => c.visaRequirement.includes('E-Visa') || c.visaRequirement.includes('E-visa')).length,
    notRecognized: visaData.filter(c => c.visaRequirement.includes('Does not recognize')).length,
    visaRequired: visaData.filter(c => c.visaRequirement === 'Visa required').length,
  }), []);

  const statItems = [
    { label: 'Visa Free', value: stats.visaFree, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', dot: 'bg-emerald-400' },
    { label: 'E-Visa', value: stats.eVisa, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', dot: 'bg-blue-400' },
    { label: 'Visa Required', value: stats.visaRequired, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', dot: 'bg-amber-400' },
    { label: 'Not Recognized', value: stats.notRecognized, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', dot: 'bg-red-400' },
  ];

  const legendItems = [
    { color: VISA_COLORS.free, label: 'Visa Free' },
    { color: VISA_COLORS.evisa, label: 'E-Visa' },
    { color: VISA_COLORS.required, label: 'Required' },
    { color: VISA_COLORS.notRecognized, label: 'Not Recognized' },
    { color: VISA_COLORS.noData, label: 'No Data' },
  ];

  return (
    <div className="py-6 text-white animate-fadeIn">
      {/* Page header */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Visa <span className="text-blue-400">Map</span>
        </h1>
        <p className="text-zinc-500 text-sm mt-1">{stats.total} countries tracked for RTD holders</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {statItems.map((stat, i) => (
          <div
            key={stat.label}
            className={`border rounded-xl p-4 ${stat.bg} animate-slideUp`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`w-1.5 h-1.5 rounded-full ${stat.dot}`} />
              <span className="text-[11px] text-zinc-400 font-medium">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Map container */}
      <div className="relative bg-zinc-900/50 border border-zinc-800/60 rounded-2xl overflow-hidden">

        {/* Desktop legend */}
        <div className="absolute top-4 left-4 z-10 hidden md:block">
          <div className="bg-zinc-950/80 backdrop-blur-md border border-zinc-800/70 rounded-xl p-3 space-y-2">
            {legendItems.map(item => (
              <div key={item.label} className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-[11px] text-zinc-400 font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: view directory CTA */}
        <div className="md:hidden absolute top-4 left-0 right-0 z-10 flex justify-center px-4">
          <button
            onClick={() => onViewChange && onViewChange('table')}
            className="flex items-center gap-2 bg-zinc-950/90 backdrop-blur-md border border-zinc-700/60 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg active:scale-95 transition-all"
          >
            <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Open Directory
          </button>
        </div>

        {/* Map */}
        <div className="h-[420px] sm:h-[560px] w-full flex items-center justify-center px-2">
          <ComposableMap
            projection="geoNaturalEarth1"
            width={800}
            height={450}
            projectionConfig={{ scale: 155, center: [10, 0] }}
            className="w-full h-full cursor-grab active:cursor-grabbing"
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map(geo => {
                  const countryName = geo.properties.name;
                  const visaInfo = findVisaInfo(countryName);
                  const fill = visaInfo ? getColor(visaInfo.visaRequirement) : VISA_COLORS.noData;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fill}
                      stroke="#18181b"
                      strokeWidth={0.4}
                      style={{
                        default: { outline: 'none', transition: 'fill 150ms' },
                        hover:   { fill: VISA_COLORS.hover, outline: 'none', cursor: 'pointer' },
                        pressed: { outline: 'none' },
                      }}
                      onMouseMove={(e) => {
                        const tooltip = document.getElementById('map-tooltip');
                        if (!tooltip) return;
                        if (visaInfo) {
                          let req = visaInfo.visaRequirement;
                          if (req.includes('Does not recognize')) req = 'RTD Not Recognized';
                          tooltip.innerHTML = `
                            <div class="p-3">
                              <p class="text-[10px] font-semibold text-zinc-500 mb-0.5">${countryName}</p>
                              <p class="text-sm font-bold text-white">${req}</p>
                              ${visaInfo.notes ? `<p class="text-[10px] text-zinc-400 mt-1.5 max-w-[200px] leading-snug italic">"${visaInfo.notes}"</p>` : ''}
                            </div>
                          `;
                          tooltip.style.display = 'block';
                        } else {
                          tooltip.innerHTML = `<div class="p-3"><p class="text-[10px] font-semibold text-zinc-500">${countryName}</p><p class="text-xs text-zinc-600 mt-0.5">No data available</p></div>`;
                          tooltip.style.display = 'block';
                        }
                        tooltip.style.left = `${e.clientX + 16}px`;
                        tooltip.style.top = `${e.clientY + 16}px`;
                      }}
                      onMouseLeave={() => {
                        const tooltip = document.getElementById('map-tooltip');
                        if (tooltip) tooltip.style.display = 'none';
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>
        </div>

        {/* Mobile bottom legend */}
        <div className="md:hidden flex items-center justify-center gap-3 flex-wrap px-4 pb-4">
          {legendItems.map(item => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: item.color }} />
              <span className="text-[10px] text-zinc-500 font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      <div
        id="map-tooltip"
        className="hidden fixed pointer-events-none bg-zinc-950/95 backdrop-blur-xl border border-zinc-800/70 rounded-xl shadow-xl z-[100]"
      />
    </div>
  );
};

export default WorldMap;
