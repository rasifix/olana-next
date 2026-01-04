import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { competitionService } from '../services/competitionService';
import StartTimeGraph from '../components/StartTimeGraph';
import Breadcrumbs from '../components/Breadcrumbs';
import { useCompetition } from '../contexts/CompetitionContext';

function StartTimeAnalysisPage() {
  const { source, id } = useParams<{ source: string; id: string }>();
  const { competition } = useCompetition();

  const runners = useMemo(() => {
    if (!competition) return [];
    return competitionService.getStartTimes(competition);
  }, [competition]);

  return (
    <div className="md:px-4 py-6">
      <div className="px-4">
      <Breadcrumbs items={[
        { label: 'Home', path: '/competitions', isHome: true },
        { label: `${competition?.name || 'Competition'}`, path: `/competitions/${source}/${id}` },
        { label: 'Start Times', path: `/competitions/${source}/${id}/starttime` }
      ]} />
      </div>

      <StartTimeGraph runners={runners} />
    </div>
  );
}

export default StartTimeAnalysisPage;
