import { ranking, formatTime } from '@rasifix/orienteering-utils';
import { Link } from 'react-router-dom';

interface RunnerSplitsTableProps {
  runner: ranking.RankingRunner;
  source: string;
  id: string;
}

function RunnerSplitsTable({ runner, source, id }: RunnerSplitsTableProps) {
  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Split Times</h3>

      {runner.splits && runner.splits.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Control
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Split Rank
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Split Time
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Split Behind
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Overall Rank
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Overall Behind
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time Loss
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Perf. Index
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {runner.splits.map((split, index) => {
                // Build leg ID: first split is "St-{code}", others are "{previousCode}-{code}"
                const legId = index === 0 
                  ? `St-${split.code}` 
                  : `${runner.splits[index - 1].code}-${split.code}`;
                
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      <Link 
                        to={`/competitions/${source}/${id}/legs/${encodeURIComponent(legId)}`}
                        className="text-rust-600 hover:text-rust-800 hover:underline"
                      >
                        {split.code}
                      </Link>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                      {split.leg.rank}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatTime(split.splitTime)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                      {split.leg.behind ? formatTime(split.leg.behind) : '0:00'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                      {split.overall.rank}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                      {split.overall.behind ? formatTime(split.overall.behind) : '0:00'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-red-700 text-right">
                      {split.timeLoss ? formatTime(split.timeLoss) : ''}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                      {split.performanceIndex !== undefined ? `${Math.round(split.performanceIndex)}%` : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500">No split times available</p>
      )}
    </div>
  );
}

export default RunnerSplitsTable;
