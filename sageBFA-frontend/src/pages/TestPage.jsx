import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import TeX from '@matejmazur/react-katex';
import api from '../services/api';

// ── Logo UAM ──
import logoUam from '../assets/logos/logo_uam.png';

// ─────────────────────────────────────────────
// Constantes de Fases
// ─────────────────────────────────────────────
const FASES = {
  INSTRUCCIONES_OPERACIONES: 'INSTRUCCIONES_OPERACIONES',
  TEST_OPERACIONES: 'TEST_OPERACIONES',
  INSTRUCCIONES_PROBLEMAS: 'INSTRUCCIONES_PROBLEMAS',
  TEST_PROBLEMAS: 'TEST_PROBLEMAS',
  FINALIZANDO: 'FINALIZANDO',
};

const FALLBACK_TIEMPO_MIN = 6;

const ejemplosOperaciones = [
  {
    id: 1,
    pregunta: "3 + \\Box = 8",
    opciones: [
      { label: "A) 3", correct: false },
      { label: "B) 5", correct: true },
      { label: "C) 6", correct: false },
      { label: "D) 4", correct: false }
    ],
    correcta: "La respuesta correcta es 5 (Letra B)."
  },
  {
    id: 2,
    pregunta: "5 + \\Box = 1",
    opciones: [
      { label: "A) 3,7", correct: false },
      { label: "B) 7,2", correct: false },
      { label: "C) -4", correct: true },
      { label: "D) 7,3", correct: false }
    ],
    correcta: "La respuesta correcta es -4 (Letra C)."
  }
];

const ejemplosProblemas = [
  {
    id: 1,
    pregunta: "Pedro tiene 28 cts., Juan tiene 31 cts. ¿Cuánto tienen entre los dos?",
    opciones: [
      { label: "A) 49", correct: false },
      { label: "B) 59", correct: true },
      { label: "C) 50", correct: false },
      { label: "D) 60", correct: false }
    ],
    correcta: "La respuesta correcta es 59 (Letra B)."
  },
  {
    id: 2,
    pregunta: "Con 50 pesos compré un dulce de 15 pesos y un jugo de 20 pesos. ¿Cuánto me quedó de cambio?",
    opciones: [
      { label: "A) 15 pesos", correct: true },
      { label: "B) 35 pesos", correct: false },
      { label: "C) 25 pesos", correct: false },
      { label: "D) 10 pesos", correct: false }
    ],
    correcta: "La respuesta correcta es 15 pesos (Letra A)."
  }
];

// ─────────────────────────────────────────────
// Componente auxiliar: detecta si un texto contiene LaTeX
// y lo renderiza con KaTeX o como texto plano
// ─────────────────────────────────────────────
function MathText({ text, display = false }) {
  if (!text) return null;
  const safeMath = text.replace(/\\+/g, '\\').replace(/\\square/g, '\\Box');
  const hasLatex = /\\frac|\\Box|\\square|\\times|\\div|\{|\}/.test(safeMath);

  if (hasLatex) {
    return <TeX block={display} math={safeMath} />;
  }
  return <span>{text}</span>;
}

export default function TestPage() {
  const navigate = useNavigate();

  // ── Estados principales ──
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [fase, setFase] = useState(FASES.INSTRUCCIONES_OPERACIONES);
  const [preguntaActualIndex, setPreguntaActualIndex] = useState(0);
  const [tiempoRestante, setTiempoRestante] = useState(null);
  const [respuestasCandidato, setRespuestasCandidato] = useState([]);
  const [seleccionActual, setSeleccionActual] = useState(null);
  const [activeExampleOperaciones, setActiveExampleOperaciones] = useState(0);
  const [activeExampleProblemas, setActiveExampleProblemas] = useState(0);

  // Estados de seguridad para pantalla completa (Fullscreen Police)
  const [isFullscreenViolated, setIsFullscreenViolated] = useState(false);
  const [violationCountdown, setViolationCountdown] = useState(10);
  const [isTestInvalidated, setIsTestInvalidated] = useState(false);

  // Refs
  const faseRef = useRef(fase);
  const respuestasRef = useRef(respuestasCandidato);
  const testDataRef = useRef(testData);
  const preguntaIndexRef = useRef(preguntaActualIndex);
  const seleccionRef = useRef(seleccionActual);
  const intervaloRef = useRef(null);
  const tiempoInicioSeccionRef = useRef(Date.now());

  useEffect(() => { faseRef.current = fase; }, [fase]);
  useEffect(() => { respuestasRef.current = respuestasCandidato; }, [respuestasCandidato]);
  useEffect(() => { testDataRef.current = testData; }, [testData]);
  useEffect(() => { preguntaIndexRef.current = preguntaActualIndex; }, [preguntaActualIndex]);
  useEffect(() => { seleccionRef.current = seleccionActual; }, [seleccionActual]);

  // ─────────────────────────────────────────────
  // 1. Verificar candidato en localStorage
  // ─────────────────────────────────────────────
  useEffect(() => {
    window.scrollTo(0, 0);
    const candidatoRaw = localStorage.getItem('candidato_actual');
    if (!candidatoRaw) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  // ─────────────────────────────────────────────
  // 2. Fetch de las preguntas del test
  // ─────────────────────────────────────────────
  useEffect(() => {
    let cancelado = false;

    async function fetchTest() {
      try {
        const { data } = await api.get('/test-numerico');
        if (cancelado) return;
        setTestData(data);
      } catch (err) {
        if (!cancelado) setError(err.message || 'Error al cargar el test.');
      } finally {
        if (!cancelado) setLoading(false);
      }
    }

    fetchTest();
    return () => { cancelado = true; };
  }, []);

  // Al cambiar de pregunta o fase, restaurar la opción previamente seleccionada si existe
  useEffect(() => {
    const preguntas = fase === FASES.TEST_OPERACIONES
      ? testData?.operaciones
      : testData?.problemas;
    const pregunta = preguntas?.[preguntaActualIndex];
    if (pregunta) {
      const respuestaExistente = respuestasRef.current.find(r => r.preguntaId === pregunta.id);
      setSeleccionActual(respuestaExistente ? respuestaExistente.opcionElegidaId : null);
    }
  }, [preguntaActualIndex, fase, testData]);

  // ─────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────
  const esTestActivo = fase === FASES.TEST_OPERACIONES || fase === FASES.TEST_PROBLEMAS;
  const esOperaciones = fase === FASES.TEST_OPERACIONES || fase === FASES.INSTRUCCIONES_OPERACIONES;

  const preguntasSeccionActual = testData
    ? (fase === FASES.TEST_OPERACIONES || fase === FASES.INSTRUCCIONES_OPERACIONES
        ? testData.operaciones
        : testData.problemas)
    : [];

  const totalPreguntas = preguntasSeccionActual.length;
  const preguntaActual = preguntasSeccionActual[preguntaActualIndex] || null;
  const progreso = totalPreguntas > 0 ? (preguntaActualIndex / totalPreguntas) * 100 : 0;
  const esUltimaPregunta = preguntaActualIndex === totalPreguntas - 1;

  // Detectar si la sección actual usa LaTeX (operaciones sí, problemas no)
  const usarKatex = fase === FASES.TEST_OPERACIONES;

  function formatTiempo(seg) {
    if (seg === null || seg === undefined) return '--:--';
    const m = Math.floor(seg / 60).toString().padStart(2, '0');
    const s = (seg % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  // ─────────────────────────────────────────────
  // Registrar respuesta actual
  // ─────────────────────────────────────────────
  function registrarRespuestaActual() {
    const preguntas = faseRef.current === FASES.TEST_OPERACIONES
      ? testDataRef.current?.operaciones
      : testDataRef.current?.problemas;
    const pregunta = preguntas?.[preguntaIndexRef.current];
    if (!pregunta) return;

    const tiempoTranscurrido = Math.round((Date.now() - tiempoInicioSeccionRef.current) / 1000);

    setRespuestasCandidato((prev) => {
      const sinDuplicado = prev.filter(r => r.preguntaId !== pregunta.id);
      return [
        ...sinDuplicado,
        {
          preguntaId: pregunta.id,
          opcionElegidaId: seleccionRef.current,
          tiempoSegundos: tiempoTranscurrido,
        },
      ];
    });
  }

  // ─────────────────────────────────────────────
  // Registrar preguntas restantes como no respondidas
  // ─────────────────────────────────────────────
  function registrarPreguntasRestantes(preguntas, desdeIndex) {
    const tiempoTotal = faseRef.current === FASES.TEST_OPERACIONES
      ? (testDataRef.current?.tiempoOperacionesMin ?? FALLBACK_TIEMPO_MIN) * 60
      : (testDataRef.current?.tiempoProblemasMin ?? FALLBACK_TIEMPO_MIN) * 60;

    const respondidas = new Set(respuestasRef.current.map(r => r.preguntaId));
    const noRespondidas = preguntas
      .slice(desdeIndex)
      .filter(p => !respondidas.has(p.id))
      .map(p => ({ preguntaId: p.id, opcionElegidaId: null, tiempoSegundos: tiempoTotal }));

    if (noRespondidas.length > 0) {
      setRespuestasCandidato(prev => [...prev, ...noRespondidas]);
    }
  }

  // ─────────────────────────────────────────────
  // POST final
  // ─────────────────────────────────────────────
  const enviarEvaluacion = useCallback(async (respuestasFinales) => {
    setFase(FASES.FINALIZANDO);

    if (intervaloRef.current) {
      clearInterval(intervaloRef.current);
      intervaloRef.current = null;
    }

    try {
      const candidato = JSON.parse(localStorage.getItem('candidato_actual') || '{}');
      const payload = { ...candidato, respuestas: respuestasFinales };
      const { data: resultado } = await api.post('/test-numerico/evaluar', payload);

      // Salir de pantalla completa antes de redirigir
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }

      localStorage.setItem('modulo_N2_completado', 'true');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError('Error al enviar la evaluación: ' + (err.response?.data?.error || err.message));
      setFase(FASES.TEST_PROBLEMAS);
    }
  }, [navigate]);

  // ─────────────────────────────────────────────
  // Agotar tiempo
  // ─────────────────────────────────────────────
  const alAgotarTiempo = useCallback(() => {
    registrarRespuestaActual();

    const data = testDataRef.current;
    if (!data) return;

    if (faseRef.current === FASES.TEST_OPERACIONES) {
      registrarPreguntasRestantes(data.operaciones, preguntaIndexRef.current + 1);
      setPreguntaActualIndex(0);
      setSeleccionActual(null);
      setFase(FASES.INSTRUCCIONES_PROBLEMAS);
    } else if (faseRef.current === FASES.TEST_PROBLEMAS) {
      registrarPreguntasRestantes(data.problemas, preguntaIndexRef.current + 1);
      setTimeout(() => {
        enviarEvaluacion(respuestasRef.current);
      }, 50);
    }
  }, [enviarEvaluacion]);

  // ─────────────────────────────────────────────
  // 3. Temporizador
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (!esTestActivo || tiempoRestante === null) return;

    intervaloRef.current = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(intervaloRef.current);
          intervaloRef.current = null;
          setTimeout(() => alAgotarTiempo(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervaloRef.current) {
        clearInterval(intervaloRef.current);
        intervaloRef.current = null;
      }
    };
  }, [esTestActivo, tiempoRestante === null, alAgotarTiempo]);

  // ─────────────────────────────────────────────
  // 4. Seguridad: Fullscreen Police
  // ─────────────────────────────────────────────
  useEffect(() => {
    const handleFullscreenChange = () => {
      const enFaseTest = fase === FASES.TEST_OPERACIONES || fase === FASES.TEST_PROBLEMAS;
      if (enFaseTest) {
        if (!document.fullscreenElement) {
          setIsFullscreenViolated(true);
        } else {
          setIsFullscreenViolated(false);
          setViolationCountdown(10);
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    const enFaseTest = fase === FASES.TEST_OPERACIONES || fase === FASES.TEST_PROBLEMAS;
    if (!enFaseTest) {
      setIsFullscreenViolated(false);
      setViolationCountdown(10);
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [fase]);

  useEffect(() => {
    let timer = null;
    if (isFullscreenViolated && violationCountdown > 0) {
      timer = setTimeout(() => {
        setViolationCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isFullscreenViolated, violationCountdown]);

  useEffect(() => {
    if (isFullscreenViolated && violationCountdown === 0) {
      // Detener el temporizador principal
      if (intervaloRef.current) {
        clearInterval(intervaloRef.current);
        intervaloRef.current = null;
      }
      setIsTestInvalidated(true);
    }
  }, [isFullscreenViolated, violationCountdown]);

  // ─────────────────────────────────────────────
  // Pantalla completa
  // ─────────────────────────────────────────────
  function entrarPantallaCompleta() {
    const el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    }
  }

  // ─────────────────────────────────────────────
  // Iniciar secciones
  // ─────────────────────────────────────────────
  function iniciarOperaciones() {
    entrarPantallaCompleta();
    const minutos = testData?.tiempoOperacionesMin ?? FALLBACK_TIEMPO_MIN;
    setTiempoRestante(minutos * 60);
    tiempoInicioSeccionRef.current = Date.now();
    setPreguntaActualIndex(0);
    setSeleccionActual(null);
    setFase(FASES.TEST_OPERACIONES);
  }

  function iniciarProblemas() {
    const minutos = testData?.tiempoProblemasMin ?? FALLBACK_TIEMPO_MIN;
    setTiempoRestante(minutos * 60);
    tiempoInicioSeccionRef.current = Date.now();
    setPreguntaActualIndex(0);
    setSeleccionActual(null);
    setFase(FASES.TEST_PROBLEMAS);
  }

  // ─────────────────────────────────────────────
  // Botón Anterior / Siguiente / Finalizar Sección
  // ─────────────────────────────────────────────
  function handleAnterior() {
    registrarRespuestaActual();

    if (preguntaActualIndex > 0) {
      setPreguntaActualIndex(prev => prev - 1);
    }
  }

  function handleSiguiente() {
    registrarRespuestaActual();

    if (!esUltimaPregunta) {
      setPreguntaActualIndex(prev => prev + 1);
    } else {
      if (fase === FASES.TEST_OPERACIONES) {
        if (intervaloRef.current) {
          clearInterval(intervaloRef.current);
          intervaloRef.current = null;
        }
        setTiempoRestante(null);
        setPreguntaActualIndex(0);
        setFase(FASES.INSTRUCCIONES_PROBLEMAS);
      } else {
        if (intervaloRef.current) {
          clearInterval(intervaloRef.current);
          intervaloRef.current = null;
        }
        setTimeout(() => {
          enviarEvaluacion(respuestasRef.current);
        }, 50);
      }
    }
  }

  // ─────────────────────────────────────────────
  // Renderizado: Pantalla de Anulación (Fullscreen Police)
  // ─────────────────────────────────────────────
  if (isTestInvalidated) {
    return (
      <div className="fixed inset-0 z-50 bg-amber-50 text-slate-800 flex flex-col items-center justify-center text-center p-8">
        <div className="max-w-md rounded-2xl bg-white p-8 border border-amber-200 shadow-2xl">
          {/* Icono de advertencia ámbar grande */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-amber-600 border border-amber-300 shadow-lg shadow-amber-100">
            <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-amber-700">¡PRUEBA ANULADA!</h2>
          <p className="mb-6 text-sm text-slate-600 leading-relaxed">
            El tiempo límite para regresar a la pantalla completa ha expirado. Por motivos de seguridad y para garantizar la integridad de los resultados, esta sesión ha sido anulada.
          </p>
          <div className="rounded-xl bg-amber-50/50 p-4 border border-amber-200">
            <p className="text-sm font-bold text-amber-800 uppercase tracking-wide">
              Por favor, permanezca en su lugar y llame inmediatamente al psicólogo evaluador.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // Renderizado: Loading
  // ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-4 border-uam-celeste/20 border-t-uam-celeste" />
          <p className="text-sm font-medium text-slate-500">Cargando preguntas del test…</p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // Renderizado: Error
  // ─────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <svg className="h-7 w-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="mb-2 text-lg font-bold text-slate-800">Error</h2>
          <p className="mb-6 text-sm text-slate-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-uam-celeste px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-uam-celeste-dark transition"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // Renderizado: Finalizando
  // ─────────────────────────────────────────────
  if (fase === FASES.FINALIZANDO) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-4 border-uam-celeste/20 border-t-uam-celeste" />
          <p className="text-sm font-medium text-slate-500">Enviando evaluación…</p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // Renderizado: Pantalla de Infracción (Fullscreen Police)
  // ─────────────────────────────────────────────
  if (isFullscreenViolated) {
    return (
      <div className="fixed inset-0 z-50 bg-amber-50 text-slate-800 flex flex-col items-center justify-center text-center p-8">
        <div className="max-w-md rounded-2xl bg-white p-8 border border-amber-400/80 shadow-2xl">
          {/* Icono de advertencia */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600 animate-bounce border border-amber-300">
            <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="mb-4 text-2xl font-extrabold tracking-tight text-amber-800">¡Atención! Has salido de pantalla completa</h2>
          <p className="mb-6 text-sm text-slate-600 leading-relaxed">
            Para garantizar la integridad de la evaluación, es obligatorio permanecer en modo pantalla completa. 
            Por favor presione <strong>F11</strong> o el botón de abajo para volver al examen.
          </p>
          <p className="mb-8 text-lg font-bold text-amber-700 animate-pulse">
            La prueba se anulará automáticamente en: <span className="font-mono text-2xl text-amber-900 font-extrabold">{violationCountdown}</span> segundos
          </p>
          <button
            type="button"
            onClick={entrarPantallaCompleta}
            className="w-full rounded-xl bg-uam-celeste hover:bg-uam-celeste-dark text-white px-6 py-4 text-sm font-bold uppercase tracking-wide shadow-lg transition active:scale-[0.98]"
          >
            REGRESAR AL EXAMEN
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // Renderizado: Instrucciones de Operaciones
  // ─────────────────────────────────────────────
  if (fase === FASES.INSTRUCCIONES_OPERACIONES) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12">
        <div className="w-full max-w-xl">
          <div className="rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-900/5 sm:p-10">
            <div className="mb-6 flex items-center gap-2">
              <span className="rounded-full bg-uam-celeste/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-uam-celeste-dark">
                Sección 1 de 2
              </span>
              <span className="text-xs font-medium text-slate-400">Operaciones</span>
            </div>

            <h2 className="mb-4 text-xl font-extrabold text-slate-800 sm:text-2xl">
              Instrucciones — Operaciones
            </h2>

            <p className="mb-6 leading-relaxed text-slate-600 text-sm sm:text-base">
              Usted va a encontrar diversos ejercicios. En cada uno de ellos hay operaciones y
              su resultado. En cada una de estas operaciones falta un número. Entre las cuatro
              posibles soluciones, <strong>A, B, C y D</strong>, que le son dadas, usted deberá
              encontrar el número que complete la operación.
            </p>

            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50/40 p-4 text-slate-600 text-xs leading-relaxed space-y-1">
              <p className="font-bold text-amber-800">💡 Consejo de usabilidad:</p>
              <p>Si no conoces la respuesta, puedes dejarla en blanco y avanzar a la siguiente pregunta. También puedes utilizar el botón <strong>"Anterior"</strong> para regresar y cambiar tus respuestas.</p>
            </div>

            {/* Visor de ejemplos basado en Pestañas (Tabs) */}
            <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              {/* Navegación (Tabs) */}
              <div className="flex gap-4 mb-5 border-b border-slate-200 pb-2">
                {ejemplosOperaciones.map((ex, idx) => (
                  <button
                    key={ex.id}
                    type="button"
                    onClick={() => setActiveExampleOperaciones(idx)}
                    className={
                      'pb-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 ' +
                      (activeExampleOperaciones === idx
                        ? 'text-uam-celeste border-b-2 border-uam-celeste'
                        : 'text-slate-400 hover:text-slate-650')
                    }
                  >
                    Ejemplo {idx + 1}
                  </button>
                ))}
              </div>

              {/* Contenido Dinámico */}
              <div className="mb-4 text-center">
                <TeX block math={ejemplosOperaciones[activeExampleOperaciones].pregunta} />
              </div>
              <div className="flex justify-center gap-3">
                {ejemplosOperaciones[activeExampleOperaciones].opciones.map((op, i) => (
                  <span
                    key={i}
                    className={
                      'rounded-lg border px-4 py-2 text-sm font-semibold ' +
                      (op.correct
                        ? 'border-green-400 bg-green-50 text-green-700'
                        : 'border-slate-200 bg-white text-slate-600')
                    }
                  >
                    {op.label}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-center text-sm text-green-600 font-semibold">
                ✓ {ejemplosOperaciones[activeExampleOperaciones].correcta}
              </p>
            </div>

            <p className="mb-8 text-sm text-slate-500 italic">
              Dispondrá de <strong className="text-slate-700">6 minutos</strong>. No avance hasta que el evaluador dé la señal.
            </p>

            <button
              onClick={iniciarOperaciones}
              className="w-full rounded-lg bg-uam-celeste px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg transition hover:bg-uam-celeste-dark hover:shadow-xl active:scale-[0.98]"
            >
              Comenzar Operaciones
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // Renderizado: Instrucciones de Problemas
  // ─────────────────────────────────────────────
  if (fase === FASES.INSTRUCCIONES_PROBLEMAS) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12">
        <div className="w-full max-w-xl">
          <div className="rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-900/5 sm:p-10">
            <div className="mb-6 flex items-center gap-2">
              <span className="rounded-full bg-uam-naranja/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-uam-naranja">
                Sección 2 de 2
              </span>
              <span className="text-xs font-medium text-slate-400">Problemas</span>
            </div>

            <h2 className="mb-4 text-xl font-extrabold text-slate-800 sm:text-2xl">
              Instrucciones — Problemas
            </h2>

            <p className="mb-6 leading-relaxed text-slate-600 text-sm sm:text-base">
              En cada ejercicio hay un problemático aritmético y cuatro posibles soluciones.
              Existe una sola respuesta correcta.
            </p>

            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50/40 p-4 text-slate-600 text-xs leading-relaxed space-y-1">
              <p className="font-bold text-amber-800">💡 Consejo de usabilidad:</p>
              <p>Si no conoces la respuesta, puedes dejarla en blanco y avanzar a la siguiente pregunta. También puedes utilizar el botón <strong>"Anterior"</strong> para regresar y cambiar tus respuestas.</p>
            </div>

            {/* Visor de ejemplos basado en Pestañas (Tabs) */}
            <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              {/* Navegación (Tabs) */}
              <div className="flex gap-4 mb-5 border-b border-slate-200 pb-2">
                {ejemplosProblemas.map((ex, idx) => (
                  <button
                    key={ex.id}
                    type="button"
                    onClick={() => setActiveExampleProblemas(idx)}
                    className={
                      'pb-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 ' +
                      (activeExampleProblemas === idx
                        ? 'text-uam-naranja border-b-2 border-uam-naranja'
                        : 'text-slate-400 hover:text-slate-650')
                    }
                  >
                    Ejemplo {idx + 1}
                  </button>
                ))}
              </div>

              {/* Contenido Dinámico */}
              <p className="mb-4 text-center text-sm font-medium text-slate-700 sm:text-base leading-relaxed">
                "{ejemplosProblemas[activeExampleProblemas].pregunta}"
              </p>
              <div className="flex justify-center gap-3">
                {ejemplosProblemas[activeExampleProblemas].opciones.map((op, i) => (
                  <span
                    key={i}
                    className={
                      'rounded-lg border px-4 py-2 text-sm font-semibold ' +
                      (op.correct
                        ? 'border-green-400 bg-green-50 text-green-700'
                        : 'border-slate-200 bg-white text-slate-600')
                    }
                  >
                    {op.label}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-center text-sm text-green-600 font-semibold">
                ✓ {ejemplosProblemas[activeExampleProblemas].correcta}
              </p>
            </div>

            <p className="mb-8 text-sm text-slate-500 italic">
              Dispondrá de <strong className="text-slate-700">6 minutos</strong>.
            </p>

            <button
              onClick={iniciarProblemas}
              className="w-full rounded-lg bg-uam-naranja px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg transition hover:bg-uam-naranja/90 hover:shadow-xl active:scale-[0.98]"
            >
              Comenzar Problemas
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // Renderizado: Test (Operaciones o Problemas)
  // ─────────────────────────────────────────────
  const tiempoBajo = tiempoRestante !== null && tiempoRestante < 60;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Header sticky: sección + temporizador ── */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          {/* Izquierda: badge de sección */}
          <div className="flex items-center gap-2">
            <span
              className={
                'rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ' +
                (fase === FASES.TEST_OPERACIONES
                  ? 'bg-uam-celeste/10 text-uam-celeste-dark'
                  : 'bg-uam-naranja/10 text-uam-naranja')
              }
            >
              {fase === FASES.TEST_OPERACIONES ? 'Operaciones' : 'Problemas'}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {preguntaActualIndex + 1} / {totalPreguntas}
            </span>
          </div>

          {/* Centro: Logo Principal UAM */}
          <div className="flex items-center justify-center">
            <img src={logoUam} alt="UAM Logo" className="h-8 w-auto object-contain" />
          </div>

          {/* Derecha: temporizador */}
          <div
            className={
              'flex items-center gap-2 rounded-lg px-3 py-1.5 transition-colors duration-300 ' +
              (tiempoBajo ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700')
            }
          >
            <svg
              className={`h-4 w-4 ${tiempoBajo ? 'animate-pulse' : 'text-slate-400'}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className={`font-mono text-lg font-extrabold tracking-wider ${tiempoBajo ? 'animate-pulse' : ''}`}>
              {formatTiempo(tiempoRestante)}
            </span>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="h-1 w-full bg-slate-200">
          <div
            className={
              'h-full transition-all duration-500 ease-out ' +
              (fase === FASES.TEST_OPERACIONES ? 'bg-uam-celeste' : 'bg-uam-naranja')
            }
            style={{ width: `${progreso}%` }}
          />
        </div>
      </header>

      {/* ── Contenido: una pregunta a la vez ── */}
      <main className="mx-auto max-w-2xl px-4 py-8 mt-10 md:mt-12 flex flex-col gap-8">
        {/* Tren de preguntas (Stepper) */}
        {esTestActivo && (
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {preguntasSeccionActual.map((preg, idx) => {
              const isActive = preguntaActualIndex === idx;
              // Verificar si ya tiene respuesta registrada
              const isAnswered = respuestasCandidato.some(r => r.preguntaId === preg.id && r.opcionElegidaId !== null);

              let btnClass = "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-200 shadow-sm ";
              if (isActive) {
                btnClass += fase === FASES.TEST_OPERACIONES 
                  ? 'bg-uam-celeste text-white shadow-md ring-2 ring-uam-celeste ring-offset-2' 
                  : 'bg-uam-naranja text-white shadow-md ring-2 ring-uam-naranja ring-offset-2';
              } else if (isAnswered) {
                btnClass += fase === FASES.TEST_OPERACIONES 
                  ? 'border-2 border-uam-celeste text-uam-celeste bg-cyan-50 hover:bg-cyan-100' 
                  : 'border-2 border-uam-naranja text-uam-naranja bg-orange-50 hover:bg-orange-100';
              } else {
                btnClass += fase === FASES.TEST_OPERACIONES 
                  ? 'border-2 border-gray-300 text-gray-400 hover:border-uam-celeste hover:text-uam-celeste' 
                  : 'border-2 border-gray-300 text-gray-400 hover:border-uam-naranja hover:text-uam-naranja';
              }

              return (
                <button
                  key={preg.id}
                  type="button"
                  onClick={() => {
                    registrarRespuestaActual();
                    setPreguntaActualIndex(idx);
                  }}
                  className={btnClass}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        )}

        <AnimatePresence mode="wait">
          {preguntaActual && (
            <motion.div
              key={`${fase}-${preguntaActual.id}`}
              initial={{ x: 80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -80, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {/* Tarjeta de la pregunta */}
              <div className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-slate-900/5 sm:p-8">
                {/* Encabezado */}
                <div className="mb-6 flex items-center gap-4">
                  <span className={
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white transition-colors duration-300 ' +
                    (fase === FASES.TEST_OPERACIONES ? 'bg-uam-celeste' : 'bg-uam-naranja')
                  }>
                    {preguntaActualIndex + 1}
                  </span>

                  {/* Enunciado: con KaTeX para operaciones, texto plano para problemas */}
                  <div className="pt-1.5 text-base leading-relaxed text-slate-800 sm:text-lg">
                    {usarKatex ? (
                      <div className="flex items-center justify-center">
                        <TeX block math={preguntaActual.enunciado.replace(/\\+/g, '\\').replace(/\\square/g, '\\Box')} />
                      </div>
                    ) : (
                      <p className="font-medium">{preguntaActual.enunciado}</p>
                    )}
                  </div>
                </div>

                {/* Opciones */}
                <div className="space-y-3 pl-0 sm:pl-14">
                  {preguntaActual.opciones.map((opcion) => {
                    const isSelected = seleccionActual === opcion.id;

                    return (
                      <button
                        key={opcion.id}
                        type="button"
                        onClick={() => setSeleccionActual(opcion.id)}
                        className={
                          'flex w-full items-center gap-4 rounded-xl border-2 px-5 py-4 text-left text-sm transition-all duration-200 sm:text-base ' +
                          (isSelected
                            ? 'border-blue-500 bg-blue-50 text-blue-800 shadow-md shadow-blue-100 ring-2 ring-blue-500'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50/40')
                        }
                      >
                        {/* Indicador radio */}
                        <span
                          className={
                            'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 ' +
                            (isSelected
                              ? 'border-blue-600 bg-blue-600'
                              : 'border-slate-300 bg-white')
                          }
                        >
                          {isSelected && <span className="h-2.5 w-2.5 rounded-full bg-white" />}
                        </span>

                        {/* Literal + texto/math */}
                        <span className="flex items-center gap-2">
                          <span className="font-bold">{opcion.literal})</span>
                          {usarKatex ? (
                            <MathText text={opcion.textoOpcion} />
                          ) : (
                            <span>{opcion.textoOpcion}</span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Botón Anterior / Siguiente / Finalizar Sección */}
              <div className="mt-8 flex justify-center gap-4">
                {preguntaActualIndex > 0 && (
                  <button
                    type="button"
                    onClick={handleAnterior}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-8 py-4 text-sm font-bold uppercase tracking-wide text-slate-600 shadow transition hover:bg-slate-50 hover:text-slate-800 hover:border-slate-400 active:scale-[0.97]"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                    </svg>
                    Anterior
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSiguiente}
                  className={
                    'inline-flex items-center gap-2 rounded-xl px-10 py-4 text-sm font-bold uppercase tracking-wide text-white shadow-lg transition hover:shadow-xl active:scale-[0.97] ' +
                    (fase === FASES.TEST_OPERACIONES
                      ? 'bg-uam-celeste hover:bg-uam-celeste-dark'
                      : 'bg-uam-naranja hover:bg-uam-naranja/90')
                  }
                >
                  {esUltimaPregunta ? 'Finalizar Sección' : 'Siguiente'}
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
