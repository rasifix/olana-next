import { formatTime, parseTime } from '@rasifix/orienteering-utils';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

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
    <div className="table-container">
      <table className="table-base">
        <thead>
          <tr>
            <th>
              #
            </th>
            <th>
              {t('table.name')}
            </th>
            <th>
              {t('table.category')}
            </th>
            <th className="hidden lg:table-cell">
              {t('table.club')}
            </th>
            <th className="hidden md:table-cell">
              {t('table.year')}
            </th>
            <th className="hidden lg:table-cell">
              {t('table.city')}
            </th>
            <th>
              {t('table.split')}
            </th>
            <th className="hidden md:table-cell">
              {t('table.behind')}
            </th>
            <th className="hidden md:table-cell">
              {t('table.timeLoss')}
            </th>
          </tr>
        </thead>
        <tbody>
          {runners.map((runner, index) => (
            <tr key={index} className="hover">
              <td className="table-td font-medium">
                {runner.splitRank}
              </td>
              <td>
                <Link
                  to={`/competitions/${source}/${competitionId}/categories/${encodeURIComponent(runner.category)}/runners/${runner.id}`}
                  className="text-link hover:text-link-hover hover:underline"
                >
                  {runner.fullName}
                </Link>
              </td>
              <td>
                <Link
                  to={`/competitions/${source}/${competitionId}/categories/${encodeURIComponent(runner.category)}`}
                  className="text-link hover:text-link-hover hover:underline">
                  {runner.category}
                </Link>
              </td>
              <td className="hidden lg:table-cell">
                {runner.club}
              </td>
              <td className="hidden md:table-cell">
                {runner.yearOfBirth}
              </td>
              <td className="hidden lg:table-cell">
                {runner.city}
              </td>
              <td className="font-mono">
                {runner.split}
              </td>
              <td className="hidden md:table-cell font-mono">
                {getTimeBehind(runner.split, fastestSplit)}
              </td>
              <td className="hidden md:table-cell font-mono">
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
