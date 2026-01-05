import { ReactNode } from 'react';
import { ranking, formatTime, parseTime } from '@rasifix/orienteering-utils';
import { useTranslation } from 'react-i18next';

interface RankingTableProps {
  runners: ranking.RankingRunner[];
  selectedRunners: Set<number>;
  onToggleRunner: (index: number) => void;
  onClearSelection: () => void;
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
  onClearSelection,
  onShowGraph,
  showCategoryColumn = false,
  showYearColumn = false,
  renderName,
  renderCategory
}: RankingTableProps) {
  const { t } = useTranslation();
  
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
        {selectedRunners.size > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-text-tertiary">
              {t('runner.selected', { count: selectedRunners.size })}
            </span>
            <button
              onClick={onShowGraph}
              disabled={selectedRunners.size < 2}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors disabled:bg-disabled disabled:cursor-not-allowed"
            >
              {t('button.showSplitGraph')}
            </button>
            <button
              onClick={onClearSelection}
              className="px-3 py-2 text-sm text-text-tertiary hover:text-text-primary transition-colors"
            >
              {t('button.clear')}
            </button>
          </div>
        )}
      </div>

      {runners.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border-default">
            <thead className="bg-surface-secondary">
              <tr>
                <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  {t('table.select')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  {t('table.rank')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  {t('table.name')}
                </th>
                {showCategoryColumn && (
                  <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    {t('table.category')}
                  </th>
                )}
                <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  {t('table.club')}
                </th>
                <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  {t('table.city')}
                </th>
                {showYearColumn && (
                  <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    {t('table.year')}
                  </th>
                )}
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  {t('table.time')}
                </th>
                <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  {t('table.behind')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-surface-primary divide-y divide-border-default">
              {runners.map((runner, index) => (
                <tr 
                  key={runner.id || index} 
                  className={`hover:bg-surface-hover ${selectedRunners.has(index) ? 'bg-primary-light' : ''}`}
                >
                  <td className="hidden md:table-cell px-4 py-3 whitespace-nowrap text-sm">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={selectedRunners.has(index)}
                      onChange={() => onToggleRunner(index)}
                      disabled={!selectedRunners.has(index) && selectedRunners.size >= 5}
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-text-primary">
                    {runner.rank}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-text-primary">
                    {renderName ? renderName(runner, index) : runner.fullName}
                  </td>
                  {showCategoryColumn && (
                    <td className="hidden md:table-cell px-4 py-3 whitespace-nowrap text-sm text-text-tertiary">
                      {renderCategory ? renderCategory(runner, index) : (runner.category || '-')}
                    </td>
                  )}
                  <td className="hidden md:table-cell px-4 py-3 whitespace-nowrap text-sm text-text-muted">
                    {runner.club}
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 whitespace-nowrap text-sm text-text-muted">
                    {runner.city}
                  </td>
                  {showYearColumn && (
                    <td className="hidden md:table-cell px-4 py-3 whitespace-nowrap text-sm text-text-muted">
                      {runner.yearOfBirth}
                    </td>
                  )}
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-text-primary">
                    {runner.time}
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 whitespace-nowrap text-sm text-text-primary">
                    {index === 0 ? '' : `+${timeBehind(runner.time, runners[0].time)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-text-muted">{t('error.noRunners')}</p>
      )}
    </div>
  );
}

export default RankingTable;
