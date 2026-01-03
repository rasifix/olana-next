import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Control } from '../types';
import RunnersBadge from './RunnersBadge';
import CategoryFilter from './CategoryFilter';
import ErrorFrequencyBar from './ErrorFrequencyBar';

interface ControlsListProps {
  controls: Control[];
}

function ControlsList({ controls }: ControlsListProps) {
  const { source, id } = useParams<{ source: string; id: string }>();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (controls.length === 0) {
    return <p className="text-gray-500">No controls available</p>;
  }

  const filteredControls = controls.filter(
    control => selectedCategory === 'all' || control.categories.includes(selectedCategory)
  );

  const allCategories = Array.from(new Set(controls.flatMap(control => control.categories))).sort();

  return (
    <>
      <CategoryFilter
        selectedCategory={selectedCategory}
        categories={allCategories}
        onChange={setSelectedCategory}
      />

      {/* Controls List */}
      <div className="space-y-3">
        {filteredControls.map((control) => {
          return (
            <Link
              key={control.code}
              to={`/competitions/${source}/${id}/controls/${encodeURIComponent(control.code)}`}
              className="block bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Control {control.code}
                  </h4>
                  <div className="text-sm text-gray-600 mt-1">
                    <span><span className="font-medium">Categories:</span> {control.categories.join(', ')}</span>
                  </div>
                </div>
                <div className="text-right">
                  <RunnersBadge count={control.runners} />
                </div>
              </div>
              <ErrorFrequencyBar errorFrequency={control.errorFrequency} />
            </Link>
          );
        })}
      </div>
    </>
  );
}

export default ControlsList;
