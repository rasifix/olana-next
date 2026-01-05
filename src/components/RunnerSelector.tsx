import { ranking } from '@rasifix/orienteering-utils';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  
  return (
    <div className="hidden md:block mb-6 p-4 bg-surface-secondary rounded-lg">
      <label className="block text-sm font-medium text-text-secondary mb-2">
        {t('runner.compareWith')}
      </label>
      <div className="flex gap-2">
        <select
          value={comparisonRunnerId || ''}
          onChange={(e) => onSelectionChange(e.target.value || null)}
          className="flex-1 rounded-md border-border-strong shadow-sm focus:border-primary-border focus:ring-primary-border bg-surface-primary text-text-primary"
        >
          <option value="">{t('runner.selectRunner')}</option>
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
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover disabled:bg-disabled disabled:cursor-not-allowed transition-colors"
        >
          {t('button.compare')}
        </button>
      </div>
    </div>
  );
}

export default RunnerSelector;
