/* ──────────────────────────────────────────────
   Mock data for the clinical history module
   ────────────────────────────────────────────── */

import type {
  Odontograma,
  OdontogramaPieza,
  OdontogramaEvento,
  DiagnosticoOdontologico,
  NotaCortaOdontologica,
  VersionHistoria,
  HistoriaOdontologica,
} from "./clinicalTypes";

// ── Helpers ─────────────────────────────────

const BASE_TEETH: OdontogramaPieza[] = [
  { numero: 11, condicion: "sano", caras: {}, notas: "" },
  { numero: 12, condicion: "sano", caras: {}, notas: "" },
  { numero: 14, condicion: "obturado", caras: { oclusal: "obturado" }, notas: "Resina compuesta 2023" },
  { numero: 16, condicion: "endodoncia", caras: { oclusal: "corona" }, notas: "Endodoncia + corona metal-porcelana" },
  { numero: 21, condicion: "sano", caras: {}, notas: "" },
  { numero: 22, condicion: "caries", caras: { mesial: "caries" }, notas: "Caries incipiente detectada" },
  { numero: 26, condicion: "obturado", caras: { oclusal: "obturado", mesial: "obturado" }, notas: "Amalgama antigua" },
  { numero: 36, condicion: "ausente", caras: {}, notas: "Extraído por periodontitis" },
  { numero: 46, condicion: "corona", caras: {}, notas: "Corona zirconio 2024" },
];

// ── Odontogram events ───────────────────────

export const MOCK_ODONTOGRAMA_EVENTOS: OdontogramaEvento[] = [
  { id: "oe1", piezaNumero: 16, fecha: "2023-06-15", descripcion: "Endodoncia completa", tipo: "procedimiento" },
  { id: "oe2", piezaNumero: 16, fecha: "2023-07-02", descripcion: "Colocación de corona metal-porcelana", tipo: "procedimiento" },
  { id: "oe3", piezaNumero: 22, fecha: "2025-04-11", descripcion: "Caries mesial detectada en radiografía", tipo: "hallazgo" },
  { id: "oe4", piezaNumero: 36, fecha: "2022-11-20", descripcion: "Extracción indicada por movilidad grado III", tipo: "procedimiento" },
  { id: "oe5", piezaNumero: 46, fecha: "2024-02-10", descripcion: "Preparación y cementación de corona", tipo: "procedimiento" },
];

// ── Odontograms ─────────────────────────────

export const MOCK_ODONTOGRAMAS: Odontograma[] = [
  {
    id: "odonto1",
    patientId: "p1",
    fecha: "2025-04-11",
    piezas: BASE_TEETH,
    eventos: MOCK_ODONTOGRAMA_EVENTOS.filter((e) => ["oe1", "oe2", "oe3"].includes(e.id)),
  },
  {
    id: "odonto2",
    patientId: "p2",
    fecha: "2025-04-09",
    piezas: [
      { numero: 11, condicion: "sano", caras: {}, notas: "" },
      { numero: 21, condicion: "sano", caras: {}, notas: "" },
      { numero: 31, condicion: "sano", caras: {}, notas: "" },
      { numero: 41, condicion: "sano", caras: {}, notas: "" },
    ],
    eventos: [],
  },
];

// ── Diagnoses ───────────────────────────────

export const MOCK_DIAGNOSTICOS: DiagnosticoOdontologico[] = [
  {
    id: "dx1",
    historiaId: "hc1",
    codigo: "K02.1",
    descripcion: "Caries de la dentina",
    severidad: "moderado",
    piezas: [22],
    fecha: "2025-04-11",
    notas: "Requiere restauración con resina compuesta",
  },
  {
    id: "dx2",
    historiaId: "hc1",
    codigo: "K05.1",
    descripcion: "Gingivitis crónica",
    severidad: "leve",
    piezas: [],
    fecha: "2025-03-15",
    notas: "Control con profilaxis cada 6 meses",
  },
  {
    id: "dx3",
    historiaId: "hc2",
    codigo: "K07.3",
    descripcion: "Anomalías de posición dental",
    severidad: "moderado",
    piezas: [13, 23],
    fecha: "2025-02-20",
    notas: "Tratamiento de ortodoncia en curso",
  },
];

// ── Quick notes ─────────────────────────────

export const MOCK_NOTAS_CORTAS: NotaCortaOdontologica[] = [
  {
    id: "nc1",
    patientId: "p1",
    historiaId: "hc1",
    fecha: "2025-04-11",
    contenido: "Paciente refiere sensibilidad al frío en cuadrante superior derecho. Programar radiografía periapical.",
    tipo: "texto",
    creadoPor: "Dr. Méndez",
  },
  {
    id: "nc2",
    patientId: "p1",
    historiaId: "hc1",
    fecha: "2025-03-15",
    contenido: "Profilaxis completada sin complicaciones. Indicaciones de higiene oral reforzadas.",
    tipo: "texto",
    creadoPor: "Dr. Méndez",
  },
  {
    id: "nc3",
    patientId: "p2",
    historiaId: "hc2",
    fecha: "2025-04-09",
    contenido: "Ajuste de arco superior realizado. Paciente tolera bien el tratamiento.",
    tipo: "voz",
    duracionSegundos: 15,
    creadoPor: "Dra. Ruiz",
  },
];

// ── Version history ─────────────────────────

export const MOCK_VERSIONES: VersionHistoria[] = [
  { id: "v1", historiaId: "hc1", version: 1, fecha: "2025-01-15", autor: "Dr. Méndez", resumenCambios: "Creación de historia clínica" },
  { id: "v2", historiaId: "hc1", version: 2, fecha: "2025-03-15", autor: "Dr. Méndez", resumenCambios: "Actualización tras profilaxis y diagnóstico de gingivitis" },
  { id: "v3", historiaId: "hc1", version: 3, fecha: "2025-04-11", autor: "Dr. Méndez", resumenCambios: "Nuevo hallazgo: caries pieza 22" },
  { id: "v4", historiaId: "hc2", version: 1, fecha: "2025-02-20", autor: "Dra. Ruiz", resumenCambios: "Apertura de historia para ortodoncia" },
];

// ── Clinical records ────────────────────────

export const MOCK_HISTORIAS: HistoriaOdontologica[] = [
  {
    id: "hc1",
    patientId: "p1",
    estado: "en_progreso",
    creadoEn: "2025-01-15",
    actualizadoEn: "2025-04-11",
    detalle: {
      motivoConsulta: "Control periódico y sensibilidad dental",
      anamnesis: "Paciente acude por sensibilidad al frío en cuadrante superior derecho desde hace 2 semanas. Sin dolor espontáneo. Última visita hace 6 meses para profilaxis de rutina.",
      antecedentesMedicos: "Alergia a penicilina. Sin enfermedades sistémicas relevantes.",
      antecedentesOdontologicos: "Endodoncia pieza 16 en 2023. Extracción pieza 36 en 2022. Restauraciones múltiples en sector posterior.",
      antecedentesFamiliares: "Madre con enfermedad periodontal. Padre diabético tipo II.",
      habitos: "Bruxismo nocturno (usa placa oclusal). No fuma. Consumo moderado de café (2 tazas/día).",
      revisionSistemas: "Cardiovascular: normal. Respiratorio: normal. Endocrino: normal. Digestivo: reflujo gástrico ocasional.",
      examenFisico: {
        general: "Paciente en buen estado general, orientado, colaborador. Piel y mucosas normocoloreadas. Sin adenopatías palpables cervicales.",
        especifico: "ATM sin chasquidos ni crepitaciones. Apertura bucal adecuada (42mm). Mucosa oral sin lesiones. Encías eritematosas en sector anteroinferior. Piso de boca y lengua sin alteraciones.",
        signosVitales: {
          presionArterial: "120/78",
          frecuenciaCardiaca: 72,
          frecuenciaRespiratoria: 16,
          temperatura: 36.5,
          peso: 74,
          talla: 172,
          imc: 25.0,
          saturacionO2: 98,
        },
        indicadoresOdontologicos: {
          indiceOLeary: 28,
          fluorosis: "normal",
          dientesExaminados: 28,
          superficiesExaminadas: 112,
          superficiesMarcadas: 31,
          copC: 1,
          copO: 3,
          copP: 1,
          copTotal: 5,
          aptoCop: true,
        },
      },
      exploracionClinica: "Higiene oral aceptable. Gingivitis leve generalizada. Caries mesial en pieza 22.",
      planTratamiento: "1. Profilaxis semestral\n2. Restauración pieza 22\n3. Seguimiento gingivitis",
    },
    clasificacion: {
      asa: "ASA_I",
      alergias: ["Penicilina"],
      enfermedadesCronicas: [],
      medicamentosActuales: [],
    },
    indicadores: {
      piezasTratadas: 3,
      procedimientosPendientes: 1,
      ultimaVisita: "2025-04-11",
      proximaCita: new Date().toISOString().split("T")[0],
      riesgoGeneral: "bajo",
    },
    odontogramaId: "odonto1",
    diagnosticos: ["dx1", "dx2"],
    notas: ["nc1", "nc2"],
    versiones: ["v1", "v2", "v3"],
  },
  {
    id: "hc2",
    patientId: "p2",
    estado: "en_progreso",
    creadoEn: "2025-02-20",
    actualizadoEn: "2025-04-09",
    detalle: {
      motivoConsulta: "Corrección de maloclusión clase II",
      anamnesis: "Paciente adolescente remitido por odontólogo general para valoración ortodóntica. Refiere insatisfacción estética con sonrisa.",
      antecedentesMedicos: "Sin antecedentes relevantes.",
      antecedentesOdontologicos: "Primera ortodoncia. Sin tratamientos previos significativos.",
      antecedentesFamiliares: "Sin antecedentes familiares relevantes.",
      habitos: "Respirador oral nocturno. Onicofagia ocasional.",
      revisionSistemas: "Sin hallazgos relevantes en la revisión por sistemas.",
      examenFisico: {
        general: "Paciente joven en buen estado general. Sin hallazgos relevantes a la inspección.",
        especifico: "ATM normal. Apertura bucal completa. Mucosa oral sana. Apiñamiento dental anterior visible. Mordida clase II molar bilateral.",
        signosVitales: {
          presionArterial: "110/70",
          frecuenciaCardiaca: 68,
          frecuenciaRespiratoria: 18,
          temperatura: 36.4,
          peso: 58,
          talla: 165,
          imc: 21.3,
          saturacionO2: 99,
        },
        indicadoresOdontologicos: {
          indiceOLeary: 15,
          fluorosis: "normal",
          dientesExaminados: 32,
          superficiesExaminadas: 128,
          superficiesMarcadas: 19,
          copC: 0,
          copO: 0,
          copP: 0,
          copTotal: 0,
          aptoCop: true,
        },
      },
      exploracionClinica: "Dentición permanente completa. Apiñamiento moderado en sector anterior.",
      planTratamiento: "Ortodoncia fija brackets metálicos. Duración estimada: 18 meses.",
    },
    clasificacion: {
      asa: "ASA_I",
      alergias: [],
      enfermedadesCronicas: [],
      medicamentosActuales: [],
    },
    indicadores: {
      piezasTratadas: 0,
      procedimientosPendientes: 2,
      ultimaVisita: "2025-04-09",
      proximaCita: new Date().toISOString().split("T")[0],
      riesgoGeneral: "bajo",
    },
    odontogramaId: "odonto2",
    diagnosticos: ["dx3"],
    notas: ["nc3"],
    versiones: ["v4"],
  },
];
