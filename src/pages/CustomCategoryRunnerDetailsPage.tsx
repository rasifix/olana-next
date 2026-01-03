import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Runner } from '../types';
import { competitionService } from '../services/competitionService';
import { ranking, parseTime, formatTime } from '@rasifix/orienteering-utils';
import RunnerSplitsTable from '../components/RunnerSplitsTable';
import { useCustomCategory } from '../contexts/CustomCategoryContext';
import Breadcrumbs from '../components/Breadcrumbs';

function CustomCategoryRunnerDetailsPage() {
  const { source, id, runnerId } = useParams<{
    source: string;
    id: string;
    runnerId: string;
  }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const customCategoryContext = useCustomCategory();
  
  const [runner, setRunner] = useState<ranking.RankingRunner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRunnerDetails = async () => {
      if (!source || !id || !runnerId) return;

      try {
        setLoading(true);
        setError(null);

        // Try to get context first, fall back to URL params
        let selectedCategories: string[];
        let selectedLegs: string[];

        if (customCategoryContext) {
          selectedCategories = customCategoryContext.selectedCategories;
          selectedLegs = customCategoryContext.selectedLegs;
        } else {
          // Parse from URL params
          const categoriesParam = searchParams.get('categories');
          const legsParam = searchParams.get('legs');
          
          if (!categoriesParam || !legsParam) {
            setError('Missing custom category configuration. Please navigate from the custom category page.');
            setLoading(false);
            return;
          }

          selectedCategories = categoriesParam.split(',');
          selectedLegs = legsParam.split(',');
        }

        if (selectedCategories.length === 0 || selectedLegs.length === 0) {
          setError('Invalid custom category configuration');
          setLoading(false);
          return;
        }

        // Fetch competition data
        const competition = await competitionService.getCompetitionById(source, id);

        // Get selected category runners
        const selectedCats = competition.categories?.filter(cat => 
          selectedCategories.includes(cat.name)
        ) || [];

        // Combine all runners from selected categories
        const allRunners: Runner[] = selectedCats.flatMap(cat => 
          cat.runners.map(runner => ({...runner, category: cat.name})) || []
        );

        // Find the specific runner
        const targetRunner = allRunners.find(r => r.id === runnerId);
        if (!targetRunner) {
          setError('Runner not found');
          setLoading(false);
          return;
        }

        // Filter runner's splits to only include selected legs
        const originalSplits = targetRunner.splits || [];
        if (originalSplits.length === 0) {
          setError('Runner has no splits');
          setLoading(false);
          return;
        }

        // Build legs for this runner
        const runnerLegs: string[] = [];
        runnerLegs.push(`St-${originalSplits[0].code}`);
        for (let i = 1; i < originalSplits.length; i++) {
          runnerLegs.push(`${originalSplits[i-1].code}-${originalSplits[i].code}`);
        }

        // Check if runner has all selected legs
        const runnerLegSet = new Set(runnerLegs);
        const hasAllLegs = selectedLegs.every(leg => runnerLegSet.has(leg));
        
        if (!hasAllLegs) {
          setError('Runner does not have all selected legs');
          setLoading(false);
          return;
        }

        // Build new splits keeping only the "to" controls of selected legs
        const adjustedSplits: { code: string; time: string }[] = [];
        let cumulativeTime = 0;
        
        for (let i = 0; i < runnerLegs.length; i++) {
          const leg = runnerLegs[i];
          const split = originalSplits[i];
          const splitTime = parseTime(split.time)!;
          const legTime = i === 0 ? splitTime : (splitTime - parseTime(originalSplits[i-1].time)!);
          
          if (selectedLegs.includes(leg)) {
            cumulativeTime += legTime;
            adjustedSplits.push({
              code: split.code,
              time: formatTime(cumulativeTime)
            });
          }
        }

        // Calculate ranking for all adjusted runners to get proper split rankings
        const adjustedRunners = allRunners.map(runner => {
          const originalSplits = runner.splits || [];
          if (originalSplits.length === 0) return null;

          const runnerLegs: string[] = [];
          runnerLegs.push(`St-${originalSplits[0].code}`);
          for (let i = 1; i < originalSplits.length; i++) {
            runnerLegs.push(`${originalSplits[i-1].code}-${originalSplits[i].code}`);
          }

          const runnerLegSet = new Set(runnerLegs);
          const hasAllLegs = selectedLegs.every(leg => runnerLegSet.has(leg));
          
          if (!hasAllLegs) return null;

          const adjustedSplits: { code: string; time: string }[] = [];
          let cumulativeTime = 0;
          
          for (let i = 0; i < runnerLegs.length; i++) {
            const leg = runnerLegs[i];
            const split = originalSplits[i];
            const splitTime = parseTime(split.time)!;
            const legTime = i === 0 ? splitTime : (splitTime - parseTime(originalSplits[i-1].time)!);
            
            if (selectedLegs.includes(leg)) {
              cumulativeTime += legTime;
              adjustedSplits.push({
                code: split.code,
                time: formatTime(cumulativeTime)
              });
            }
          }

          if (adjustedSplits.length === 0) return null;

          return {
            ...runner,
            splits: adjustedSplits,
            time: formatTime(cumulativeTime)
          };
        }).filter((r) => r !== null);

        // Calculate ranking
        const ranked = ranking.parseRanking(adjustedRunners as any);
        const rankedRunner = ranked.runners.find((r: any) => r.id === runnerId);
        
        if (rankedRunner) {
          setRunner(rankedRunner);
        } else {
          setError('Failed to calculate runner ranking');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load runner details');
        console.error('Error loading runner details:', err);
      } finally {
        setLoading(false);
      }
    };

    loadRunnerDetails();
  }, [source, id, runnerId, customCategoryContext, searchParams]);

  if (loading) {
    return (
      <div className="px-4 py-6">
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-600">Loading runner details...</div>
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
          onClick={() => navigate(`/competitions/${source}/${id}/custom`)}
          className="mt-4 text-rust-600 hover:text-rust-800"
        >
          ← Back to custom category
        </button>
      </div>
    );
  }

  if (!runner) {
    return (
      <div className="px-4 py-6">
        <div className="text-center py-8 text-gray-500">Runner not found</div>
        <button
          onClick={() => navigate(`/competitions/${source}/${id}/custom`)}
          className="mt-4 text-rust-600 hover:text-rust-800"
        >
          ← Back to custom category
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <Breadcrumbs items={[
        { label: 'Home', path: '/competitions', isHome: true },
        { label: 'Competition', path: `/competitions/${source}/${id}` },
        { label: 'Custom Category', path: `/competitions/${source}/${id}/custom` },
        { label: runner.fullName, path: `/competitions/${source}/${id}/custom/runners/${runnerId}` }
      ]} />

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {runner.fullName}
        </h2>
        <p className="text-red-800 font-semibold mb-2">
          Error: {runner.errorTime ? runner.errorTime : '00:00'}
        </p>
        <p className="text-gray-600 mb-6">
          {runner.club} • {runner.yearOfBirth}
        </p>

        <RunnerSplitsTable runner={runner} source={source!} id={id!} />
      </div>
    </div>
  );
}

export default CustomCategoryRunnerDetailsPage;
