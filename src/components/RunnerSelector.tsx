import { ranking } from '@rasifix/orienteering-utils';

interface RunnerSelectorProps {
  rankedRunners: ranking.RankingRunner[];
  currentRunnerId: string;
  comparisonRunnerId: string | null;
  onSelectionChange: (runnerId: string | null) => void;
  onCompare: () => void;
}

function RunnerSelector({ 
  rankedRunners, 
  currentRunnerId, 
  comparisonRunnerId, 
  onSelectionChange, 
  onCompare 
}: RunnerSelectorProps) {
  return (
    <div className="hidden md:block mb-6 p-4 bg-gray-50 rounded-lg">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Compare with another runner:
      </label>
      <div className="flex gap-2">
        <select
          value={comparisonRunnerId || ''}
          onChange={(e) => onSelectionChange(e.target.value || null)}
          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-rust-500 focus:ring-rust-500"
        >
          <option value="">Select a runner...</option>
          {rankedRunners
            .filter(r => r.id !== currentRunnerId)
            .map(r => (
              <option key={r.id} value={r.id}>
                {r.rank}. {r.fullName} ({r.time})
              </option>
            ))}
        </select>
        <button
          onClick={onCompare}
          disabled={!comparisonRunnerId}
          className="px-4 py-2 bg-rust-600 text-white rounded-md hover:bg-rust-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Compare
        </button>
      </div>
    </div>
  );
}

export default RunnerSelector;
