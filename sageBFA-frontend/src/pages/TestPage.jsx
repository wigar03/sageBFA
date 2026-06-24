import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BlockMath, InlineMath } from 'react-katex';
import api from '../services/api';

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

// ─────────────────────────────────────────────
// Componente auxiliar: detecta si un texto contiene LaTeX
// y lo renderiza con KaTeX o como texto plano
// ─────────────────────────────────────────────
function MathText({ text, display = false }) {
  if (!text) return null;
  const hasLatex = /\\frac|\\square|\\times|\\div|\{|\}/.test(text);

  if (hasLatex) {
    return display
      ? <BlockMath math={text} />
      : <InlineMath math={text} />;
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

      navigate('/resultados', { state: { resultado }, replace: true });
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
  // Botón Siguiente / Finalizar Sección
  // ─────────────────────────────────────────────
  function handleSiguiente() {
    registrarRespuestaActual();

    if (!esUltimaPregunta) {
      setPreguntaActualIndex(prev => prev + 1);
      setSeleccionActual(null);
    } else {
      if (fase === FASES.TEST_OPERACIONES) {
        if (intervaloRef.current) {
          clearInterval(intervaloRef.current);
          intervaloRef.current = null;
        }
        setTiempoRestante(null);
        setPreguntaActualIndex(0);
        setSeleccionActual(null);
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
  // Renderizado: Loading
  // ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
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
            className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-700 transition"
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
          <div className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
          <p className="text-sm font-medium text-slate-500">Enviando evaluación…</p>
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
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700">
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

            {/* Ejemplo con KaTeX */}
            <div className="mb-6 rounded-xl border border-indigo-100 bg-indigo-50/60 p-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-indigo-500">Ejemplo</p>
              <div className="mb-4 text-center">
                <BlockMath math="3 + \square = 8" />
              </div>
              <div className="flex justify-center gap-3">
                {[
                  { label: 'A) 3', correct: false },
                  { label: 'B) 5', correct: true },
                  { label: 'C) 6', correct: false },
                  { label: 'D) 4', correct: false },
                ].map((op, i) => (
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
              <p className="mt-3 text-center text-sm text-green-700 font-medium">
                ✓ La respuesta correcta es <strong>5</strong> (Letra B).
              </p>
            </div>

            <p className="mb-8 text-sm text-slate-500 italic">
              Dispondrá de <strong className="text-slate-700">6 minutos</strong>. No avance hasta que el evaluador dé la señal.
            </p>

            <button
              onClick={iniciarOperaciones}
              className="w-full rounded-lg bg-indigo-600 px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg transition hover:bg-indigo-700 hover:shadow-xl active:scale-[0.98]"
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
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
                Sección 2 de 2
              </span>
              <span className="text-xs font-medium text-slate-400">Problemas</span>
            </div>

            <h2 className="mb-4 text-xl font-extrabold text-slate-800 sm:text-2xl">
              Instrucciones — Problemas
            </h2>

            <p className="mb-6 leading-relaxed text-slate-600 text-sm sm:text-base">
              En cada ejercicio hay un problema aritmético y cuatro posibles soluciones.
              Existe una sola respuesta correcta.
            </p>

            {/* Ejemplo */}
            <div className="mb-6 rounded-xl border border-emerald-100 bg-emerald-50/60 p-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-emerald-500">Ejemplo</p>
              <p className="mb-4 text-center text-sm font-medium text-slate-700 sm:text-base">
                "Pedro tiene 28 cts., Juan tiene 31 cts. ¿Cuánto tienen entre los dos?"
              </p>
              <div className="flex justify-center gap-3">
                {[
                  { label: 'A) 49', correct: false },
                  { label: 'B) 59', correct: true },
                  { label: 'C) 50', correct: false },
                  { label: 'D) 60', correct: false },
                ].map((op, i) => (
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
              <p className="mt-3 text-center text-sm text-green-700 font-medium">
                ✓ La respuesta correcta es <strong>59</strong> (Letra B).
              </p>
            </div>

            <p className="mb-8 text-sm text-slate-500 italic">
              Dispondrá de <strong className="text-slate-700">6 minutos</strong>.
            </p>

            <button
              onClick={iniciarProblemas}
              className="w-full rounded-lg bg-emerald-600 px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg transition hover:bg-emerald-700 hover:shadow-xl active:scale-[0.98]"
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
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-emerald-100 text-emerald-700')
              }
            >
              {fase === FASES.TEST_OPERACIONES ? 'Operaciones' : 'Problemas'}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {preguntaActualIndex + 1} / {totalPreguntas}
            </span>
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
              (fase === FASES.TEST_OPERACIONES ? 'bg-indigo-500' : 'bg-emerald-500')
            }
            style={{ width: `${progreso}%` }}
          />
        </div>
      </header>

      {/* ── Contenido: una pregunta a la vez ── */}
      <main className="mx-auto max-w-2xl px-4 py-8">
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
                <div className="mb-6 flex items-start gap-4">
                  <span
                    className={
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ' +
                      (fase === FASES.TEST_OPERACIONES ? 'bg-indigo-600' : 'bg-emerald-600')
                    }
                  >
                    {preguntaActualIndex + 1}
                  </span>

                  {/* Enunciado: con KaTeX para operaciones, texto plano para problemas */}
                  <div className="pt-1.5 text-base leading-relaxed text-slate-800 sm:text-lg">
                    {usarKatex ? (
                      <div className="flex items-center justify-center">
                        <BlockMath math={preguntaActual.enunciado} />
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
                            ? 'border-blue-500 bg-blue-50 text-blue-800 shadow-md shadow-blue-100'
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

              {/* Botón Siguiente / Finalizar Sección */}
              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={handleSiguiente}
                  className={
                    'inline-flex items-center gap-2 rounded-xl px-10 py-4 text-sm font-bold uppercase tracking-wide text-white shadow-lg transition hover:shadow-xl active:scale-[0.97] ' +
                    (fase === FASES.TEST_OPERACIONES
                      ? 'bg-indigo-600 hover:bg-indigo-700'
                      : 'bg-emerald-600 hover:bg-emerald-700')
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
