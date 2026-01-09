import { ranking } from '@rasifix/orienteering-utils';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import CategoryCard from '../components/CategoryCard';
import RankingTable from '../components/RankingTable';
import RunnerSelectorSheet from '../components/RunnerSelectorSheet';
import SplitGraph from '../components/SplitGraph';
import { useCompetition } from '../contexts/CompetitionContext';


function CategoryDetailsPage() {
  const { t } = useTranslation();
  const { source, id, categoryName } = useParams<{ source: string; id: string; categoryName: string }>();
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
        <div className="text-center py-8 text-text-muted">
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
    if (isMobile && selectedRunners.size === 0) {
      setShowRunnerSelector(true);
    } else if (selectedRunners.size >= 2) {
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
    <div className="page-layout">
      <div className="px-4">
        <Breadcrumbs items={[
          { label: t('navigation.home'), path: '/competitions', isHome: true },
          { label: competition?.name || t('navigation.competitions'), path: `/competitions/${source}/${id}` },
          { label: t('navigation.categories'), path: `/competitions/${source}/${id}/categories` },
          { label: categoryName || t('table.category'), path: `/competitions/${source}/${id}/categories/${categoryName}` }
        ]} />
      </div>

      <div className="page-container-card">
        <div className="mb-6">
          <CategoryCard
            name={category.name}
            controls={category.controls}
            distance={category.distance}
            elevation={category.ascent}
            runnerCount={rankedRunners.length}
          />
        </div>

        {!showGraph ? (
          <div className="mt-6">
            <RankingTable
              runners={rankedRunners}
              selectedRunners={selectedRunners}
              onToggleRunner={toggleRunnerSelection}
              onClearSelection={() => setSelectedRunners(new Set())}
              onShowGraph={handleShowGraph}
              showYearColumn={true}
              renderName={(runner) => (
                <Link
                  to={`/competitions/${source}/${id}/categories/${encodeURIComponent(categoryName!)}/runners/${runner.id}`}
                  className="text-link hover:text-link-hover hover:underline"
                >
                  {runner.fullName}
                </Link>
              )}
            />
          </div>
        ) : (
          <SplitGraph
            runners={getSelectedRunners()}
            onClose={() => setShowGraph(false)}
          />
        )}
      </div>

      {showRunnerSelector && (
        <RunnerSelectorSheet
          runners={rankedRunners}
          selectedRunners={selectedRunners}
          onToggleRunner={toggleRunnerSelection}
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

export default CategoryDetailsPage;
