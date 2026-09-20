import { Menu, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
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
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);

  // Determine active tab from current path
  const activeTab = useMemo(() => {
    const pathParts = location.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    return ['categories', 'courses', 'legs', 'controls', 'custom', 'starttime'].includes(lastPart)
      ? lastPart
      : 'categories';
  }, [location.pathname]);

  useEffect(() => {
    setIsNavigationOpen(false);
  }, [location.pathname]);

  const tabs = [
    {
      id: 'categories',
      label: t('navigation.categories'),
      count: competition?.categories?.length || 0,
    },
    {
      id: 'courses',
      label: t('navigation.courses'),
      count: competition ? competitionService.getCourses(competition).length : 0,
    },
    {
      id: 'legs',
      label: t('navigation.legs'),
      count: competition ? competitionService.getLegs(competition).length : 0,
    },
    {
      id: 'controls',
      label: t('navigation.controls'),
      count: competition ? competitionService.getControls(competition).length : 0,
    },
    { id: 'custom', label: t('navigation.customCategory') },
    { id: 'starttime', label: t('navigation.startTimes') },
  ];

  const activeTabLabel = tabs.find((tab) => tab.id === activeTab)?.label;

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
          <div className="lg:hidden pb-3">
            <button
              type="button"
              className="flex w-full max-w-full items-center justify-between gap-3 rounded-md border border-border-default bg-surface-primary px-3 py-2 text-left text-text-primary"
              aria-expanded={isNavigationOpen}
              aria-controls="competition-navigation"
              aria-label={isNavigationOpen ? t('navigation.closeMenu') : t('navigation.openMenu')}
              onClick={() => setIsNavigationOpen((open) => !open)}
            >
              <span className="min-w-0 truncate font-medium">{activeTabLabel}</span>
              {isNavigationOpen ? <X className="h-5 w-5 shrink-0" /> : <Menu className="h-5 w-5 shrink-0" />}
            </button>

            {isNavigationOpen && (
              <nav id="competition-navigation" className="mt-2 overflow-hidden rounded-md border border-border-default bg-surface-primary" aria-label={t('navigation.eventNavigation')}>
                {tabs.map((tab) => (
                  <Link
                    key={tab.id}
                    to={`/competitions/${source}/${id}/${tab.id}`}
                    className={`flex max-w-full items-center justify-between gap-3 px-3 py-3 text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'bg-surface-secondary font-semibold text-link'
                        : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                    }`}
                  >
                    <span className="min-w-0 truncate">{tab.label}</span>
                    {tab.count !== undefined && <span className="shrink-0 text-text-muted">({tab.count})</span>}
                  </Link>
                ))}
              </nav>
            )}
          </div>

          <nav className="hidden space-x-8 lg:flex" aria-label={t('navigation.eventNavigation')}>
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                to={`/competitions/${source}/${id}/${tab.id}`}
                className={`${activeTab === tab.id
                  ? 'tab-link-active'
                  : 'tab-link hover:text-text-secondary hover:border-border-strong'
                  } whitespace-nowrap transition-colors`}
              >
                {tab.label}{tab.count !== undefined && ` (${tab.count})`}
              </Link>
            ))}
          </nav>
        </div>

        {/* Outlet for nested routes */}
        <Outlet />
      </div>
    </div>
  );
}

export default CompetitionDetailsPage;
