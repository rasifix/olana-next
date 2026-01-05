import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';import { useTranslation } from 'react-i18next';import { competitionService } from '../services/competitionService';
import LegCard from '../components/LegCard';
import Breadcrumbs from '../components/Breadcrumbs';
import { useCompetition } from '../contexts/CompetitionContext';
import CategoryCard from '@/components/CategoryCard';

function ControlDetailsPage() {
  const { t } = useTranslation();
  const { source, id, controlCode } = useParams<{ source: string; id: string; controlCode: string }>();
  const { competition } = useCompetition();

  const control = useMemo(() => {
    if (!competition || !controlCode) return null;
    try {
      return competitionService.getControlDetails(competition, controlCode);
    } catch (err) {
      console.error('Error loading control:', err);
      return null;
    }
  }, [competition, controlCode]);

  if (!control) {
    return (
      <div className="px-4 py-6">
        <div className="text-center py-8 text-text-muted">
          Control not found
        </div>
      </div>
    );
  }

  return (
    <div className="md:px-4 py-6">
      <div className="px-4">
      <Breadcrumbs items={[
        { label: t('navigation.home'), path: '/competitions', isHome: true },
        { label: competition?.name || t('navigation.competitions'), path: `/competitions/${source}/${id}` },
        { label: t('navigation.controls'), path: `/competitions/${source}/${id}/controls` },
        { label: `${t('table.control')} ${control.code}`, path: `/competitions/${source}/${id}/controls/${controlCode}` }
      ]} />
      </div>

      <div className="bg-surface-primary rounded-none md:rounded-lg shadow-lg p-4 md:p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-text-primary">
            Control {control.code}
          </h2>
        </div>

        {/* Categories Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Categories
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {control.categories.map((category) => (
              <Link
                key={category.name}
                to={`/competitions/${source}/${id}/categories/${encodeURIComponent(category.name)}`}
                className="hover:opacity-80 transition-opacity block"
              >
                <CategoryCard name={category.name} distance={category.distance} elevation={category.elevation} controls={category.controls} runnerCount={category.runners} />
              </Link>
            ))}
          </div>
        </div>

        {/* Incoming Legs Section */}
        {control.from.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Incoming Legs ({control.from.length})
            </h3>
            <div className="flex flex-col gap-3">
              {control.from.map((leg) => (
                <Link
                  key={leg.leg}
                  to={`/competitions/${source}/${id}/legs/${encodeURIComponent(leg.leg)}`}
                >
                  <LegCard
                    title={leg.leg}
                    categories={leg.categories}
                    runners={leg.runners}
                    errorFrequency={leg.errorFrequency}
                  />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Outgoing Legs Section */}
        {control.to.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Outgoing Legs ({control.to.length})
            </h3>
            <div className="flex flex-col gap-3">
              {control.to.map((leg) => (
                <Link
                  key={leg.leg}
                  to={`/competitions/${source}/${id}/legs/${encodeURIComponent(leg.leg)}`}
                >
                  <LegCard
                    title={leg.leg}
                    categories={leg.categories}
                    runners={leg.runners}
                    errorFrequency={leg.errorFrequency}
                  />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ControlDetailsPage;
