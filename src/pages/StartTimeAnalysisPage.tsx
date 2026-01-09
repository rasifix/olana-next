import { useMemo } from 'react';
import StartTimeGraph from '../components/StartTimeGraph';
import { useCompetition } from '../contexts/CompetitionContext';
import { competitionService } from '../services/competitionService';

function StartTimeAnalysisPage() {
  const { competition } = useCompetition();

  const runners = useMemo(() => {
    if (!competition) return [];
    return competitionService.getStartTimes(competition);
  }, [competition]);

  return <StartTimeGraph runners={runners} />;
}

export default StartTimeAnalysisPage;
