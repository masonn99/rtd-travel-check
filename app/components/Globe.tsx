import { useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { CountryData } from '../actions/countries';

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json';

interface WorldMapProps {
  countries: CountryData[];
}

const WorldMap = ({ countries }: WorldMapProps) => {
  // Color mapping based on visa requirements
  const getColorForRequirement = (requirement: string) => {
    if (!requirement) return '#6b7280';
    const reqLower = requirement.toLowerCase();
    if (reqLower.includes('not required')) return '#10b981'; // Green
    if (reqLower.includes('e-visa')) return '#86efac'; // Light Green
    if (reqLower.includes('does not recognize')) return '#ef4444'; // Red
    return '#f59e0b'; // Yellow (for visa required)
  };

  // Known mapping differences between TopoJSON and our DB
  const nameAliases: { [key: string]: string } = {
    'united states of america': 'united states',
    'united states': 'united states of america',
    'vietnam': 'viet nam',
    'south korea': 'korea, republic of',
    'north korea': "korea, democratic people's republic of",
    'laos': "lao people's democratic republic",
    'syria': 'syrian arab republic',
    'moldova': 'moldova, republic of',
    'russia': 'russian federation',
    'bolivia': 'bolivia, plurinational state of',
    'venezuela': 'venezuela, bolivarian republic of',
    'iran': 'iran, islamic republic of',
    'tanzania': 'tanzania, united republic of',
    'congo': 'congo, republic of the',
    'dr congo': 'congo, democratic republic of the',
    'ivory coast': "cote d'ivoire",
    'cape verde': 'cabo verde',
    'swaziland': 'eswatini',
    'turkey': 'türkiye',
    'brunei': 'brunei darussalam',
    'palestine': 'palestine, state of',
    'micronesia': 'micronesia, federated states of',
    'east timor': 'timor-leste'
  };

  return (
    <div className="relative animate-fadeIn">
      {/* Stats Bar */}
      <div className="mb-8">
        <div className="bg-zinc-800/30 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>🌍</span>
            Global Visa Requirements Overview
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Visa Free', count: countries.filter(c => c.visaRequirement?.includes('not required')).length, color: 'emerald' },
              { label: 'E-Visa', count: countries.filter(c => c.visaRequirement?.includes('E-Visa') || c.visaRequirement?.includes('E-visa')).length, color: 'blue' },
              { label: 'Visa Required', count: countries.filter(c => c.visaRequirement?.includes('Visa required')).length, color: 'amber' },
              { label: 'Not Recognized', count: countries.filter(c => c.visaRequirement?.includes('Does not recognize')).length, color: 'red' },
            ].map((stat) => (
              <div key={stat.label} className={`bg-${stat.color}-500/5 border border-${stat.color}-500/20 rounded-xl p-4`}>
                <div className={`text-2xl font-bold text-${stat.color}-400 mb-1`}>{stat.count}</div>
                <div className="text-xs text-zinc-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-zinc-800/30 backdrop-blur-sm border border-zinc-700/50 rounded-2xl overflow-hidden">
        <div className="h-[450px] sm:h-[500px] w-full max-w-5xl mx-auto p-4 sm:p-6">
          <ComposableMap
            projection="geoNaturalEarth1"
            width={800}
            height={450}
            projectionConfig={{
              scale: 150,
              center: [10, 10]
            }}
          >
        <Geographies geography={geoUrl}>
          {({ geographies }: { geographies: any[] }) =>
            geographies.map(geo => {
              const countryName = geo.properties.name;
              const mapCountryLower = countryName.toLowerCase().trim();
              
              const visaInfo = countries.find(item => {
                const dataCountryLower = item.country.toLowerCase().trim();
                
                // 1. Exact match
                if (mapCountryLower === dataCountryLower) return true;
                
                // 2. Alias match
                if (nameAliases[mapCountryLower] === dataCountryLower) return true;
                if (nameAliases[dataCountryLower] === mapCountryLower) return true;

                // 3. Map name includes Data name (e.g., "Republic of Mali" includes "Mali")
                // We AVOID data includes map (e.g., "Romania" includes "Oman") to prevent false positives
                if (mapCountryLower.includes(dataCountryLower) && dataCountryLower.length > 3) return true;

                return false;
              });

              if (countryName === 'Oman') {
                 console.log('Oman Debug:', {
                    mapName: countryName,
                    found: !!visaInfo,
                    matchedCountry: visaInfo?.country,
                    requirement: visaInfo?.visaRequirement
                 });
              }

              const color = visaInfo ? getColorForRequirement(visaInfo.visaRequirement) : '#6b7280';

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={color}
                  stroke="#FFF"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: 'none' },
                    hover: { fill: '#3B82F6', outline: 'none' },
                    pressed: { outline: 'none' },
                  }}
                  onMouseMove={(e: React.MouseEvent) => {
                    const tooltip = document.getElementById('map-tooltip');
                    if (tooltip && visaInfo) {
                      let requirementText = visaInfo.visaRequirement;
                      if (requirementText.includes('Does not recognize US issued Refugee Travel Document')) {
                        requirementText = 'Does not recognize RTD';
                      }
                      tooltip.innerHTML = `
                        <div class="p-2 transition-all duration-200">
                          <h3 class="font-bold text-sm text-white [text-shadow:_0_1px_2px_rgb(0_0_0_/_80%)]">${countryName}</h3>
                          <p class="text-xs text-white/90 [text-shadow:_0_1px_2px_rgb(0_0_0_/_80%)]">${requirementText}</p>
                        </div>
                      `;
                      tooltip.style.display = 'block';
                      tooltip.style.left = `${e.clientX + 15}px`;
                      tooltip.style.top = `${e.clientY + 15}px`;
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

        {/* Legend */}
        <div className="mt-6 pt-6 border-t border-zinc-700/50 bg-zinc-800/60 backdrop-blur-sm -mx-4 sm:-mx-6 px-4 sm:px-6 py-4">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {[
              { color: '#10b981', label: 'Visa Not Required', icon: '✓' },
              { color: '#86efac', label: 'E-Visa Available', icon: '⚡' },
              { color: '#f59e0b', label: 'Visa Required', icon: '📋' },
              { color: '#ef4444', label: 'Does not recognize RTD', icon: '✕' },
              { color: '#6b7280', label: 'No Info', icon: '?' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 group">
                <div
                  className="w-4 h-4 rounded border border-zinc-600 group-hover:scale-110 transition-transform shadow-sm"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-xs sm:text-sm text-zinc-300 group-hover:text-white transition-colors">
                  <span className="mr-1">{item.icon}</span>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        id="map-tooltip"
        className="hidden fixed pointer-events-none bg-zinc-900/95 backdrop-blur-md border border-zinc-700 rounded-lg shadow-2xl"
        style={{ zIndex: 100 }}
      ></div>
    </div>
  );
};

export default WorldMap;