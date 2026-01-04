import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ranking } from '@rasifix/orienteering-utils';
import SplitGraph from '../components/SplitGraph';
import RankingTable from '../components/RankingTable';
import Breadcrumbs from '../components/Breadcrumbs';
import CategoryCard from '../components/CategoryCard';
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
    <div className="md:px-4 py-6">
      <div className="px-4">
      <Breadcrumbs items={[
        { label: 'Home', path: '/competitions', isHome: true },
        { label: competition?.name || 'Competition', path: `/competitions/${source}/${id}` },
        { label: 'Categories', path: `/competitions/${source}/${id}/categories` },
        { label: categoryName || 'Category', path: `/competitions/${source}/${id}/categories/${categoryName}` }
      ]} />
      </div>

      <div className="bg-white rounded-none md:rounded-lg shadow-lg p-4 md:p-6">
        <div className="mb-6">
          <CategoryCard
            name={category.name}
            controls={category.controls}
            distance={category.distance}
            elevation={category.ascent}
            runnerCount={rankedRunners.length}
          />
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
                to={`/competitions/${source}/${id}/categories/${encodeURIComponent(categoryName!)}/runners/${runner.id}`}
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
