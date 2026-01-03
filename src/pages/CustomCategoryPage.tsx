import { useState } from 'react';
import { useParams, Outlet } from 'react-router-dom';
import { Runner } from '../types';
import { ranking, parseTime, formatTime } from '@rasifix/orienteering-utils';
import SplitGraph from '../components/SplitGraph';
import RankingTable from '../components/RankingTable';
import CustomCategoryBuilder from '../components/CustomCategoryBuilder';
import { CustomCategoryProvider } from '../contexts/CustomCategoryContext';
import Breadcrumbs from '../components/Breadcrumbs';
import { useCompetition } from '../contexts/CompetitionContext';

function CustomCategoryPage() {
  const { source, id } = useParams<{ source: string; id: string }>();
  const { competition } = useCompetition();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLegs, setSelectedLegs] = useState<string[]>([]);
  const [rankedRunners, setRankedRunners] = useState<ranking.RankingRunner[] | null>(null);
  const [selectedRunners, setSelectedRunners] = useState<Set<number>>(new Set());
  const [showGraph, setShowGraph] = useState(false);

  const hasCustomCategory = selectedCategories.length > 0 && selectedLegs.length > 0;

  const handleBuilderComplete = (categories: string[], legs: string[]) => {
    setSelectedCategories(categories);
    setSelectedLegs(legs);
    // Automatically calculate ranking
    calculateRanking(categories, legs);
  };

  const handleEdit = () => {
    setSelectedCategories([]);
    setSelectedLegs([]);
    setRankedRunners(null);
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
    const allRunners: Runner[] = selectedCats.flatMap(cat => cat.runners.map(runner => ({...runner, category: cat.name})) || []);
    
    const adjustedRunners = allRunners.map(runner => {
      const originalSplits = runner.splits || [];
      if (originalSplits.length === 0) return null;

      // Build legs for this runner
      const runnerLegs: string[] = [];
      runnerLegs.push(`St-${originalSplits[0].code}`);
      for (let i = 1; i < originalSplits.length; i++) {
        runnerLegs.push(`${originalSplits[i-1].code}-${originalSplits[i].code}`);
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
        const legTime = i === 0 ? splitTime : (splitTime - parseTime(originalSplits[i-1].time)!);
        
        // Determine the leg for this split
        const leg = i === 0 ? `St-${split.code}` : `${originalSplits[i-1].code}-${split.code}`;
        
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
      <div className="px-4 py-6">
        <Breadcrumbs items={[
          { label: 'Home', path: '/competitions', isHome: true },
          { label: competition?.name || 'Competition', path: `/competitions/${source}/${id}` },
          { label: 'Custom Category', path: `/competitions/${source}/${id}/custom` }
        ]} />

        {!hasCustomCategory ? (
          <CustomCategoryBuilder 
            competition={competition!} 
            onComplete={handleBuilderComplete}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Custom Category
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedCategories.join(', ')} • {selectedLegs.length} legs
                </p>
              </div>
              <button
                onClick={handleEdit}
                className="px-4 py-2 text-rust-600 hover:text-rust-800 border border-rust-600 hover:border-rust-800 rounded-lg transition-colors font-semibold"
              >
                Edit Selection
              </button>
            </div>

            {rankedRunners && rankedRunners.length > 0 && (
              <div>
                <RankingTable
                  runners={rankedRunners}
                  selectedRunners={selectedRunners}
                  onToggleRunner={toggleRunnerSelection}
                  onShowGraph={handleShowGraph}
                  showCategoryColumn={true}
                  renderName={(runner) => (
                    <a
                      href={`/competitions/${source}/${id}/custom/runners/${runner.id}?categories=${encodeURIComponent(categoriesParam)}&legs=${encodeURIComponent(legsParam)}`}
                      className="text-rust-600 hover:text-rust-800 hover:underline"
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
      </div>
      
      <Outlet />
    </CustomCategoryProvider>
  );
}

export default CustomCategoryPage;
