import { useState, useCallback } from "react";

export type AppointmentStatus = "pending" | "confirmed" | "completed" | "noshow";

export interface Patient {
  id: string;
  name: string;
  phone: string;
  notes: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: number; // minutes
  notes: string;
  status: AppointmentStatus;
  paid: boolean;
  amount: number;
}

// Demo data
const today = new Date().toISOString().split("T")[0];

const INITIAL_PATIENTS: Patient[] = [
  { id: "p1", name: "María García", phone: "+34 612 345 678", notes: "Sensitive to anesthesia", createdAt: "2024-01-15" },
  { id: "p2", name: "Carlos López", phone: "+34 623 456 789", notes: "Orthodontic treatment in progress", createdAt: "2024-02-20" },
  { id: "p3", name: "Ana Martínez", phone: "+34 634 567 890", notes: "", createdAt: "2024-03-10" },
  { id: "p4", name: "Pedro Sánchez", phone: "+34 645 678 901", notes: "Crown replacement needed", createdAt: "2024-04-05" },
  { id: "p5", name: "Laura Fernández", phone: "+34 656 789 012", notes: "Teeth whitening scheduled", createdAt: "2024-05-12" },
];

const INITIAL_APPOINTMENTS: Appointment[] = [
  { id: "a1", patientId: "p1", date: today, time: "09:00", duration: 30, notes: "Routine cleaning", status: "confirmed", paid: false, amount: 60 },
  { id: "a2", patientId: "p2", date: today, time: "10:00", duration: 45, notes: "Bracket adjustment", status: "pending", paid: false, amount: 80 },
  { id: "a3", patientId: "p3", date: today, time: "11:30", duration: 30, notes: "Check-up", status: "completed", paid: true, amount: 45 },
  { id: "a4", patientId: "p4", date: today, time: "14:00", duration: 60, notes: "Crown fitting", status: "pending", paid: false, amount: 350 },
  { id: "a5", patientId: "p5", date: today, time: "16:00", duration: 45, notes: "Whitening session", status: "confirmed", paid: false, amount: 200 },
  { id: "a6", patientId: "p1", date: "2025-04-10", time: "09:30", duration: 30, notes: "Follow-up", status: "completed", paid: true, amount: 45 },
  { id: "a7", patientId: "p2", date: "2025-04-09", time: "11:00", duration: 30, notes: "X-ray review", status: "completed", paid: true, amount: 90 },
];

let _id = 100;
const genId = () => `gen_${++_id}`;

export function useStore() {
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);

  const addPatient = useCallback((p: Omit<Patient, "id" | "createdAt">) => {
    const newP: Patient = { ...p, id: genId(), createdAt: new Date().toISOString().split("T")[0] };
    setPatients((prev) => [...prev, newP]);
    return newP;
  }, []);

  const updatePatient = useCallback((id: string, data: Partial<Patient>) => {
    setPatients((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
  }, []);

  const addAppointment = useCallback((a: Omit<Appointment, "id">) => {
    const newA: Appointment = { ...a, id: genId() };
    setAppointments((prev) => [...prev, newA]);
    return newA;
  }, []);

  const updateAppointment = useCallback((id: string, data: Partial<Appointment>) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, ...data } : a)));
  }, []);

  const deleteAppointment = useCallback((id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const getPatient = useCallback((id: string) => patients.find((p) => p.id === id), [patients]);

  const getAppointmentsForDate = useCallback(
    (date: string) => appointments.filter((a) => a.date === date).sort((a, b) => a.time.localeCompare(b.time)),
    [appointments]
  );

  const getAppointmentsForPatient = useCallback(
    (patientId: string) => appointments.filter((a) => a.patientId === patientId).sort((a, b) => b.date.localeCompare(a.date)),
    [appointments]
  );

  const getPaidAppointments = useCallback(
    () => appointments.filter((a) => a.paid).sort((a, b) => b.date.localeCompare(a.date)),
    [appointments]
  );

  return {
    patients,
    appointments,
    addPatient,
    updatePatient,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    getPatient,
    getAppointmentsForDate,
    getAppointmentsForPatient,
    getPaidAppointments,
  };
}

export type Store = ReturnType<typeof useStore>;
