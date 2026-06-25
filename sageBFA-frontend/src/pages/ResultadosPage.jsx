import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function ResultadosPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Si no hay resultado en el state de la ruta, redirigir al inicio
  useEffect(() => {
    if (!location.state?.resultado) {
      navigate('/', { replace: true });
    }
  }, [location.state, navigate]);

  if (!location.state?.resultado) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-green-50 px-4 py-12">
      <div className="w-full max-w-lg text-center">
        {/* Tarjeta principal */}
        <div className="rounded-2xl bg-white p-10 shadow-xl ring-1 ring-slate-900/5 sm:p-12">

          {/* Ícono de éxito animado */}
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-14 w-14 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2.2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          {/* Título */}
          <h1 className="mb-3 text-2xl font-extrabold text-green-800 sm:text-3xl">
            ¡Evaluación Finalizada!
          </h1>

          {/* Mensaje para el candidato */}
          <p className="mb-8 leading-relaxed text-slate-600 text-sm sm:text-base">
            Sus respuestas han sido guardadas exitosamente en el sistema.
            <br />
            Por favor, <strong className="text-green-800 font-bold">permanezca en silencio</strong> y
            avísele al psicólogo evaluador que ha terminado.
          </p>

          {/* Separador decorativo */}
          <div className="mx-auto mb-6 h-px w-16 bg-green-200" />

          {/* Texto de cierre institucional */}
          <p className="text-xs text-green-600">
            SAGE-BFA &middot; Test Numérico Factor N2
          </p>
        </div>
      </div>
    </div>
  );
}
