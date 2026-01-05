import { useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { competitionService } from '../services/competitionService';
import LegsList from '../components/LegsList';
import ControlsList from '../components/ControlsList';
import Breadcrumbs from '../components/Breadcrumbs';
import CategoryCard from '../components/CategoryCard';
import { useCompetition } from '../contexts/CompetitionContext';

function CompetitionDetailsPage() {
  const { t } = useTranslation();
  const { source, id, tab } = useParams<{ source: string; id: string; tab?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { competition } = useCompetition();

  // Redirect to categories tab if no tab specified
  useEffect(() => {
    if (source && id && !tab && location.pathname === `/competitions/${source}/${id}`) {
      navigate(`/competitions/${source}/${id}/categories`, { replace: true });
    }
  }, [source, id, tab, location.pathname, navigate]);

  const activeTab = tab || 'categories';

  // Calculate data from competition using useMemo
  const courses = useMemo(() => {
    if (!competition) return [];
    return competitionService.getCourses(competition);
  }, [competition]);

  const legs = useMemo(() => {
    if (!competition) return [];
    return competitionService.getLegs(competition);
  }, [competition]);

  const controls = useMemo(() => {
    if (!competition) return [];
    return competitionService.getControls(competition);
  }, [competition]);

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
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <Link
              to={`/competitions/${source}/${id}/categories`}
              className={`${
                activeTab === 'categories'
                  ? 'tab-link-active'
                  : 'tab-link hover:text-text-secondary hover:border-border-strong'
              } whitespace-nowrap transition-colors`}
            >
              {t('navigation.categories')}<span className="hidden md:inline"> ({competition?.categories?.length || 0})</span>
            </Link>
            <Link
              to={`/competitions/${source}/${id}/courses`}
              className={`${
                activeTab === 'courses'
                  ? 'tab-link-active'
                  : 'tab-link hover:text-text-secondary hover:border-border-strong'
              } whitespace-nowrap transition-colors`}
            >
              {t('navigation.courses')}<span className="hidden md:inline"> ({courses.length})</span>
            </Link>
            <Link
              to={`/competitions/${source}/${id}/legs`}
              className={`${
                activeTab === 'legs'
                  ? 'tab-link-active'
                  : 'tab-link hover:text-text-secondary hover:border-border-strong'
              } whitespace-nowrap transition-colors`}
            >
              {t('navigation.legs')}<span className="hidden md:inline"> ({legs.length})</span>
            </Link>
            <Link
              to={`/competitions/${source}/${id}/controls`}
              className={`${
                activeTab === 'controls'
                  ? 'tab-link-active'
                  : 'tab-link hover:text-text-secondary hover:border-border-strong'
              } whitespace-nowrap transition-colors`}
            >
              {t('navigation.controls')}<span className="hidden md:inline"> ({controls.length})</span>
            </Link>
            <Link
              to={`/competitions/${source}/${id}/custom`}
              className={`${
                activeTab === 'custom'
                  ? 'border-primary-border text-link'
                  : 'border-transparent text-text-muted hover:text-text-secondary hover:border-border-strong'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              {t('navigation.customCategory')}
            </Link>
            <Link
              to={`/competitions/${source}/${id}/starttime`}
              className={`${
                activeTab === 'starttime'
                  ? 'border-primary-border text-link'
                  : 'border-transparent text-text-muted hover:text-text-secondary hover:border-border-strong'
              } hidden md:inline-flex whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              {t('navigation.startTimes')}
            </Link>
          </nav>
        </div>

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div>
            {competition?.categories && competition.categories.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {competition.categories.map((category, index) => (
                  <Link
                    key={index}
                    to={`/competitions/${source}/${id}/categories/${encodeURIComponent(category.name)}`}
                    className="hover:opacity-80 transition-opacity block"
                  >
                    <CategoryCard
                      name={category.name}
                      controls={category.controls}
                      distance={category.distance}
                      elevation={category.ascent}
                      runnerCount={category.runners?.length || 0}
                    />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-text-muted">No categories available</p>
            )}
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div>
            {courses.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {courses.map((course) => (
                  <Link
                    key={course.id}
                    to={`/competitions/${source}/${id}/courses/${encodeURIComponent(course.id)}`}
                    className="hover:opacity-80 transition-opacity block"
                  >
                    <CategoryCard
                      name={course.name}
                      controls={course.controls}
                      distance={course.distance}
                      elevation={course.ascent}
                      runnerCount={course.runners || 0}
                    />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-text-muted">No courses available</p>
            )}
          </div>
        )}

        {/* Legs Tab */}
        {activeTab === 'legs' && (
          <div>
            <LegsList legs={legs} />
          </div>
        )}

        {/* Controls Tab */}
        {activeTab === 'controls' && (
          <div>
            <ControlsList controls={controls} />
          </div>
        )}
      </div>
    </div>
  );
}

export default CompetitionDetailsPage;
