import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import IssuesPage from './pages/IssuePage';
import { useAuthStore } from './store/auth.store';
import Navbar from './components/ui/Navbar';

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
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
