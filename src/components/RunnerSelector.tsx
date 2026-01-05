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
          className="select-input flex-1 focus"
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
          className="btn-primary hover:bg-primary-hover disabled transition-colors"
        >
          {t('button.compare')}
        </button>
      </div>
    </div>
  );
}

export default RunnerSelector;
