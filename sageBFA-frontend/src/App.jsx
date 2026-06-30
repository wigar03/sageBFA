import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import IntroPage from './pages/IntroPage';
import WelcomePage from './pages/WelcomePage';
import CandidateDashboard from './pages/CandidateDashboard';
import TestPage from './pages/TestPage';
import ResultadosPage from './pages/ResultadosPage';

function AdminRedirect() {
  useEffect(() => {
    window.location.replace("http://localhost:8080/sageBFA");
  }, []);
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IntroPage />} />
        <Route path="/registro" element={<WelcomePage />} />
        <Route path="/dashboard" element={<CandidateDashboard />} />
        <Route path="/test/:id" element={<TestPage />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/resultados" element={<ResultadosPage />} />
        <Route path="/admin" element={<AdminRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

