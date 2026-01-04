import { Link } from 'react-router-dom';
import { Competition } from '../types';
import CompetitionCard from './CompetitionCard';

interface CompetitionListProps {
  competitions: Competition[];
  loading: boolean;
  error: string | null;
}

function CompetitionList({ competitions, loading, error }: CompetitionListProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-text-tertiary">Loading competitions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-bg border border-error-border rounded-lg p-4 text-error">
        Error loading competitions: {error}
      </div>
    );
  }

  if (!competitions || competitions.length === 0) {
    return (
      <div className="text-center py-8 text-text-muted">
        No competitions found
      </div>
    );
  }

  // Group competitions by month
  const groupedByMonth = competitions.reduce((groups, competition) => {
    const date = new Date(competition.date);
    const monthKey = date.toLocaleDateString('en-US', { month: 'long' });
    
    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }
    groups[monthKey].push(competition);
    
    return groups;
  }, {} as Record<string, Competition[]>);

  // Sort month keys in descending order (newest first)
  const sortedMonthKeys = Object.keys(groupedByMonth).sort((a, b) => {
    const dateA = new Date(groupedByMonth[a][0].date);
    const dateB = new Date(groupedByMonth[b][0].date);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <>
      {sortedMonthKeys.map((monthKey) => (
        <div key={monthKey} className="mb-8">
          <h2 className="text-md font-bold text-text-muted mb-4">
            {monthKey} ({groupedByMonth[monthKey].length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2 sm:grid-cols-1">
            {groupedByMonth[monthKey].map((competition, index) => (
              <Link
                key={index}
                to={`/competitions/${competition.source}/${competition.id}`}
              >
                <CompetitionCard competition={competition} />
              </Link>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

export default CompetitionList;
