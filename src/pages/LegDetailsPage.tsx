import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { LegDetails } from '../types';
import { competitionService } from '../services/competitionService';
import { parseTime, formatTime } from '@rasifix/orienteering-utils';
import Breadcrumbs from '../components/Breadcrumbs';
import { useCompetition } from '../contexts/CompetitionContext';

function LegDetailsPage() {
  const { source, id, legId } = useParams<{ source: string; id: string; legId: string }>();
  const navigate = useNavigate();
  const { competition } = useCompetition();
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());

  const leg = useMemo(() => {
    if (!competition || !legId) return null;
    try {
      return competitionService.getLegDetails(competition, legId);
    } catch (err) {
      console.error('Error loading leg:', err);
      return null;
    }
  }, [competition, legId]);

  useEffect(() => {
    if (leg) {
      setSelectedCategories(new Set(leg.categories));
    }
  }, [leg]);

  // Filter and recalculate rankings based on selected categories
  const filteredRunners = useMemo(() => {
    if (!leg) return [];
    
    const filtered = leg.runners.filter(runner => 
      selectedCategories.has(runner.category)
    );
    
    // Sort by split time
    filtered.sort((a, b) => {
      const timeA = parseTime(a.split) || Number.MAX_VALUE;
      const timeB = parseTime(b.split) || Number.MAX_VALUE;
      return timeA - timeB;
    });
    
    // Recalculate ranks
    filtered.forEach((runner, idx) => {
      if (idx === 0) {
        runner.splitRank = 1;
      } else {
        const prev = filtered[idx - 1];
        if (prev.split === runner.split) {
          runner.splitRank = prev.splitRank;
        } else {
          runner.splitRank = idx + 1;
        }
      }
    });
    
    return filtered;
  }, [leg, selectedCategories]);

  const categoryColors = useMemo(() => {
    if (!leg) return {};
    const colors: Record<string, string> = {};
    const COLORS = ['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51'];
    const COLORS_DARK = ['#1a2f3a', '#1d6d63', '#a68a48', '#ab7143', '#a34e38'];
    const colorPalette = [...COLORS, ...COLORS_DARK];
    
    leg.categories.forEach((cat, idx) => {
      colors[cat] = colorPalette[idx % colorPalette.length];
    });
    return colors;
  }, [leg]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const toggleAll = () => {
    if (!leg) return;
    if (selectedCategories.size === leg.categories.length) {
      setSelectedCategories(new Set());
    } else {
      setSelectedCategories(new Set(leg.categories));
    }
  };

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

  const fastestSplit = filteredRunners.length > 0 ? filteredRunners[0].split : '';

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

        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-3">
            <div
              className="flex items-center gap-2 px-3 py-1 rounded-md bg-gray-50 cursor-pointer"
              onClick={toggleAll}
              style={{
                backgroundColor: selectedCategories.size === leg.categories.length ? '#e5e7eb' : undefined,
                fontWeight: selectedCategories.size === leg.categories.length ? '600' : '400',
              }}
            >
              <span className="text-sm text-gray-700">All</span>
            </div>
            {leg.categories.map(category => {
              const isSelected = selectedCategories.has(category);
              return (
                <div
                  key={category}
                  className="flex items-center gap-2 px-3 py-1 rounded-md bg-gray-50 cursor-pointer"
                  onClick={() => toggleCategory(category)}
                  style={{
                    backgroundColor: isSelected ? `${categoryColors[category]}20` : undefined,
                  }}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: categoryColors[category] }}
                  />
                  <span className="text-sm font-medium text-gray-700">{category}</span>
                </div>
              );
            })}
          </div>
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
              {filteredRunners.map((runner, index) => (
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
