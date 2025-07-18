import { useState } from 'react';
import data from '/data.json';
import Flag from 'react-world-flags';
import { getCode } from 'country-list';

const TableView = ({ onViewChange }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Color mapping based on visa requirements
  const getColorForRequirement = (requirement) => {
    if (requirement.includes('not required')) return 'bg-emerald-500/10 text-emerald-400';
    if (requirement.includes('E-Visa') || requirement.includes('E-visa')) return 'bg-yellow-500/10 text-yellow-400';
    if (requirement.includes('Does not recognize')) return 'bg-red-500/10 text-red-400';
    return 'bg-gray-500/10 text-gray-400';
  };

  const filteredCountries = data
    .filter(country => country.country.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.country.localeCompare(b.country));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-white">
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => onViewChange('globe')}
          className="flex items-center gap-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs"
        >
  
        </button>
        <input
          type="text"
          placeholder="Search countries..."
          className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        {/* Desktop Table */}
        <table className="w-full border-collapse hidden md:table">
          <thead>
            <tr className="border-b border-zinc-700">
              <th className="px-4 py-3 text-left">Country</th>
              <th className="px-4 py-3 text-left">Visa Requirement</th>
              <th className="px-4 py-3 text-left">Duration</th>
              <th className="px-4 py-3 text-left">Notes</th>
            </tr>
          </thead>
          <tbody>
            {filteredCountries.map((country) => (
              <tr 
                key={country.country}
                className="border-b border-zinc-800 hover:bg-zinc-800/30"
              >
                <td className="px-4 py-3 flex items-center gap-2">
                  {getCode(country.country) ? (
                    <Flag code={getCode(country.country)} className="h-4 w-6 rounded-sm" />
                  ) : null}
                  {country.country}
                </td>
                <td className={`px-4 py-3 ${getColorForRequirement(country.visaRequirement)}`}>
                  {country.visaRequirement}
                </td>
                <td className="px-4 py-3 text-zinc-300">
                  {country.duration || 'N/A'}
                </td>
                <td className="px-4 py-3 text-zinc-400 text-sm">
                  {country.notes || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {filteredCountries.map((country) => (
            <div 
              key={country.country}
              className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700"
            >
              <div className="flex items-center gap-2 mb-1">
                {getCode(country.country) ? (
                  <Flag code={getCode(country.country)} className="h-3 w-5 rounded-sm" />
                ) : null}
                <h3 className="font-medium text-sm">{country.country}</h3>
              </div>
              <div className={`${getColorForRequirement(country.visaRequirement)} px-1.5 py-0.5 rounded text-xs mb-0.5`}>
                {country.visaRequirement}
              </div>
              <div className="text-zinc-300 text-xs mb-0.5">
                Duration: {country.duration || 'N/A'}
              </div>
              {country.notes && (
                <div className="text-zinc-400 text-[0.65rem] leading-tight">
                  Notes: {country.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TableView;
