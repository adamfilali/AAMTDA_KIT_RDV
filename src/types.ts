/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  ADMIN = "ADMIN",
  SPECIALISTE = "SPECIALISTE",
  PARENT = "PARENT",
  SECRETAIRE = "SECRETAIRE",
}

export enum ConsultationMode {
  CENTRE = "CENTRE",
  TELECONSULTATION = "TELECONSULTATION",
  DOMICILE = "DOMICILE",
}

export enum AppointmentStatus {
  EN_ATTENTE = "EN_ATTENTE",
  CONFIRME = "CONFIRME",
  ANNULE = "ANNULE",
  REPORTE = "REPORTE",
}

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  role: UserRole;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
}

export interface Specialiste {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  specialties: string[]; // e.g., ["Orthophonie", "Neuropsychologie"]
  bio: string;
  avatar: string;
  availableDays: number[]; // 1 = Lundi, 2 = Mardi...
  guichetId: string; // Attributed guichet (1-6)
}

export interface Guichet {
  id: string; // "1" to "6"
  name: string; // e.g., "Guichet 1 - Orthophonie"
  specialty: string;
  roomNumber: string;
  capacity: number;
}

export interface Room {
  id: string;
  name: string;
  type: string; // specialty e.g. "Orthophonie"
  specialistId?: string; // assigned specialist ID
  specialistName?: string; // assigned specialist name
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  morningStart?: string; // e.g., "09:00"
  morningEnd?: string; // e.g., "12:00"
  afternoonStart?: string; // e.g., "14:00"
  afternoonEnd?: string; // e.g., "18:00"
  appointmentDuration?: number; // room specific duration override
  status: "disponible" | "occupee" | "maintenance";
}

export interface Parent {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  relation: string; // "Père" | "Mère" | "Tuteur"
  createdAt: string;
}

export interface Enfant {
  id: string;
  parentId: string;
  name: string;
  birthdate: string;
  gender: "Garçon" | "Fille";
  schoolGrade: string;
  diagnostics: string[]; // ["Dyslexie", "Dysgraphie"]
  createdAt: string;
}

export interface RendezVous {
  id: string;
  childId: string;
  specialistId: string;
  guichetId: string;
  date: string; // YYYY-MM-DD
  slot: string; // e.g., "09:00 - 09:45"
  mode: ConsultationMode;
  status: AppointmentStatus;
  notes?: string;
  otpCode?: string;
  isOtpVerified: boolean;
  createdAt: string;
}

export interface Consultation {
  id: string;
  appointmentId: string;
  childId: string;
  specialistId: string;
  date: string;
  motif: string;
  diagnostic: string;
  observations: string;
  objectifs: string;
  recommandations: string;
  planSuivi: string;
  signedBySpecialist: boolean;
  signatureData?: string; // base64 representation of digital signature
  nextAppointmentDate?: string;
  createdAt: string;
}

export interface Bilan {
  id: string;
  childId: string;
  specialistId: string;
  title: string;
  score?: string;
  date: string;
  summary: string;
  recommendation: string;
  fileUrl?: string;
}

export interface Document {
  id: string;
  title: string;
  fileType: string; // "PDF" | "Image" | "Bilan"
  fileUrl: string;
  ownerId: string; // userId
  sharedWithIds: string[]; // userIds
  uploadedAt: string;
}

export interface MessageInterne {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  attachmentUrl?: string;
  attachmentName?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: "Email" | "SMS" | "WhatsApp";
  recipient: string;
  content: string;
  status: "ENVOYE" | "EN_ATTENTE" | "ECHEC";
  templateName: string;
  sentAt: string;
}

export interface Parametres {
  siteName: string;
  logoSvg: string; // Inline SVG code
  primaryColor: string;
  secondaryColor: string;
  alertMessage?: string;
  whatsappContact: string;
  emailContact: string;
  phoneContact: string;
  appointmentDuration: number; // in minutes
  notificationTemplates: {
    confirmation: string;
    rappel: string;
    annulation: string;
  };
}

export interface AuditLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface SeriousGameResult {
  id: string;
  childId: string;
  childName: string;
  gameName: string;
  score: number;
  maxScore: number;
  durationSeconds: number;
  status: "reussite" | "besoin_aide" | "entrainement";
  whatsappNumber: string;
  notes?: string;
  createdAt: string;
}

export interface DatabaseSchema {
  users: User[];
  specialists: Specialiste[];
  guichets: Guichet[];
  rooms: Room[];
  parents: Parent[];
  children: Enfant[];
  appointments: RendezVous[];
  consultations: Consultation[];
  bilans: Bilan[];
  documents: Document[];
  internalMessages: MessageInterne[];
  notifications: Notification[];
  parametres: Parametres;
  auditLogs: AuditLog[];
  seriousGameResults: SeriousGameResult[];
}
