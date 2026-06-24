import { BrowserRouter, Routes, Route } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage';
import TestPage from './pages/TestPage';
import ResultadosPage from './pages/ResultadosPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/resultados" element={<ResultadosPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

