import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { competitionService } from '../services/competitionService';
import { parseTime } from '@rasifix/orienteering-utils';
import Breadcrumbs from '../components/Breadcrumbs';
import { useCompetition } from '../contexts/CompetitionContext';
import LegRankingTable from '../components/LegRankingTable';
import { useTheme } from '../contexts/ThemeContext';
import { getCombinedChartPalette } from '../utils/chartColors';

function LegDetailsPage() {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const categoryColorPalette = getCombinedChartPalette(isDarkMode);
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
    leg.categories.forEach((cat, idx) => {
      colors[cat] = categoryColorPalette[idx % categoryColorPalette.length];
    });
    return colors;
  }, [leg, categoryColorPalette]);

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

  if (!leg) {
    return (
      <div className="px-4 py-6">
        <div className="text-center py-8 text-text-muted">
          Leg not found
        </div>
        <button
          onClick={() => navigate(`/competitions/${source}/${id}`)}
          className="mt-4 text-link hover:text-link-hover"
        >
          ← Back to competition
        </button>
      </div>
    );
  }

  return (
    <div className="md:px-4 py-6">
      <div className="px-4">
      <Breadcrumbs items={[
        { label: t('navigation.home'), path: '/competitions', isHome: true },
        { label: competition?.name || t('navigation.competitions'), path: `/competitions/${source}/${id}` },
        { label: t('navigation.legs'), path: `/competitions/${source}/${id}/legs` },
        { label: t('leg.fromTo', { from: leg.from, to: leg.to }), path: `/competitions/${source}/${id}/legs/${legId}` }
      ]} />
      </div>

      <div className="page-container-card">
        <div className="mb-6">
          <h2 className="page-title">
            Leg: <Link 
              to={`/competitions/${source}/${id}/controls/${encodeURIComponent(leg.from)}`}
              className="text-link hover:text-link-hover hover:underline"
            >
              {leg.from}
            </Link> → <Link 
              to={`/competitions/${source}/${id}/controls/${encodeURIComponent(leg.to)}`}
              className="text-link hover:text-link-hover hover:underline"
            >
              {leg.to}
            </Link>
          </h2>
          <p className="text-text-tertiary mt-1">
            Categories: {leg.categories.join(', ')}
          </p>
        </div>

        {/* Category Filter */}
        {leg.categories.length > 1 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-3">
              <div
                className="flex items-center gap-2 px-3 py-1 rounded-md bg-surface-secondary cursor-pointer"
                onClick={toggleAll}
                style={{
                  backgroundColor: selectedCategories.size === leg.categories.length ? '#e5e7eb' : undefined,
                  fontWeight: selectedCategories.size === leg.categories.length ? '600' : '400',
                }}
              >
                <span className="text-secondary">All</span>
              </div>
              {leg.categories.map(category => {
                const isSelected = selectedCategories.has(category);
                return (
                  <div
                    key={category}
                    className="flex items-center gap-2 px-3 py-1 rounded-md bg-surface-secondary cursor-pointer"
                    onClick={() => toggleCategory(category)}
                    style={{
                      backgroundColor: isSelected ? `${categoryColors[category]}20` : undefined,
                    }}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: categoryColors[category] }}
                    />
                    <span className="text-sm font-medium text-text-secondary">{category}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <LegRankingTable 
          runners={filteredRunners}
          source={source!}
          competitionId={id!}
        />
      </div>
    </div>
  );
}

export default LegDetailsPage;
