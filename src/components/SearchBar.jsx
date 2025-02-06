import { useState, useEffect } from 'react';
import { Search, Globe2, Clock, FileText, SlidersHorizontal, X } from 'lucide-react';
import Flag from 'react-world-flags';
import data from '/data.json';
import { getCode } from 'country-list';
import { useNavigate } from 'react-router-dom'; // Add this import


const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [countries, setCountries] = useState([]);
  const [allCountries, setAllCountries] = useState([]);
  const [activeFilter, setActiveFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate(); // Add this line
  const [postCounts, setPostCounts] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const visaTypes = [
    { name: 'Visa Not Required', color: 'emerald' },
    { name: 'E-Visa', color: 'green' },
    { name: 'Visa Required', color: 'yellow' },
    { name: 'Does Not Recognize Refugee Travel Document', color: 'red' }
  ];

  useEffect(() => {
    const cachedCounts = localStorage.getItem('postCounts');
    if (cachedCounts) {
      setPostCounts(JSON.parse(cachedCounts));
      setIsLoading(false);
    }

    const fetchData = async () => {
      const sortedCountries = [...data].sort((a, b) => a.country.localeCompare(b.country));
      setCountries(sortedCountries);
      setAllCountries(sortedCountries);

      try {
        console.log('Fetching post counts...');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/experiences/stats`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Origin': window.location.origin
          },
          credentials: 'include'
        });
        
        if (response.ok) {
          const stats = await response.json();
          console.log('Received stats:', stats);
          
          // Convert the stats array into an object format
          const counts = stats.reduce((acc, stat) => {
            acc[stat.country] = stat._count.country;
            return acc;
          }, {});
          
          console.log('Processed post counts:', counts);
          setPostCounts(counts);
          localStorage.setItem('postCounts', JSON.stringify(counts));
        } else {
          console.error('Failed to fetch stats:', response.status);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);


  const handleSearch = event => {
    setSearchTerm(event.target.value);
    filterCountries(event.target.value, activeFilter);
  };

  const toggleFilter = (filterName) => {
    const newFilter = activeFilter === filterName ? '' : filterName;
    setActiveFilter(newFilter);
    setShowFilters(false); // Close the filter popup after selection
    filterCountries(searchTerm, newFilter);
  };

  const filterCountries = (search, filter) => {
    let filtered = [...allCountries];

    if (search) {
      filtered = filtered.filter(country =>
        country.country.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filter) {
      filtered = filtered.filter(country => {
        const countryStatus = country.visaRequirement.toLowerCase();
        const filterStatus = filter.toLowerCase();
        
        if (filterStatus === 'does not recognize refugee travel document') {
          return countryStatus.includes('does not recognize');
        }
        
        return countryStatus === filterStatus;
      });
    }

    filtered.sort((a, b) => a.country.localeCompare(b.country));
    setCountries(filtered);
  };

  const getStatusStyles = (status) => {
    const lowercaseStatus = status.toLowerCase();
    
    if (lowercaseStatus === 'visa not required') {
      return {
        card: 'bg-emerald-900/10 border-emerald-800/50 hover:bg-emerald-900/20',
        badge: 'bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/30'
      };
    }
    
    if (lowercaseStatus === 'evisa' || lowercaseStatus === 'e-visa') {
      return {
        card: 'bg-green-800/10 border-green-700/50 hover:bg-green-800/20',
        badge: 'bg-green-500/20 text-green-400 group-hover:bg-green-500/30'
      };
    }
    
    if (lowercaseStatus === 'visa required') {
      return {
        card: 'bg-yellow-900/10 border-yellow-800/50 hover:bg-yellow-900/20',
        badge: 'bg-yellow-500/20 text-yellow-400 group-hover:bg-yellow-500/30'
      };
    }
    
    if (lowercaseStatus.includes('does not recognize')) {
      return {
        card: 'bg-red-900/10 border-red-800/50 hover:bg-red-900/20',
        badge: 'bg-red-500/20 text-red-400 group-hover:bg-red-500/30'
      };
    }
    
    return {
      card: 'bg-zinc-800/30 border-zinc-700/50 hover:bg-zinc-800/50',
      badge: 'bg-zinc-700/30 text-zinc-300 group-hover:bg-zinc-700/40'
    };
  };

  const jsonLD = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "RTD Travel Check",
    "description": "Check visa requirements for Refugee Travel Document holders",
    "applicationCategory": "Travel Application",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0"
    }
  };

  return (
    <>
      <script type="application/ld+json">
        {JSON.stringify(jsonLD)}
      </script>
      <div className="relative">
        {/* Search and filter buttons */}
        <div className="sticky top-0 z-50 bg-black pb-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search countries..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full px-4 py-2 pl-10 bg-black/50 border border-zinc-800 rounded-lg 
                        focus:outline-none focus:border-blue-500 transition-colors text-white placeholder-zinc-400"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg border transition-all duration-200 flex items-center gap-2
                        ${showFilters 
                          ? 'bg-blue-500 border-blue-400 text-white' 
                          : 'bg-black/50 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
            >
              {showFilters ? (
                <X className="h-4 w-4" />
              ) : (
                <SlidersHorizontal className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
        </div>

        {/* Filter dropdown */}
        {showFilters && (
          <>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setShowFilters(false)} />
            <div className="fixed left-1/2 top-1/4 -translate-x-1/2 w-full max-w-2xl px-4 z-50">
              <div className="w-full p-4 bg-black border border-zinc-800 rounded-lg shadow-xl animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => toggleFilter('Visa Not Required')}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors
                              ${activeFilter === 'Visa Not Required' 
                                ? 'bg-emerald-500 text-white' 
                                : 'bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800/50'}`}
                  >
                    Visa Not Required
                  </button>
                  <button
                    onClick={() => toggleFilter('E-Visa')}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors
                              ${activeFilter === 'E-Visa' 
                                ? 'bg-green-500 text-white' 
                                : 'bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800/50'}`}
                  >
                    E-Visa
                  </button>
                  <button
                    onClick={() => toggleFilter('Visa Required')}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors
                              ${activeFilter === 'Visa Required' 
                                ? 'bg-yellow-500 text-white' 
                                : 'bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800/50'}`}
                  >
                    Visa Required
                  </button>
                  <button
                    onClick={() => toggleFilter('Does Not Recognize Refugee Travel Document')}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors
                              ${activeFilter === 'Does Not Recognize Refugee Travel Document' 
                                ? 'bg-red-500 text-white' 
                                : 'bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800/50'}`}
                  >
                    Does Not Recognize Refugee Travel Document
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Results section with padding when filters are shown */}
        <div className={showFilters ? 'opacity-50' : ''}>
          {/* Results count */}
          <div className="text-xs sm:text-sm text-zinc-400 mb-4">
            Found {countries.length} countries
          </div>

          {/* Results list */}
          <div className={`space-y-3 sm:space-y-4 ${isLoading ? 'opacity-50' : ''}`}>
            {isLoading && (
              <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            )}
            {countries.map((country, index) => {
              const styles = getStatusStyles(country.visaRequirement);
              const postCount = postCounts[country.country] || 0;
              console.log(`Post count for ${country.country}:`, postCount); // Add this line for debugging
              
              return (
                <div
                  key={index}
                  className={`group p-4 sm:p-6 rounded-lg sm:rounded-xl border backdrop-blur-sm transition-all duration-300 
                            hover:transform hover:translate-y-[-2px] hover:shadow-lg hover:shadow-zinc-900/20
                            ${styles.card} relative`} // Added relative positioning
                  onClick={() => navigate(`/country/${country.country}`)} // Add this line
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      {getCode(country.country) ? (
                        <div className="w-5 h-3.5 sm:w-6 sm:h-4 flex items-center justify-center overflow-hidden">
                          <Flag 
                            code={getCode(country.country)}
                            className="rounded-sm object-cover w-full h-full"
                            fallback={<Globe2 className="h-5 w-5 text-zinc-400" />}
                          />
                        </div>
                      ) : (
                        <Globe2 className="h-5 w-5 text-zinc-400" />
                      )}
                      <h2 className="text-base sm:text-lg font-medium text-zinc-100">{country.country}</h2>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium
                                    transition-colors ${styles.badge}`}>
                      {country.visaRequirement}
                    </span>
                  </div>
                  
                  <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3 text-xs sm:text-sm text-zinc-300 pb-10"> {/* Added pb-10 for space */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-zinc-400 flex-shrink-0" />
                      <p>Maximum Stay: {country.duration || "Not specified"}</p>
                    </div>
                    {country.notes && (
                      <div className="flex items-start gap-1.5 sm:gap-2"> {/* Changed to items-start */}
                        <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-zinc-400 flex-shrink-0 mt-1" /> {/* Added flex-shrink-0 and mt-1 */}
                        <p className="break-words pr-20"> {/* Added break-words and right padding */}
                          {country.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Experience count badge with absolute positioning */}
                  <div className="absolute bottom-4 right-4">
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full 
                                    ${postCount > 0 
                                      ? 'bg-blue-500/20 text-blue-400' 
                                      : 'bg-zinc-700/20 text-zinc-400'}`}>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-3.5 w-3.5" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" 
                        />
                      </svg>
                      <span className="text-xs font-medium whitespace-nowrap"> {/* Added whitespace-nowrap */}
                        {postCount} {postCount === 1 ? 'Experience' : 'Experiences'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {countries.length === 0 && (
              <div className="text-center py-12 text-zinc-400">
                No countries found matching your criteria 🔍
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchBar;
