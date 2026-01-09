import { Moon, Sun } from 'lucide-react';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import CompassLogo from './components/CompassLogo';
import LanguageSelector from './components/LanguageSelector';
import { CompetitionProvider } from './contexts/CompetitionContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import './i18n/config';
import CategoriesTabPage from './pages/CategoriesTabPage';
import CategoryDetailsPage from './pages/CategoryDetailsPage';
import CompetitionDetailsPage from './pages/CompetitionDetailsPage';
import CompetitionsPage from './pages/CompetitionsPage';
import ControlDetailsPage from './pages/ControlDetailsPage';
import ControlsTabPage from './pages/ControlsTabPage';
import CourseDetailsPage from './pages/CourseDetailsPage';
import CourseRunnerDetailsPage from './pages/CourseRunnerDetailsPage';
import CoursesTabPage from './pages/CoursesTabPage';
import CustomCategoryPage from './pages/CustomCategoryPage';
import CustomCategoryRunnerDetailsPage from './pages/CustomCategoryRunnerDetailsPage';
import LegDetailsPage from './pages/LegDetailsPage';
import LegsTabPage from './pages/LegsTabPage';
import RunnerDetailsPage from './pages/RunnerDetailsPage';
import StartTimeAnalysisPage from './pages/StartTimeAnalysisPage';

function EventRedirect() {
  const location = useLocation();
  const pathParts = location.pathname.split('/').slice(2); // Remove leading empty and 'event'
  const newPath = `/competitions/${pathParts.join('/')}`;
  return <Navigate to={newPath} replace />;
}

function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-colors"
      aria-label={isDarkMode ? t('accessibility.switchToLightMode') : t('accessibility.switchToDarkMode')}
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
              <div className="flex items-center gap-2">
                <LanguageSelector />
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto mx:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<Navigate to="/competitions" replace />} />
              <Route path="/event/*" element={<EventRedirect />} />
              <Route path="/competitions" element={<CompetitionsPage />} />
              <Route path="/competitions/:source/:id" element={<CompetitionProvider />}>
                <Route element={<CompetitionDetailsPage />}>
                  <Route index element={<Navigate to="categories" replace />} />
                  <Route path="categories" element={<CategoriesTabPage />} />
                  <Route path="courses" element={<CoursesTabPage />} />
                  <Route path="legs" element={<LegsTabPage />} />
                  <Route path="controls" element={<ControlsTabPage />} />
                  <Route path="custom" element={<CustomCategoryPage />} />
                  <Route path="starttime" element={<StartTimeAnalysisPage />} />
                </Route>
                <Route path="courses/:courseCode" element={<CourseDetailsPage />} />
                <Route path="courses/:courseCode/runners/:runnerId" element={<CourseRunnerDetailsPage />} />
                <Route path="categories/:categoryName" element={<CategoryDetailsPage />} />
                <Route path="categories/:categoryName/runners/:runnerId" element={<RunnerDetailsPage />} />
                <Route path="legs/:legId" element={<LegDetailsPage />} />
                <Route path="controls/:controlCode" element={<ControlDetailsPage />} />
                <Route path="custom/runners/:runnerId" element={<CustomCategoryRunnerDetailsPage />} />
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
    <LanguageProvider>
      <ThemeProvider>
        <Suspense fallback={
          <div className="min-h-screen bg-surface-primary flex items-center justify-center">
            <div className="text-text-secondary">Loading...</div>
          </div>
        }>
          <AppContent />
        </Suspense>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App
