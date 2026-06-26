import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ── Logos (deben existir en src/assets/logos/) ──
import logoUam from '../assets/logos/logo_uam.png';
import logoFia from '../assets/logos/logo_fia.svg';
import logoFcm from '../assets/logos/logo_fcm.svg';

const NIVELES_ESTUDIO = [
  { value: '', label: 'Selecciona tu nivel de estudio' },
  { value: 'PRIMARIA', label: 'Primaria' },
  { value: 'SECUNDARIA', label: 'Secundaria' },
  { value: 'TECNICO', label: 'Técnico' },
  { value: 'LICENCIATURA', label: 'Licenciatura' },
  { value: 'POSGRADO', label: 'Posgrado' },
];

const SEXOS = [
  { value: '', label: 'Selecciona tu sexo' },
  { value: 'MASCULINO', label: 'Masculino' },
  { value: 'FEMENINO', label: 'Femenino' },
];

const UBICACIONES_NICARAGUA = {
  'Boaco': ['Boaco', 'Camoapa', 'San José de los Remates', 'San Lorenzo', 'Santa Lucía', 'Teustepe'],
  'Carazo': ['Diriamba', 'Jinotepe', 'San Marcos', 'Dolores', 'El Rosario', 'La Conquista', 'La Paz de Oriente', 'Santa Teresa'],
  'Chinandega': ['Chinandega', 'El Realejo', 'Corinto', 'Chichigalpa', 'Posoltega', 'El Viejo', 'Puerto Morazán', 'Somotillo', 'Villa Nueva', 'Santo Tomás del Norte', 'Cinco Pinos', 'San Pedro del Norte', 'San Francisco del Norte'],
  'Chontales': ['Juigalpa', 'Acoyapa', 'Santo Tomás', 'Villa Sandino', 'La Libertad', 'Santo Domingo', 'San Pedro de Lóvago', 'El Coral', 'San Francisco de Cuapa'],
  'Estelí': ['Estelí', 'Condega', 'Pueblo Nuevo', 'San Juan de Limay', 'La Trinidad', 'San Nicolás'],
  'Granada': ['Granada', 'Nandaime', 'Diriomo', 'Diriá'],
  'Jinotega': ['Jinotega', 'San Rafael del Norte', 'San Sebastián de Yalí', 'La Concordia', 'San José de Bocay', 'El Cuá', 'Santa María de Pantasma', 'Wiwilí de Jinotega'],
  'León': ['León', 'Nagarote', 'La Paz Centro', 'El Sauce', 'Achuapa', 'Santa Rosa del Peñón', 'El Jicaral', 'Larreynaga (Malpaisillo)', 'Quezalguaque', 'Telica'],
  'Madriz': ['Somoto', 'Totogalpa', 'San Lucas', 'Las Sabanas', 'Yalagüina', 'Palacagüina', 'Telpaneca', 'San Juan de Río Coco', 'San José de Cusmapa'],
  'Managua': ['Managua', 'Ciudad Sandino', 'Tipitapa', 'El Crucero', 'San Francisco del Libre', 'San Rafael del Sur', 'Villa El Carmen', 'Mateare', 'Ticuantepe'],
  'Masaya': ['Masaya', 'Nindirí', 'La Concepción', 'Masatepe', 'Nandasmo', 'Catarina', 'San Juan de Oriente', 'Niquinohomo', 'Tisma'],
  'Matagalpa': ['Matagalpa', 'Sébaco', 'Ciudad Darío', 'San Ramón', 'Muy Muy', 'Esquipulas', 'Matiguás', 'Río Blanco', 'El Tuma - La Dalia', 'Rancho Grande', 'San Isidro', 'Terrabona'],
  'Nueva Segovia': ['Ocotal', 'Mozonte', 'Dipilto', 'Ciudad Antigua', 'San Fernando', 'Macuelizo', 'Santa María', 'Jalapa', 'El Jícaro', 'Murra', 'Quilalí', 'Wiwilí de Nueva Segovia'],
  'Río San Juan': ['San Carlos', 'Morrito', 'El Almendro', 'San Miguelito', 'El Castillo', 'San Juan del Norte'],
  'Rivas': ['Rivas', 'San Jorge', 'Buenos Aires', 'Potosí', 'Belén', 'Tola', 'San Juan del Sur', 'Cárdenas', 'Altagracia', 'Moyogalpa'],
  'Costa Caribe Norte (RACCN)': ['Bilwi (Puerto Cabezas)', 'Waspam', 'Rosita', 'Bonanza', 'Siuna', 'Prinzapolka', 'Mulukukú', 'Waslala'],
  'Costa Caribe Sur (RACCS)': ['Bluefields', 'El Rama', 'Muelle de los Bueyes', 'Nueva Guinea', 'Corn Island', 'El Tortuguero', 'Desembocadura de Río Grande', 'Laguna de Perlas', 'Kukra Hill', 'La Cruz de Río Grande']
};

const TIPOS_COLEGIO = [
  { value: '', label: 'Selecciona tipo de colegio' },
  { value: 'PUBLICO', label: 'Público' },
  { value: 'PRIVADO', label: 'Privado' }
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
    cedula: '',
    edad: '',
    telefono: '',
    departamento: '',
    municipio: '',
    tipoColegio: '',
    aceptoConsentimiento: false,
  });

  const [touched, setTouched] = useState({
    nombres: false,
    apellidos: false,
    correo: false,
    cedula: false,
    telefono: false,
    fechaNacimiento: false,
    edad: false,
    sexo: false,
    nivelEstudio: false,
    departamento: false,
    municipio: false,
    tipoColegio: false,
  });

  const validations = {
    nombres: form.nombres.trim().length >= 2 && /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(form.nombres.trim()),
    apellidos: form.apellidos.trim().length >= 2 && /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(form.apellidos.trim()),
    correo: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo.trim()),
    cedula: /^\d{3}-\d{6}-\d{4}[A-Z]$/.test(form.cedula),
    telefono: /^\d{4}-\d{4}$/.test(form.telefono),
    fechaNacimiento: form.fechaNacimiento !== '',
    edad: form.edad.toString().trim() !== '' && Number(form.edad) >= 6 && Number(form.edad) <= 100,
    sexo: form.sexo !== '',
    nivelEstudio: form.nivelEstudio !== '',
    tipoColegio: form.tipoColegio !== '',
    departamento: form.departamento !== '',
    municipio: form.municipio !== '',
  };

  const isFormValid =
    validations.nombres &&
    validations.apellidos &&
    validations.correo &&
    validations.sexo &&
    validations.nivelEstudio &&
    validations.fechaNacimiento &&
    validations.cedula &&
    validations.edad &&
    validations.telefono &&
    validations.departamento &&
    validations.municipio &&
    validations.tipoColegio &&
    form.aceptoConsentimiento;

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function handleBlur(e) {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  }

  function handleDepartamentoChange(e) {
    const dep = e.target.value;
    setForm((prev) => ({
      ...prev,
      departamento: dep,
      municipio: '',
    }));
    setTouched((prev) => ({
      ...prev,
      departamento: true,
      municipio: false,
    }));
  }

  function handleFechaNacimientoChange(e) {
    const fecha = e.target.value;
    let edadCalculada = '';
    if (fecha) {
      const birthDate = new Date(fecha);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      edadCalculada = age >= 0 ? age.toString() : '';
    }
    setForm((prev) => ({
      ...prev,
      fechaNacimiento: fecha,
      edad: edadCalculada,
    }));
    setTouched((prev) => ({
      ...prev,
      fechaNacimiento: true,
      edad: true,
    }));
  }

  function handleTelefonoChange(e) {
    let raw = e.target.value.replace(/[^0-9]/g, '');
    if (raw.length > 8) {
      raw = raw.substring(0, 8);
    }
    let formatted = raw;
    if (raw.length > 4) {
      formatted = raw.substring(0, 4) + '-' + raw.substring(4);
    }
    setForm((prev) => ({
      ...prev,
      telefono: formatted,
    }));
  }

  function handleCedulaChange(e) {
    let raw = e.target.value.replace(/[^0-9A-Za-z]/g, '').toUpperCase();
    if (raw.length > 14) {
      raw = raw.substring(0, 14);
    }

    let formatted = '';
    if (raw.length > 0) {
      formatted += raw.substring(0, Math.min(raw.length, 3));
    }
    if (raw.length > 3) {
      formatted += '-' + raw.substring(3, Math.min(raw.length, 9));
    }
    if (raw.length > 9) {
      formatted += '-' + raw.substring(9, Math.min(raw.length, 13));
    }
    if (raw.length > 13) {
      formatted += raw.substring(13, 14);
    }

    setForm((prev) => ({
      ...prev,
      cedula: formatted,
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
      cedula: form.cedula,
      edad: Number(form.edad),
      telefono: form.telefono.trim(),
      departamento: form.departamento,
      municipio: form.municipio,
      tipoColegio: form.tipoColegio,
      aceptoConsentimientoInformado: form.aceptoConsentimiento,
    };

    localStorage.removeItem('modulo_N2_completado');
    localStorage.removeItem('respuestas_temporales_N2');
    localStorage.setItem('candidato_actual', JSON.stringify(candidato));
    navigate('/dashboard');
  }

  const municipiosDisponibles = form.departamento ? UBICACIONES_NICARAGUA[form.departamento] : [];

  /* ── Estilos reutilizables con branding UAM ── */
  const inputClass =
    'w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 ' +
    'placeholder-slate-400 shadow-sm transition ' +
    'focus:border-uam-celeste focus:outline-none focus:ring-2 focus:ring-uam-celeste/30';

  const labelClass = 'mb-1 block text-sm font-semibold text-slate-700';

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-sky-50">
      {/* ══════════ Contenido principal (crece para empujar el footer) ══════════ */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          {/* ── Logo UAM + Encabezado ── */}
          <div className="mb-8 text-center">
            <img
              src={logoUam}
              alt="Universidad Americana — UAM"
              className="mx-auto mb-5 h-20 w-auto object-contain drop-shadow-sm"
            />
            <h1 className="text-3xl font-extrabold tracking-tight text-uam-celeste sm:text-4xl">
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
                onBlur={handleBlur}
                className={`${inputClass} ${touched.nombres && !validations.nombres ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                required
              />
              {touched.nombres && !validations.nombres && (
                <p className="mt-1 text-xs text-red-500">
                  El nombre debe contener al menos 2 letras y no incluir números ni caracteres especiales.
                </p>
              )}
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
                onBlur={handleBlur}
                className={`${inputClass} ${touched.apellidos && !validations.apellidos ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                required
              />
              {touched.apellidos && !validations.apellidos && (
                <p className="mt-1 text-xs text-red-500">
                  El apellido debe contener al menos 2 letras y no incluir números ni caracteres especiales.
                </p>
              )}
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
                onBlur={handleBlur}
                className={`${inputClass} ${touched.correo && !validations.correo ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                required
              />
              {touched.correo && !validations.correo && (
                <p className="mt-1 text-xs text-red-500">
                  Ingresa un correo electrónico válido que contenga @ y un dominio (ej. correo@ejemplo.com).
                </p>
              )}
            </div>

            {/* Cédula y Teléfono — Fila de 2 columnas */}
            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="cedula" className={labelClass}>
                  Cédula de Identidad
                </label>
                <input
                  id="cedula"
                  name="cedula"
                  type="text"
                  placeholder="001-010190-0001A"
                  value={form.cedula}
                  onChange={handleCedulaChange}
                  onBlur={handleBlur}
                  className={`${inputClass} ${touched.cedula && !validations.cedula ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                  maxLength={16}
                  required
                />
                {touched.cedula && !validations.cedula && (
                  <p className="mt-1 text-xs text-red-500">
                    El formato debe ser 000-000000-0000X.
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="telefono" className={labelClass}>
                  Teléfono
                </label>
                <input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  placeholder="Ej. 8888-8888"
                  value={form.telefono}
                  onChange={handleTelefonoChange}
                  onBlur={handleBlur}
                  className={`${inputClass} ${touched.telefono && !validations.telefono ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                  required
                />
                {touched.telefono && !validations.telefono && (
                  <p className="mt-1 text-xs text-red-500">
                    El teléfono debe tener exactamente 8 dígitos (ej. 8888-8888).
                  </p>
                )}
              </div>
            </div>

            {/* Fecha de Nacimiento y Edad — Fila de 2 columnas */}
            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="fechaNacimiento" className={labelClass}>
                  Fecha de Nacimiento
                </label>
                <input
                  id="fechaNacimiento"
                  name="fechaNacimiento"
                  type="date"
                  value={form.fechaNacimiento}
                  onChange={handleFechaNacimientoChange}
                  onBlur={handleBlur}
                  className={`${inputClass} ${touched.fechaNacimiento && !validations.fechaNacimiento ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                  required
                />
                {touched.fechaNacimiento && !validations.fechaNacimiento && (
                  <p className="mt-1 text-xs text-red-500">
                    Selecciona una fecha válida.
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="edad" className={labelClass}>
                  Edad
                </label>
                <input
                  id="edad"
                  name="edad"
                  type="number"
                  min="1"
                  max="120"
                  placeholder="Ej. 18"
                  value={form.edad}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${inputClass} ${touched.edad && !validations.edad ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                  required
                />
                {touched.edad && !validations.edad && (
                  <p className="mt-1 text-xs text-red-500">
                    Debe ser entre 6 y 100 años.
                  </p>
                )}
              </div>
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
                  onBlur={handleBlur}
                  className={`${inputClass} ${touched.sexo && !validations.sexo ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                  required
                >
                  {SEXOS.map((s) => (
                    <option key={s.value} value={s.value} disabled={s.value === ''}>
                      {s.label}
                    </option>
                  ))}
                </select>
                {touched.sexo && !validations.sexo && (
                  <p className="mt-1 text-xs text-red-500">
                    Selecciona tu sexo.
                  </p>
                )}
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
                  onBlur={handleBlur}
                  className={`${inputClass} ${touched.nivelEstudio && !validations.nivelEstudio ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                  required
                >
                  {NIVELES_ESTUDIO.map((n) => (
                    <option key={n.value} value={n.value} disabled={n.value === ''}>
                      {n.label}
                    </option>
                  ))}
                </select>
                {touched.nivelEstudio && !validations.nivelEstudio && (
                  <p className="mt-1 text-xs text-red-500">
                    Selecciona tu nivel de estudio.
                  </p>
                )}
              </div>
            </div>

            {/* Tipo de Colegio */}
            <div className="mb-4">
              <label htmlFor="tipoColegio" className={labelClass}>
                Tipo de Colegio
              </label>
              <select
                id="tipoColegio"
                name="tipoColegio"
                value={form.tipoColegio}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`${inputClass} ${touched.tipoColegio && !validations.tipoColegio ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                required
              >
                {TIPOS_COLEGIO.map((c) => (
                  <option key={c.value} value={c.value} disabled={c.value === ''}>
                    {c.label}
                  </option>
                ))}
              </select>
              {touched.tipoColegio && !validations.tipoColegio && (
                <p className="mt-1 text-xs text-red-500">
                  Selecciona el tipo de colegio.
                </p>
              )}
            </div>

            {/* Departamento y Municipio — Fila de 2 columnas */}
            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="departamento" className={labelClass}>
                  Departamento / Región
                </label>
                <select
                  id="departamento"
                  name="departamento"
                  value={form.departamento}
                  onChange={handleDepartamentoChange}
                  onBlur={handleBlur}
                  className={`${inputClass} ${touched.departamento && !validations.departamento ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                  required
                >
                  <option value="" disabled>Selecciona departamento</option>
                  {Object.keys(UBICACIONES_NICARAGUA).map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                {touched.departamento && !validations.departamento && (
                  <p className="mt-1 text-xs text-red-500">
                    Selecciona tu departamento.
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="municipio" className={labelClass}>
                  Municipio
                </label>
                <select
                  id="municipio"
                  name="municipio"
                  value={form.municipio}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${inputClass} ${touched.municipio && !validations.municipio ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                  disabled={!form.departamento}
                  required
                >
                  <option value="" disabled>Selecciona municipio</option>
                  {municipiosDisponibles.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                {touched.municipio && !validations.municipio && (
                  <p className="mt-1 text-xs text-red-500">
                    Selecciona tu municipio.
                  </p>
                )}
              </div>
            </div>

            {/* ── Consentimiento Informado ── */}
            <div className="mb-6 rounded-lg border border-uam-celeste/20 bg-sky-50/50 p-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  name="aceptoConsentimiento"
                  checked={form.aceptoConsentimiento}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-uam-celeste focus:ring-uam-celeste"
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
                  ? 'bg-uam-celeste hover:bg-uam-celeste-dark hover:shadow-lg active:scale-[0.98]'
                  : 'cursor-not-allowed bg-slate-300 text-slate-500')
              }
            >
              Ir al Panel de Evaluaciones
            </button>
          </form>
        </div>
      </div>

      {/* ══════════ Footer: Facultades colaboradoras ══════════ */}
      <footer className="border-t border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-4 py-8">
          <p className="mb-5 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
            Desarrollado en colaboración con
          </p>

          <div className="flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-12">
            {/* Facultad de Ingeniería y Arquitectura */}
            <div className="flex flex-col items-center gap-2">
              <img
                src={logoFia}
                alt="Facultad de Ingeniería y Arquitectura — FIA"
                className="h-12 w-auto object-contain"
              />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Fac. de Ingeniería y Arquitectura
              </span>
              <span className="h-0.5 w-10 rounded-full bg-uam-naranja" />
            </div>

            {/* Facultad de Ciencias Médicas */}
            <div className="flex flex-col items-center gap-2">
              <img
                src={logoFcm}
                alt="Facultad de Ciencias Médicas — FCM"
                className="h-12 w-auto object-contain"
              />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Fac. de Ciencias Médicas
              </span>
              <span className="h-0.5 w-10 rounded-full bg-uam-verde" />
            </div>
          </div>

          <p className="mt-6 text-center text-[10px] text-slate-400">
            SAGE-BFA &middot; Universidad Americana &middot; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
