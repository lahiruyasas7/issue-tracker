import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
// import AuthPage from './pages/AuthPage';
// import IssuesPage from './pages/IssuePage';
import { useAuthStore } from './store/auth.store';
import Navbar from './components/ui/Navbar';
// import CreateIssuePage from './pages/CreateIssuePage';
// import EditIssuePage from './pages/EditeIssuePage';
// import IssueDetailPage from './pages/IssueDetailPage';
import ProtectedRoute from './components/Protected.Route';
import { lazy, Suspense } from 'react';
import PageFallback from './components/PageFallback';

const AuthPage = lazy(() => import('./pages/AuthPage'));
const IssuesPage = lazy(() => import('./pages/IssuePage'));
const CreateIssuePage = lazy(() => import('./pages/CreateIssuePage'));
const EditIssuePage = lazy(() => import('./pages/EditeIssuePage'));
const IssueDetailPage = lazy(() => import('./pages/IssueDetailPage'));

function App() {
  const { isAuthenticated } = useAuthStore();
  return (
    <>
      <BrowserRouter>
        {isAuthenticated && <Navbar />}
        <Suspense fallback={<PageFallback />}>
          <Routes>
            {/* Public routes */}
            <Route path="/auth" element={<AuthPage />} />
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/issues" element={<IssuesPage />} />
              <Route path="/issues/new" element={<CreateIssuePage />} />
              <Route path="/issues/:id/edit" element={<EditIssuePage />} />
              <Route path="/issues/:id" element={<IssueDetailPage />} />
            </Route>
            {/* Default redirect */}
            <Route path="*" element={<Navigate to="/issues" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </>
  );
}

export default App;
