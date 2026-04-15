/* ──────────────────────────────────────────────
   Clinical store hook — extends the main store
   ────────────────────────────────────────────── */

import { useState, useCallback } from "react";
import type {
  HistoriaOdontologica,
  DiagnosticoOdontologico,
  Odontograma,
  NotaCortaOdontologica,
  VersionHistoria,
} from "./clinicalTypes";
import {
  MOCK_HISTORIAS,
  MOCK_DIAGNOSTICOS,
  MOCK_ODONTOGRAMAS,
  MOCK_NOTAS_CORTAS,
  MOCK_VERSIONES,
} from "./clinicalMockData";

let _cid = 500;
const genClinicalId = (prefix: string) => `${prefix}_${++_cid}`;

export function useClinicalStore() {
  const [historias, setHistorias] = useState<HistoriaOdontologica[]>(MOCK_HISTORIAS);
  const [diagnosticos, setDiagnosticos] = useState<DiagnosticoOdontologico[]>(MOCK_DIAGNOSTICOS);
  const [odontogramas, setOdontogramas] = useState<Odontograma[]>(MOCK_ODONTOGRAMAS);
  const [notasCortas, setNotasCortas] = useState<NotaCortaOdontologica[]>(MOCK_NOTAS_CORTAS);
  const [versiones, setVersiones] = useState<VersionHistoria[]>(MOCK_VERSIONES);

  // ── Historias ───────────────────────────────
  const getHistoriaByPatient = useCallback(
    (patientId: string) => historias.find((h) => h.patientId === patientId),
    [historias]
  );

  const getHistoria = useCallback(
    (id: string) => historias.find((h) => h.id === id),
    [historias]
  );

  const updateHistoria = useCallback((id: string, data: Partial<HistoriaOdontologica>) => {
    setHistorias((prev) => prev.map((h) => (h.id === id ? { ...h, ...data, actualizadoEn: new Date().toISOString().split("T")[0] } : h)));
  }, []);

  const addHistoria = useCallback((h: Omit<HistoriaOdontologica, "id">) => {
    const newH: HistoriaOdontologica = { ...h, id: genClinicalId("hc") };
    setHistorias((prev) => [...prev, newH]);
    return newH;
  }, []);

  // ── Diagnostics ─────────────────────────────
  const getDiagnosticosByHistoria = useCallback(
    (historiaId: string) => diagnosticos.filter((d) => d.historiaId === historiaId),
    [diagnosticos]
  );

  const addDiagnostico = useCallback((d: Omit<DiagnosticoOdontologico, "id">) => {
    const newD: DiagnosticoOdontologico = { ...d, id: genClinicalId("dx") };
    setDiagnosticos((prev) => [...prev, newD]);
    return newD;
  }, []);

  // ── Odontogram ──────────────────────────────
  const getOdontograma = useCallback(
    (id: string) => odontogramas.find((o) => o.id === id),
    [odontogramas]
  );

  const getOdontogramaByPatient = useCallback(
    (patientId: string) => odontogramas.find((o) => o.patientId === patientId),
    [odontogramas]
  );

  // ── Notes ───────────────────────────────────
  const getNotasByHistoria = useCallback(
    (historiaId: string) => notasCortas.filter((n) => n.historiaId === historiaId),
    [notasCortas]
  );

  const getNotasByPatient = useCallback(
    (patientId: string) => notasCortas.filter((n) => n.patientId === patientId),
    [notasCortas]
  );

  const addNota = useCallback((n: Omit<NotaCortaOdontologica, "id">) => {
    const newN: NotaCortaOdontologica = { ...n, id: genClinicalId("nc") };
    setNotasCortas((prev) => [...prev, newN]);
    return newN;
  }, []);

  const updateNota = useCallback((id: string, data: Partial<NotaCortaOdontologica>) => {
    setNotasCortas((prev) => prev.map((n) => (n.id === id ? { ...n, ...data } : n)));
  }, []);

  // ── Versions ────────────────────────────────
  const getVersionesByHistoria = useCallback(
    (historiaId: string) => versiones.filter((v) => v.historiaId === historiaId).sort((a, b) => b.version - a.version),
    [versiones]
  );

  return {
    historias,
    diagnosticos,
    odontogramas,
    notasCortas,
    versiones,
    getHistoriaByPatient,
    getHistoria,
    updateHistoria,
    addHistoria,
    getDiagnosticosByHistoria,
    addDiagnostico,
    getOdontograma,
    getOdontogramaByPatient,
    getNotasByHistoria,
    getNotasByPatient,
    addNota,
    updateNota,
    getVersionesByHistoria,
  };
}

export type ClinicalStore = ReturnType<typeof useClinicalStore>;
