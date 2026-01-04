import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ranking } from '@rasifix/orienteering-utils';
import RunnerSplitsTable from '../components/RunnerSplitsTable';
import RunnerComparisonGraph from '../components/RunnerComparisonGraph';
import RunnerSelector from '../components/RunnerSelector';
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
        <div className="text-center py-8 text-text-muted">Runner not found</div>
      </div>
    );
  }

  return (
    <div className="md:px-4 py-6">
      <div className="px-4">
      <Breadcrumbs items={[
        { label: 'Home', path: '/competitions', isHome: true },
        { label: competition?.name || 'Competition', path: `/competitions/${source}/${id}` },
        { label: category?.name || 'Category', path: `/competitions/${source}/${id}/categories/${categoryName}` },
        { label: runner.fullName, path: `/competitions/${source}/${id}/categories/${categoryName}/runners/${runnerId}` }
      ]} />
      </div>

      <div className="bg-surface-primary rounded-none md:rounded-lg shadow-lg p-4 md:p-6">
        <h2 className="text-2xl font-bold text-text-primary mb-2">
          {runner.fullName}
        </h2>
        <p className="text-text-primary font-semibold mb-2">
          Final Time: {runner.time}
        </p>
        <p className="text-error font-semibold mb-2">
          Error: {runner.errorTime ? runner.errorTime : '00:00'}
        </p>
        <p className="text-text-tertiary mb-6">
          {runner.club} • {runner.yearOfBirth}
        </p>

        <RunnerSelector
          rankedRunners={rankedRunners}
          currentRunnerId={runnerId!}
          comparisonRunnerId={comparisonRunnerId}
          onSelectionChange={setComparisonRunnerId}
          onCompare={() => setShowComparison(true)}
        />

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
