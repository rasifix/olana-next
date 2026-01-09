import { formatTime, parseTime, ranking } from '@rasifix/orienteering-utils';
import { ReactNode } from 'react';
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
  const timeRegex = /^\d{1,2}:\d{2}(:\d{2})?$/;

  function timeBehind(time: string | undefined, fastest: string | undefined) {
    if (!time || !timeRegex.test(time) || !fastest || !timeRegex.test(fastest)) {
      return "";
    } else if (time === fastest) {
      return "";
    } else if (parseTime(time!) && parseTime(fastest!)) {
      return "+" + formatTime(parseTime(time)! - parseTime(fastest)!);
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
              className="btn-primary hover:bg-primary-hover transition-colors disabled"
            >
              {t('button.showSplitGraph')}
            </button>
            <button
              onClick={onClearSelection}
              className="btn-secondary hover:text-text-primary transition-colors"
            >
              {t('button.clear')}
            </button>
          </div>
        )}
      </div>

      {runners.length > 0 ? (
        <div className="table-container">
          <table className="table-base">
            <thead>
              <tr>
                <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
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
            <tbody className="table-body">
              {runners.map((runner, index) => (
                <tr
                  key={runner.id || index}
                  className={`hover ${selectedRunners.has(index) ? 'selected' : ''}`}
                >
                  <td className="table-td hidden md:table-cell">
                    <input
                      type="checkbox"
                      className="checkbox-input focus disabled"
                      checked={selectedRunners.has(index)}
                      onChange={() => onToggleRunner(index)}
                      disabled={!selectedRunners.has(index) && selectedRunners.size >= 5}
                    />
                  </td>
                  <td className="table-td font-medium">
                    {runner.rank}
                  </td>
                  <td className="table-td">
                    {renderName ? renderName(runner, index) : runner.fullName}
                  </td>
                  {showCategoryColumn && (
                    <td className="table-td-muted hidden md:table-cell">
                      {renderCategory ? renderCategory(runner, index) : (runner.category || '-')}
                    </td>
                  )}
                  <td className="table-td-muted hidden md:table-cell">
                    {runner.club}
                  </td>
                  <td className="table-td-muted hidden md:table-cell">
                    {runner.city}
                  </td>
                  {showYearColumn && (
                    <td className="table-td-muted hidden md:table-cell">
                      {runner.yearOfBirth}
                    </td>
                  )}
                  <td className="table-td">
                    {runner.time}
                  </td>
                  <td className="table-td hidden md:table-cell">
                    {index === 0 ? '' : `${timeBehind(runner.time, runners[0].time)}`}
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
