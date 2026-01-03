import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Category } from '../types';
import { competitionService } from '../services/competitionService';
import { ranking } from '@rasifix/orienteering-utils';
import SplitGraph from '../components/SplitGraph';
import RankingTable from '../components/RankingTable';
import Breadcrumbs from '../components/Breadcrumbs';

function CourseDetailsPage() {
  const { source, id, courseCode } = useParams<{ source: string; id: string; courseCode: string }>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rankingData, setRankingData] = useState<ranking.Ranking | null>(null);
  const [selectedRunners, setSelectedRunners] = useState<Set<number>>(new Set());
  const [showGraph, setShowGraph] = useState(false);

  useEffect(() => {
    const loadCourse = async () => {
      if (!source || !id || !courseCode) return;

      try {
        setLoading(true);
        setError(null);
        const data = await competitionService.getCourseRankings(source, id, courseCode);
        console.log('Course data received:', data);
        setCategory(data);
        
        // Calculate rankings for all runners in the course
        if (data.runners && data.runners.length > 0) {
          const parsed = ranking.parseRanking(data.runners);
          console.log('Parsed ranking:', parsed);
          setRankingData(parsed);
        } else {
          console.warn('No runners found in course data');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load course');
        console.error('Error loading course:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [source, id, courseCode]);

  const handleRunnerToggle = (index: number) => {
    const newSelected = new Set(selectedRunners);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      if (newSelected.size < 5) {
        newSelected.add(index);
      }
    }
    setSelectedRunners(newSelected);
  };

  if (loading) {
    return (
      <div className="px-4 py-6">
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-600">Loading course...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Error loading course: {error}
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

  if (!category || !rankingData) {
    return (
      <div className="px-4 py-6">
        <div className="text-center py-8 text-gray-500">
          Course not found
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

  const selectedRankedRunners = Array.from(selectedRunners)
    .map(index => rankingData.runners[index])
    .filter(Boolean);

  return (
    <div className="px-4 py-6">
      <Breadcrumbs items={[
        { label: 'Home', path: '/competitions', isHome: true },
        { label: 'Competition', path: `/competitions/${source}/${id}` },
        { label: courseCode || 'Course', path: `/competitions/${source}/${id}/courses/${courseCode}` }
      ]} />

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {category.name}
            </h2>
            <p className="text-gray-600 mt-1">
              {category.controls} controls • {category.distance}m • {category.ascent}m elevation
            </p>
          </div>
        </div>

        <RankingTable
          runners={rankingData.runners}
          selectedRunners={selectedRunners}
          onToggleRunner={handleRunnerToggle}
          onShowGraph={() => setShowGraph(true)}
          showCategoryColumn={true}
          renderName={(runner) => (
            <a
              href={`/competitions/${source}/${id}/courses/${courseCode}/runners/${runner.id}`}
              className="text-rust-600 hover:text-rust-800 hover:underline"
            >
              {runner.fullName}
            </a>
          )}
          renderCategory={(runner) => (
            runner.category ? (
              <a
                href={`/competitions/${source}/${id}/categories/${encodeURIComponent(runner.category)}`}
                className="text-rust-600 hover:text-rust-800 hover:underline"
              >
                {runner.category}
              </a>
            ) : '-'
          )}
        />

        {selectedRunners.size > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Selected {selectedRunners.size} of 5 runners maximum for split graph
          </div>
        )}
      </div>

      {showGraph && selectedRankedRunners.length > 0 && (
        <SplitGraph
          runners={selectedRankedRunners}
          onClose={() => setShowGraph(false)}
        />
      )}
    </div>
  );
}

export default CourseDetailsPage;
