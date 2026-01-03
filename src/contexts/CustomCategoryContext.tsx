import { createContext, useContext, ReactNode } from 'react';

interface CustomCategoryContextType {
  selectedCategories: string[];
  selectedLegs: string[];
}

const CustomCategoryContext = createContext<CustomCategoryContextType | null>(null);

export function CustomCategoryProvider({ 
  children, 
  selectedCategories, 
  selectedLegs 
}: { 
  children: ReactNode;
  selectedCategories: string[];
  selectedLegs: string[];
}) {
  return (
    <CustomCategoryContext.Provider value={{ selectedCategories, selectedLegs }}>
      {children}
    </CustomCategoryContext.Provider>
  );
}

export function useCustomCategory() {
  return useContext(CustomCategoryContext);
}
