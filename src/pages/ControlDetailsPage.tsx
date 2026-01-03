import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ControlDetails } from '../types';
import { competitionService } from '../services/competitionService';
import RunnersBadge from '../components/RunnersBadge';
import LegCard from '../components/LegCard';
import Breadcrumbs from '../components/Breadcrumbs';

function ControlDetailsPage() {
  const { source, id, controlCode } = useParams<{ source: string; id: string; controlCode: string }>();
  const navigate = useNavigate();
  const [control, setControl] = useState<ControlDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadControl = async () => {
      if (!source || !id || !controlCode) return;

      try {
        setLoading(true);
        setError(null);
        const data = await competitionService.getControlDetails(source, id, controlCode);
        setControl(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load control');
        console.error('Error loading control:', err);
      } finally {
        setLoading(false);
      }
    };

    loadControl();
  }, [source, id, controlCode]);

  if (loading) {
    return (
      <div className="px-4 py-6">
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-600">Loading control details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Error loading control: {error}
        </div>
        <button
          onClick={() => navigate(`/competitions/${source}/${id}/controls`)}
          className="mt-4 text-rust-600 hover:text-rust-800"
        >
          ← Back to controls
        </button>
      </div>
    );
  }

  if (!control) {
    return (
      <div className="px-4 py-6">
        <div className="text-center py-8 text-gray-500">
          Control not found
        </div>
        <button
          onClick={() => navigate(`/competitions/${source}/${id}/controls`)}
          className="mt-4 text-rust-600 hover:text-rust-800"
        >
          ← Back to controls
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <Breadcrumbs items={[
        { label: 'Home', path: '/competitions', isHome: true },
        { label: 'Competition', path: `/competitions/${source}/${id}` },
        { label: `Control ${control.code}`, path: `/competitions/${source}/${id}/controls/${controlCode}` }
      ]} />

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Control {control.code}
          </h2>
        </div>

        {/* Categories Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Categories
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {control.categories.map((category) => (
              <Link
                key={category.name}
                to={`/competitions/${source}/${id}/categories/${encodeURIComponent(category.name)}`}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-colors flex items-center justify-between"
              >
                <span className="font-medium text-gray-900">{category.name}</span>
                <RunnersBadge count={category.runners} />
              </Link>
            ))}
          </div>
        </div>

        {/* Incoming Legs Section */}
        {control.from.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Incoming Legs ({control.from.length})
            </h3>
            <div className="space-y-3">
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Outgoing Legs ({control.to.length})
            </h3>
            <div className="space-y-3">
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
