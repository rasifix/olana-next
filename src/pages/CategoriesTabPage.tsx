import { Link, useParams } from 'react-router-dom';
import CategoryCard from '../components/CategoryCard';
import { useCompetition } from '../contexts/CompetitionContext';

function CategoriesTabPage() {
    const { source, id } = useParams<{ source: string; id: string }>();
    const { competition } = useCompetition();

    return (
        <div>
            {competition?.categories && competition.categories.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {competition.categories.map((category, index) => (
                        <Link
                            key={index}
                            to={`/competitions/${source}/${id}/categories/${encodeURIComponent(category.name)}`}
                            className="hover:opacity-80 transition-opacity block"
                        >
                            <CategoryCard
                                name={category.name}
                                controls={category.controls}
                                distance={category.distance}
                                elevation={category.ascent}
                                runnerCount={category.runners?.length || 0}
                            />
                        </Link>
                    ))}
                </div>
            ) : (
                <p className="text-text-muted">No categories available</p>
            )}
        </div>
    );
}

export default CategoriesTabPage;
