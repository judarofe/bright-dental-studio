/* ──────────────────────────────────────────────
   Clinical types for the dental history module
   ────────────────────────────────────────────── */

// ── Odontogram ──────────────────────────────

export type ToothFace = "oclusal" | "mesial" | "distal" | "vestibular" | "lingual" | "palatino";
export type ToothCondition = "sano" | "caries" | "obturado" | "ausente" | "corona" | "endodoncia" | "implante" | "protesis";

export interface OdontogramaPieza {
  numero: number;           // FDI notation 11-48
  condicion: ToothCondition;
  caras: Partial<Record<ToothFace, ToothCondition>>;
  notas: string;
}

export interface OdontogramaEvento {
  id: string;
  piezaNumero: number;
  fecha: string;
  descripcion: string;
  tipo: "procedimiento" | "hallazgo" | "observacion";
}

export interface Odontograma {
  id: string;
  patientId: string;
  fecha: string;
  piezas: OdontogramaPieza[];
  eventos: OdontogramaEvento[];
}

// ── Diagnosis ───────────────────────────────

export type DiagnosticoSeveridad = "leve" | "moderado" | "severo";

export interface DiagnosticoOdontologico {
  id: string;
  historiaId: string;
  codigo: string;          // CIE-10 / CDA
  descripcion: string;
  severidad: DiagnosticoSeveridad;
  piezas: number[];        // teeth involved
  fecha: string;
  notas: string;
}

// ── Quick notes ─────────────────────────────

export interface NotaCortaOdontologica {
  id: string;
  patientId: string;
  historiaId: string;
  fecha: string;
  contenido: string;
  tipo: "texto" | "voz";
  duracionSegundos?: number;
  creadoPor: string;
}

// ── Version history ─────────────────────────

export interface VersionHistoria {
  id: string;
  historiaId: string;
  version: number;
  fecha: string;
  autor: string;
  resumenCambios: string;
}

// ── Clinical record ─────────────────────────

export type HistoriaEstado = "borrador" | "en_progreso" | "cerrada" | "anulada";

export interface HistoriaOdontologicaIndicadores {
  piezasTratadas: number;
  procedimientosPendientes: number;
  ultimaVisita: string;
  proximaCita: string;
  riesgoGeneral: "bajo" | "medio" | "alto";
}

export type ClasificacionASA = "ASA_I" | "ASA_II" | "ASA_III" | "ASA_IV";

export interface HistoriaOdontologicaClasificacion {
  asa: ClasificacionASA;
  alergias: string[];
  enfermedadesCronicas: string[];
  medicamentosActuales: string[];
}

// ── Signos vitales & examen físico ──────────

export interface SignosVitales {
  presionArterial: string;        // e.g. "120/80"
  frecuenciaCardiaca: number;     // bpm
  frecuenciaRespiratoria: number; // rpm
  temperatura: number;            // °C
  peso: number;                   // kg
  talla: number;                  // cm
  imc: number;                    // calculated
  saturacionO2?: number;          // %
}

export interface IndicadoresOdontologicos {
  indiceOLeary: number;           // %
  fluorosis: "normal" | "cuestionable" | "muy_leve" | "leve" | "moderada" | "severa";
  dientesExaminados: number;
  superficiesExaminadas: number;
  superficiesMarcadas: number;
  copC: number;                   // cariados
  copO: number;                   // obturados
  copP: number;                   // perdidos
  copTotal: number;               // C+O+P
  copd?: number;                  // deciduous
  aptoCop: boolean;
}

export interface ExamenFisico {
  general: string;
  especifico: string;
  signosVitales: SignosVitales;
  indicadoresOdontologicos: IndicadoresOdontologicos;
}

export interface HistoriaOdontologicaDetalle {
  motivoConsulta: string;
  anamnesis: string;
  antecedentesMedicos: string;
  antecedentesOdontologicos: string;
  antecedentesFamiliares: string;
  habitos: string;
  revisionSistemas: string;
  examenFisico: ExamenFisico;
  exploracionClinica: string;
  planTratamiento: string;
}

export interface HistoriaOdontologica {
  id: string;
  patientId: string;
  estado: HistoriaEstado;
  creadoEn: string;
  actualizadoEn: string;
  detalle: HistoriaOdontologicaDetalle;
  clasificacion: HistoriaOdontologicaClasificacion;
  indicadores: HistoriaOdontologicaIndicadores;
  odontogramaId: string;
  diagnosticos: string[];   // DiagnosticoOdontologico ids
  notas: string[];           // NotaCortaOdontologica ids
  versiones: string[];       // VersionHistoria ids
}
