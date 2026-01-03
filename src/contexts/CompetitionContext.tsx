import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useParams, Outlet } from 'react-router-dom';
import { Competition } from '../types';
import { competitionService } from '../services/competitionService';

interface CompetitionContextType {
  competition: Competition | null;
  loading: boolean;
  error: string | null;
}

const CompetitionContext = createContext<CompetitionContextType | undefined>(undefined);

export function CompetitionProvider() {
  const { source, id } = useParams<{ source: string; id: string }>();
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCompetition = async () => {
      if (!source || !id) return;

      try {
        setLoading(true);
        setError(null);
        const data = await competitionService.getCompetitionById(source, id);
        setCompetition(data);
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

  if (error || !competition) {
    return (
      <div className="px-4 py-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Error: {error || 'Competition not found'}
        </div>
      </div>
    );
  }

  return (
    <CompetitionContext.Provider value={{ competition, loading, error }}>
      <Outlet />
    </CompetitionContext.Provider>
  );
}

export function useCompetition() {
  const context = useContext(CompetitionContext);
  if (context === undefined) {
    throw new Error('useCompetition must be used within a CompetitionProvider');
  }
  return context;
}
