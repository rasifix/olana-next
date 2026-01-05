import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { competitionService } from '../services/competitionService';
import { ranking } from '@rasifix/orienteering-utils';
import RunnerSplitsTable from '../components/RunnerSplitsTable';
import RunnerComparisonGraph from '../components/RunnerComparisonGraph';
import RunnerSelector from '../components/RunnerSelector';
import Breadcrumbs from '../components/Breadcrumbs';
import { useCompetition } from '../contexts/CompetitionContext';

function CourseRunnerDetailsPage() {
    const { t } = useTranslation();
    const { source, id, courseCode, runnerId } = useParams<{
        source: string;
        id: string;
        courseCode: string;
        runnerId: string;
    }>();
    const { competition } = useCompetition();
    const [comparisonRunnerId, setComparisonRunnerId] = useState<string | null>(null);
    const [showComparison, setShowComparison] = useState(false);

    const { runner, courseName, rankedRunners } = useMemo(() => {
        if (!competition || !courseCode || !runnerId) return { runner: null, courseName: '', rankedRunners: [] };

        try {
            const courseData = competitionService.getCourseRankings(competition, courseCode);
            const ranked = ranking.parseRanking(courseData.runners || []);
            const selectedRunner = ranked.runners.find((r) => r.id == runnerId) || null;

            return { runner: selectedRunner, courseName: courseCode, rankedRunners: ranked.runners };
        } catch (err) {
            console.error('Error loading runner details:', err);
            return { runner: null, courseName: courseCode, rankedRunners: [] };
        }
    }, [competition, courseCode, runnerId]);

    const comparisonRunner = useMemo(() => {
        if (!comparisonRunnerId) return null;
        return rankedRunners.find(r => r.id === comparisonRunnerId) || null;
    }, [comparisonRunnerId, rankedRunners]);

    if (!runner) {
        return (
            <div className="px-4 py-6">
                <div className="text-center py-8 text-text-muted">{t('error.runnerNotFound')}</div>
            </div>
        );
    }

    return (
        <div className="md:px-4 py-6">
            <div className="px-4">
                <Breadcrumbs items={[
                    { label: t('navigation.home'), path: '/competitions', isHome: true },
                    { label: competition?.name || t('navigation.competitions'), path: `/competitions/${source}/${id}` },
                    { label: courseName || t('navigation.courses'), path: `/competitions/${source}/${id}/courses/${courseCode}` },
                    { label: runner.fullName, path: `/competitions/${source}/${id}/courses/${courseCode}/runners/${runnerId}` }
                ]} />
            </div>

            <div className="bg-surface-primary rounded-none md:rounded-lg shadow-lg p-4 md:p-6">
                <h2 className="text-2xl font-bold text-text-primary mb-2">
                    {runner.fullName}
                </h2>
                <p className="text-text-primary font-semibold mb-2">
                    {t('runner.finalTime')}: {runner.time}
                </p>
                <p className="text-error font-semibold mb-2">
                    {t('runner.error')}: {runner.errorTime ? runner.errorTime : '00:00'}
                </p>
                <p className="text-text-tertiary mb-6">
                    {runner.club} • {runner.yearOfBirth}
                </p>

                <RunnerSelector
                    rankedRunners={rankedRunners}
                    currentRunnerId={runnerId!}
                    comparisonRunnerId={comparisonRunnerId}
                    onSelectionChange={setComparisonRunnerId}
                    onCompare={() => setShowComparison(true)}
                />

                <RunnerSplitsTable runner={runner} source={source!} id={id!} />
            </div>

            {showComparison && comparisonRunner && runner && (
                <RunnerComparisonGraph
                    currentRunner={runner}
                    comparisonRunner={comparisonRunner}
                    onClose={() => setShowComparison(false)}
                />
            )}
        </div>
    );
}

export default CourseRunnerDetailsPage;
