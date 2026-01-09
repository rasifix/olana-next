import { formatTime, parseTime, ranking } from '@rasifix/orienteering-utils';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router-dom';
import CustomCategoryBuilder from '../components/CustomCategoryBuilder';
import RankingTable from '../components/RankingTable';
import SplitGraph from '../components/SplitGraph';
import { useCompetition } from '../contexts/CompetitionContext';
import { CustomCategoryProvider } from '../contexts/CustomCategoryContext';
import { Runner } from '../types';

function CustomCategoryPage() {
  const { t } = useTranslation();
  const { source, id } = useParams<{ source: string; id: string }>();
  const [searchParams] = useSearchParams();
  const { competition } = useCompetition();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLegs, setSelectedLegs] = useState<string[]>([]);
  const [rankedRunners, setRankedRunners] = useState<ranking.RankingRunner[] | null>(null);
  const [selectedRunners, setSelectedRunners] = useState<Set<number>>(new Set());
  const [showGraph, setShowGraph] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const hasCustomCategory = selectedCategories.length > 0 && selectedLegs.length > 0;

  // Initialize from URL parameters
  useEffect(() => {
    if (!competition) return;

    const categoriesParam = searchParams.get('categories');
    const legsParam = searchParams.get('legs');

    if (categoriesParam && legsParam) {
      const categories = categoriesParam.split(',').filter(Boolean);
      const legs = legsParam.split(',').filter(Boolean);

      if (categories.length > 0 && legs.length > 0) {
        setSelectedCategories(categories);
        setSelectedLegs(legs);
        calculateRanking(categories, legs);
      }
    }
  }, [competition, searchParams]);

  const handleBuilderComplete = (categories: string[], legs: string[]) => {
    setSelectedCategories(categories);
    setSelectedLegs(legs);
    setShowBuilder(false);
    // Automatically calculate ranking
    calculateRanking(categories, legs);
  };

  const handleEdit = () => {
    setShowBuilder(true);
  };

  const handleBuilderCancel = () => {
    setShowBuilder(false);
  };

  const handleShare = () => {
    setCopySuccess(false);
    setShowShareModal(true);
  };

  const handleCopyLink = async () => {
    const categoriesParam = selectedCategories.join(',');
    const legsParam = selectedLegs.join(',');
    const shareUrl = `${window.location.origin}/competitions/${source}/${id}/custom?categories=${encodeURIComponent(categoriesParam)}&legs=${encodeURIComponent(legsParam)}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const calculateRanking = (categories: string[], legs: string[]) => {
    if (!competition || categories.length === 0 || legs.length === 0) {
      return;
    }

    const selectedCats = competition.categories?.filter(cat =>
      categories.includes(cat.name)
    ) || [];

    const selectedLegsSet = new Set(legs);

    // Combine all runners from selected categories
    const allRunners: Runner[] = selectedCats.flatMap(cat => cat.runners.map(runner => ({ ...runner, category: cat.name })) || []);

    const adjustedRunners = allRunners.map(runner => {
      const originalSplits = runner.splits || [];
      if (originalSplits.length === 0) return null;

      // Build legs for this runner
      const runnerLegs: string[] = [];
      runnerLegs.push(`St-${originalSplits[0].code}`);
      for (let i = 1; i < originalSplits.length; i++) {
        runnerLegs.push(`${originalSplits[i - 1].code}-${originalSplits[i].code}`);
      }

      // Check if runner has all selected legs
      const runnerLegSet = new Set(runnerLegs);
      const hasAllLegs = legs.every(leg => runnerLegSet.has(leg));

      if (!hasAllLegs) {
        return null;
      }

      // Build new splits keeping only the "to" controls of selected legs
      const adjustedSplits: { code: string; time: string }[] = [];
      let cumulativeTime = 0;

      for (let i = 0; i < originalSplits.length; i++) {
        const split = originalSplits[i];
        const splitTime = parseTime(split.time)!;
        const legTime = i === 0 ? splitTime : (splitTime - parseTime(originalSplits[i - 1].time)!);

        // Determine the leg for this split
        const leg = i === 0 ? `St-${split.code}` : `${originalSplits[i - 1].code}-${split.code}`;

        if (selectedLegsSet.has(leg)) {
          // This leg is selected, include its endpoint split
          cumulativeTime += legTime;
          adjustedSplits.push({
            code: split.code,
            time: formatTime(cumulativeTime)
          });
        }
      }

      if (adjustedSplits.length === 0) return null;

      // Update the runner's splits and calculate total time for the selected legs
      const adjustedTotalTime = formatTime(cumulativeTime);

      return {
        ...runner,
        splits: adjustedSplits,
        // Store the adjusted time in a temporary field that parseRanking will use
        time: adjustedTotalTime
      };
    }).filter((r) => r !== null);

    // Manually set the time field for parseRanking to calculate correctly
    const runnersWithTime = adjustedRunners.map(r => {
      return {
        ...r,
        splits: r.splits.map(s => ({ ...s, time: s.time }))
      };
    });

    // Sort runners by time before passing to parseRanking
    const sortedRunners = runnersWithTime.sort((a, b) => {
      const timeA = parseTime(a.time) || 0;
      const timeB = parseTime(b.time) || 0;
      return timeA - timeB;
    });

    // Use parseRanking to calculate the ranking
    const ranked = ranking.parseRanking(sortedRunners);
    setRankedRunners(ranked.runners);
  };

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
      .map(index => rankedRunners![index])
      .filter(Boolean);
  };

  const categoriesParam = selectedCategories.join(',');
  const legsParam = selectedLegs.join(',');

  return (
    <CustomCategoryProvider
      selectedCategories={selectedCategories}
      selectedLegs={selectedLegs}
    >
      {!hasCustomCategory ? (
        <div>
          <p className="text-text-tertiary mb-6">
            {t('customCategory.description')}
          </p>
          <button
            onClick={() => setShowBuilder(true)}
            className="btn-primary"
          >
            {t('customCategory.createButton')}
          </button>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="page-title">
                {t('customCategory.title')}
              </h2>
              <p className="text-sm text-text-tertiary mt-1">
                {selectedCategories.join(', ')} • {selectedLegs.length} {t('customCategory.legs')}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleShare}
                className="px-4 py-2 text-link hover:text-link-hover border border-primary hover:border-rust-800 rounded-lg transition-colors font-semibold"
              >
                {t('customCategory.shareButton')}
              </button>
              <button
                onClick={handleEdit}
                className="px-4 py-2 text-link hover:text-link-hover border border-primary hover:border-rust-800 rounded-lg transition-colors font-semibold"
              >
                {t('customCategory.editButton')}
              </button>
            </div>
          </div>

          {rankedRunners && rankedRunners.length > 0 && (
            <div>
              <RankingTable
                runners={rankedRunners}
                selectedRunners={selectedRunners}
                onToggleRunner={toggleRunnerSelection}
                onClearSelection={() => setSelectedRunners(new Set())}
                onShowGraph={handleShowGraph}
                showCategoryColumn={true}
                renderName={(runner) => (
                  <a
                    href={`/competitions/${source}/${id}/custom/runners/${runner.id}?categories=${encodeURIComponent(categoriesParam)}&legs=${encodeURIComponent(legsParam)}`}
                    className="text-link hover:text-link-hover hover:underline"
                  >
                    {runner.fullName}
                  </a>
                )}
              />
            </div>
          )}
        </div>
      )}

      {showGraph && (
        <SplitGraph
          runners={getSelectedRunners()}
          onClose={() => setShowGraph(false)}
        />
      )}

      {showBuilder && (
        <CustomCategoryBuilder
          competition={competition!}
          onComplete={handleBuilderComplete}
          onCancel={handleBuilderCancel}
        />
      )}

      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-surface-primary rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">
              {t('customCategory.shareTitle')}
            </h3>
            <p className="text-text-tertiary text-sm mb-4">
              {t('customCategory.shareDescription')}
            </p>
            <div className="bg-background p-3 rounded border border-border mb-4 break-all text-sm font-mono">
              {`${window.location.origin}/competitions/${source}/${id}/custom?categories=${encodeURIComponent(selectedCategories.join(','))}&legs=${encodeURIComponent(selectedLegs.join(','))}`}
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 text-text-tertiary hover:text-text-primary transition-colors"
              >
                {t('button.close')}
              </button>
              <button
                onClick={handleCopyLink}
                className="btn-primary"
              >
                {copySuccess ? t('customCategory.copied') : t('customCategory.copyLink')}
              </button>
            </div>
          </div>
        </div>
      )}
    </CustomCategoryProvider>
  );
}

export default CustomCategoryPage;
