import { useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { competitionService } from '../services/competitionService';
import LegsList from '../components/LegsList';
import ControlsList from '../components/ControlsList';
import Breadcrumbs from '../components/Breadcrumbs';
import CategoryCard from '../components/CategoryCard';
import { useCompetition } from '../contexts/CompetitionContext';

function CompetitionDetailsPage() {
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
    <div className="px-4 py-6">
      <Breadcrumbs items={[
        { label: 'Home', path: '/competitions', isHome: true },
        { label: competition?.name || 'Competition', path: `/competitions/${source}/${id}` }
      ]} />

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {competition?.name}
        </h2>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <Link
              to={`/competitions/${source}/${id}/categories`}
              className={`${
                activeTab === 'categories'
                  ? 'border-rust-500 text-rust-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Categories ({competition?.categories?.length || 0})
            </Link>
            <Link
              to={`/competitions/${source}/${id}/courses`}
              className={`${
                activeTab === 'courses'
                  ? 'border-rust-500 text-rust-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Courses ({courses.length})
            </Link>
            <Link
              to={`/competitions/${source}/${id}/legs`}
              className={`${
                activeTab === 'legs'
                  ? 'border-rust-500 text-rust-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Legs ({legs.length})
            </Link>
            <Link
              to={`/competitions/${source}/${id}/controls`}
              className={`${
                activeTab === 'controls'
                  ? 'border-rust-500 text-rust-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Controls ({controls.length})
            </Link>
            <Link
              to={`/competitions/${source}/${id}/custom`}
              className={`${
                activeTab === 'custom'
                  ? 'border-rust-500 text-rust-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Custom Category
            </Link>
            <Link
              to={`/competitions/${source}/${id}/starttime`}
              className={`${
                activeTab === 'starttime'
                  ? 'border-rust-500 text-rust-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Start Times
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
                    className="bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-colors block"
                  >
                    <CategoryCard
                      name={category.name}
                      controls={category.controls}
                      distance={category.distance}
                      ascent={category.ascent}
                      runnerCount={category.runners?.length || 0}
                    />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No categories available</p>
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
                    className="bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-colors block"
                  >
                    <CategoryCard
                      name={course.name}
                      controls={course.controls}
                      distance={course.distance}
                      ascent={course.ascent}
                      runnerCount={course.runners || 0}
                    />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No courses available</p>
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
