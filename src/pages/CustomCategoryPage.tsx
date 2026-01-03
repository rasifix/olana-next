import { useEffect, useState, useMemo } from 'react';
import { useParams, Outlet } from 'react-router-dom';
import { Runner } from '../types';
import { ranking, parseTime, formatTime } from '@rasifix/orienteering-utils';
import SplitGraph from '../components/SplitGraph';
import RankingTable from '../components/RankingTable';
import { CustomCategoryProvider } from '../contexts/CustomCategoryContext';
import Breadcrumbs from '../components/Breadcrumbs';
import { useCompetition } from '../contexts/CompetitionContext';

function CustomCategoryPage() {
  const { source, id } = useParams<{ source: string; id: string }>();
  const { competition } = useCompetition();
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [availableLegs, setAvailableLegs] = useState<string[]>([]);
  const [selectedLegs, setSelectedLegs] = useState<Set<string>>(new Set());
  const [rankedRunners, setRankedRunners] = useState<ranking.RankingRunner[] | null>(null);
  const [selectedRunners, setSelectedRunners] = useState<Set<number>>(new Set());
  const [showGraph, setShowGraph] = useState(false);

  // Calculate legs for each category
  const categoryLegsMap = useMemo(() => {
    if (!competition) return new Map<string, Set<string>>();
    
    const map = new Map<string, Set<string>>();
    competition.categories?.forEach(cat => {
      const legs = new Set<string>();
      cat.runners?.forEach(runner => {
        const splits = runner.splits || [];
        if (splits.length > 0) {
          legs.add(`St-${splits[0].code}`);
          for (let i = 1; i < splits.length; i++) {
            legs.add(`${splits[i-1].code}-${splits[i].code}`);
          }
        }
      });
      map.set(cat.name, legs);
    });
    return map;
  }, [competition]);

  // Calculate common legs count for each category given current selection
  const categoryCommonLegsCount = useMemo(() => {
    if (selectedCategories.size === 0) {
      return new Map<string, number>();
    }

    const map = new Map<string, number>();
    const selectedLegsArray = Array.from(selectedCategories).map(name => categoryLegsMap.get(name)!);
    
    competition?.categories?.forEach(cat => {
      const catLegs = categoryLegsMap.get(cat.name);
      if (!catLegs) {
        map.set(cat.name, 0);
        return;
      }

      // If this category is already selected, show its own leg count
      if (selectedCategories.has(cat.name)) {
        map.set(cat.name, catLegs.size);
        return;
      }

      // Calculate common legs between selected categories and this category
      const commonLegs = Array.from(catLegs).filter(leg =>
        selectedLegsArray.every(selectedLegSet => selectedLegSet.has(leg))
      );
      map.set(cat.name, commonLegs.length);
    });

    return map;
  }, [competition, selectedCategories, categoryLegsMap]);

  // When categories are selected, find common legs
  useEffect(() => {
    if (!competition || selectedCategories.size === 0) {
      setAvailableLegs([]);
      setSelectedLegs(new Set());
      setRankedRunners(null);
      return;
    }

    const selectedCats = competition.categories?.filter(cat => 
      selectedCategories.has(cat.name)
    ) || [];

    if (selectedCats.length === 0) {
      setAvailableLegs([]);
      return;
    }

    // Build legs (from->to pairs) for each category
    const allLegs = selectedCats.map(cat => {
      const legs = new Set<string>();
      cat.runners?.forEach(runner => {
        const splits = runner.splits || [];
        if (splits.length > 0) {
          // First leg is from "St" to first split
          legs.add(`St-${splits[0].code}`);
          // Subsequent legs are from previous split to current split
          for (let i = 1; i < splits.length; i++) {
            legs.add(`${splits[i-1].code}-${splits[i].code}`);
          }
        }
      });
      return legs;
    });

    // Find intersection of all legs
    const commonLegs = Array.from(allLegs[0] || []).filter(leg =>
      allLegs.every(legSet => legSet.has(leg))
    );

    // Sort legs to maintain order
    const sortedLegs = commonLegs.sort((a, b) => {
      // Extract control numbers for proper sorting
      const getControlNum = (control: string) => {
        if (control === 'St') return -1;
        const num = parseInt(control, 10);
        return isNaN(num) ? 999 : num;
      };
      const [aFrom] = a.split('-');
      const [bFrom] = b.split('-');
      return getControlNum(aFrom) - getControlNum(bFrom);
    });
    
    setAvailableLegs(sortedLegs);
    setSelectedLegs(new Set(sortedLegs)); // Initially select all
  }, [competition, selectedCategories]);

  const handleCategoryToggle = (categoryName: string) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(categoryName)) {
      newSelected.delete(categoryName);
    } else {
      newSelected.add(categoryName);
    }
    setSelectedCategories(newSelected);
    setRankedRunners(null); // Reset ranking when categories change
  };

  const handleLegToggle = (legCode: string) => {
    const newSelected = new Set(selectedLegs);
    if (newSelected.has(legCode)) {
      newSelected.delete(legCode);
    } else {
      newSelected.add(legCode);
    }
    setSelectedLegs(newSelected);
    setRankedRunners(null); // Reset ranking when legs change
  };

  const calculateRanking = () => {
    if (!competition || selectedCategories.size === 0 || selectedLegs.size === 0) {
      return;
    }

    const selectedCats = competition.categories?.filter(cat => 
      selectedCategories.has(cat.name)
    ) || [];

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
      const hasAllLegs = Array.from(selectedLegs).every(leg => runnerLegSet.has(leg));
      
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
        
        if (selectedLegs.has(leg)) {
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

  const categoriesParam = Array.from(selectedCategories).join(',');
  const legsParam = Array.from(selectedLegs).join(',');

  return (
    <CustomCategoryProvider
      selectedCategories={Array.from(selectedCategories)}
      selectedLegs={Array.from(selectedLegs)}
    >
      <div className="px-4 py-6">
        <Breadcrumbs items={[
          { label: 'Home', path: '/competitions', isHome: true },
          { label: competition?.name || 'Competition', path: `/competitions/${source}/${id}` },
          { label: 'Custom Category', path: `/competitions/${source}/${id}/custom` }
        ]} />

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Custom Category Builder
          </h2>

          {/* Step 1: Select Categories */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              1. Select Categories to Combine
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {competition!.categories?.map(category => {
                const commonLegsCount = categoryCommonLegsCount.get(category.name) || 0;
                const isDisabled = selectedCategories.size > 0 && !selectedCategories.has(category.name) && commonLegsCount === 0;
                
                return (
                  <label
                    key={category.name}
                    className={`flex items-center gap-2 p-3 border border-gray-200 rounded-lg ${
                      isDisabled 
                        ? 'bg-gray-100 cursor-not-allowed opacity-50' 
                        : 'hover:bg-gray-50 cursor-pointer'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.has(category.name)}
                      onChange={() => handleCategoryToggle(category.name)}
                      disabled={isDisabled}
                      className="h-4 w-4 text-rust-600 focus:ring-rust-500 border-gray-300 rounded disabled:cursor-not-allowed"
                    />
                    <span className="text-sm font-medium text-gray-900 flex-1">
                      {category.name}
                    </span>
                    {selectedCategories.size > 0 && !selectedCategories.has(category.name) && (
                      <span className="text-xs text-gray-500">
                        ({commonLegsCount} legs)
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Step 2: Select Legs */}
          {selectedCategories.size > 0 && availableLegs.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                2. Select Legs ({availableLegs.length} common legs found)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {availableLegs.map(leg => (
                  <label
                    key={leg}
                    className="flex items-center gap-2 p-2 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedLegs.has(leg)}
                      onChange={() => handleLegToggle(leg)}
                      className="h-4 w-4 text-rust-600 focus:ring-rust-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {leg}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Calculate Button */}
          {selectedCategories.size > 0 && selectedLegs.size > 0 && (
            <div className="mb-8">
              <button
                onClick={calculateRanking}
                className="bg-rust-600 text-white px-6 py-3 rounded-lg hover:bg-rust-700 transition-colors font-semibold"
              >
                Calculate Combined Ranking
              </button>
            </div>
          )}

          {/* Step 4: Show Ranking */}
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
