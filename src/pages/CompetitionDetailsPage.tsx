import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { Competition, Course, Leg, Control } from '../types';
import { competitionService } from '../services/competitionService';
import LegsList from '../components/LegsList';
import ControlsList from '../components/ControlsList';
import Breadcrumbs from '../components/Breadcrumbs';

function CompetitionDetailsPage() {
  const { source, id, tab } = useParams<{ source: string; id: string; tab?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [legs, setLegs] = useState<Leg[]>([]);
  const [controls, setControls] = useState<Control[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect to categories tab if no tab specified
  useEffect(() => {
    if (source && id && !tab && location.pathname === `/competitions/${source}/${id}`) {
      navigate(`/competitions/${source}/${id}/categories`, { replace: true });
    }
  }, [source, id, tab, location.pathname, navigate]);

  const activeTab = tab || 'categories';

  useEffect(() => {
    const loadCompetition = async () => {
      if (!source || !id) return;

      try {
        setLoading(true);
        setError(null);
        const [competitionData, coursesData, legsData, controlsData] = await Promise.all([
          competitionService.getCompetitionById(source, id),
          competitionService.getCourses(source, id),
          competitionService.getLegs(source, id),
          competitionService.getControls(source, id)
        ]);
        setCompetition(competitionData);
        setCourses(coursesData);
        setLegs(legsData);
        setControls(controlsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load competition');
        console.error('Error loading competition:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCompetition();
  }, [source, id]);

  if (loading) {
    return (
      <div className="px-4 py-6">
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-600">Loading competition...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Error loading competition: {error}
        </div>
        <button
          onClick={() => navigate('/competitions')}
          className="mt-4 text-rust-600 hover:text-rust-800"
        >
          ← Back to competitions
        </button>
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="px-4 py-6">
        <div className="text-center py-8 text-gray-500">
          Competition not found
        </div>
        <button
          onClick={() => navigate('/competitions')}
          className="mt-4 text-rust-600 hover:text-rust-800"
        >
          ← Back to competitions
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <Breadcrumbs items={[
        { label: 'Home', path: '/competitions', isHome: true },
        { label: competition.name, path: `/competitions/${source}/${id}` }
      ]} />

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {competition.name}
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
              Categories ({competition.categories?.length || 0})
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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 p-4">
                        <h4 className="font-semibold text-gray-900">
                          {course.name}
                        </h4>
                        <span className="text-sm text-gray-600">
                          🎯 {course.controls} • 📏 {course.distance}m • ⛰️ {course.ascent}m • 🏃 {course.runners || 0}
                        </span>
                      </div>
                    </div> 
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No courses available</p>
            )}
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div>
            {competition.categories && competition.categories.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {competition.categories.map((category, index) => (
                  <Link
                    key={index}
                    to={`/competitions/${source}/${id}/categories/${encodeURIComponent(category.name)}`}
                    className="bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-colors block"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 p-4">
                        <h4 className="font-semibold text-gray-900">
                          {category.name}
                        </h4>
                        <span className="text-sm text-gray-600">
                          🎯 {category.controls} • 📏 {category.distance}m • ⛰️ {category.ascent}m • 🏃 {category.runners?.length || 0}
                        </span>
                      </div>
                    </div> 
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No categories available</p>
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
