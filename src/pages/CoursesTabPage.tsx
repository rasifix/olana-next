import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import CategoryCard from '../components/CategoryCard';
import { useCompetition } from '../contexts/CompetitionContext';
import { competitionService } from '../services/competitionService';

function CoursesTabPage() {
    const { source, id } = useParams<{ source: string; id: string }>();
    const { competition } = useCompetition();

    const courses = useMemo(() => {
        if (!competition) return [];
        return competitionService.getCourses(competition);
    }, [competition]);

    return (
        <div>
            {courses.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {courses.map((course) => (
                        <Link
                            key={course.id}
                            to={`/competitions/${source}/${id}/courses/${encodeURIComponent(course.id)}`}
                            className="hover:opacity-80 transition-opacity block"
                        >
                            <CategoryCard
                                name={course.name}
                                controls={course.controls}
                                distance={course.distance}
                                elevation={course.ascent}
                                runnerCount={course.runners || 0}
                            />
                        </Link>
                    ))}
                </div>
            ) : (
                <p className="text-text-muted">No courses available</p>
            )}
        </div>
    );
}

export default CoursesTabPage;
