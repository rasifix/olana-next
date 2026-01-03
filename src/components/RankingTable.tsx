import { ReactNode } from 'react';
import { ranking, formatTime, parseTime } from '@rasifix/orienteering-utils';

interface RankingTableProps {
  runners: ranking.RankingRunner[];
  selectedRunners: Set<number>;
  onToggleRunner: (index: number) => void;
  onShowGraph: () => void;
  showCategoryColumn?: boolean;
  showYearColumn?: boolean;
  renderName?: (runner: ranking.RankingRunner, index: number) => ReactNode;
  renderCategory?: (runner: ranking.RankingRunner, index: number) => ReactNode;
}

function RankingTable({
  runners,
  selectedRunners,
  onToggleRunner,
  onShowGraph,
  showCategoryColumn = false,
  showYearColumn = false,
  renderName,
  renderCategory
}: RankingTableProps) {
  
  function timeBehind(time: string | undefined, fastest: string | undefined) {
    if (time === fastest) {
      return "";
    } else if (parseTime(time!) && parseTime(fastest!)) {
      return formatTime(parseTime(time)! - parseTime(fastest)!);
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-900">
          Results
        </h3>
        {selectedRunners.size > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              {selectedRunners.size} runner{selectedRunners.size !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={onShowGraph}
              disabled={selectedRunners.size < 2}
              className="px-4 py-2 bg-rust-600 text-white rounded-md hover:bg-rust-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Show Split Graph
            </button>
            <button
              onClick={() => {
                selectedRunners.clear();
                onToggleRunner(-1); // Trigger a re-render
              }}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {runners.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Select
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                {showCategoryColumn && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                )}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Club
                </th>
                {showYearColumn && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Year
                  </th>
                )}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Behind
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {runners.map((runner, index) => (
                <tr 
                  key={(runner as any).id || index} 
                  className={`hover:bg-gray-100 ${selectedRunners.has(index) ? 'bg-rust-50' : ''}`}
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={selectedRunners.has(index)}
                      onChange={() => onToggleRunner(index)}
                      disabled={!selectedRunners.has(index) && selectedRunners.size >= 5}
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {runner.rank}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {renderName ? renderName(runner, index) : runner.fullName}
                  </td>
                  {showCategoryColumn && (
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {renderCategory ? renderCategory(runner, index) : (runner.category || '-')}
                    </td>
                  )}
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {runner.club}
                  </td>
                  {showYearColumn && (
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {runner.yearOfBirth}
                    </td>
                  )}
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {runner.time}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {index === 0 ? '' : `+${timeBehind(runner.time, runners[0].time)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500">No runners in this ranking</p>
      )}
    </div>
  );
}

export default RankingTable;
