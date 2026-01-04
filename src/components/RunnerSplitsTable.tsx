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
      <h3 className="text-xl font-semibold text-text-primary mb-4">Split Times</h3>

      {runner.splits && runner.splits.length > 0 ? (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-border-default">
              <thead className="bg-surface-secondary">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider border-l border-border-strong">
                    Split Rank
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">
                    Split Time
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider border-r border-border-strong">
                    Split Behind
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">
                    Overall Rank
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">
                    Overall Time
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">
                    Overall Behind
                  </th>
                </tr>
              </thead>
              <tbody className="bg-surface-primary divide-y divide-border-default">
                {runner.splits.map((split, index) => {
                  const legId = index === 0 
                    ? `St-${split.code}` 
                    : `${runner.splits[index - 1].code}-${split.code}`;
                  
                  return (
                    <tr key={index} className="hover:bg-surface-hover">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-text-primary">
                        <Link 
                          to={`/competitions/${source}/${id}/legs/${encodeURIComponent(legId)}`}
                          className="text-link hover:text-link-hover hover:underline"
                        >
                          {split.code}
                        </Link>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text-primary text-right border-l border-border-strong">
                        {split.leg.rank}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text-primary text-right font-mono">
                        {formatTime(split.splitTime)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text-primary text-right border-r border-border-strong font-mono">
                        {split.timeLoss && 
                          <span 
                            className="text-error font-medium cursor-pointer" 
                            title={`Time loss: ${formatTime(split.timeLoss)}`}
                            onClick={() => alert(`Time loss: ${formatTime(split.timeLoss)}`)}
                          >
                            ⚠ 
                          </span>
                        }
                        {split.leg.behind ? formatTime(split.leg.behind) : '0:00'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text-primary text-right">
                        {split.overall.rank}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text-primary text-right font-mono">
                        {formatTime(split.time)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text-primary text-right font-mono">
                        {split.overall.behind ? formatTime(split.overall.behind) : '0:00'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile layout */}
          <div className="md:hidden space-y-4">
            {runner.splits.map((split, index) => {
              const legId = index === 0 
                ? `St-${split.code}` 
                : `${runner.splits[index - 1].code}-${split.code}`;
              
              return (
                <div key={index} className="bg-surface-primary border border-border-default rounded-lg p-4">
                  <div className="mb-3">
                    <Link 
                      to={`/competitions/${source}/${id}/legs/${encodeURIComponent(legId)}`}
                      className="text-lg font-semibold text-link hover:text-link-hover hover:underline"
                    >
                      {split.code}
                    </Link>
                  </div>
                  
                  {/* Split row */}
                  <div className="mb-3 pb-3 border-b border-border-default">
                    <div className="text-xs font-medium text-text-muted uppercase mb-2">Split</div>
                    <div className="flex justify-between text-sm">
                      <div className="flex-1">
                        <div className="text-text-muted text-xs">Rank</div>
                        <div className="text-text-primary font-medium">{split.leg.rank}</div>
                      </div>
                      <div className="flex-1 text-center">
                        <div className="text-text-muted text-xs">Time</div>
                        <div className="text-text-primary font-medium font-mono">{formatTime(split.splitTime)}</div>
                      </div>
                      <div className="flex-1 text-right">
                        <div className="text-text-muted text-xs">Behind</div>
                        <div className="text-text-primary font-medium font-mono flex items-center justify-end gap-1">
                          {split.leg.behind ? formatTime(split.leg.behind) : '0:00'}
                        </div>
                          {split.timeLoss && 
                            <div className="text-error font-medium font-mono">{split.timeLoss ? formatTime(split.timeLoss) : '-'}</div>
                          }
                      </div>
                    </div>
                  </div>
                  
                  {/* Overall row */}
                  <div>
                    <div className="text-xs font-medium text-text-muted uppercase mb-2">Overall</div>
                    <div className="flex justify-between text-sm">
                      <div className="flex-1">
                        <div className="text-text-muted text-xs">Rank</div>
                        <div className="text-text-primary font-medium">{split.overall.rank}</div>
                      </div>
                      <div className="flex-1 text-center">
                        <div className="text-text-muted text-xs">Time</div>
                        <div className="text-text-primary font-medium font-mono">{formatTime(split.time)}</div>
                      </div>
                      <div className="flex-1 text-right">
                        <div className="text-text-muted text-xs">Behind</div>
                        <div className="text-text-primary font-medium font-mono">{split.overall.behind ? formatTime(split.overall.behind) : '0:00'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <p className="text-text-muted">No split times available</p>
      )}
    </div>
  );
}

export default RunnerSplitsTable;
