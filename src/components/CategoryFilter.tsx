import { useTranslation } from 'react-i18next';

interface CategoryFilterProps {
  selectedCategory: string;
  categories: string[];
  onChange: (category: string) => void;
}

function CategoryFilter({ selectedCategory, categories, onChange }: CategoryFilterProps) {
  const { t } = useTranslation();
  
  return (
    <div className="mb-4">
      <label htmlFor="category-filter" className="block text-sm font-medium text-text-secondary mb-2">
        {t('form.filterByCategory')}
      </label>
      <select
        id="category-filter"
        value={selectedCategory}
        onChange={(e) => onChange(e.target.value)}
        className="select-input md:w-64 focus"
      >
        <option value="all">{t('form.allCategories')}</option>
        {categories.map(category => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
    </div>
  );
}

export default CategoryFilter;
