import { Link } from 'react-router-dom';
import { parseTime, formatTime } from '@rasifix/orienteering-utils';

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
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-2 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rank
            </th>
            <th className="px-2 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-2 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cat
            </th>
            <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Club
            </th>
            <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Year
            </th>
            <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              City
            </th>
            <th className="px-2 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Split
            </th>
            <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Behind
            </th>
            <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Time Loss
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {runners.map((runner, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-2 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {runner.splitRank}
              </td>
              <td className="px-2 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <Link
                  to={`/competitions/${source}/${competitionId}/categories/${encodeURIComponent(runner.category)}/runners/${runner.id}`}
                  className="text-rust-600 hover:text-rust-800 hover:underline"
                >
                  {runner.fullName}
                </Link>
              </td>
              <td className="px-2 md:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                <Link
                  to={`/competitions/${source}/${competitionId}/categories/${encodeURIComponent(runner.category)}`}
                  className="text-rust-600 hover:text-rust-800 hover:underline"
                >
                  {runner.category}
                </Link>
              </td>
              <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {runner.club}
              </td>
              <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {runner.yearOfBirth}
              </td>
              <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {runner.city}
              </td>
              <td className="px-2 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {runner.split}
              </td>
              <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {getTimeBehind(runner.split, fastestSplit)}
              </td>
              <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-600">
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
