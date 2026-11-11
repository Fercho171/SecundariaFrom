export type JustificationReason =
  | 'ILLNESS'
  | 'MEDICAL_APPOINTMENT'
  | 'FAMILY'
  | 'SCHOOL_ACTIVITY'
  | 'OTHER';

export const JUSTIFICATION_REASONS: { value: JustificationReason; label: string }[] = [
  { value: 'ILLNESS', label: 'Enfermedad' },
  { value: 'MEDICAL_APPOINTMENT', label: 'Cita médica' },
  { value: 'FAMILY', label: 'Problema familiar' },
  { value: 'SCHOOL_ACTIVITY', label: 'Actividad escolar' },
  { value: 'OTHER', label: 'Otro' }
];

export interface Justification {
  id: string;
  studentId: string;
  studentName: string;
  groupName: string;
  date: string;
  reason: JustificationReason;
  reasonLabel: string;
  notes: string;
  fileName?: string;
  createdAt: string;
}

export interface JustificationRequest {
  studentId: string;
  date: string;
  reason: JustificationReason;
  notes: string;
  file?: File | null;
}
