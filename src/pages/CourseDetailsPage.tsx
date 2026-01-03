import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { competitionService } from '../services/competitionService';
import { ranking } from '@rasifix/orienteering-utils';
import SplitGraph from '../components/SplitGraph';
import RankingTable from '../components/RankingTable';
import Breadcrumbs from '../components/Breadcrumbs';
import { useCompetition } from '../contexts/CompetitionContext';

function CourseDetailsPage() {
  const { source, id, courseCode } = useParams<{ source: string; id: string; courseCode: string }>();
  const { competition } = useCompetition();
  const [selectedRunners, setSelectedRunners] = useState<Set<number>>(new Set());
  const [showGraph, setShowGraph] = useState(false);

  const category = useMemo(() => {
    if (!competition || !courseCode) return null;
    try {
      return competitionService.getCourseRankings(competition, courseCode);
    } catch (err) {
      console.error('Error loading course:', err);
      return null;
    }
  }, [competition, courseCode]);

  const rankingData = useMemo(() => {
    if (!category?.runners || category.runners.length === 0) return null;
    return ranking.parseRanking(category.runners);
  }, [category]);

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

  if (!category || !rankingData) {
    return (
      <div className="px-4 py-6">
        <div className="text-center py-8 text-gray-500">
          Course not found
        </div>
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
