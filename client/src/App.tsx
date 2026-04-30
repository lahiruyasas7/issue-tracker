import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import IssuesPage from './pages/IssuePage';
import { useAuthStore } from './store/auth.store';
import Navbar from './components/ui/Navbar';
import CreateIssuePage from './pages/CreateIssuePage';
import EditIssuePage from './pages/EditeIssuePage';
import IssueDetailPage from './pages/IssueDetailPage';

function App() {
  const { isAuthenticated } = useAuthStore();
  return (
    <>
      <BrowserRouter>
        {isAuthenticated && <Navbar />}
        <Routes>
          {/* Public routes */}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/issues" element={<IssuesPage />} />
          <Route path="/issues/new" element={<CreateIssuePage />} />
          <Route path="/issues/:id/edit" element={<EditIssuePage />} />
          <Route path="/issues/:id" element={<IssueDetailPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
