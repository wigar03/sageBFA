import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// ─────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────
const SECCIONES = { OPERACIONES: 'OPERACIONES', PROBLEMAS: 'PROBLEMAS' };
const FALLBACK_TIEMPO_MIN = 6; // 6 minutos por defecto si la API no envía tiempos

export default function TestPage() {
  const navigate = useNavigate();

  // ── Estados principales ──
  const [testData, setTestData] = useState(null);        // Respuesta completa del GET
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const [seccionActual, setSeccionActual] = useState(SECCIONES.OPERACIONES);
  const [tiempoRestante, setTiempoRestante] = useState(null); // Se inicializa al recibir la API
  const [respuestasCandidato, setRespuestasCandidato] = useState([]); // { preguntaId, opcionElegidaId, tiempoSegundos }

  // Refs para acceder al valor más reciente dentro de callbacks del intervalo
  const seccionRef = useRef(seccionActual);
  const respuestasRef = useRef(respuestasCandidato);
  const testDataRef = useRef(testData);
  const intervaloRef = useRef(null);
  const tiempoInicioSeccionRef = useRef(Date.now());

  // Mantener los refs sincronizados con el estado
  useEffect(() => { seccionRef.current = seccionActual; }, [seccionActual]);
  useEffect(() => { respuestasRef.current = respuestasCandidato; }, [respuestasCandidato]);
  useEffect(() => { testDataRef.current = testData; }, [testData]);

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

        // Inicializar el temporizador con el tiempo de Operaciones de la API (o fallback 6 min)
        const minutos = data.tiempoOperacionesMin ?? FALLBACK_TIEMPO_MIN;
        setTiempoRestante(minutos * 60);
        tiempoInicioSeccionRef.current = Date.now();
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
  // 5. Función de envío del POST final
  // ─────────────────────────────────────────────
  const enviarEvaluacion = useCallback(async (respuestasFinales) => {
    if (enviando) return;
    setEnviando(true);

    // Detener el temporizador
    if (intervaloRef.current) {
      clearInterval(intervaloRef.current);
      intervaloRef.current = null;
    }

    try {
      const candidato = JSON.parse(localStorage.getItem('candidato_actual') || '{}');

      const payload = {
        ...candidato,
        respuestas: respuestasFinales,
      };

      const { data: resultado } = await api.post('/test-numerico/evaluar', payload);

      // Redirigir a /resultados pasando el resultado a través del state de la ruta
      navigate('/resultados', { state: { resultado }, replace: true });

    } catch (err) {
      setEnviando(false);
      setError('Error al enviar la evaluación: ' + (err.response?.data?.error || err.message));
    }
  }, [enviando, navigate]);

  // ─────────────────────────────────────────────
  // Función para avanzar de sección o finalizar
  // ─────────────────────────────────────────────
  const avanzarSeccion = useCallback(() => {
    if (seccionRef.current === SECCIONES.OPERACIONES) {
      // Registrar preguntas de Operaciones no respondidas con opcionElegidaId = null
      const data = testDataRef.current;
      if (data) {
        const preguntasOp = data.operaciones || [];
        const respondidas = new Set(respuestasRef.current.map(r => r.preguntaId));
        const tiempoTotal = (data.tiempoOperacionesMin ?? FALLBACK_TIEMPO_MIN) * 60;

        const noRespondidas = preguntasOp
          .filter(p => !respondidas.has(p.id))
          .map(p => ({ preguntaId: p.id, opcionElegidaId: null, tiempoSegundos: tiempoTotal }));

        if (noRespondidas.length > 0) {
          setRespuestasCandidato(prev => [...prev, ...noRespondidas]);
        }
      }

      // Cambiar a PROBLEMAS y reiniciar temporizador
      setSeccionActual(SECCIONES.PROBLEMAS);
      const minutosProblemas = data?.tiempoProblemasMin ?? FALLBACK_TIEMPO_MIN;
      setTiempoRestante(minutosProblemas * 60);
      tiempoInicioSeccionRef.current = Date.now();

    } else {
      // Estamos en PROBLEMAS → registrar no respondidas y enviar
      const data = testDataRef.current;
      let respuestasFinales = [...respuestasRef.current];

      if (data) {
        const preguntasPr = data.problemas || [];
        const respondidas = new Set(respuestasFinales.map(r => r.preguntaId));
        const tiempoTotal = (data.tiempoProblemasMin ?? FALLBACK_TIEMPO_MIN) * 60;

        const noRespondidas = preguntasPr
          .filter(p => !respondidas.has(p.id))
          .map(p => ({ preguntaId: p.id, opcionElegidaId: null, tiempoSegundos: tiempoTotal }));

        respuestasFinales = [...respuestasFinales, ...noRespondidas];
      }

      enviarEvaluacion(respuestasFinales);
    }
  }, [enviarEvaluacion]);

  // ─────────────────────────────────────────────
  // 3. Temporizador (setInterval)
  // ─────────────────────────────────────────────
  useEffect(() => {
    // No iniciar hasta que tengamos el tiempo calculado
    if (tiempoRestante === null) return;

    intervaloRef.current = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          // El tiempo llegó a 0 → avanzar sección
          clearInterval(intervaloRef.current);
          intervaloRef.current = null;
          // Usamos setTimeout para evitar setState dentro de setState
          setTimeout(() => avanzarSeccion(), 0);
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
  }, [tiempoRestante === null, seccionActual, avanzarSeccion]); // Se re-crea al cambiar de sección

  // ─────────────────────────────────────────────
  // 4. Seleccionar una opción de respuesta
  // ─────────────────────────────────────────────
  function seleccionarOpcion(preguntaId, opcionId) {
    const tiempoTranscurrido = Math.round((Date.now() - tiempoInicioSeccionRef.current) / 1000);

    setRespuestasCandidato((prev) => {
      // Si ya existía una respuesta para esta pregunta, la reemplazamos
      const sinDuplicado = prev.filter(r => r.preguntaId !== preguntaId);
      return [
        ...sinDuplicado,
        { preguntaId, opcionElegidaId: opcionId, tiempoSegundos: tiempoTranscurrido },
      ];
    });
  }

  // ─────────────────────────────────────────────
  // Helpers de renderizado
  // ─────────────────────────────────────────────
  function formatTiempo(seg) {
    const m = Math.floor(seg / 60).toString().padStart(2, '0');
    const s = (seg % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  // Obtener la opción seleccionada para una pregunta
  function opcionSeleccionada(preguntaId) {
    const r = respuestasCandidato.find(r => r.preguntaId === preguntaId);
    return r ? r.opcionElegidaId : null;
  }

  // Preguntas de la sección actual
  const preguntas = testData
    ? (seccionActual === SECCIONES.OPERACIONES ? testData.operaciones : testData.problemas)
    : [];

  // ─────────────────────────────────────────────
  // Renderizado condicional: Loading
  // ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
          <p className="text-sm font-medium text-slate-500">Cargando preguntas del test…</p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // Renderizado condicional: Error
  // ─────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
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
  // Renderizado condicional: Enviando evaluación
  // ─────────────────────────────────────────────
  if (enviando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
          <p className="text-sm font-medium text-slate-500">Enviando evaluación…</p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // Renderizado principal
  // ─────────────────────────────────────────────
  const tiempoBajo = tiempoRestante !== null && tiempoRestante < 60;

  return (
    <div className="min-h-screen bg-slate-100">
      {/* ── Barra superior fija con temporizador ── */}
      <header
        className={
          'sticky top-0 z-50 flex items-center justify-between px-6 py-3 shadow-md transition-colors duration-300 ' +
          (tiempoBajo
            ? 'bg-red-600 text-white'
            : 'bg-white text-slate-800 border-b border-slate-200')
        }
      >
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-bold uppercase tracking-wide sm:text-base">
            {seccionActual === SECCIONES.OPERACIONES ? 'Sección: Operaciones' : 'Sección: Problemas'}
          </h1>
          <span
            className={
              'rounded-full px-3 py-0.5 text-xs font-semibold ' +
              (tiempoBajo
                ? 'bg-white/20 text-white'
                : 'bg-indigo-100 text-indigo-700')
            }
          >
            {seccionActual === SECCIONES.OPERACIONES ? '1 / 2' : '2 / 2'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Ícono de reloj */}
          <svg
            className={`h-5 w-5 ${tiempoBajo ? 'animate-pulse text-white' : 'text-slate-400'}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>

          <span className={`font-mono text-2xl font-extrabold tracking-wider ${tiempoBajo ? 'animate-pulse' : ''}`}>
            {tiempoRestante !== null ? formatTiempo(tiempoRestante) : '--:--'}
          </span>
        </div>
      </header>

      {/* ── Contenido de preguntas ── */}
      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* Indicaciones de sección */}
        <div className="mb-8 rounded-xl bg-indigo-50 border border-indigo-100 p-5">
          <p className="text-sm text-indigo-800">
            {seccionActual === SECCIONES.OPERACIONES
              ? 'Resuelve las siguientes operaciones aritméticas. Selecciona la respuesta correcta para cada una. El tiempo límite es de 6 minutos.'
              : 'Resuelve los siguientes problemas numéricos. Selecciona la respuesta correcta para cada uno. El tiempo límite es de 6 minutos.'}
          </p>
        </div>

        {/* Lista de preguntas */}
        <div className="space-y-6">
          {preguntas.map((pregunta, index) => {
            const seleccionada = opcionSeleccionada(pregunta.id);

            return (
              <div
                key={pregunta.id}
                className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5 transition hover:shadow-md"
              >
                {/* Encabezado de la pregunta */}
                <div className="mb-4 flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <p className="text-sm font-medium leading-relaxed text-slate-800 sm:text-base">
                    {pregunta.enunciado}
                  </p>
                </div>

                {/* Opciones de respuesta */}
                <div className="ml-11 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {pregunta.opciones.map((opcion) => {
                    const isSelected = seleccionada === opcion.id;

                    return (
                      <button
                        key={opcion.id}
                        type="button"
                        onClick={() => seleccionarOpcion(pregunta.id, opcion.id)}
                        className={
                          'flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition ' +
                          (isSelected
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-800 ring-2 ring-indigo-500/30 font-semibold'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50')
                        }
                      >
                        {/* Indicador visual (radio) */}
                        <span
                          className={
                            'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ' +
                            (isSelected
                              ? 'border-indigo-600 bg-indigo-600'
                              : 'border-slate-300 bg-white')
                          }
                        >
                          {isSelected && (
                            <span className="h-2 w-2 rounded-full bg-white" />
                          )}
                        </span>

                        {/* Literal + texto */}
                        <span>
                          <span className="mr-1.5 font-bold">{opcion.literal})</span>
                          {opcion.textoOpcion}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Botón de finalizar sección ── */}
        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={avanzarSeccion}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-8 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-md transition hover:bg-indigo-700 hover:shadow-lg active:scale-[0.98]"
          >
            {seccionActual === SECCIONES.OPERACIONES
              ? 'Finalizar Sección — Ir a Problemas'
              : 'Finalizar Prueba — Enviar Respuestas'}

            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </main>
    </div>
  );
}
