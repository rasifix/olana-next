import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Leg } from '../types';
import CategoryFilter from './CategoryFilter';
import LegCard from './LegCard';

interface LegsListProps {
  legs: Leg[];
}

function LegsList({ legs }: LegsListProps) {
  const { t } = useTranslation();
  const { source, id } = useParams<{ source: string; id: string }>();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (legs.length === 0) {
    return <p className="text-text-muted">{t('error.noLegs')}</p>;
  }

  const filteredLegs = legs.filter(
    leg => selectedCategory === 'all' || leg.categories.includes(selectedCategory)
  );

  const allCategories = Array.from(new Set(legs.flatMap(leg => leg.categories))).sort();

  return (
    <>
      <CategoryFilter
        selectedCategory={selectedCategory}
        categories={allCategories}
        onChange={setSelectedCategory}
      />

      {/* Legs List */}
      <div className="space-y-3">
        {filteredLegs.map((leg) => (
          <Link
            key={leg.id}
            to={`/competitions/${source}/${id}/legs/${encodeURIComponent(leg.id)}`}
            className="block"
          >
            <LegCard
              title={`${leg.from} → ${leg.to}`}
              categories={leg.categories}
              runners={leg.runners}
              errorFrequency={leg.errorFrequency}
            />
          </Link>
        ))}
      </div>
    </>
  );
}

export default LegsList;
