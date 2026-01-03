import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { competitionService } from '../services/competitionService';
import { parseTime, ranking } from '@rasifix/orienteering-utils';
import RunnerSplitsTable from '../components/RunnerSplitsTable';
import Breadcrumbs from '../components/Breadcrumbs';

function CourseRunnerDetailsPage() {
  const { source, id, courseCode, runnerId } = useParams<{
    source: string;
    id: string;
    courseCode: string;
    runnerId: string;
  }>();
  const navigate = useNavigate();
  const [runner, setRunner] = useState<ranking.RankingRunner | null>(null);
  const [courseName, setCourseName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRunnerDetails = async () => {
      if (!source || !id || !courseCode || !runnerId) return;

      try {
        setLoading(true);
        setError(null);
        
        // Fetch course rankings
        const courseData = await competitionService.getCourseRankings(source, id, courseCode);
        setCourseName(courseCode);

        // Calculate ranking
        const runners = courseData.runners || [];
        const ranked = ranking.parseRanking(runners);

        // Find the specific runner by ID
        const selectedRunner = ranked.runners.find((r: any) => r.id == runnerId);
        if (selectedRunner) {
          setRunner(selectedRunner);
        } else {
          setError('Runner not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load runner details');
        console.error('Error loading runner details:', err);
      } finally {
        setLoading(false);
      }
    };

    loadRunnerDetails();
  }, [source, id, courseCode, runnerId]);

  if (loading) {
    return (
      <div className="px-4 py-6">
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-600">Loading runner details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Error: {error}
        </div>
        <button
          onClick={() => navigate(`/competitions/${source}/${id}/courses/${courseCode}`)}
          className="mt-4 text-rust-600 hover:text-rust-800"
        >
          ← Back to course
        </button>
      </div>
    );
  }

  if (!runner) {
    return (
      <div className="px-4 py-6">
        <div className="text-center py-8 text-gray-500">Runner not found</div>
        <button
          onClick={() => navigate(`/competitions/${source}/${id}/courses/${courseCode}`)}
          className="mt-4 text-rust-600 hover:text-rust-800"
        >
          ← Back to course
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <Breadcrumbs items={[
        { label: 'Home', path: '/competitions', isHome: true },
        { label: 'Competition', path: `/competitions/${source}/${id}` },
        { label: courseName || 'Course', path: `/competitions/${source}/${id}/courses/${courseCode}` },
        { label: runner.fullName, path: `/competitions/${source}/${id}/courses/${courseCode}/runners/${runnerId}` }
      ]} />

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {runner.fullName}
        </h2>
        <p className="text-red-800 font-semibold mb-2">
          Error: {runner.errorTime ? runner.errorTime : '00:00'}
        </p>
        <p className="text-gray-600 mb-6">
          {runner.club} • {runner.yearOfBirth}
        </p>

        <RunnerSplitsTable runner={runner} source={source!} id={id!} />
      </div>
    </div>
  );
}

export default CourseRunnerDetailsPage;
