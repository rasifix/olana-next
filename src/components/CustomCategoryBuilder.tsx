import { useEffect, useState, useMemo } from 'react';
import { Competition } from '../types';

interface CustomCategoryBuilderProps {
  competition: Competition;
  onComplete: (categories: string[], legs: string[]) => void;
  onCancel: () => void;
}

function CustomCategoryBuilder({ competition, onComplete, onCancel }: CustomCategoryBuilderProps) {
  const [currentStep, setCurrentStep] = useState(1);
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

  const handleNext = () => {
    if (currentStep === 1 && selectedCategories.size > 0) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-primary rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-default">
          <div className="flex justify-between items-center">
            <h2 className="page-title">
              Custom Category Builder
            </h2>
            <button
              onClick={onCancel}
              className="text-text-muted hover:text-text-tertiary text-2xl font-bold"
            >
              ×
            </button>
          </div>
          
          {/* Step indicator */}
          <div className="mt-4 flex items-center">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                currentStep === 1 ? 'bg-primary text-white' : 'bg-success text-white'
              }`}>
                {currentStep > 1 ? '✓' : '1'}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                currentStep === 1 ? 'text-text-primary' : 'text-text-muted'
              }`}>
                Select Categories
              </span>
            </div>
            <div className="flex-1 h-0.5 bg-border-strong mx-4"></div>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                currentStep === 2 ? 'bg-primary text-white' : 'bg-border-strong text-text-tertiary'
              }`}>
                2
              </div>
              <span className={`ml-2 text-sm font-medium ${
                currentStep === 2 ? 'text-text-primary' : 'text-text-muted'
              }`}>
                Select Legs
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {currentStep === 1 && (
            <div>
              <h3 className="card-title">
                Select Categories to Combine
              </h3>
              <p className="text-sm text-text-tertiary mb-4">
                Choose the categories you want to combine. Categories with no common legs will be disabled.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {competition.categories?.map(category => {
                  const commonLegsCount = categoryCommonLegsCount.get(category.name) || 0;
                  const isDisabled = selectedCategories.size > 0 && !selectedCategories.has(category.name) && commonLegsCount < 2;
                  
                  return (
                    <label
                      key={category.name}
                      className={`flex items-center gap-2 p-3 border border-border-default rounded-lg ${
                        isDisabled 
                          ? 'bg-surface-hover cursor-not-allowed opacity-50' 
                          : 'hover:bg-surface-secondary cursor-pointer'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.has(category.name)}
                        onChange={() => handleCategoryToggle(category.name)}
                        disabled={isDisabled}
                        className="h-4 w-4 text-primary focus:ring-primary-border border-border-strong rounded disabled:cursor-not-allowed"
                      />
                      <span className="text-sm font-medium text-text-primary flex-1">
                        {category.name}
                      </span>
                      {selectedCategories.size > 0 && !selectedCategories.has(category.name) && (
                        <span className="text-xs text-text-muted">
                          ({commonLegsCount} legs)
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h3 className="card-title">
                Select Legs ({availableLegs.length} common legs found)
              </h3>
              <p className="text-sm text-text-tertiary mb-4">
                Choose which legs to include in your custom category. All legs are selected by default.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {availableLegs.map(leg => (
                  <label
                    key={leg}
                    className="flex items-center gap-2 p-2 border border-border-default rounded hover:bg-surface-secondary cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedLegs.has(leg)}
                      onChange={() => handleLegToggle(leg)}
                      className="h-4 w-4 text-primary focus:ring-primary-border border-border-strong rounded"
                    />
                    <span className="text-sm font-medium text-text-primary">
                      {leg}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border-default flex justify-between">
          <div>
            {currentStep === 2 && (
              <button
                onClick={handleBack}
                className="px-4 py-2 text-text-secondary hover:text-text-primary font-medium"
              >
                ← Back
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-text-secondary hover:text-text-primary border border-border-strong rounded-lg font-medium"
            >
              Cancel
            </button>
            {currentStep === 1 && (
              <button
                onClick={handleNext}
                disabled={selectedCategories.size === 0}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:bg-disabled disabled:cursor-not-allowed transition-colors font-semibold"
              >
                Next →
              </button>
            )}
            {currentStep === 2 && (
              <button
                onClick={handleCreate}
                disabled={selectedLegs.size === 0}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:bg-disabled disabled:cursor-not-allowed transition-colors font-semibold"
              >
                Create Custom Category
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomCategoryBuilder;
