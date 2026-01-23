import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import TravelPlanDetail from './pages/TravelPlanDetail/TravelPlanDetail';
import Travelers from './pages/Travelers/Travelers';
import Login from './pages/Login/Login';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import { TravelProvider } from './context/TravelContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import ThemeToggle from './components/ThemeToggle/ThemeToggle';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TravelProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/*"
                element={
                  <>
                    <Layout>
                      <Routes>
                        <Route
                          path="/"
                          element={
                            <ProtectedRoute>
                              <Dashboard />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/travel/:id"
                          element={
                            <ProtectedRoute>
                              <TravelPlanDetail />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/travelers"
                          element={
                            <ProtectedRoute>
                              <Travelers />
                            </ProtectedRoute>
                          }
                        />
                      </Routes>
                    </Layout>
                    <ThemeToggle />
                  </>
                }
              />
            </Routes>
          </Router>
        </TravelProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
