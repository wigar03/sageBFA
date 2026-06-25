import { useNavigate } from 'react-router-dom';

export default function IntroPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-2xl text-center">
        {/* Contenedor principal minimalista */}
        <div className="rounded-3xl bg-white p-10 shadow-xl border border-slate-100 sm:p-16">
          {/* Título Grande */}
          <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-slate-850 sm:text-4xl">
            Batería Factorial de Aptitudes (B.F.A.)
          </h1>

          {/* Texto Explicativo */}
          <p className="mb-10 text-base leading-relaxed text-slate-650 sm:text-lg">
            Bienvenido. Esta herramienta de evaluación psicométrica está diseñada para medir diversas 
            capacidades intelectuales necesarias para tu orientación y desarrollo. Lee cuidadosamente 
            las instrucciones de cada módulo antes de comenzar.
          </p>

          {/* Línea decorativa minimalista */}
          <div className="mx-auto mb-10 h-1 w-20 rounded-full bg-slate-200" />

          {/* Acción */}
          <div className="flex justify-center">
            <button
              onClick={() => navigate('/registro')}
              className="rounded-xl bg-uam-celeste hover:bg-uam-celeste-dark px-8 py-4 text-base font-bold uppercase tracking-wider text-white shadow-lg transition active:scale-[0.98]"
            >
              Continuar a Registro
            </button>
          </div>
        </div>

        {/* Footer simple */}
        <p className="mt-8 text-[11px] text-slate-400 font-medium">
          Sistema de Evaluación SAGE-BFA &middot; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
