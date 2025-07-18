import { useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import visaData from '/data.json';

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json';

const WorldMap = () => {
  const [data, setData] = useState([]);

  // Color mapping based on visa requirements
  const getColorForRequirement = (requirement) => {
    if (requirement.includes('not required')) return '#10b981'; // Green
    if (requirement.includes('E-Visa') || requirement.includes('E-visa')) return '#86efac'; // Light Green
    if (requirement.includes('Does not recognize')) return '#ef4444'; // Red
    return '#f59e0b'; // Yellow (for visa required)
  };

  useEffect(() => {
    fetch(geoUrl)
      .then(res => res.json())
      .then(geoData => {
        const processed = geoData.objects.countries.geometries.map(geo => {
          const countryName = geo.properties.name;
          const visaInfo = visaData.find(item => {
            // Handle common naming differences
            const dataCountry = item.country.toLowerCase();
            const mapCountry = countryName.toLowerCase();
            
            // Special cases
            if (mapCountry === 'united kingdom' && dataCountry.includes('uk')) return true;
            if (mapCountry === 'south korea' && dataCountry.includes('korea')) return true;
            if (mapCountry === 'turkey' && dataCountry.includes('türkiye')) return true;
            
            // General matching
            return mapCountry.includes(dataCountry) || 
                   dataCountry.includes(mapCountry);
          });
          
          return {
            ...geo,
            color: visaInfo ? getColorForRequirement(visaInfo.visaRequirement) : '#6b7280'
          };
        });
        setData(processed);
      });
  }, []);

  return (
    <div className="relative">
      <div className="h-[500px] w-full max-w-5xl mx-auto">
      <ComposableMap 
        projection="geoNaturalEarth1"
        width={800}
        height={450}
        projectionConfig={{
          scale: 150,
          center: [10, 20]  // Shifted center down by 20 degrees
        }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map(geo => {
              const countryName = geo.properties.name;
              const visaInfo = visaData.find(item => {
                const dataCountry = item.country.toLowerCase();
                const mapCountry = countryName.toLowerCase();
                if (mapCountry === 'united kingdom' && dataCountry.includes('uk')) return true;
                if (mapCountry === 'south korea' && dataCountry.includes('korea')) return true;
                if (mapCountry === 'turkey' && dataCountry.includes('türkiye')) return true;
                return mapCountry.includes(dataCountry) || dataCountry.includes(mapCountry);
              });
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
                  onMouseMove={(e) => {
                    const tooltip = document.getElementById('map-tooltip');
                    if (tooltip && visaInfo) {
                      tooltip.innerHTML = `
                        <div class="bg-white p-2 rounded shadow-lg">
                          <h3 class="font-bold">${countryName}</h3>
                          <p>Visa: ${visaInfo.visaRequirement}</p>
                          ${visaInfo.notes ? `<p class="text-sm">${visaInfo.notes}</p>` : ''}
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
      <div className="mt-4 flex flex-wrap gap-4 justify-center">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 mr-2"></div>
          <span className="text-white">Visa Not Required</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-[#86efac] mr-2"></div>
          <span className="text-white">E-Visa Available</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-500 mr-2"></div>
          <span className="text-white">Visa Required</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 mr-2"></div>
          <span className="text-white">Does Not Recognize RTD</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gray-500 mr-2"></div>
          <span className="text-white">No Info</span>
        </div>
      </div>
      </div>
      <div 
        id="map-tooltip"
        className="hidden fixed bg-white p-2 rounded shadow-lg pointer-events-none"
        style={{ zIndex: 100 }}
      ></div>
    </div>
  );
};

export default WorldMap;
