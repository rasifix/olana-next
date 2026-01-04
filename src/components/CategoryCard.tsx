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
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center gap-4">
        <h4 className="font-semibold text-gray-900">
          {name}
        </h4>
        <span className="text-sm text-gray-600">
          🎯 {controls} • 📏 {distance}m • ⛰️ {elevation}m
        </span>
      </div>
      <RunnersBadge count={runnerCount} />
    </div>
  );
}

export default CategoryCard;
