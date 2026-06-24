import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NIVELES_ESTUDIO = [
  { value: '', label: 'Selecciona tu nivel de estudio' },
  { value: 'PRIMARIA', label: 'Primaria' },
  { value: 'SECUNDARIA', label: 'Secundaria' },
  { value: 'BACHILLERATO', label: 'Bachillerato' },
  { value: 'TECNICO', label: 'Técnico' },
  { value: 'LICENCIATURA', label: 'Licenciatura' },
  { value: 'POSGRADO', label: 'Posgrado' },
];

const SEXOS = [
  { value: '', label: 'Selecciona tu sexo' },
  { value: 'MASCULINO', label: 'Masculino' },
  { value: 'FEMENINO', label: 'Femenino' },
];

export default function WelcomePage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombres: '',
    apellidos: '',
    correo: '',
    sexo: '',
    nivelEstudio: '',
    fechaNacimiento: '',
    aceptoConsentimiento: false,
  });

  const isFormValid =
    form.nombres.trim() !== '' &&
    form.apellidos.trim() !== '' &&
    form.correo.trim() !== '' &&
    form.sexo !== '' &&
    form.nivelEstudio !== '' &&
    form.fechaNacimiento !== '' &&
    form.aceptoConsentimiento;

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!isFormValid) return;

    const candidato = {
      nombres: form.nombres.trim(),
      apellidos: form.apellidos.trim(),
      correo: form.correo.trim(),
      sexo: form.sexo,
      nivelEstudio: form.nivelEstudio,
      fechaNacimiento: form.fechaNacimiento,
      aceptoConsentimientoInformado: form.aceptoConsentimiento,
    };

    localStorage.setItem('candidato_actual', JSON.stringify(candidato));
    navigate('/test');
  }

  /* ── Estilos reutilizables ── */
  const inputClass =
    'w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 ' +
    'placeholder-slate-400 shadow-sm transition ' +
    'focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30';

  const labelClass = 'mb-1 block text-sm font-semibold text-slate-700';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 px-4 py-12">
      <div className="w-full max-w-lg">
        {/* ── Encabezado ── */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-indigo-700 sm:text-4xl">
            Test Numérico BFA
          </h1>
          <p className="mt-2 text-base text-slate-500">
            Factor N2 — Operaciones y Problemas
          </p>
        </div>

        {/* ── Tarjeta del Formulario ── */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-900/5"
        >
          <h2 className="mb-6 text-lg font-bold text-slate-800">
            Datos del Candidato
          </h2>

          {/* Nombres */}
          <div className="mb-4">
            <label htmlFor="nombres" className={labelClass}>
              Nombres
            </label>
            <input
              id="nombres"
              name="nombres"
              type="text"
              placeholder="Ej. María José"
              value={form.nombres}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>

          {/* Apellidos */}
          <div className="mb-4">
            <label htmlFor="apellidos" className={labelClass}>
              Apellidos
            </label>
            <input
              id="apellidos"
              name="apellidos"
              type="text"
              placeholder="Ej. García López"
              value={form.apellidos}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>

          {/* Correo Electrónico */}
          <div className="mb-4">
            <label htmlFor="correo" className={labelClass}>
              Correo Electrónico
            </label>
            <input
              id="correo"
              name="correo"
              type="email"
              placeholder="correo@ejemplo.com"
              value={form.correo}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>

          {/* Fecha de Nacimiento */}
          <div className="mb-4">
            <label htmlFor="fechaNacimiento" className={labelClass}>
              Fecha de Nacimiento
            </label>
            <input
              id="fechaNacimiento"
              name="fechaNacimiento"
              type="date"
              value={form.fechaNacimiento}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>

          {/* Sexo y Nivel de Estudio — Fila de 2 columnas */}
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="sexo" className={labelClass}>
                Sexo
              </label>
              <select
                id="sexo"
                name="sexo"
                value={form.sexo}
                onChange={handleChange}
                className={inputClass}
                required
              >
                {SEXOS.map((s) => (
                  <option key={s.value} value={s.value} disabled={s.value === ''}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="nivelEstudio" className={labelClass}>
                Nivel de Estudio
              </label>
              <select
                id="nivelEstudio"
                name="nivelEstudio"
                value={form.nivelEstudio}
                onChange={handleChange}
                className={inputClass}
                required
              >
                {NIVELES_ESTUDIO.map((n) => (
                  <option key={n.value} value={n.value} disabled={n.value === ''}>
                    {n.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Consentimiento Informado ── */}
          <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                name="aceptoConsentimiento"
                checked={form.aceptoConsentimiento}
                onChange={handleChange}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs leading-relaxed text-slate-600">
                <strong className="text-slate-700">Consentimiento Informado:</strong>{' '}
                Declaro que participo de forma voluntaria en esta evaluación
                psicométrica con fines académicos. Entiendo que mis datos serán
                tratados de manera confidencial y utilizados exclusivamente para
                la calificación e interpretación del Test de Aptitudes BFA.
                Acepto que los resultados podrán ser revisados por el profesional
                a cargo de la evaluación.
              </span>
            </label>
          </div>

          {/* ── Botón Iniciar Prueba ── */}
          <button
            type="submit"
            disabled={!isFormValid}
            className={
              'w-full rounded-lg px-6 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-md transition ' +
              (isFormValid
                ? 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg active:scale-[0.98]'
                : 'cursor-not-allowed bg-slate-300 text-slate-500')
            }
          >
            Iniciar Prueba
          </button>
        </form>

        {/* ── Pie de página ── */}
        <p className="mt-6 text-center text-xs text-slate-400">
          SAGE-BFA &middot; Universidad Americana
        </p>
      </div>
    </div>
  );
}
