import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StartTimeRunner } from '../types';
import { competitionService } from '../services/competitionService';
import StartTimeGraph from '../components/StartTimeGraph';
import Breadcrumbs from '../components/Breadcrumbs';

function StartTimeAnalysisPage() {
  const { source, id } = useParams<{ source: string; id: string }>();
  const navigate = useNavigate();
  const [runners, setRunners] = useState<StartTimeRunner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStartTimes = async () => {
      if (!source || !id) return;

      try {
        setLoading(true);
        setError(null);
        const data = await competitionService.getStartTimes(source, id);
        setRunners(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load start times');
        console.error('Error loading start times:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStartTimes();
  }, [source, id]);

  if (loading) {
    return (
      <div className="px-4 py-6">
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-600">Loading start time data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Error loading start times: {error}
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

  return (
    <div className="px-4 py-6">
      <Breadcrumbs items={[
        { label: 'Home', path: '/competitions', isHome: true },
        { label: 'Competition', path: `/competitions/${source}/${id}` },
        { label: 'Start Times', path: `/competitions/${source}/${id}/starttime` }
      ]} />

      <StartTimeGraph runners={runners} />
    </div>
  );
}

export default StartTimeAnalysisPage;
