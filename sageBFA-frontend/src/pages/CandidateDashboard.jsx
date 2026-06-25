import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Logos
import logoUam from '../assets/logos/logo_uam.png';
import logoFia from '../assets/logos/logo_fia.svg';
import logoFcm from '../assets/logos/logo_fcm.svg';

export default function CandidateDashboard() {
  const navigate = useNavigate();
  const [candidato, setCandidato] = useState(null);
  
  // Obtener estado de completado desde localStorage
  const isN2Completado = localStorage.getItem('modulo_N2_completado') === 'true';

  const modulos = [
    {
      id: 'N1',
      titulo: 'Aptitud Numérica (Sumas y Multiplicaciones) — N1',
      descripcion: 'Evalúa la agilidad mental y destreza en operaciones fundamentales de suma y multiplicación.',
      tiempo: '10 minutos',
      completado: false,
      bloqueado: true,
      color: 'bg-slate-400',
    },
    {
      id: 'N2',
      titulo: 'Aptitud Numérica (Operaciones y Problemas) — N2',
      descripcion: 'Mide la rapidez y precisión para realizar operaciones aritméticas sencillas y resolver problemas lógicos.',
      tiempo: '12 minutos (6 min. por sección)',
      completado: isN2Completado,
      bloqueado: false,
      color: 'bg-uam-celeste',
    },
    {
      id: 'N3',
      titulo: 'Aptitud Numérica (Restas y Divisiones) — N3',
      descripcion: 'Evalúa la velocidad y precisión al realizar cálculos de resta y división en serie.',
      tiempo: '10 minutos',
      completado: false,
      bloqueado: true,
      color: 'bg-slate-400',
    },
    {
      id: 'N4',
      titulo: 'Aptitud Numérica (Razonamiento Matemático) — N4',
      descripcion: 'Mide la capacidad de estructurar y formular ecuaciones matemáticas para resolver problemas complejos.',
      tiempo: '15 minutos',
      completado: false,
      bloqueado: true,
      color: 'bg-slate-400',
    },
    {
      id: 'CV',
      titulo: 'Comprensión Verbal',
      descripcion: 'Mide la habilidad para asimilar y comprender textos complejos, proverbios y refranes.',
      tiempo: '15 minutos',
      completado: false,
      bloqueado: true,
      color: 'bg-slate-400',
    },
    {
      id: 'FV',
      titulo: 'Fluidez Verbal',
      descripcion: 'Mide la velocidad de evocación verbal y capacidad asociativa de palabras que inician con una letra específica.',
      tiempo: '5 minutos',
      completado: false,
      bloqueado: true,
      color: 'bg-slate-400',
    },
    {
      id: 'VOC1',
      titulo: 'Vocabulario (Forma A)',
      descripcion: 'Prueba de amplitud de vocabulario mediante la identificación de sinónimos para palabras de complejidad creciente.',
      tiempo: '5 minutos',
      completado: false,
      bloqueado: true,
      color: 'bg-slate-400',
    },
    {
      id: 'VOC2',
      titulo: 'Vocabulario (Forma B)',
      descripcion: 'Prueba complementaria de vocabulario alternativo y equivalencias conceptuales léxicas.',
      tiempo: '5 minutos',
      completado: false,
      bloqueado: true,
      color: 'bg-slate-400',
    },
    {
      id: 'R1',
      titulo: 'Razonamiento (Forma A)',
      descripcion: 'Evalúa la capacidad de inducción y deducción lógica mediante la identificación de series numéricas.',
      tiempo: '10 minutos',
      completado: false,
      bloqueado: true,
      color: 'bg-slate-400',
    },
    {
      id: 'R2',
      titulo: 'Razonamiento (Forma B)',
      descripcion: 'Mide el razonamiento abstracto analítico mediante relaciones y analogías gramaticales e inductivas.',
      tiempo: '12 minutos',
      completado: false,
      bloqueado: true,
      color: 'bg-slate-400',
    },
    {
      id: 'S1',
      titulo: 'Aptitud Espacial (Rapidez Perceptiva) — S1',
      descripcion: 'Mide la velocidad de comparación visual de figuras y patrones en dos dimensiones.',
      tiempo: '10 minutos',
      completado: false,
      bloqueado: true,
      color: 'bg-slate-400',
    },
    {
      id: 'S2',
      titulo: 'Aptitud Espacial (Visualización Espacial) — S2',
      descripcion: 'Evalúa la capacidad de manipulación y rotación mental de cuerpos tridimensionales en el espacio.',
      tiempo: '12 minutos',
      completado: false,
      bloqueado: true,
      color: 'bg-slate-400',
    },
    {
      id: 'S3',
      titulo: 'Aptitud Espacial (Orientación Espacial) — S3',
      descripcion: 'Mide la habilidad de reconocer posiciones relativas y perspectivas de objetos en el espacio.',
      tiempo: '10 minutos',
      completado: false,
      bloqueado: true,
      color: 'bg-slate-400',
    }
  ];

  useEffect(() => {
    const candRaw = localStorage.getItem('candidato_actual');
    if (!candRaw) {
      navigate('/', { replace: true });
    } else {
      setCandidato(JSON.parse(candRaw));
    }
  }, [navigate]);

  // Verificar si todos los módulos activos están completados
  const todosCompletados = modulos.filter(m => !m.bloqueado).every(m => m.completado);

  function handleLogout() {
    localStorage.removeItem('candidato_actual');
    localStorage.removeItem('modulo_N2_completado');
    navigate('/', { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* ── Header institucional ── */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <img src={logoUam} alt="UAM Logo" className="h-10 w-auto object-contain" />
            <div className="h-6 w-px bg-slate-200" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Panel de Evaluaciones
            </span>
          </div>

          {candidato && (
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800">
                  {candidato.nombres} {candidato.apellidos}
                </p>
                <p className="text-xs text-slate-400 font-medium">{candidato.correo}</p>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-650 hover:bg-slate-50 hover:text-slate-800 transition"
              >
                Salir
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── Contenido Principal ── */}
      <main className="mx-auto w-full max-w-5xl px-6 py-12 flex-1">
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-2xl font-extrabold text-slate-800 sm:text-3xl">
            ¡Hola, {candidato?.nombres || 'Candidato'}!
          </h1>
          <p className="mt-2 text-slate-500 text-sm sm:text-base">
            Bienvenido al panel central de la Batería Factorial de Aptitudes. Por favor, selecciona y completa cada uno de los módulos habilitados.
          </p>
        </div>

        {/* Módulos grid */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {modulos.map((modulo) => (
            <div
              key={modulo.id}
              className={
                'relative flex flex-col justify-between rounded-2xl border bg-white p-6 shadow-md transition duration-300 ' +
                (modulo.completado ? 'opacity-60 border-slate-200' : 'border-slate-100 hover:shadow-lg')
              }
            >
              <div>
                {/* Cabecera del Módulo */}
                <div className="mb-4 flex items-start justify-between">
                  <span
                    className={
                      'rounded-lg px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white ' +
                      (modulo.bloqueado ? 'bg-slate-400' : modulo.color)
                    }
                  >
                    Módulo {modulo.id}
                  </span>

                  {modulo.completado && (
                    <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-150">
                      ✅ Completado
                    </span>
                  )}
                  {modulo.bloqueado && (
                    <span className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                      🔒 Próximamente
                    </span>
                  )}
                </div>

                {/* Título y Descripción */}
                <h3 className="text-lg font-bold text-slate-800 mb-2">{modulo.titulo}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">{modulo.descripcion}</p>

                {/* Info de tiempo */}
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-6">
                  <svg className="h-4 w-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Duración aproximada: {modulo.tiempo}
                </div>
              </div>

              {/* Botón de acción */}
              <div>
                {modulo.completado ? (
                  <button
                    disabled
                    className="w-full rounded-xl bg-slate-100 py-3 text-sm font-bold uppercase tracking-wider text-slate-400 cursor-not-allowed border border-slate-200"
                  >
                    Módulo Completado
                  </button>
                ) : modulo.bloqueado ? (
                  <button
                    disabled
                    className="w-full rounded-xl bg-slate-100 py-3 text-sm font-bold uppercase tracking-wider text-slate-400 cursor-not-allowed border border-slate-200"
                  >
                    Próximamente
                  </button>
                ) : (
                  <button
                    onClick={() => navigate(`/test/${modulo.id}`)}
                    className="w-full rounded-xl bg-uam-celeste hover:bg-uam-celeste-dark py-3 text-sm font-bold uppercase tracking-wider text-white shadow transition active:scale-[0.98]"
                  >
                    Iniciar Módulo
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 bg-white/80 backdrop-blur-sm mt-12">
        <div className="mx-auto max-w-5xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-[10px] text-slate-400">
            SAGE-BFA &middot; Universidad Americana &middot; {new Date().getFullYear()}
          </p>
          <div className="flex items-center gap-6">
            <img src={logoFia} alt="FIA" className="h-8 w-auto object-contain opacity-40 hover:opacity-100 transition" />
            <img src={logoFcm} alt="FCM" className="h-8 w-auto object-contain opacity-40 hover:opacity-100 transition" />
          </div>
        </div>
      </footer>

      {/* ── Overlay de Evaluación Finalizada ── */}
      {todosCompletados && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Ícono de éxito animado */}
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600 border border-green-200 shadow-lg shadow-green-150/40">
              <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            {/* Título */}
            <h2 className="mb-4 text-2xl font-extrabold tracking-tight text-slate-800">
              ¡Evaluación Finalizada!
            </h2>

            {/* Mensaje */}
            <p className="mb-6 text-sm text-slate-650 leading-relaxed">
              Has completado todos los módulos de la prueba. Tus resultados han sido guardados y enviados exitosamente. Ya puedes retirarte de esta pantalla, por favor avisa al examinador.
            </p>

            {/* Separador */}
            <div className="mx-auto h-0.5 w-10 bg-slate-200" />
          </div>
        </div>
      )}
    </div>
  );
}
