import { BrowserRouter, Routes, Route } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />

        <Route
          path="/test"
          element={
            <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white text-xl font-semibold">
              Pantalla del Examen
            </div>
          }
        />

        <Route
          path="/resultados"
          element={
            <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white text-xl font-semibold">
              Pantalla de Resultados
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
