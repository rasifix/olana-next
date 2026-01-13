import { formatTime, parseTime, ranking } from '@rasifix/orienteering-utils';
import { ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface RankingTableProps {
  runners: ranking.RankingRunner[];
  selectedRunners: Set<number>;
  showCategory?: boolean;
  showCourse?: boolean;
  onToggleRunner: (index: number) => void;
  onClearSelection: () => void;
  onShowGraph: () => void;
  renderName?: (runner: ranking.RankingRunner, index: number) => ReactNode;
  source?: string;
  id?: string;
}

function RankingTable({
  runners,
  selectedRunners,
  showCategory = true,
  showCourse = true,
  onToggleRunner,
  onClearSelection,
  onShowGraph,
  renderName,
  source,
  id
}: RankingTableProps) {
  const { t } = useTranslation();
  const timeRegex = /^\d{1,2}:\d{2}(:\d{2})?$/;
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  function timeBehind(time: string | undefined, fastest: string | undefined) {
    if (!time || !timeRegex.test(time) || !fastest || !timeRegex.test(fastest)) {
      return "";
    } else if (time === fastest) {
      return "";
    } else if (parseTime(time!) && parseTime(fastest!)) {
      return "+" + formatTime(parseTime(time)! - parseTime(fastest)!);
    }
  }

  console.log('Rendering RankingTable with runners:', runners[0]);

  return (
    <div>
      <div className="mb-4">
        {(selectedRunners.size > 0 || isMobile) && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            {selectedRunners.size > 0 && (
              <span className="text-sm text-text-tertiary">
                {t('runner.selected', { count: selectedRunners.size })}
              </span>
            )}
            <div className="flex gap-2">
              <button
                onClick={onShowGraph}
                disabled={!isMobile && selectedRunners.size < 2}
                className="btn-primary hover:bg-primary-hover transition-colors disabled flex-1 sm:flex-initial"
              >
                {t('button.showSplitGraph')}
              </button>
              {selectedRunners.size > 0 && (
                <button
                  onClick={onClearSelection}
                  className="btn-secondary hover:text-text-primary transition-colors flex-1 sm:flex-initial"
                >
                  {t('button.clear')}
                </button>
              )}
            </div>
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
                {showCategory && <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  {t('table.category')}
                </th>}
                {showCourse && <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  {t('table.course')}
                </th>}
                <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  {t('table.club')}
                </th>
                <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  {t('table.city')}
                </th>
                <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  {t('table.year')}
                </th>
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
                  {showCategory && <td className="table-td-muted hidden md:table-cell">
                    <Link
                      to={`/competitions/${source}/${id}/categories/${encodeURIComponent(runner.category)}`}
                      className="text-link hover:text-link-hover hover:underline"
                    >
                      {runner.category}
                    </Link>
                  </td>}
                  {showCourse && <td className="table-td-muted hidden md:table-cell">
                    {runner.course ? (
                      <Link
                        to={`/competitions/${source}/${id}/courses/${encodeURIComponent(runner.course)}`}
                        className="text-link hover:text-link-hover hover:underline"
                      >
                        {runner.course}
                      </Link>
                    ) : (runner.course || '-')}
                  </td>}
                  <td className="table-td-muted hidden md:table-cell">
                    {runner.club}
                  </td>
                  <td className="table-td-muted hidden md:table-cell">
                    {runner.city}
                  </td>
                  <td className="table-td-muted hidden lg:table-cell">
                    {runner.yearOfBirth}
                  </td>
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
