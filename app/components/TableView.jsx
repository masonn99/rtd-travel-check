import { useState, useMemo } from 'react';
import data from '/data.json';
import Flag from 'react-world-flags';
import { getCode } from 'country-list';

const TableView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Color mapping based on visa requirements
  const getColorForRequirement = (requirement) => {
    if (requirement.includes('not required')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (requirement.includes('E-Visa') || requirement.includes('E-visa')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    if (requirement.includes('Does not recognize')) return 'bg-red-500/10 text-red-400 border-red-500/20';
    return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  };

  const getBadgeIcon = (requirement) => {
    if (requirement.includes('not required')) return '✓';
    if (requirement.includes('E-Visa') || requirement.includes('E-visa')) return '⚡';
    if (requirement.includes('Does not recognize')) return '✕';
    return '📋';
  };

  const filteredCountries = useMemo(() => {
    return data
      .filter(country => {
        const matchesSearch = country.country.toLowerCase().includes(searchTerm.toLowerCase());
        if (filterType === 'all') return matchesSearch;
        if (filterType === 'visa-free') return matchesSearch && country.visaRequirement.includes('not required');
        if (filterType === 'e-visa') return matchesSearch && (country.visaRequirement.includes('E-Visa') || country.visaRequirement.includes('E-visa'));
        if (filterType === 'visa-required') return matchesSearch && country.visaRequirement.includes('Visa required');
        if (filterType === 'not-recognized') return matchesSearch && country.visaRequirement.includes('Does not recognize');
        return matchesSearch;
      })
      .sort((a, b) => a.country.localeCompare(b.country));
  }, [searchTerm, filterType]);

  const stats = useMemo(() => ({
    total: data.length,
    visaFree: data.filter(c => c.visaRequirement.includes('not required')).length,
    eVisa: data.filter(c => c.visaRequirement.includes('E-Visa') || c.visaRequirement.includes('E-visa')).length,
    visaRequired: data.filter(c => c.visaRequirement.includes('Visa required')).length,
    notRecognized: data.filter(c => c.visaRequirement.includes('Does not recognize')).length,
  }), []);

  return (
    <div className="py-8 text-white">
      {/* Modern Bento Header */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
        <div className="md:col-span-2 bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 backdrop-blur-md border border-zinc-700/50 rounded-3xl p-6 flex flex-col justify-center animate-fadeIn">
          <h1 className="text-2xl font-extrabold text-white mb-2 tracking-tight">
            Visa <span className="text-blue-500">Directory</span>
          </h1>
          <p className="text-zinc-400 text-[10px] leading-relaxed max-w-md uppercase font-bold tracking-widest">
            Database for RTD Holders
          </p>
        </div>

        {[
          { id: 'visa-free', label: 'Visa Free', value: stats.visaFree, color: 'emerald', icon: '✓' },
          { id: 'e-visa', label: 'E-Visa', value: stats.eVisa, color: 'blue', icon: '⚡' },
          { id: 'visa-required', label: 'Visa Required', value: stats.visaRequired, color: 'amber', icon: '📋' },
          { id: 'not-recognized', label: 'Not Recognized', value: stats.notRecognized, color: 'red', icon: '✕' },
        ].map((item) => (
          <div 
            key={item.id}
            onClick={() => setFilterType(item.id)}
            className={`bg-${item.color}-500/10 border border-${item.color}-500/20 rounded-3xl p-4 flex flex-col justify-between hover:bg-${item.color}-500/20 transition-all cursor-pointer group animate-fadeIn ${filterType === item.id ? 'ring-2 ring-' + item.color + '-500/50' : ''}`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-lg">{item.icon}</span>
              <span className={`text-[8px] font-black uppercase tracking-widest text-${item.color}-500/50 group-hover:text-${item.color}-500 transition-colors`}>{item.label}</span>
            </div>
            <div className={`text-2xl font-black text-${item.color}-400`}>{item.value}</div>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <div 
          onClick={() => setFilterType('all')}
          className="bg-zinc-800/30 border border-zinc-700/50 rounded-2xl p-4 hover:bg-zinc-800/50 transition-all cursor-pointer group animate-slideUp"
        >
          <div className="flex justify-between items-center max-w-xs mx-auto">
             <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total Monitored Countries</div>
             <div className="text-2xl font-black text-white">{stats.total}</div>
          </div>
        </div>
      </div>

      {/* Modern Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 animate-slideUp">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search destination country..."
            className="w-full px-6 py-4 bg-zinc-800/40 backdrop-blur-md border border-zinc-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-zinc-500 transition-all shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="p-1 text-zinc-500 hover:text-white transition-colors">
                ✕
              </button>
            )}
            <div className="h-6 w-px bg-zinc-700 mx-1"></div>
            <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <div className="flex p-1 bg-zinc-800/40 backdrop-blur-md border border-zinc-700/50 rounded-2xl overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All' },
            { id: 'visa-free', label: 'Visa Free' },
            { id: 'e-visa', label: 'E-Visa' },
            { id: 'not-recognized', label: 'Not Recognized' },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setFilterType(filter.id)}
              className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-tighter whitespace-nowrap transition-all duration-300 ${
                filterType === filter.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="animate-slideUp">
        {/* Desktop View: Modern List */}
        <div className="hidden md:block space-y-2">
          {filteredCountries.map((country, index) => (
            <div
              key={country.country}
              className="group bg-zinc-800/20 hover:bg-zinc-800/50 border border-zinc-700/30 hover:border-zinc-600/50 rounded-2xl p-4 transition-all duration-300 flex items-center gap-6"
              style={{ animationDelay: `${index * 10}ms` }}
            >
              <div className="w-12 h-8 flex-shrink-0">
                {getCode(country.country) ? (
                  <Flag code={getCode(country.country)} className="w-full h-full object-cover rounded shadow-md group-hover:scale-110 transition-transform" />
                ) : (
                  <div className="w-full h-full bg-zinc-700 rounded flex items-center justify-center text-[8px]">NO FLAG</div>
                )}
              </div>
              
              <div className="w-48 flex-shrink-0">
                <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors truncate uppercase tracking-tight">{country.country}</h3>
              </div>

              <div className="w-48 flex-shrink-0">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getColorForRequirement(country.visaRequirement)} shadow-sm`}>
                  <span>{getBadgeIcon(country.visaRequirement)}</span>
                  {country.visaRequirement.includes('Refugee Travel Document') ? 'NOT RECOGNIZED' : country.visaRequirement}
                </span>
              </div>

              <div className="w-32 flex-shrink-0">
                <p className="text-sm font-medium text-zinc-300">{country.duration || 'N/A'}</p>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs text-zinc-400 leading-relaxed font-medium italic">
                    {country.notes || '-'}
                </p>
                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-0.5">Notes</p>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile View: Enhanced Cards */}
        <div className="md:hidden space-y-4">
          {filteredCountries.map((country, index) => (
            <div
              key={country.country}
              className="bg-zinc-800/40 backdrop-blur-md rounded-[2rem] p-6 border border-zinc-700/50 animate-fadeIn shadow-xl"
              style={{ animationDelay: `${index * 20}ms` }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-10 flex-shrink-0">
                  {getCode(country.country) ? (
                    <Flag code={getCode(country.country)} className="w-full h-full object-cover rounded-xl shadow-lg" />
                  ) : (
                    <div className="w-full h-full bg-zinc-700 rounded-xl" />
                  )}
                </div>
                <div>
                  <h3 className="font-black text-white text-lg tracking-tight uppercase leading-none mb-1">{country.country}</h3>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getColorForRequirement(country.visaRequirement)}`}>
                    {getBadgeIcon(country.visaRequirement)} {country.visaRequirement.includes('Refugee Travel Document') ? 'NOT RECOGNIZED' : country.visaRequirement}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-zinc-900/50 rounded-2xl p-4 border border-zinc-700/30">
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Max Stay</p>
                  <p className="text-sm font-black text-white">{country.duration || 'N/A'}</p>
                </div>
                <div className="bg-zinc-900/50 rounded-2xl p-4 border border-zinc-700/30 flex items-center justify-center">
                   <div className="text-[10px] font-black text-blue-500 uppercase tracking-tighter">Details →</div>
                </div>
              </div>

              {country.notes && (
                <div className="p-4 bg-zinc-900/30 rounded-2xl border-l-2 border-zinc-600">
                  <p className="text-xs text-zinc-400 leading-relaxed italic text-wrap">
                    "{country.notes}"
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredCountries.length === 0 && (
          <div className="text-center py-24 bg-zinc-800/20 rounded-[3rem] border border-zinc-700/50 border-dashed">
            <div className="text-7xl mb-6 grayscale opacity-30">🛂</div>
            <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">No Results Found</h3>
            <p className="text-zinc-500 text-sm max-w-xs mx-auto">
              We couldn't find any information matching your search criteria.
            </p>
            <button 
              onClick={() => {setSearchTerm(''); setFilterType('all');}}
              className="mt-6 text-blue-500 font-bold uppercase text-xs tracking-widest hover:text-blue-400 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableView;
