import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { competitionService } from '../services/competitionService';
import StartTimeGraph from '../components/StartTimeGraph';
import Breadcrumbs from '../components/Breadcrumbs';
import { useCompetition } from '../contexts/CompetitionContext';

function StartTimeAnalysisPage() {
  const { t } = useTranslation();
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
        { label: t('navigation.home'), path: '/competitions', isHome: true },
        { label: `${competition?.name || t('navigation.competitions')}`, path: `/competitions/${source}/${id}` },
        { label: t('navigation.startTimes'), path: `/competitions/${source}/${id}/starttime` }
      ]} />
      </div>

      <StartTimeGraph runners={runners} />
    </div>
  );
}

export default StartTimeAnalysisPage;
