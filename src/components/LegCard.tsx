import { useTranslation } from 'react-i18next';
import RunnersBadge from './RunnersBadge';
import ErrorFrequencyBar from './ErrorFrequencyBar';

interface LegCardProps {
  title: string;
  categories: string[];
  runners: number;
  errorFrequency: number;
}

function LegCard({ title, categories, runners, errorFrequency }: LegCardProps) {
  const { t } = useTranslation();
  
  return (
    <div className="card-secondary block hover:bg-surface-hover hover:border-border-strong transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="heading-small">
            {title}
          </h4>
          <div className="text-sm text-text-tertiary mt-1">
            <span><span className="font-medium">{t('table.categories')}:</span> {categories.join(', ')}</span>
          </div>
        </div>
        <div className="text-right">
          <RunnersBadge count={runners} />
        </div>
      </div>
      <ErrorFrequencyBar errorFrequency={errorFrequency} />
    </div>
  );
}

export default LegCard;
