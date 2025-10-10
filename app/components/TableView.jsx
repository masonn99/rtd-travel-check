import { useState } from 'react';
import data from '/data.json';
import Flag from 'react-world-flags';
import { getCode } from 'country-list';

const TableView = ({ onViewChange }) => {
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

  const filteredCountries = data
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

  const stats = {
    total: data.length,
    visaFree: data.filter(c => c.visaRequirement.includes('not required')).length,
    eVisa: data.filter(c => c.visaRequirement.includes('E-Visa') || c.visaRequirement.includes('E-visa')).length,
    visaRequired: data.filter(c => c.visaRequirement.includes('Visa required')).length,
    notRecognized: data.filter(c => c.visaRequirement.includes('Does not recognize')).length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-white">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 animate-fadeIn">
        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-xl p-3 sm:p-4 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 cursor-pointer"
             onClick={() => setFilterType('visa-free')}>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-400 mb-1">{stats.visaFree}</div>
          <div className="text-[10px] sm:text-xs text-emerald-300/70">Visa Free</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-3 sm:p-4 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer"
             onClick={() => setFilterType('e-visa')}>
          <div className="text-2xl sm:text-3xl font-bold text-blue-400 mb-1">{stats.eVisa}</div>
          <div className="text-[10px] sm:text-xs text-blue-300/70">E-Visa</div>
        </div>
        <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-xl p-3 sm:p-4 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 cursor-pointer"
             onClick={() => setFilterType('visa-required')}>
          <div className="text-2xl sm:text-3xl font-bold text-amber-400 mb-1">{stats.visaRequired}</div>
          <div className="text-[10px] sm:text-xs text-amber-300/70">Visa Required</div>
        </div>
        <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-xl p-3 sm:p-4 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300 cursor-pointer"
             onClick={() => setFilterType('not-recognized')}>
          <div className="text-2xl sm:text-3xl font-bold text-red-400 mb-1">{stats.notRecognized}</div>
          <div className="text-[10px] sm:text-xs text-red-300/70">Not Recognized</div>
        </div>
        <div className="bg-gradient-to-br from-zinc-500/10 to-zinc-600/5 border border-zinc-500/20 rounded-xl p-3 sm:p-4 hover:shadow-lg hover:shadow-zinc-500/10 transition-all duration-300 cursor-pointer col-span-2 sm:col-span-3 lg:col-span-1"
             onClick={() => setFilterType('all')}>
          <div className="text-2xl sm:text-3xl font-bold text-zinc-300 mb-1">{stats.total}</div>
          <div className="text-[10px] sm:text-xs text-zinc-400/70">Total Countries</div>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 mb-4 animate-slideUp">
        {[
          { id: 'all', label: 'All Countries', icon: '🌍' },
          { id: 'visa-free', label: 'Visa Free', icon: '✓' },
          { id: 'e-visa', label: 'E-Visa', icon: '⚡' },
          { id: 'visa-required', label: 'Visa Required', icon: '📋' },
          { id: 'not-recognized', label: 'Not Recognized', icon: '✕' },
        ].map((filter) => (
          <button
            key={filter.id}
            onClick={() => setFilterType(filter.id)}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
              filterType === filter.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700/50 hover:text-white border border-zinc-700/50'
            }`}
          >
            <span className="mr-1">{filter.icon}</span>
            {filter.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="mb-6 animate-slideUp">
        <div className="relative">
          <input
            type="text"
            placeholder="Search countries..."
            className="w-full px-4 py-3 sm:py-3.5 pl-11 bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white placeholder-zinc-500 text-sm sm:text-base transition-all duration-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <div className="mt-2 text-xs text-zinc-500">
          Showing {filteredCountries.length} of {data.length} countries
        </div>
      </div>

      <div className="overflow-x-auto animate-slideUp">
        {/* Desktop Table */}
        <div className="hidden md:block bg-zinc-800/30 backdrop-blur-sm border border-zinc-700/50 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-zinc-800/50 border-b border-zinc-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-300 uppercase tracking-wider">Country</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-300 uppercase tracking-wider">Visa Requirement</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-300 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-300 uppercase tracking-wider">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filteredCountries.map((country, index) => (
                <tr
                  key={country.country}
                  className="hover:bg-zinc-800/30 transition-colors duration-150"
                  style={{ animationDelay: `${index * 20}ms` }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {getCode(country.country) ? (
                        <Flag code={getCode(country.country)} className="h-5 w-7 rounded shadow-sm" />
                      ) : (
                        <div className="h-5 w-7 bg-zinc-700 rounded" />
                      )}
                      <span className="font-medium text-white">{country.country}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${getColorForRequirement(country.visaRequirement)}`}>
                      <span>{getBadgeIcon(country.visaRequirement)}</span>
                      {country.visaRequirement}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-300">
                    {country.duration || <span className="text-zinc-600">N/A</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-400 max-w-md">
                    {country.notes || <span className="text-zinc-600">-</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {filteredCountries.map((country, index) => (
            <div
              key={country.country}
              className="bg-zinc-800/40 backdrop-blur-sm rounded-xl p-4 border border-zinc-700/50 hover:border-zinc-600/50 transition-all duration-200 animate-fadeIn"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div className="flex items-start gap-3 mb-3">
                {getCode(country.country) ? (
                  <Flag code={getCode(country.country)} className="h-4 w-6 rounded shadow-sm flex-shrink-0 mt-0.5" />
                ) : (
                  <div className="h-4 w-6 bg-zinc-700 rounded flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-sm mb-2">{country.country}</h3>
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${getColorForRequirement(country.visaRequirement)} mb-2`}>
                    <span>{getBadgeIcon(country.visaRequirement)}</span>
                    {country.visaRequirement}
                  </div>
                </div>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 font-medium">Duration:</span>
                  <span className="text-zinc-300">{country.duration || 'N/A'}</span>
                </div>
                {country.notes && (
                  <div className="flex gap-2 pt-1 border-t border-zinc-700/50">
                    <span className="text-zinc-500 font-medium flex-shrink-0">Notes:</span>
                    <span className="text-zinc-400 leading-relaxed">{country.notes}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredCountries.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-zinc-400 text-lg mb-2">No countries found</p>
            <p className="text-zinc-500 text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableView;
