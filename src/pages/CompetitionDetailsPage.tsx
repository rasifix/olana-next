import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Outlet, useLocation, useParams } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import { useCompetition } from '../contexts/CompetitionContext';
import { competitionService } from '../services/competitionService';

function CompetitionDetailsPage() {
  const { t } = useTranslation();
  const { source, id } = useParams<{ source: string; id: string }>();
  const location = useLocation();
  const { competition } = useCompetition();

  // Determine active tab from current path
  const activeTab = useMemo(() => {
    const pathParts = location.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    return ['categories', 'courses', 'legs', 'controls', 'custom', 'starttime'].includes(lastPart)
      ? lastPart
      : 'categories';
  }, [location.pathname]);

  return (
    <div className="page-layout">
      <div className="px-4">
        <Breadcrumbs items={[
          { label: t('navigation.home'), path: '/competitions', isHome: true },
          { label: competition?.name || t('navigation.competitions'), path: `/competitions/${source}/${id}` }
        ]} />
      </div>

      <div className="page-container-card">
        <h2 className="page-title">
          {competition?.name}
        </h2>

        {/* Tab Navigation */}
        <div className="border-b border-border-default mb-6">
          <nav className="flex space-x-8" aria-label="Tabs">
            <Link
              to={`/competitions/${source}/${id}/categories`}
              className={`${activeTab === 'categories'
                ? 'tab-link-active'
                : 'tab-link hover:text-text-secondary hover:border-border-strong'
                } whitespace-nowrap transition-colors`}
            >
              {t('navigation.categories')}<span className="hidden md:inline"> ({competition?.categories?.length || 0})</span>
            </Link>
            <Link
              to={`/competitions/${source}/${id}/courses`}
              className={`${activeTab === 'courses'
                ? 'tab-link-active'
                : 'tab-link hover:text-text-secondary hover:border-border-strong'
                } whitespace-nowrap transition-colors`}
            >
              {t('navigation.courses')}<span className="hidden md:inline"> ({competition && competitionService.getCourses(competition).length || 0})</span>
            </Link>
            <Link
              to={`/competitions/${source}/${id}/legs`}
              className={`${activeTab === 'legs'
                ? 'tab-link-active'
                : 'tab-link hover:text-text-secondary hover:border-border-strong'
                } whitespace-nowrap transition-colors`}
            >
              {t('navigation.legs')}<span className="hidden md:inline"> ({competition && competitionService.getLegs(competition).length || 0})</span>
            </Link>
            <Link
              to={`/competitions/${source}/${id}/controls`}
              className={`${activeTab === 'controls'
                ? 'tab-link-active'
                : 'tab-link hover:text-text-secondary hover:border-border-strong'
                } whitespace-nowrap transition-colors`}
            >
              {t('navigation.controls')}<span className="hidden md:inline"> ({competition && competitionService.getControls(competition).length || 0})</span>
            </Link>
            <Link
              to={`/competitions/${source}/${id}/custom`}
              className={`${activeTab === 'custom'
                ? 'tab-link-active'
                : 'tab-link hover:text-text-secondary hover:border-border-strong'
                } whitespace-nowrap transition-colors`}
            >
              {t('navigation.customCategory')}
            </Link>
            <Link
              to={`/competitions/${source}/${id}/starttime`}
              className={`${activeTab === 'starttime'
                ? 'tab-link-active'
                : 'tab-link hover:text-text-secondary hover:border-border-strong'
                } hidden md:inline-flex whitespace-nowrap transition-colors`}
            >
              {t('navigation.startTimes')}
            </Link>
          </nav>
        </div>

        {/* Outlet for nested routes */}
        <Outlet />
      </div>
    </div>
  );
}

export default CompetitionDetailsPage;
