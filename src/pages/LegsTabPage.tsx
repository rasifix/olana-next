import { useMemo } from 'react';
import LegsList from '../components/LegsList';
import { useCompetition } from '../contexts/CompetitionContext';
import { competitionService } from '../services/competitionService';

function LegsTabPage() {
    const { competition } = useCompetition();

    const legs = useMemo(() => {
        if (!competition) return [];
        return competitionService.getLegs(competition);
    }, [competition]);

    return (
        <div>
            <LegsList legs={legs} />
        </div>
    );
}

export default LegsTabPage;
