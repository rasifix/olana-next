import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Category } from '../types';
import { ranking } from '@rasifix/orienteering-utils';
import SplitGraph from '../components/SplitGraph';
import RankingTable from '../components/RankingTable';
import Breadcrumbs from '../components/Breadcrumbs';
import { useCompetition } from '../contexts/CompetitionContext';


function CategoryDetailsPage() {
  const { source, id, categoryName } = useParams<{ source: string; id: string; categoryName: string }>();
  const { competition } = useCompetition();
  const [selectedRunners, setSelectedRunners] = useState<Set<number>>(new Set());
  const [showGraph, setShowGraph] = useState(false);

  const category = useMemo(() => {
    if (!competition || !categoryName) return null;
    return competition.categories?.find(
      cat => cat.name === decodeURIComponent(categoryName)
    ) || null;
  }, [competition, categoryName]);

  const rankedRunners = useMemo(() => {
    if (!category) return [];
    const ranked = ranking.parseRanking(category.runners || []);
    return ranked.runners;
  }, [category]);

  if (!category) {
    return (
      <div className="px-4 py-6">
        <div className="text-center py-8 text-gray-500">
          Category not found
        </div>
      </div>
    );
  }

  const toggleRunnerSelection = (index: number) => {
    const newSelection = new Set(selectedRunners);
    if (newSelection.has(index)) {
      newSelection.delete(index);
    } else if (newSelection.size < 5) {
      newSelection.add(index);
    }
    setSelectedRunners(newSelection);
  };

  const handleShowGraph = () => {
    if (selectedRunners.size >= 2) {
      setShowGraph(true);
    }
  };

  const getSelectedRunners = () => {
    return Array.from(selectedRunners)
      .sort((a, b) => a - b)
      .map(index => rankedRunners[index])
      .filter(Boolean);
  };

  return (
    <div className="px-4 py-6">
      <Breadcrumbs items={[
        { label: 'Home', path: '/competitions', isHome: true },
        { label: competition?.name || 'Competition', path: `/competitions/${source}/${id}` },
        { label: categoryName || 'Category', path: `/competitions/${source}/${id}/categories/${categoryName}` }
      ]} />

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {category.name}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <span className="font-medium text-gray-700">Controls:</span>{' '}
            <span className="text-gray-900">{category.controls}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Distance:</span>{' '}
            <span className="text-gray-900">{category.distance}m</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Elevation:</span>{' '}
            <span className="text-gray-900">{category.ascent}m</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Runners:</span>{' '}
            <span className="text-gray-900">{rankedRunners.length}</span>
          </div>
        </div>

        <div className="mt-6">
          <RankingTable
            runners={rankedRunners}
            selectedRunners={selectedRunners}
            onToggleRunner={toggleRunnerSelection}
            onShowGraph={handleShowGraph}
            showYearColumn={true}
            renderName={(runner) => (
              <Link 
                to={`/competitions/${source}/${id}/categories/${encodeURIComponent(categoryName!)}/runners/${(runner as any).id}`}
                className="text-rust-600 hover:text-rust-800 hover:underline"
              >
                {runner.fullName}
              </Link>
            )}
          />
        </div>
      </div>

      {showGraph && (
        <SplitGraph
          runners={getSelectedRunners()}
          onClose={() => setShowGraph(false)}
        />
      )}
    </div>
  );
}

export default CategoryDetailsPage;
