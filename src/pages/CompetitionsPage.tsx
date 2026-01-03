import { useEffect, useState } from 'react';
import CompetitionList from '../components/CompetitionList';
import { competitionService } from '../services/competitionService';
import { Competition } from '../types';

function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<string>('all');

  useEffect(() => {
    const loadCompetitions = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await competitionService.getCompetitions();
        setCompetitions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load competitions');
        console.error('Error loading competitions:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCompetitions();
  }, []);

  const allSources = Array.from(new Set(competitions.map(c => c.source))).sort();
  const filteredCompetitions = competitions.filter(
    competition => selectedSource === 'all' || competition.source === selectedSource
  );

  return (
    <div className="px-4 py-6 sm:px-0">
      {/* Source Filter */}
      {!loading && !error && competitions.length > 0 && (
        <div className="mb-6 flex justify-end">
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
      <CompetitionList competitions={filteredCompetitions} loading={loading} error={error} />
    </div>
  );
}

export default CompetitionsPage;
