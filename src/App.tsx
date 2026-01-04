import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import CompetitionsPage from './pages/CompetitionsPage';
import CompetitionDetailsPage from './pages/CompetitionDetailsPage';
import CategoryDetailsPage from './pages/CategoryDetailsPage';
import RunnerDetailsPage from './pages/RunnerDetailsPage';
import CourseDetailsPage from './pages/CourseDetailsPage';
import CourseRunnerDetailsPage from './pages/CourseRunnerDetailsPage';
import LegDetailsPage from './pages/LegDetailsPage';
import ControlDetailsPage from './pages/ControlDetailsPage';
import CustomCategoryPage from './pages/CustomCategoryPage';
import CustomCategoryRunnerDetailsPage from './pages/CustomCategoryRunnerDetailsPage';
import StartTimeAnalysisPage from './pages/StartTimeAnalysisPage';
import CompassLogo from './components/CompassLogo';
import { CompetitionProvider } from './contexts/CompetitionContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-colors"
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
}

function AppContent() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-surface-secondary">
        <header className="bg-surface-primary shadow">
          <div className="max-w-7xl mx-auto py-3 px-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CompassLogo />
              </div>
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto mx:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<Navigate to="/competitions" replace />} />
              <Route path="/competitions" element={<CompetitionsPage />} />
              <Route path="/competitions/:source/:id" element={<CompetitionProvider />}>
                <Route index element={<CompetitionDetailsPage />} />
                <Route path=":tab" element={<CompetitionDetailsPage />} />
                <Route path="courses/:courseCode" element={<CourseDetailsPage />} />
                <Route path="courses/:courseCode/runners/:runnerId" element={<CourseRunnerDetailsPage />} />
                <Route path="categories/:categoryName" element={<CategoryDetailsPage />} />
                <Route path="categories/:categoryName/runners/:runnerId" element={<RunnerDetailsPage />} />
                <Route path="legs/:legId" element={<LegDetailsPage />} />
                <Route path="controls/:controlCode" element={<ControlDetailsPage />} />
                <Route path="custom" element={<CustomCategoryPage />} />
                <Route path="custom/runners/:runnerId" element={<CustomCategoryRunnerDetailsPage />} />
                <Route path="starttime" element={<StartTimeAnalysisPage />} />
              </Route>
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App
