import { useMemo } from 'react';
import ControlsList from '../components/ControlsList';
import { useCompetition } from '../contexts/CompetitionContext';
import { competitionService } from '../services/competitionService';

function ControlsTabPage() {
    const { competition } = useCompetition();

    const controls = useMemo(() => {
        if (!competition) return [];
        return competitionService.getControls(competition);
    }, [competition]);

    return (
        <div>
            <ControlsList controls={controls} />
        </div>
    );
}

export default ControlsTabPage;
