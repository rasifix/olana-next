import { Competition } from '../types';

interface CompetitionCardProps {
  competition: Competition;
}

function CompetitionCard({ competition }: CompetitionCardProps) {
  const date = new Date(competition.date);
  const day = String(date.getDate());
  const month = date.toLocaleDateString('en-US', { month: 'short' });

  return (
    <div className="card shadow-hover relative">
      <div className="absolute top-2 right-2">
        <span className="hidden sm:block px-2 py-1 text-xs font-medium bg-surface-secondary text-text-secondary rounded">
          {competition.source.toUpperCase()}
        </span>
      </div>
      <div className="flex gap-4">
        <div className="flex flex-col items-center justify-center min-w-[60px]">
          <div className="text-3xl font-bold text-text-primary">{day}</div>
          <div className="text-sm text-text-tertiary">{month}</div>
        </div>
        <div className="flex-1">
          <h3 className="card-title">
            {competition.name}
          </h3>
          <div className="space-y-1 text-sm text-text-tertiary">
            <p>
              <span className="font-medium">🗺</span> {competition.map}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompetitionCard;
