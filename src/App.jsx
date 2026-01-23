import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import TravelPlanDetail from './pages/TravelPlanDetail/TravelPlanDetail';
import Travelers from './pages/Travelers/Travelers';
import { TravelProvider } from './context/TravelContext';
import { ThemeProvider } from './context/ThemeContext';
import ThemeToggle from './components/ThemeToggle/ThemeToggle';

function App() {
  return (
    <ThemeProvider>
      <TravelProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/travel/:id" element={<TravelPlanDetail />} />
              <Route path="/travelers" element={<Travelers />} />
            </Routes>
          </Layout>
          <ThemeToggle />
        </Router>
      </TravelProvider>
    </ThemeProvider>
  );
}

export default App;
