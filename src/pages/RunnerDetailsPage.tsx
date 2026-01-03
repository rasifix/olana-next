import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { ranking } from '@rasifix/orienteering-utils';
import RunnerSplitsTable from '../components/RunnerSplitsTable';
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

  const { category, runner } = useMemo(() => {
    if (!competition || !categoryName || !runnerId) return { category: null, runner: null };
    
    const foundCategory = competition.categories?.find(
      cat => cat.name === decodeURIComponent(categoryName)
    );
    
    if (!foundCategory) return { category: null, runner: null };
    
    const ranked = ranking.parseRanking(foundCategory.runners || []);
    const selectedRunner = ranked.runners.find((r) => r.id === runnerId) || null;
    
    return { category: foundCategory, runner: selectedRunner };
  }, [competition, categoryName, runnerId]);

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

        <RunnerSplitsTable runner={runner} source={source!} id={id!} />
      </div>
    </div>
  );
}

export default RunnerDetailsPage;
