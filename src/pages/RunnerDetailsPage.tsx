import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ranking } from '@rasifix/orienteering-utils';
import RunnerSplitsTable from '../components/RunnerSplitsTable';
import RunnerComparisonGraph from '../components/RunnerComparisonGraph';
import Breadcrumbs from '../components/Breadcrumbs';
import { useCompetition } from '../contexts/CompetitionContext';

function RunnerDetailsPage() {
  const { source, id, categoryName, runnerId } = useParams<{
    source: string;
    id: string;
    categoryName: string;
    runnerId: string;
  }>();
  const { competition } = useCompetition();
  const [comparisonRunnerId, setComparisonRunnerId] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  const { category, runner, rankedRunners } = useMemo(() => {
    if (!competition || !categoryName || !runnerId) return { category: null, runner: null, rankedRunners: [] };
    
    const foundCategory = competition.categories?.find(
      cat => cat.name === decodeURIComponent(categoryName)
    );
    
    if (!foundCategory) return { category: null, runner: null, rankedRunners: [] };
    
    const ranked = ranking.parseRanking(foundCategory.runners || []);
    const selectedRunner = ranked.runners.find((r) => r.id === runnerId) || null;
    
    return { category: foundCategory, runner: selectedRunner, rankedRunners: ranked.runners };
  }, [competition, categoryName, runnerId]);

  const comparisonRunner = useMemo(() => {
    if (!comparisonRunnerId) return null;
    return rankedRunners.find(r => r.id === comparisonRunnerId) || null;
  }, [comparisonRunnerId, rankedRunners]);

  if (!runner) {
    return (
      <div className="px-4 py-6">
        <div className="text-center py-8 text-gray-500">Runner not found</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <Breadcrumbs items={[
        { label: 'Home', path: '/competitions', isHome: true },
        { label: competition?.name || 'Competition', path: `/competitions/${source}/${id}` },
        { label: category?.name || 'Category', path: `/competitions/${source}/${id}/categories/${categoryName}` },
        { label: runner.fullName, path: `/competitions/${source}/${id}/categories/${categoryName}/runners/${runnerId}` }
      ]} />

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {runner.fullName}
        </h2>
        <p className="text-red-800 font-semibold mb-2">
          Error: {runner.errorTime ? runner.errorTime : '00:00'}
        </p>
        <p className="text-gray-600 mb-6">
          {runner.club} • {runner.yearOfBirth}
        </p>

        {/* Comparison selector */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Compare with another runner:
          </label>
          <div className="flex gap-2">
            <select
              value={comparisonRunnerId || ''}
              onChange={(e) => setComparisonRunnerId(e.target.value || null)}
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-rust-500 focus:ring-rust-500"
            >
              <option value="">Select a runner...</option>
              {rankedRunners
                .filter(r => r.id !== runnerId)
                .map(r => (
                  <option key={r.id} value={r.id}>
                    {r.rank}. {r.fullName} ({r.time})
                  </option>
                ))}
            </select>
            <button
              onClick={() => setShowComparison(true)}
              disabled={!comparisonRunnerId}
              className="px-4 py-2 bg-rust-600 text-white rounded-md hover:bg-rust-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Compare
            </button>
          </div>
        </div>

        <RunnerSplitsTable runner={runner} source={source!} id={id!} />
      </div>

      {showComparison && comparisonRunner && runner && (
        <RunnerComparisonGraph
          currentRunner={runner}
          comparisonRunner={comparisonRunner}
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  );
}

export default RunnerDetailsPage;
