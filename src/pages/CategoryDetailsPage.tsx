import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Competition, Category } from '../types';
import { competitionService } from '../services/competitionService';
import { ranking } from '@rasifix/orienteering-utils';
import SplitGraph from '../components/SplitGraph';
import RankingTable from '../components/RankingTable';
import Breadcrumbs from '../components/Breadcrumbs';


function CategoryDetailsPage() {
  const { source, id, categoryName } = useParams<{ source: string; id: string; categoryName: string }>();
  const navigate = useNavigate();
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [rankedRunners, setRankedRunners] = useState<ranking.RankingRunner[]>([]);
  const [selectedRunners, setSelectedRunners] = useState<Set<number>>(new Set());
  const [showGraph, setShowGraph] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategoryDetails = async () => {
      if (!source || !id || !categoryName) return;

      try {
        setLoading(true);
        setError(null);
        const data = await competitionService.getCompetitionById(source, id);
        setCompetition(data);

        // Find the category by name
        const foundCategory = data.categories?.find(
          cat => cat.name === decodeURIComponent(categoryName)
        );

        if (foundCategory) {
          setCategory(foundCategory);

          // Calculate ranking using orienteering-utils
          const runners = foundCategory.runners || [];
          const ranked = ranking.parseRanking(runners);
          console.log('Ranked:', ranked);
          setRankedRunners(ranked.runners);
        } else {
          setError('Category not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load category');
        console.error('Error loading category:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCategoryDetails();
  }, [source, id, categoryName]);

  if (loading) {
    return (
      <div className="px-4 py-6">
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-600">Loading category details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Error: {error}
        </div>
        <button
          onClick={() => navigate(`/competitions/${source}/${id}`)}
          className="mt-4 text-rust-600 hover:text-rust-800"
        >
          ← Back to competition
        </button>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="px-4 py-6">
        <div className="text-center py-8 text-gray-500">
          Category not found
        </div>
        <button
          onClick={() => navigate(`/competitions/${source}/${id}`)}
          className="mt-4 text-rust-600 hover:text-rust-800"
        >
          ← Back to competition
        </button>
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
