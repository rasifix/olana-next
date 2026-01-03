import RunnersBadge from './RunnersBadge';
import ErrorFrequencyBar from './ErrorFrequencyBar';

interface LegCardProps {
  title: string;
  categories: string[];
  runners: number;
  errorFrequency: number;
}

function LegCard({ title, categories, runners, errorFrequency }: LegCardProps) {
  return (
    <div className="block bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-semibold text-gray-900">
            {title}
          </h4>
          <div className="text-sm text-gray-600 mt-1">
            <span><span className="font-medium">Categories:</span> {categories.join(', ')}</span>
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
