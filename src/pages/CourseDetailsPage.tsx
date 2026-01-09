import { ranking } from '@rasifix/orienteering-utils';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import CategoryCard from '../components/CategoryCard';
import RankingTable from '../components/RankingTable';
import RunnerSelectorSheet from '../components/RunnerSelectorSheet';
import SplitGraph from '../components/SplitGraph';
import { useCompetition } from '../contexts/CompetitionContext';
import { competitionService } from '../services/competitionService';

function CourseDetailsPage() {
  const { t } = useTranslation();
  const { source, id, courseCode } = useParams<{ source: string; id: string; courseCode: string }>();
  const { competition } = useCompetition();
  const [selectedRunners, setSelectedRunners] = useState<Set<number>>(new Set());
  const [showGraph, setShowGraph] = useState(false);
  const [showRunnerSelector, setShowRunnerSelector] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  const handleShowGraph = () => {
    if (isMobile && selectedRunners.size === 0) {
      setShowRunnerSelector(true);
    } else if (selectedRunners.size >= 2) {
      setShowGraph(true);
    }
  };

  if (!category || !rankingData) {
    return (
      <div className="px-4 py-6">
        <div className="text-center py-8 text-text-muted">
          Course not found
        </div>
      </div>
    );
  }

  const selectedRankedRunners = Array.from(selectedRunners)
    .map(index => rankingData.runners[index])
    .filter(Boolean);

  return (
    <div className="page-layout">
      <div className="px-4">
        <Breadcrumbs items={[
          { label: t('navigation.home'), path: '/competitions', isHome: true },
          { label: competition?.name || t('navigation.competitions'), path: `/competitions/${source}/${id}` },
          { label: t('navigation.courses'), path: `/competitions/${source}/${id}/courses` },
          { label: courseCode || t('navigation.courses'), path: `/competitions/${source}/${id}/courses/${courseCode}` }
        ]} />
      </div>

      <div className="page-container-card">
        <div className="mb-6">
          <CategoryCard
            name={category.name}
            controls={category.controls}
            distance={category.distance}
            elevation={category.ascent}
            runnerCount={category.runners.length}
          />
        </div>

        {!showGraph ? (
          <>
            <RankingTable
              runners={rankingData.runners}
              selectedRunners={selectedRunners}
              onToggleRunner={handleRunnerToggle}
              onClearSelection={() => setSelectedRunners(new Set())}
              onShowGraph={handleShowGraph}
              renderName={(runner) => (
                <a
                  href={`/competitions/${source}/${id}/courses/${courseCode}/runners/${runner.id}`}
                  className="text-link hover:text-link-hover hover:underline"
                >
                  {runner.fullName}
                </a>
              )}
              renderCategory={(runner) => (
                runner.category ? (
                  <a
                    href={`/competitions/${source}/${id}/categories/${encodeURIComponent(runner.category)}`}
                    className="text-link hover:text-link-hover hover:underline"
                  >
                    {runner.category}
                  </a>
                ) : '-'
              )}
            />

            {selectedRunners.size > 0 && (
              <div className="mt-4 text-sm text-text-tertiary">
                Selected {selectedRunners.size} of 5 runners maximum for split graph
              </div>
            )}
          </>
        ) : (
          selectedRankedRunners.length > 0 && (
            <SplitGraph
              runners={selectedRankedRunners}
              onClose={() => setShowGraph(false)}
            />
          )
        )}
      </div>

      {showRunnerSelector && (
        <RunnerSelectorSheet
          runners={rankingData.runners}
          selectedRunners={selectedRunners}
          onToggleRunner={handleRunnerToggle}
          onConfirm={() => {
            setShowRunnerSelector(false);
            setShowGraph(true);
          }}
          onClose={() => setShowRunnerSelector(false)}
        />
      )}
    </div>
  );
}

export default CourseDetailsPage;
