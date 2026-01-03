import { useEffect, useState, useMemo } from 'react';
import { Competition } from '../types';

interface CustomCategoryBuilderProps {
  competition: Competition;
  onComplete: (categories: string[], legs: string[]) => void;
}

function CustomCategoryBuilder({ competition, onComplete }: CustomCategoryBuilderProps) {
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [availableLegs, setAvailableLegs] = useState<string[]>([]);
  const [selectedLegs, setSelectedLegs] = useState<Set<string>>(new Set());

  // Calculate legs for each category
  const categoryLegsMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    competition.categories?.forEach(cat => {
      const legs = new Set<string>();
      cat.runners?.forEach(runner => {
        const splits = runner.splits || [];
        if (splits.length > 0) {
          legs.add(`St-${splits[0].code}`);
          for (let i = 1; i < splits.length; i++) {
            legs.add(`${splits[i-1].code}-${splits[i].code}`);
          }
        }
      });
      map.set(cat.name, legs);
    });
    return map;
  }, [competition]);

  // Calculate common legs count for each category given current selection
  const categoryCommonLegsCount = useMemo(() => {
    if (selectedCategories.size === 0) {
      return new Map<string, number>();
    }

    const map = new Map<string, number>();
    const selectedLegsArray = Array.from(selectedCategories).map(name => categoryLegsMap.get(name)!);
    
    competition.categories?.forEach(cat => {
      const catLegs = categoryLegsMap.get(cat.name);
      if (!catLegs) {
        map.set(cat.name, 0);
        return;
      }

      // If this category is already selected, show its own leg count
      if (selectedCategories.has(cat.name)) {
        map.set(cat.name, catLegs.size);
        return;
      }

      // Calculate common legs between selected categories and this category
      const commonLegs = Array.from(catLegs).filter(leg =>
        selectedLegsArray.every(selectedLegSet => selectedLegSet.has(leg))
      );
      map.set(cat.name, commonLegs.length);
    });

    return map;
  }, [competition, selectedCategories, categoryLegsMap]);

  // When categories are selected, find common legs
  useEffect(() => {
    if (selectedCategories.size === 0) {
      setAvailableLegs([]);
      setSelectedLegs(new Set());
      return;
    }

    const selectedCats = competition.categories?.filter(cat => 
      selectedCategories.has(cat.name)
    ) || [];

    if (selectedCats.length === 0) {
      setAvailableLegs([]);
      return;
    }

    // Build legs (from->to pairs) for each category
    const allLegs = selectedCats.map(cat => {
      const legs = new Set<string>();
      cat.runners?.forEach(runner => {
        const splits = runner.splits || [];
        if (splits.length > 0) {
          legs.add(`St-${splits[0].code}`);
          for (let i = 1; i < splits.length; i++) {
            legs.add(`${splits[i-1].code}-${splits[i].code}`);
          }
        }
      });
      return legs;
    });

    // Find intersection of all legs
    const commonLegs = Array.from(allLegs[0] || []).filter(leg =>
      allLegs.every(legSet => legSet.has(leg))
    );

    // Sort legs to maintain order
    const sortedLegs = commonLegs.sort((a, b) => {
      const getControlNum = (control: string) => {
        if (control === 'St') return -1;
        const num = parseInt(control, 10);
        return isNaN(num) ? 999 : num;
      };
      const [aFrom] = a.split('-');
      const [bFrom] = b.split('-');
      return getControlNum(aFrom) - getControlNum(bFrom);
    });
    
    setAvailableLegs(sortedLegs);
    setSelectedLegs(new Set(sortedLegs)); // Initially select all
  }, [competition, selectedCategories]);

  const handleCategoryToggle = (categoryName: string) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(categoryName)) {
      newSelected.delete(categoryName);
    } else {
      newSelected.add(categoryName);
    }
    setSelectedCategories(newSelected);
  };

  const handleLegToggle = (legCode: string) => {
    const newSelected = new Set(selectedLegs);
    if (newSelected.has(legCode)) {
      newSelected.delete(legCode);
    } else {
      newSelected.add(legCode);
    }
    setSelectedLegs(newSelected);
  };

  const handleCreate = () => {
    onComplete(Array.from(selectedCategories), Array.from(selectedLegs));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Custom Category Builder
      </h2>

      {/* Step 1: Select Categories */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          1. Select Categories to Combine
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {competition.categories?.map(category => {
            const commonLegsCount = categoryCommonLegsCount.get(category.name) || 0;
            const isDisabled = selectedCategories.size > 0 && !selectedCategories.has(category.name) && commonLegsCount < 2;
            
            return (
              <label
                key={category.name}
                className={`flex items-center gap-2 p-3 border border-gray-200 rounded-lg ${
                  isDisabled 
                    ? 'bg-gray-100 cursor-not-allowed opacity-50' 
                    : 'hover:bg-gray-50 cursor-pointer'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.has(category.name)}
                  onChange={() => handleCategoryToggle(category.name)}
                  disabled={isDisabled}
                  className="h-4 w-4 text-rust-600 focus:ring-rust-500 border-gray-300 rounded disabled:cursor-not-allowed"
                />
                <span className="text-sm font-medium text-gray-900 flex-1">
                  {category.name}
                </span>
                {selectedCategories.size > 0 && !selectedCategories.has(category.name) && (
                  <span className="text-xs text-gray-500">
                    ({commonLegsCount} legs)
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </div>

      {/* Step 2: Select Legs */}
      {selectedCategories.size > 0 && availableLegs.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            2. Select Legs ({availableLegs.length} common legs found)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {availableLegs.map(leg => (
              <label
                key={leg}
                className="flex items-center gap-2 p-2 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedLegs.has(leg)}
                  onChange={() => handleLegToggle(leg)}
                  className="h-4 w-4 text-rust-600 focus:ring-rust-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-900">
                  {leg}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Create Button */}
      {selectedCategories.size > 0 && selectedLegs.size > 0 && (
        <div className="mb-8">
          <button
            onClick={handleCreate}
            className="bg-rust-600 text-white px-6 py-3 rounded-lg hover:bg-rust-700 transition-colors font-semibold"
          >
            Create Custom Category
          </button>
        </div>
      )}
    </div>
  );
}

export default CustomCategoryBuilder;
