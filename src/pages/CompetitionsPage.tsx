import { useEffect, useState } from 'react';
import CompetitionList from '../components/CompetitionList';
import { competitionService } from '../services/competitionService';
import { Competition } from '../types';

function CompetitionsPage() {
  // Default to current year, except in January where we use previous year
  const getDefaultYear = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0 = January
    return currentMonth === 0 ? currentYear - 1 : currentYear;
  };

  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<number>(getDefaultYear());

  useEffect(() => {
    const loadCompetitions = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await competitionService.getCompetitions(selectedYear);
        setCompetitions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load competitions');
        console.error('Error loading competitions:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCompetitions();
  }, [selectedYear]);

  const allSources = Array.from(new Set(competitions.map(c => c.source))).sort();
  const filteredCompetitions = competitions.filter(
    competition => selectedSource === 'all' || competition.source === selectedSource
  );

  // Generate year options from 1997 to current year
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from(
    { length: currentYear - 1997 + 1 },
    (_, i) => currentYear - i
  );

  return (
    <div className="px-4 py-6 sm:px-0">
      {/* Year and Source Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-end">
        <div className="flex-1 sm:flex-initial">
          <label htmlFor="year-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Year
          </label>
          <select
            id="year-filter"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="block w-full md:w-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rust-500 focus:border-rust-500 sm:text-sm"
          >
            {yearOptions.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        {!loading && !error && competitions.length > 0 && (
          <div className="flex-1 sm:flex-initial">
            <label htmlFor="source-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Source
            </label>
            <select
              id="source-filter"
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="block w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rust-500 focus:border-rust-500 sm:text-sm"
            >
              <option value="all">All Sources</option>
              {allSources.map(source => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      <CompetitionList competitions={filteredCompetitions} loading={loading} error={error} />
    </div>
  );
}

export default CompetitionsPage;
