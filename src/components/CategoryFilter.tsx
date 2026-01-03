interface CategoryFilterProps {
  selectedCategory: string;
  categories: string[];
  onChange: (category: string) => void;
}

function CategoryFilter({ selectedCategory, categories, onChange }: CategoryFilterProps) {
  return (
    <div className="mb-4">
      <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-2">
        Filter by Category
      </label>
      <select
        id="category-filter"
        value={selectedCategory}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rust-500 focus:border-rust-500 sm:text-sm"
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
