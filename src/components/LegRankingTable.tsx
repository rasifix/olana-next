import { Link } from 'react-router-dom';
import { parseTime, formatTime } from '@rasifix/orienteering-utils';
import { useTranslation } from 'react-i18next';

interface LegRunner {
  id: number | string;
  splitRank: number;
  fullName: string;
  category: string;
  club: string;
  yearOfBirth: string;
  city: string;
  split: string;
  timeLoss?: string;
}

interface LegRankingTableProps {
  runners: LegRunner[];
  source: string;
  competitionId: string;
}

function LegRankingTable({ runners, source, competitionId }: LegRankingTableProps) {
  const { t } = useTranslation();
  
  const getTimeBehind = (split: string, fastestSplit: string): string => {
    if (split === fastestSplit) {
      return '';
    }
    const currentTime = parseTime(split);
    const fastestTime = parseTime(fastestSplit);
    if (currentTime && fastestTime) {
      return '+' + formatTime(currentTime - fastestTime);
    }
    return '-';
  };

  const fastestSplit = runners.length > 0 ? runners[0].split : '';

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border-default">
        <thead className="bg-surface-secondary">
          <tr>
            <th className="px-2 md:px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
              #
            </th>
            <th className="px-2 md:px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
              {t('table.name')}
            </th>
            <th className="px-2 md:px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
              {t('table.category')}
            </th>
            <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
              {t('table.club')}
            </th>
            <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
              {t('table.year')}
            </th>
            <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
              {t('table.city')}
            </th>
            <th className="px-2 md:px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
              {t('table.split')}
            </th>
            <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
              {t('table.behind')}
            </th>
            <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
              {t('table.timeLoss')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-surface-primary divide-y divide-border-default">
          {runners.map((runner, index) => (
            <tr key={index} className="hover:bg-surface-hover">
              <td className="px-2 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">
                {runner.splitRank}
              </td>
              <td className="px-2 md:px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                <Link
                  to={`/competitions/${source}/${competitionId}/categories/${encodeURIComponent(runner.category)}/runners/${runner.id}`}
                  className="text-link hover:text-link-hover hover:underline"
                >
                  {runner.fullName}
                </Link>
              </td>
              <td className="px-2 md:px-6 py-4 whitespace-nowrap text-sm text-text-tertiary">
                <Link
                  to={`/competitions/${source}/${competitionId}/categories/${encodeURIComponent(runner.category)}`}
                  className="text-link hover:text-link-hover hover:underline">
                  {runner.category}
                </Link>
              </td>
              <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-text-tertiary">
                {runner.club}
              </td>
              <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-text-tertiary">
                {runner.yearOfBirth}
              </td>
              <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-text-tertiary">
                {runner.city}
              </td>
              <td className="px-2 md:px-6 py-4 whitespace-nowrap text-sm text-sm text-text-primary font-mono">
                {runner.split}
              </td>
              <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-text-tertiary font-mono">
                {getTimeBehind(runner.split, fastestSplit)}
              </td>
              <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-text-tertiary font-mono">
                {runner.timeLoss || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LegRankingTable;
