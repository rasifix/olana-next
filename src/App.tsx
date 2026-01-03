import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-3 px-3 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <CompassLogo />
            </div>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto mx:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<Navigate to="/competitions" replace />} />
              <Route path="/competitions" element={<CompetitionsPage />} />
              <Route path="/competitions/:source/:id" element={<CompetitionDetailsPage />} />
              <Route path="/competitions/:source/:id/:tab" element={<CompetitionDetailsPage />} />
              <Route path="/competitions/:source/:id/courses/:courseCode" element={<CourseDetailsPage />} />
              <Route path="/competitions/:source/:id/courses/:courseCode/runners/:runnerId" element={<CourseRunnerDetailsPage />} />
              <Route path="/competitions/:source/:id/categories/:categoryName" element={<CategoryDetailsPage />} />
              <Route path="/competitions/:source/:id/categories/:categoryName/runners/:runnerId" element={<RunnerDetailsPage />} />
              <Route path="/competitions/:source/:id/legs/:legId" element={<LegDetailsPage />} />
              <Route path="/competitions/:source/:id/controls/:controlCode" element={<ControlDetailsPage />} />
              <Route path="/competitions/:source/:id/custom" element={<CustomCategoryPage />} />
              <Route path="/competitions/:source/:id/custom/runners/:runnerId" element={<CustomCategoryRunnerDetailsPage />} />
              <Route path="/competitions/:source/:id/starttime" element={<StartTimeAnalysisPage />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App
