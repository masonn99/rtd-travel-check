import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import visaData from '../../data.json';

const InteractiveGlobe = dynamic(() => import('./InteractiveGlobe'), { 
  ssr: false,
  loading: () => <div className="w-full aspect-square max-w-[400px] bg-zinc-800/20 animate-pulse rounded-full" />
});

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json';

const WorldMap = ({ onViewChange }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Common matching logic to avoid false positives and handle naming differences
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

  const getColorForRequirement = (requirement) => {
    if (requirement.includes('not required')) return '#10b981'; // Green
    if (requirement.includes('E-Visa') || requirement.includes('E-visa')) return '#3b82f6'; // Blue
    if (requirement.includes('Does not recognize')) return '#ef4444'; // Red
    return '#f59e0b'; // Amber
  };

  const stats = useMemo(() => ({
    total: visaData.length,
    visaFree: visaData.filter(c => c.visaRequirement.includes('not required')).length,
    eVisa: visaData.filter(c => c.visaRequirement.includes('E-Visa') || c.visaRequirement.includes('E-visa')).length,
    notRecognized: visaData.filter(c => c.visaRequirement.includes('Does not recognize')).length,
    visaRequired: visaData.filter(c => c.visaRequirement === 'Visa required').length,
  }), []);

  useEffect(() => {
    setLoading(true);
    fetch(geoUrl)
      .then(res => res.json())
      .then(geoData => {
        const processed = geoData.objects.countries.geometries.map(geo => {
          const countryName = geo.properties.name;
          const visaInfo = findVisaInfo(countryName);
          return {
            ...geo,
            color: visaInfo ? getColorForRequirement(visaInfo.visaRequirement) : '#27272a' // zinc-800
          };
        });
        setData(processed);
        setLoading(false);
      });
  }, []);

  return (
    <div className="py-8 text-white animate-fadeIn">
      {/* Bento Stats Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-6 flex flex-col justify-between group transition-all hover:bg-emerald-500/20">
          <div className="flex justify-between items-start">
            <span className="text-2xl">✓</span>
            <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500/50">Visa Free</span>
          </div>
          <div className="text-4xl font-black text-emerald-400">{stats.visaFree}</div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-3xl p-6 flex flex-col justify-between group transition-all hover:bg-blue-500/20">
          <div className="flex justify-between items-start">
            <span className="text-2xl">⚡</span>
            <span className="text-[8px] font-black uppercase tracking-widest text-blue-500/50">E-Visa</span>
          </div>
          <div className="text-4xl font-black text-blue-400">{stats.eVisa}</div>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-6 flex flex-col justify-between group transition-all hover:bg-amber-500/20">
          <div className="flex justify-between items-start">
            <span className="text-2xl">📋</span>
            <span className="text-[8px] font-black uppercase tracking-widest text-amber-500/50">Required</span>
          </div>
          <div className="text-4xl font-black text-amber-400">{stats.visaRequired}</div>
        </div>

        <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-6 flex flex-col justify-between group transition-all hover:bg-red-500/20">
          <div className="flex justify-between items-start">
            <span className="text-2xl">✕</span>
            <span className="text-[8px] font-black uppercase tracking-widest text-red-500/50">Restricted</span>
          </div>
          <div className="text-4xl font-black text-red-400">{stats.notRecognized}</div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative bg-zinc-900/40 backdrop-blur-md border border-zinc-700/50 rounded-[2.5rem] overflow-hidden shadow-2xl min-h-[400px] flex flex-col items-center justify-center">
        {isMobile ? (
          <div className="w-full flex flex-col items-center py-10 px-6">
            <div className="text-center mb-8">
              <h2 className="text-xl font-black text-white uppercase tracking-tight mb-2">Interactive Globe</h2>
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Touch to spin & explore</p>
            </div>
            
            <InteractiveGlobe data={visaData} />
            
            <button 
              onClick={() => onViewChange && onViewChange('table')}
              className="mt-10 bg-blue-600/90 backdrop-blur-md text-white px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl flex items-center gap-3 active:scale-95 transition-all w-full justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Browse Full Directory
            </button>
          </div>
        ) : (
          <>
            {/* Floating Legend */}
            <div className="absolute top-6 left-6 z-10 hidden md:block">
               <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-700/50 rounded-2xl p-4 flex flex-col gap-3">
                  {[
                    { color: '#10b981', label: 'Visa Free', icon: '✓' },
                    { color: '#3b82f6', label: 'E-Visa', icon: '⚡' },
                    { color: '#f59e0b', label: 'Required', icon: '📋' },
                    { color: '#ef4444', label: 'Restricted', icon: '✕' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3 group">
                       <div className="w-3 h-3 rounded-full shadow-lg transition-transform group-hover:scale-125" style={{ backgroundColor: item.color }}></div>
                       <span className="text-[10px] font-black uppercase tracking-tighter text-zinc-400 group-hover:text-white transition-colors">{item.label}</span>
                    </div>
                  ))}
               </div>
            </div>

            <div className="h-[600px] w-full flex items-center justify-center p-4">
              <ComposableMap
                projection="geoNaturalEarth1"
                width={800}
                height={450}
                projectionConfig={{
                  scale: 170,
                  center: [10, 0]
                }}
                className="w-full h-full cursor-grab active:cursor-grabbing"
              >
                <Geographies geography={geoUrl}>
                  {({ geographies }) =>
                    geographies.map(geo => {
                      const countryName = geo.properties.name;
                      const visaInfo = findVisaInfo(countryName);
                      const color = visaInfo ? getColorForRequirement(visaInfo.visaRequirement) : '#3f3f46'; // zinc-700
                      
                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill={color}
                          stroke="#71717a" // zinc-500
                          strokeWidth={0.5}
                          style={{
                            default: { outline: 'none', transition: 'all 250ms' },
                            hover: { fill: '#60a5fa', outline: 'none', cursor: 'pointer' },
                            pressed: { outline: 'none' },
                          }}
                          onMouseMove={(e) => {
                            const tooltip = document.getElementById('map-tooltip');
                            if (tooltip && visaInfo) {
                              let requirementText = visaInfo.visaRequirement;
                              if (requirementText.includes('Does not recognize US issued Refugee Travel Document')) {
                                requirementText = 'RTD NOT RECOGNIZED';
                              }
                              tooltip.innerHTML = `
                                <div class="p-3 transition-all duration-200">
                                  <h3 class="font-black text-[10px] text-zinc-500 uppercase tracking-widest mb-1">${countryName}</h3>
                                  <p class="text-sm font-black text-white uppercase">${requirementText}</p>
                                  ${visaInfo.notes ? `<p class="text-[9px] text-zinc-400 mt-2 max-w-[200px] leading-tight italic">"${visaInfo.notes}"</p>` : ''}
                                </div>
                              `;
                              tooltip.style.display = 'block';
                              tooltip.style.left = `${e.clientX + 20}px`;
                              tooltip.style.top = `${e.clientY + 20}px`;
                            }
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
          </>
        )}
      </div>

      <div
        id="map-tooltip"
        className="hidden fixed pointer-events-none bg-zinc-950/95 backdrop-blur-xl border border-zinc-700/50 rounded-2xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] z-[100]"
      ></div>
    </div>
  );
};

export default WorldMap;
