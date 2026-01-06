import { Route, TrendingUp } from 'lucide-react';
import RunnersBadge from './RunnersBadge';

interface CategoryCardProps {
  name: string;
  controls: number;
  distance: number;
  elevation: number;
  runnerCount: number;
}

function CategoryCard({ name, controls, distance, elevation, runnerCount }: CategoryCardProps) {
  return (
    <div className="card-secondary flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h4 className="heading-small">
          {name}
        </h4>
        <span className="text-sm text-text-tertiary">
          <svg className="inline-block w-4 h-4 -mt-0.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon points="3,3 21,3 3,21" fill="white" />
            <polygon points="21,3 21,21 3,21" fill="#FF6B35" />
            <rect x="3" y="3" width="18" height="18" fill="none" stroke="#FF6B35" strokeWidth="1.5" />
          </svg> {controls}
          &nbsp; <Route style={{ display: 'inline', width: '16px' }} /> {distance}m &nbsp; <TrendingUp style={{ display: 'inline', width: '16px' }} /> {elevation}m
        </span>
      </div>
      <RunnersBadge count={runnerCount} />
    </div>
  );
}

export default CategoryCard;