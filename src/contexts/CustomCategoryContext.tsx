import { createContext, ReactNode, useContext, useState } from 'react';

interface CustomCategoryContextType {
  selectedCategories: string[];
  selectedLegs: string[];
  setSelectedCategories: (categories: string[]) => void;
  setSelectedLegs: (legs: string[]) => void;
  clearCustomCategory: () => void;
}

const CustomCategoryContext = createContext<CustomCategoryContextType | null>(null);

export function CustomCategoryProvider({ children }: { children: ReactNode }) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLegs, setSelectedLegs] = useState<string[]>([]);

  const clearCustomCategory = () => {
    setSelectedCategories([]);
    setSelectedLegs([]);
  };

  return (
    <CustomCategoryContext.Provider
      value={{
        selectedCategories,
        selectedLegs,
        setSelectedCategories,
        setSelectedLegs,
        clearCustomCategory
      }}
    >
      {children}
    </CustomCategoryContext.Provider>
  );
}

export function useCustomCategory() {
  return useContext(CustomCategoryContext);
}
