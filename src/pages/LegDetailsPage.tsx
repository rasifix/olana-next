import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { LegDetails } from '../types';
import { competitionService } from '../services/competitionService';
import { parseTime, formatTime } from '@rasifix/orienteering-utils';
import Breadcrumbs from '../components/Breadcrumbs';

function LegDetailsPage() {
  const { source, id, legId } = useParams<{ source: string; id: string; legId: string }>();
  const navigate = useNavigate();
  const [leg, setLeg] = useState<LegDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLeg = async () => {
      if (!source || !id || !legId) return;

      try {
        setLoading(true);
        setError(null);
        const data = await competitionService.getLegDetails(source, id, legId);
        setLeg(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load leg');
        console.error('Error loading leg:', err);
      } finally {
        setLoading(false);
      }
    };

    loadLeg();
  }, [source, id, legId]);

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

  if (loading) {
    return (
      <div className="px-4 py-6">
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-600">Loading leg details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Error loading leg: {error}
        </div>
        <button
          onClick={() => navigate(`/competitions/${source}/${id}`)}
          className="mt-4 text-rust-600 hover:text-rust-800"
        >
          ← Back to competition
        </button>
      </div>
    );
  }

  if (!leg) {
    return (
      <div className="px-4 py-6">
        <div className="text-center py-8 text-gray-500">
          Leg not found
        </div>
        <button
          onClick={() => navigate(`/competitions/${source}/${id}`)}
          className="mt-4 text-rust-600 hover:text-rust-800"
        >
          ← Back to competition
        </button>
      </div>
    );
  }

  const fastestSplit = leg.runners.length > 0 ? leg.runners[0].split : '';

  return (
    <div className="px-4 py-6">
      <Breadcrumbs items={[
        { label: 'Home', path: '/competitions', isHome: true },
        { label: 'Competition', path: `/competitions/${source}/${id}` },
        { label: `Leg ${leg.from} → ${leg.to}`, path: `/competitions/${source}/${id}/legs/${legId}` }
      ]} />

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Leg: <Link 
              to={`/competitions/${source}/${id}/controls/${encodeURIComponent(leg.from)}`}
              className="text-rust-600 hover:text-rust-800 hover:underline"
            >
              {leg.from}
            </Link> → <Link 
              to={`/competitions/${source}/${id}/controls/${encodeURIComponent(leg.to)}`}
              className="text-rust-600 hover:text-rust-800 hover:underline"
            >
              {leg.to}
            </Link>
          </h2>
          <p className="text-gray-600 mt-1">
            Categories: {leg.categories.join(', ')}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Club
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  City
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Split Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Behind
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time Loss
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leg.runners.map((runner, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {runner.splitRank}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <Link
                      to={`/competitions/${source}/${id}/categories/${encodeURIComponent(runner.category)}/runners/${runner.id}`}
                      className="text-rust-600 hover:text-rust-800 hover:underline"
                    >
                      {runner.fullName}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <Link
                      to={`/competitions/${source}/${id}/categories/${encodeURIComponent(runner.category)}`}
                      className="text-rust-600 hover:text-rust-800 hover:underline"
                    >
                      {runner.category}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {runner.club}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {runner.yearOfBirth}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {runner.city}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {runner.split}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {getTimeBehind(runner.split, fastestSplit)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {runner.timeLoss || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default LegDetailsPage;
