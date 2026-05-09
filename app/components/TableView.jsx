import { useState, useMemo } from 'react';
import data from '../../data.json';
import Flag from 'react-world-flags';
import { getCode } from 'country-list';
import ExperienceList from './ExperienceList';

const getVisaStyle = (requirement) => {
  if (requirement.includes('not required')) return { bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' };
  if (requirement.includes('E-Visa') || requirement.includes('E-visa')) return { bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20', dot: 'bg-blue-400' };
  if (requirement.includes('Does not recognize')) return { bg: 'bg-red-500/10 text-red-400 border-red-500/20', dot: 'bg-red-400' };
  return { bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20', dot: 'bg-amber-400' };
};

const getVisaLabel = (requirement) => {
  if (requirement.includes('not required')) return 'Visa Free';
  if (requirement.includes('E-Visa') || requirement.includes('E-visa')) return 'E-Visa';
  if (requirement.includes('Does not recognize')) return 'Not Recognized';
  return 'Visa Required';
};

const TableView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [expandedCountry, setExpandedCountry] = useState(null);

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

  const filterOptions = [
    { id: 'all', label: 'All', value: stats.total, color: 'text-zinc-300' },
    { id: 'visa-free', label: 'Visa Free', value: stats.visaFree, color: 'text-emerald-400' },
    { id: 'e-visa', label: 'E-Visa', value: stats.eVisa, color: 'text-blue-400' },
    { id: 'visa-required', label: 'Visa Required', value: stats.visaRequired, color: 'text-amber-400' },
    { id: 'not-recognized', label: 'Not Recognized', value: stats.notRecognized, color: 'text-red-400' },
  ];

  return (
    <div className="py-6 text-white">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Visa <span className="text-blue-400">Directory</span>
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          {stats.total} countries tracked for RTD holders
        </p>
      </div>

      {/* Stat filter chips — horizontal scroll on mobile */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-5">
        {filterOptions.map(opt => (
          <button
            key={opt.id}
            onClick={() => setFilterType(opt.id)}
            className={`flex-shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all duration-200 ${
              filterType === opt.id
                ? 'bg-blue-600 border-blue-500 text-white shadow-sm shadow-blue-600/30'
                : 'bg-zinc-800/40 border-zinc-700/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
            }`}
          >
            <span className={filterType === opt.id ? 'text-white' : opt.color}>{opt.value}</span>
            <span>{opt.label}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search country..."
          className="w-full pl-10 pr-10 py-2.5 bg-zinc-800/40 border border-zinc-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 text-white placeholder-zinc-500 text-sm transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Results count */}
      <p className="text-xs text-zinc-600 mb-3 font-medium">
        {filteredCountries.length} {filteredCountries.length === 1 ? 'result' : 'results'}
      </p>

      {/* Desktop list */}
      <div className="hidden md:block">
        <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[auto_1fr_180px_120px_1fr] gap-4 px-5 py-3 border-b border-zinc-800/60 bg-zinc-900/60">
            <div className="w-12" />
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Country</span>
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Visa Status</span>
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Max Stay</span>
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Notes</span>
          </div>

          {filteredCountries.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-4xl mb-3 opacity-20">🛂</div>
              <p className="text-zinc-500 text-sm">No results for "{searchTerm}"</p>
              <button
                onClick={() => { setSearchTerm(''); setFilterType('all'); }}
                className="mt-3 text-blue-400 text-xs font-semibold hover:text-blue-300 transition-colors"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/40">
              {filteredCountries.map((country) => {
                const style = getVisaStyle(country.visaRequirement);
                const label = getVisaLabel(country.visaRequirement);
                return (
                  <div
                    key={country.country}
                    className="grid grid-cols-[auto_1fr_180px_120px_1fr] gap-4 px-5 py-3.5 items-center hover:bg-zinc-800/20 transition-colors group"
                  >
                    <div className="w-12 h-8 flex-shrink-0">
                      {getCode(country.country) ? (
                        <Flag code={getCode(country.country)} className="w-full h-full object-cover rounded-md shadow-sm" />
                      ) : (
                        <div className="w-full h-full bg-zinc-800 rounded-md flex items-center justify-center text-[8px] text-zinc-600">N/A</div>
                      )}
                    </div>
                    <span className="font-semibold text-white text-sm group-hover:text-blue-300 transition-colors truncate">
                      {country.country}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border w-fit ${style.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                      {label}
                    </span>
                    <span className="text-sm text-zinc-300 font-medium">{country.duration || '—'}</span>
                    <span className="text-xs text-zinc-500 leading-relaxed line-clamp-2 italic">
                      {country.notes || '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mobile list — compact rows */}
      <div className="md:hidden space-y-1.5">
        {filteredCountries.length === 0 ? (
          <div className="py-16 text-center bg-zinc-800/20 rounded-2xl border border-zinc-700/40 border-dashed">
            <div className="text-4xl mb-3 opacity-20">🛂</div>
            <p className="text-zinc-500 text-sm mb-3">No results found</p>
            <button
              onClick={() => { setSearchTerm(''); setFilterType('all'); }}
              className="text-blue-400 text-xs font-semibold hover:text-blue-300 transition-colors"
            >
              Reset filters
            </button>
          </div>
        ) : (
          filteredCountries.map((country) => {
            const style = getVisaStyle(country.visaRequirement);
            const label = getVisaLabel(country.visaRequirement);
            const isExpanded = expandedCountry === country.country;

            return (
              <div
                key={country.country}
                className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl overflow-hidden animate-fadeIn"
              >
                {/* Row */}
                <button
                  className="w-full flex items-center gap-3 p-3.5 text-left hover:bg-zinc-800/30 transition-colors"
                  onClick={() => setExpandedCountry(isExpanded ? null : country.country)}
                >
                  <div className="w-9 h-6 flex-shrink-0">
                    {getCode(country.country) ? (
                      <Flag code={getCode(country.country)} className="w-full h-full object-cover rounded-[4px] shadow-sm" />
                    ) : (
                      <div className="w-full h-full bg-zinc-800 rounded-[4px]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-white text-sm block truncate">{country.country}</span>
                    {country.duration && (
                      <span className="text-[11px] text-zinc-500">{country.duration}</span>
                    )}
                  </div>

                  <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${style.bg}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                    {label}
                  </span>

                  <svg
                    className={`w-4 h-4 text-zinc-600 flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Expanded panel */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-zinc-800/60 animate-fadeIn">
                    {country.notes && (
                      <p className="text-xs text-zinc-400 leading-relaxed italic mt-3 mb-4">
                        "{country.notes}"
                      </p>
                    )}
                    <div className="pt-3 border-t border-zinc-800/40">
                      <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-3">Traveler Stories</p>
                      <ExperienceList filterCountry={country.country} />
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TableView;
