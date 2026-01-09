import { formatTime, ranking } from '@rasifix/orienteering-utils';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface RunnerSplitsTableProps {
  runner: ranking.RankingRunner;
  source: string;
  id: string;
}

function RunnerSplitsTable({ runner, source, id }: RunnerSplitsTableProps) {
  const { t } = useTranslation();

  return (
    <div className="mt-6">
      <h3 className="section-heading">{t('table.splitTimes')}</h3>

      {runner.splits && runner.splits.length > 0 ? (
        <>
          {/* Desktop table */}
          <div className="hidden md:block table-container">
            <table className="table-base">
              <thead>
                <tr>
                  <th>
                    Nr
                  </th>
                  <th>
                    #
                  </th>
                  <th className="text-right border-l border-border-strong">
                    {t('table.splitRank')}
                  </th>
                  <th className="text-right">
                    {t('table.splitTime')}
                  </th>
                  <th className="text-right border-r border-border-strong">
                    {t('table.splitBehind')}
                  </th>
                  <th className="text-right">
                    {t('table.overallRank')}
                  </th>
                  <th className="text-right">
                    {t('table.overallTime')}
                  </th>
                  <th className="text-right">
                    {t('table.overallBehind')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {runner.splits.map((split, index) => {
                  const legId = index === 0
                    ? `St-${split.code}`
                    : `${runner.splits[index - 1].code}-${split.code}`;

                  return (
                    <tr key={index} className="hover">
                      <td className="font-medium">
                        {index + 1}
                      </td>
                      <td className="font-medium">
                        <Link
                          to={`/competitions/${source}/${id}/legs/${encodeURIComponent(legId)}`}
                          className="text-link hover:text-link-hover hover:underline"
                        >
                          {split.code}
                        </Link>
                      </td>
                      <td className="text-right border-l border-border-strong">
                        {split.leg.rank}
                      </td>
                      <td className="text-right font-mono">
                        {formatTime(split.splitTime)}
                      </td>
                      <td className="text-right border-r border-border-strong font-mono">
                        {split.timeLoss &&
                          <span
                            className="text-error font-medium cursor-pointer"
                            title={`Time loss: ${formatTime(split.timeLoss)}`}
                            onClick={() => alert(`Time loss: ${formatTime(split.timeLoss)}`)}
                          >
                            ⚠
                          </span>
                        }
                        {split.leg.behind ? '+' + formatTime(split.leg.behind) : ''}
                      </td>
                      <td className="text-right">
                        {split.overall.rank}
                      </td>
                      <td className="text-right font-mono">
                        {formatTime(split.time)}
                      </td>
                      <td className="text-right font-mono">
                        {split.overall.behind ? '+' + formatTime(split.overall.behind) : ''}
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
                    <div className="text-xs font-medium text-text-muted uppercase mb-2">{t('table.split')}</div>
                    <div className="flex justify-between text-sm">
                      <div className="flex-1">
                        <div className="text-text-muted text-xs">{t('table.rank')}</div>
                        <div className="text-text-primary font-medium">{split.leg.rank}</div>
                      </div>
                      <div className="flex-1 text-center">
                        <div className="text-text-muted text-xs">{t('table.time')}</div>
                        <div className="text-text-primary font-medium font-mono">{formatTime(split.splitTime)}</div>
                      </div>
                      <div className="flex-1 text-right">
                        <div className="text-text-muted text-xs">{t('table.behind')}</div>
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
                    <div className="text-xs font-medium text-text-muted uppercase mb-2">{t('table.overall')}</div>
                    <div className="flex justify-between text-sm">
                      <div className="flex-1">
                        <div className="text-text-muted text-xs">{t('table.rank')}</div>
                        <div className="text-text-primary font-medium">{split.overall.rank}</div>
                      </div>
                      <div className="flex-1 text-center">
                        <div className="text-text-muted text-xs">{t('table.time')}</div>
                        <div className="text-text-primary font-medium font-mono">{formatTime(split.time)}</div>
                      </div>
                      <div className="flex-1 text-right">
                        <div className="text-text-muted text-xs">{t('table.behind')}</div>
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
        <p className="text-text-muted">{t('message.noSplitTimes')}</p>
      )}
    </div>
  );
}

export default RunnerSplitsTable;
