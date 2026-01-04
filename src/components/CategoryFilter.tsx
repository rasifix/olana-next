interface CategoryFilterProps {
  selectedCategory: string;
  categories: string[];
  onChange: (category: string) => void;
}

function CategoryFilter({ selectedCategory, categories, onChange }: CategoryFilterProps) {
  return (
    <div className="mb-4">
      <label htmlFor="category-filter" className="block text-sm font-medium text-text-secondary mb-2">
        Filter by Category
      </label>
      <select
        id="category-filter"
        value={selectedCategory}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full md:w-64 px-3 py-2 border border-border-strong rounded-md shadow-sm focus:outline-none focus:ring-primary-border focus:border-primary-border sm:text-sm bg-surface-primary text-text-primary"
      >
        <option value="all">All Categories</option>
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
