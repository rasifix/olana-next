import { Competition } from '../types';

interface CompetitionCardProps {
  competition: Competition;
}

function CompetitionCard({ competition }: CompetitionCardProps) {
  const date = new Date(competition.date);
  const day = String(date.getDate());
  const month = date.toLocaleDateString('en-US', { month: 'short' });

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 border border-gray-200 block">
      <div className="flex gap-4">
        <div className="flex flex-col items-center justify-center min-w-[60px]">
          <div className="text-3xl font-bold text-gray-900">{day}</div>
          <div className="text-sm text-gray-600">{month}</div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {competition.name}
          </h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p>
              <span className="font-medium">🗺</span> {competition.map}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompetitionCard;
