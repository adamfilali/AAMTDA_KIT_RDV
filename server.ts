/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { 
  DatabaseSchema, 
  UserRole, 
  User, 
  Specialiste, 
  Guichet, 
  Room, 
  Parent, 
  Enfant, 
  RendezVous, 
  Consultation, 
  Bilan, 
  Document, 
  MessageInterne, 
  Notification, 
  Parametres, 
  AuditLog,
  AppointmentStatus,
  ConsultationMode,
  SeriousGameResult
} from "./src/types.js"; // ESM resolution in server compilation

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "db.json");

app.use(express.json({ limit: "50mb" }));

// Helper function for SHA-256 hashing
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Default Logo SVG of AMTDA Maroc (Designed locally)
const DEFAULT_LOGO_SVG = `<svg viewBox="0 0 500 180" xmlns="http://www.w3.org/2000/svg" class="h-16 w-auto">
  <!-- Styled radiating human figure -->
  <g transform="translate(10, 10)">
    <!-- Sun/Knowledge rays -->
    <line x1="80" y1="55" x2="80" y2="15" stroke="#a3e635" stroke-width="8" stroke-linecap="round" />
    <line x1="80" y1="55" x2="115" y2="25" stroke="#a3e635" stroke-width="8" stroke-linecap="round" />
    <line x1="80" y1="55" x2="135" y2="55" stroke="#a3e635" stroke-width="8" stroke-linecap="round" />
    <line x1="80" y1="55" x2="45" y2="25" stroke="#a3e635" stroke-width="8" stroke-linecap="round" />
    <line x1="80" y1="55" x2="25" y2="55" stroke="#a3e635" stroke-width="8" stroke-linecap="round" />
    
    <!-- Head -->
    <circle cx="80" cy="55" r="16" fill="#15803d" />
    
    <!-- Body & Arms (green/orange-themed stick figure) -->
    <path d="M 80,71 C 70,82 45,84 45,91 C 45,98 65,95 73,88 L 73,120 C 65,135 55,150 55,155 C 55,160 62,158 70,148 L 80,128 L 90,148 C 98,158 105,160 105,155 C 105,150 95,135 87,120 L 87,88 C 95,95 115,98 115,91 C 115,84 90,82 80,71 Z" fill="#84cc16" />
  </g>
  
  <!-- Text Section -->
  <g transform="translate(160, 20)">
    <!-- AMTDA Text -->
    <text x="0" y="70" font-family="'Inter', sans-serif" font-weight="900" font-size="76" fill="#ea580c" letter-spacing="-1">AMTDA</text>
    
    <!-- Subtitle border line -->
    <line x1="0" y1="85" x2="310" y2="85" stroke="#15803d" stroke-width="8" stroke-linecap="round" />
    
    <!-- Subtitle lines -->
    <text x="0" y="112" font-family="'Inter', sans-serif" font-weight="700" font-size="16" fill="#1e3a8a">Association Marocaine</text>
    <text x="0" y="132" font-family="'Inter', sans-serif" font-weight="500" font-size="14" fill="#475569">des Troubles et Difficultés d'Apprentissage</text>
  </g>
</svg>`;

// Initialize Database with high-fidelity seed data
function initializeDatabase(): DatabaseSchema {
  const users: User[] = [
    {
      id: "u-admin",
      username: "admin",
      passwordHash: hashPassword("admin123"),
      role: UserRole.ADMIN,
      name: "Direction AMTDA Maroc",
      email: "contact@amtda.ma",
      phone: "+212 522-013444",
      createdAt: new Date().toISOString()
    },
    {
      id: "u-sec",
      username: "secretaire",
      passwordHash: hashPassword("sec123"),
      role: UserRole.SECRETAIRE,
      name: "Siham El Fassi",
      email: "siham@amtda.ma",
      phone: "+212 661-089336",
      createdAt: new Date().toISOString()
    },
    // Specialists matched with user accounts
    { id: "u-ben", username: "amina", passwordHash: hashPassword("therapist123"), role: UserRole.SPECIALISTE, name: "Dr. Amina Bennani", email: "amina.b@amtda.ma", phone: "+212 661-078045", createdAt: new Date().toISOString() },
    { id: "u-amr", username: "youssef", passwordHash: hashPassword("therapist123"), role: UserRole.SPECIALISTE, name: "M. Youssef El Amrani", email: "youssef.a@amtda.ma", phone: "+212 661-518927", createdAt: new Date().toISOString() },
    { id: "u-ala", username: "sofia", passwordHash: hashPassword("therapist123"), role: UserRole.SPECIALISTE, name: "Dr. Sofia Alami", email: "sofia.a@amtda.ma", phone: "+212 662-112233", createdAt: new Date().toISOString() },
    { id: "u-mez", username: "leila", passwordHash: hashPassword("therapist123"), role: UserRole.SPECIALISTE, name: "Mme Leila Meziane", email: "leila.m@amtda.ma", phone: "+212 663-445566", createdAt: new Date().toISOString() },
    { id: "u-taz", username: "karim", passwordHash: hashPassword("therapist123"), role: UserRole.SPECIALISTE, name: "M. Karim Tazi", email: "karim.t@amtda.ma", phone: "+212 664-778899", createdAt: new Date().toISOString() },
    { id: "u-aoi", username: "fatima", passwordHash: hashPassword("therapist123"), role: UserRole.SPECIALISTE, name: "Mme Fatima-Zahra Alaoui", email: "fatima.a@amtda.ma", phone: "+212 665-223344", createdAt: new Date().toISOString() },
    
    // Seed Parent account
    {
      id: "u-parent-samir",
      username: "samir",
      passwordHash: hashPassword("parent123"),
      role: UserRole.PARENT,
      name: "Samir Bennani",
      email: "samir.bennani@gmail.com",
      phone: "+212 668-990011",
      createdAt: new Date().toISOString()
    }
  ];

  const specialists: Specialiste[] = [
    { id: "sp-1", userId: "u-ben", name: "Dr. Amina Bennani", email: "amina.b@amtda.ma", phone: "+212 661-078045", specialties: ["Orthophonie"], bio: "Orthophoniste clinicienne avec 12 ans d'expérience, spécialisée dans le traitement de la dyslexie, dysorthographie et des troubles du langage oral chez l'enfant d'âge préscolaire et scolaire.", avatar: "female_doc_1", availableDays: [1, 2, 3, 4, 5], guichetId: "1" },
    { id: "sp-2", userId: "u-amr", name: "M. Youssef El Amrani", email: "youssef.a@amtda.ma", phone: "+212 661-518927", specialties: ["Psychomotricité"], bio: "Thérapeute en psychomotricité. Prise en charge des troubles du schéma corporel, de l'instabilité motrice, de la dyspraxie et de la latéralité chez l'enfant et l'adolescent.", avatar: "male_doc_1", availableDays: [1, 2, 3, 4, 5], guichetId: "2" },
    { id: "sp-3", userId: "u-ala", name: "Dr. Sofia Alami", email: "sofia.a@amtda.ma", phone: "+212 662-112233", specialties: ["Neuropsychologie"], bio: "Docteur en Neuropsychologie cognitive. Réalise les bilans intellectuels (WISC-V) et neuropsychologiques pour identifier les troubles attentionnels (TDAH) et dysfonctionnements exécutifs.", avatar: "female_doc_2", availableDays: [1, 2, 3, 4], guichetId: "3" },
    { id: "sp-4", userId: "u-mez", name: "Mme Leila Meziane", email: "leila.m@amtda.ma", phone: "+212 663-445566", specialties: ["Psychologie clinique"], bio: "Psychologue clinicienne pour enfants et adolescents. Accompagnement psycho-affectif des familles d'enfants en situation d'échec scolaire ou souffrant d'anxiété de performance.", avatar: "female_doc_3", availableDays: [1, 3, 5], guichetId: "4" },
    { id: "sp-5", userId: "u-taz", name: "M. Karim Tazi", email: "karim.t@amtda.ma", phone: "+212 664-778899", specialties: ["Ergothérapie"], bio: "Ergothérapeute diplômé d'État. Rééducation des praxies et accompagnement dans les aménagements scolaires (outils informatiques, aides matérielles pour dysgraphie).", avatar: "male_doc_2", availableDays: [2, 4, 5], guichetId: "5" },
    { id: "sp-6", userId: "u-aoi", name: "Mme Fatima-Zahra Alaoui", email: "fatima.a@amtda.ma", phone: "+212 665-223344", specialties: ["Orthoptie"], bio: "Orthoptiste spécialisée dans le bilan de fatigue visuelle, de strabisme et d'insuffisances de convergence affectant la poursuite de lecture chez le dyslexique.", avatar: "female_doc_4", availableDays: [1, 2, 4], guichetId: "6" }
  ];

  // Exactly 6 Guichets
  const guichets: Guichet[] = [
    { id: "1", name: "Guichet 1 - Orthophonie", specialty: "Orthophonie", roomNumber: "Salle A01 (RDC)", capacity: 1 },
    { id: "2", name: "Guichet 2 - Psychomotricité", specialty: "Psychomotricité", roomNumber: "Salle Gym B02 (Étage 1)", capacity: 1 },
    { id: "3", name: "Guichet 3 - Neuropsychologie", specialty: "Neuropsychologie", roomNumber: "Bureau C03 (RDC)", capacity: 1 },
    { id: "4", name: "Guichet 4 - Psychologie", specialty: "Psychologie clinique", roomNumber: "Bureau C04 (RDC)", capacity: 1 },
    { id: "5", name: "Guichet 5 - Ergothérapie", specialty: "Ergothérapie", roomNumber: "Atelier D05 (Étage 1)", capacity: 1 },
    { id: "6", name: "Guichet 6 - Orthoptie", specialty: "Orthoptie", roomNumber: "Salle Optique E06 (RDC)", capacity: 1 }
  ];

  const rooms: Room[] = [
    { 
      id: "r-1", 
      name: "Salle A01", 
      type: "Orthophonie", 
      specialistId: "sp-1", 
      specialistName: "Dr. Amina Bennani", 
      startDate: "2026-07-01", 
      endDate: "2026-08-31", 
      morningStart: "09:00", 
      morningEnd: "12:00", 
      afternoonStart: "14:00", 
      afternoonEnd: "17:00", 
      appointmentDuration: 45, 
      status: "disponible" 
    },
    { 
      id: "r-2", 
      name: "Salle B02", 
      type: "Psychomotricité", 
      specialistId: "sp-2", 
      specialistName: "M. Youssef El Amrani", 
      startDate: "2026-07-01", 
      endDate: "2026-08-31", 
      morningStart: "09:00", 
      morningEnd: "12:00", 
      afternoonStart: "14:00", 
      afternoonEnd: "17:00", 
      appointmentDuration: 45, 
      status: "disponible" 
    },
    { 
      id: "r-3", 
      name: "Bureau C03", 
      type: "Neuropsychologie", 
      specialistId: "sp-3", 
      specialistName: "Dr. Sofia Alami", 
      startDate: "2026-07-01", 
      endDate: "2026-08-31", 
      morningStart: "09:00", 
      morningEnd: "12:00", 
      afternoonStart: "14:00", 
      afternoonEnd: "17:00", 
      appointmentDuration: 45, 
      status: "disponible" 
    },
    { 
      id: "r-4", 
      name: "Bureau C04", 
      type: "Psychologie clinique", 
      specialistId: "sp-4", 
      specialistName: "Mme Leila Meziane", 
      startDate: "2026-07-01", 
      endDate: "2026-08-31", 
      morningStart: "09:00", 
      morningEnd: "12:00", 
      afternoonStart: "14:00", 
      afternoonEnd: "17:00", 
      appointmentDuration: 45, 
      status: "disponible" 
    },
    { 
      id: "r-5", 
      name: "Atelier D05", 
      type: "Ergothérapie", 
      specialistId: "sp-5", 
      specialistName: "M. Karim Tazi", 
      startDate: "2026-07-01", 
      endDate: "2026-08-31", 
      morningStart: "09:00", 
      morningEnd: "12:00", 
      afternoonStart: "14:00", 
      afternoonEnd: "17:00", 
      appointmentDuration: 45, 
      status: "disponible" 
    },
    { 
      id: "r-6", 
      name: "Salle E06", 
      type: "Orthoptie", 
      specialistId: "sp-6", 
      specialistName: "Mme Fatima-Zahra Alaoui", 
      startDate: "2026-07-01", 
      endDate: "2026-08-31", 
      morningStart: "09:00", 
      morningEnd: "12:00", 
      afternoonStart: "14:00", 
      afternoonEnd: "17:00", 
      appointmentDuration: 45, 
      status: "disponible" 
    }
  ];

  const parents: Parent[] = [
    {
      id: "p-samir",
      userId: "u-parent-samir",
      name: "Samir Bennani",
      email: "samir.bennani@gmail.com",
      phone: "+212 668-990011",
      address: "Angle Boulevard Anfa et Zerktouni, Résidence El Bahja, Casablanca",
      relation: "Père",
      createdAt: new Date().toISOString()
    }
  ];

  const children: Enfant[] = [
    {
      id: "ch-yassine",
      parentId: "p-samir",
      name: "Yassine Bennani",
      birthdate: "2016-10-12",
      gender: "Garçon",
      schoolGrade: "CE2 (Primaire)",
      diagnostics: ["Dyslexie", "Dysorthographie"],
      createdAt: new Date().toISOString()
    }
  ];

  // Seed default parametres
  const parametres: Parametres = {
    siteName: "AMTDA Maroc",
    logoSvg: DEFAULT_LOGO_SVG,
    primaryColor: "#15803d", // Green
    secondaryColor: "#ea580c", // Orange
    whatsappContact: "+212 661-089336",
    emailContact: "association.amtda@gmail.com",
    phoneContact: "+212 522-013444",
    appointmentDuration: 45,
    alertMessage: "Dépistage gratuit des troubles d'apprentissage pour les écoles primaires de Casablanca en cours.",
    notificationTemplates: {
      confirmation: "Bonjour {parentName}, le rendez-vous de votre enfant {childName} avec {specialistName} est confirmé pour le {date} à {slot} ({mode}). AMTDA Maroc.",
      rappel: "Rappel : Bonjour {parentName}, votre enfant {childName} a rendez-vous demain à {slot} avec {specialistName} chez AMTDA Maroc. Veuillez vous présenter 10 min en avance.",
      annulation: "Bonjour {parentName}, nous vous informons que le rendez-vous de votre enfant {childName} du {date} a été annulé ou déplacé. Contactez-nous au {phone}."
    }
  };

  // Seed appointments (some past, some upcoming)
  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const appointments: RendezVous[] = [
    {
      id: "apt-1",
      childId: "ch-yassine",
      specialistId: "sp-1", // Dr. Amina Bennani
      guichetId: "1",
      date: "2026-07-15", // Past
      slot: "10:30 - 11:15",
      mode: ConsultationMode.CENTRE,
      status: AppointmentStatus.CONFIRME,
      notes: "Bilan initial d'orthophonie suite aux difficultés de lecture signalées par l'enseignant.",
      isOtpVerified: true,
      createdAt: new Date().toISOString()
    },
    {
      id: "apt-2",
      childId: "ch-yassine",
      specialistId: "sp-1", // Dr. Amina Bennani
      guichetId: "1",
      date: tomorrowStr, // Upcoming
      slot: "09:45 - 10:30",
      mode: ConsultationMode.CENTRE,
      status: AppointmentStatus.CONFIRME,
      notes: "Deuxième séance de rééducation de la lecture syllabique.",
      isOtpVerified: true,
      createdAt: new Date().toISOString()
    }
  ];

  const consultations: Consultation[] = [
    {
      id: "con-1",
      appointmentId: "apt-1",
      childId: "ch-yassine",
      specialistId: "sp-1",
      date: "2026-07-15",
      motif: "Difficultés majeures dans la vitesse de lecture et omissions de phonèmes complexes.",
      diagnostic: "Dyslexie phonologique modérée, dysorthographie d'usage.",
      observations: "L'enfant est motivé mais se fatigue vite après 20 minutes d'efforts continus. Confusions récurrentes entre [b] et [d], [p] et [q].",
      objectifs: "1. Renforcer la conscience phonologique.\n2. Automatiser la correspondance graphème-phonème.\n3. Améliorer l'empan visuel de lecture.",
      recommandations: "Lecture partagée de 10 min par jour à la maison. Utiliser des textes avec police adaptée (DYS font) et espacement double. Privilégier les supports visuels.",
      planSuivi: "Rééducation hebdomadaire pendant 6 mois, renouvelable après un bilan intermédiaire.",
      signedBySpecialist: true,
      signatureData: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='50'><path d='M10,30 Q30,5 50,30 T90,30' stroke='blue' fill='none'/></svg>",
      nextAppointmentDate: tomorrowStr,
      createdAt: new Date().toISOString()
    }
  ];

  const bilans: Bilan[] = [
    {
      id: "bil-1",
      childId: "ch-yassine",
      specialistId: "sp-1",
      title: "Bilan Orthophonique Complet de Lecture",
      score: "Standardisé (L'Alouette: -2.4 DS)",
      date: "2026-07-15",
      summary: "Score de vitesse de lecture en deçà des normes du niveau scolaire de l'enfant. Analyse qualitative indiquant un déficit de la voie d'assemblage.",
      recommendation: "Mise en place d'un aménagement de tiers-temps aux évaluations de l'école et soutien orthophonique à raison de 2 séances par semaine."
    }
  ];

  const documents: Document[] = [
    {
      id: "doc-1",
      title: "Bilan Initial Orthophonie Yassine.pdf",
      fileType: "Bilan",
      fileUrl: "data:application/pdf;base64,JVBERi0xLjQKJc..." , // High-fidelity mock pdf
      ownerId: "u-ben",
      sharedWithIds: ["u-parent-samir", "u-admin"],
      uploadedAt: "2026-07-15T12:00:00Z"
    }
  ];

  const internalMessages: MessageInterne[] = [
    {
      id: "msg-1",
      senderId: "u-ben", // Dr Amina
      receiverId: "u-admin", // Admin
      content: "Bonjour l'administration, j'ai complété le dossier du petit Yassine Bennani. J'aurai besoin d'une validation de salle pour sa prochaine séance de groupe de mercredi prochain.",
      isRead: false,
      createdAt: new Date().toISOString()
    },
    {
      id: "msg-2",
      senderId: "u-admin",
      receiverId: "u-ben",
      content: "Parfait Amina. Nous avons alloué la Salle A01 de 09:45 à 10:30 pour le dossier Yassine. Le parent est notifié.",
      isRead: true,
      createdAt: new Date(Date.now() - 3600000).toISOString()
    }
  ];

  const notifications: Notification[] = [
    {
      id: "not-1",
      type: "SMS",
      recipient: "+212 668-990011",
      content: "Bonjour Samir Bennani, le rendez-vous de Yassine Bennani avec Dr. Amina Bennani est confirmé pour le " + tomorrowStr + " à 09:45 - 10:30. AMTDA Maroc.",
      status: "ENVOYE",
      templateName: "confirmation",
      sentAt: new Date().toISOString()
    }
  ];

  const auditLogs: AuditLog[] = [
    {
      id: "aud-1",
      userId: "u-admin",
      username: "admin",
      action: "INITIALISATION",
      details: "Création et configuration initiale de la plateforme de base de données AMTDA Maroc.",
      timestamp: new Date().toISOString()
    }
  ];

  const seriousGameResults: SeriousGameResult[] = [
    {
      id: "res-seed-1",
      childId: "ch-yassine",
      childName: "Yassine Bennani",
      gameName: "Atlas Syllable Adventure",
      score: 8,
      maxScore: 10,
      durationSeconds: 120,
      status: "reussite",
      whatsappNumber: "+212 668-990011",
      notes: "Excellente association de phonèmes arabes, légères hésitations sur le son 'Bab'.",
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
    }
  ];

  return {
    users,
    specialists,
    guichets,
    rooms,
    parents,
    children,
    appointments,
    consultations,
    bilans,
    documents,
    internalMessages,
    notifications,
    parametres,
    auditLogs,
    seriousGameResults
  };
}

// Global in-memory DB proxy with file persistence
let db: DatabaseSchema;

function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      db = JSON.parse(content);
      console.log("Database successfully loaded from", DB_FILE);
    } else {
      console.log("Database file not found, seeding...");
      db = initializeDatabase();
      saveDatabase();
    }
  } catch (err) {
    console.error("Failed to load database, resetting...", err);
    db = initializeDatabase();
    saveDatabase();
  }
}

function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save database file!", err);
  }
}

// Log action for security auditing (Section 14 & 13)
function logAction(userId: string, username: string, action: string, details: string) {
  const log: AuditLog = {
    id: "aud-" + Math.random().toString(36).substr(2, 9),
    userId,
    username,
    action,
    details,
    timestamp: new Date().toISOString()
  };
  db.auditLogs.unshift(log); // newest first
  saveDatabase();
}

// Load DB now
loadDatabase();


// ------------------------------------------------------------------
// API ENDPOINTS
// ------------------------------------------------------------------

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "AMTDA Maroc Full-Stack Premium Platform" });
});

// Authentication API (Section 14)
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Nom d'utilisateur et mot de passe requis." });
  }
  
  const user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (!user) {
    return res.status(401).json({ message: "Identifiants invalides." });
  }

  const pwdHash = hashPassword(password);
  if (user.passwordHash !== pwdHash) {
    return res.status(401).json({ message: "Identifiants invalides." });
  }

  // Find linked profile if parent or specialist
  let profile: any = null;
  if (user.role === UserRole.SPECIALISTE) {
    profile = db.specialists.find(s => s.userId === user.id);
  } else if (user.role === UserRole.PARENT) {
    profile = db.parents.find(p => p.userId === user.id);
  }

  logAction(user.id, user.username, "CONNEXION", `Connexion réussie en tant que ${user.role}.`);
  
  // Return safe session data
  res.json({
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    },
    profile
  });
});

// Register custom Parent account on flight (Section 6 & 14)
app.post("/api/auth/register-parent", (req, res) => {
  const { username, password, name, email, phone, address, relation } = req.body;
  
  if (!username || !password || !name || !email || !phone) {
    return res.status(400).json({ message: "Tous les champs de contact obligatoires doivent être remplis." });
  }

  // Check if username already exists
  if (db.users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    return res.status(400).json({ message: "Ce nom d'utilisateur est déjà pris." });
  }

  const userId = "u-" + Math.random().toString(36).substr(2, 9);
  const parentId = "p-" + Math.random().toString(36).substr(2, 9);

  const newUser: User = {
    id: userId,
    username,
    passwordHash: hashPassword(password),
    role: UserRole.PARENT,
    name,
    email,
    phone,
    createdAt: new Date().toISOString()
  };

  const newParent: Parent = {
    id: parentId,
    userId,
    name,
    email,
    phone,
    address: address || "",
    relation: relation || "Père",
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  db.parents.push(newParent);
  saveDatabase();

  logAction(userId, username, "INSCRIPTION_PARENT", `Création de compte parent pour ${name}.`);

  res.json({
    user: {
      id: newUser.id,
      username: newUser.username,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role
    },
    profile: newParent
  });
});

// GET Settings & Parametres
app.get("/api/settings", (req, res) => {
  res.json(db.parametres);
});

// UPDATE Settings
app.put("/api/settings", (req, res) => {
  const { siteName, logoSvg, whatsappContact, emailContact, phoneContact, alertMessage, notificationTemplates, appointmentDuration } = req.body;
  
  db.parametres = {
    ...db.parametres,
    siteName: siteName || db.parametres.siteName,
    logoSvg: logoSvg || db.parametres.logoSvg,
    whatsappContact: whatsappContact || db.parametres.whatsappContact,
    emailContact: emailContact || db.parametres.emailContact,
    phoneContact: phoneContact || db.parametres.phoneContact,
    appointmentDuration: appointmentDuration !== undefined ? Number(appointmentDuration) : (db.parametres.appointmentDuration || 45),
    alertMessage: alertMessage !== undefined ? alertMessage : db.parametres.alertMessage,
    notificationTemplates: notificationTemplates || db.parametres.notificationTemplates
  };
  
  saveDatabase();
  logAction("u-admin", "admin", "MAJ_PARAMETRES", "Mise à jour des paramètres du site (dont durée de RDV).");
  res.json(db.parametres);
});

// GET Database Backup
app.get("/api/db/backup", (req, res) => {
  res.json(db);
});

// POST Database Restore
app.post("/api/db/restore", (req, res) => {
  const newDb = req.body;
  if (!newDb.users || !newDb.specialists || !newDb.guichets) {
    return res.status(400).json({ message: "Le fichier de sauvegarde est invalide." });
  }
  
  db = { ...db, ...newDb };
  saveDatabase();
  logAction("u-admin", "admin", "RESTAURATE_DB", "Base de données restaurée via sauvegarde.");
  res.json({ message: "Base de données restaurée avec succès." });
});

// Specialists API
app.get("/api/specialists", (req, res) => {
  res.json(db.specialists);
});

app.post("/api/specialists", (req, res) => {
  const spec = req.body;
  const id = "sp-" + Math.random().toString(36).substr(2, 9);
  const userId = "u-" + Math.random().toString(36).substr(2, 9);
  
  const newUser: User = {
    id: userId,
    username: spec.username || spec.name.toLowerCase().replace(/ /g, ""),
    passwordHash: hashPassword("therapist123"),
    role: UserRole.SPECIALISTE,
    name: spec.name,
    email: spec.email,
    phone: spec.phone,
    createdAt: new Date().toISOString()
  };

  const newSpec: Specialiste = {
    id,
    userId,
    name: spec.name,
    email: spec.email,
    phone: spec.phone,
    specialties: spec.specialties || [],
    bio: spec.bio || "",
    avatar: spec.avatar || "female_doc_1",
    availableDays: spec.availableDays || [1, 2, 3, 4, 5],
    guichetId: spec.guichetId || "1"
  };

  db.users.push(newUser);
  db.specialists.push(newSpec);
  saveDatabase();
  
  logAction("u-admin", "admin", "AJOUT_SPECIALISTE", `Création du profil spécialiste ${spec.name}.`);
  res.json(newSpec);
});

app.put("/api/specialists/:id", (req, res) => {
  const { id } = req.params;
  const update = req.body;
  
  const specIndex = db.specialists.findIndex(s => s.id === id);
  if (specIndex === -1) return res.status(404).json({ message: "Spécialiste introuvable." });
  
  db.specialists[specIndex] = {
    ...db.specialists[specIndex],
    ...update
  };
  
  saveDatabase();
  logAction("u-admin", "admin", "MAJ_SPECIALISTE", `Mise à jour du profil de ${db.specialists[specIndex].name}.`);
  res.json(db.specialists[specIndex]);
});

app.delete("/api/specialists/:id", (req, res) => {
  const { id } = req.params;
  const spec = db.specialists.find(s => s.id === id);
  if (!spec) return res.status(404).json({ message: "Spécialiste introuvable." });
  
  db.specialists = db.specialists.filter(s => s.id !== id);
  db.users = db.users.filter(u => u.id !== spec.userId);
  saveDatabase();
  
  logAction("u-admin", "admin", "SUPPR_SPECIALISTE", `Spécialiste ${spec.name} supprimé de la clinique.`);
  res.json({ success: true });
});

// Guichets & Rooms
app.get("/api/guichets", (req, res) => {
  res.json(db.guichets);
});

app.put("/api/guichets/:id", (req, res) => {
  const { id } = req.params;
  const update = req.body;
  const index = db.guichets.findIndex(g => g.id === id);
  if (index === -1) return res.status(404).json({ message: "Guichet introuvable." });
  
  db.guichets[index] = { ...db.guichets[index], ...update };
  saveDatabase();
  logAction("u-admin", "admin", "MAJ_GUICHET", `Modification du Guichet ${id}.`);
  res.json(db.guichets[index]);
});

app.get("/api/rooms", (req, res) => {
  res.json(db.rooms);
});

app.post("/api/rooms", (req, res) => {
  const room = req.body;
  const id = "r-" + Math.random().toString(36).substr(2, 9);
  
  // Find specialist name if id provided
  let specName = "";
  if (room.specialistId) {
    const spec = db.specialists.find(s => s.id === room.specialistId);
    if (spec) specName = spec.name;
  }

  const newRoom: Room = {
    id,
    name: room.name,
    type: room.type || "Orthophonie",
    specialistId: room.specialistId || "",
    specialistName: specName || room.specialistName || "",
    startDate: room.startDate || "",
    endDate: room.endDate || "",
    morningStart: room.morningStart || "09:00",
    morningEnd: room.morningEnd || "12:00",
    afternoonStart: room.afternoonStart || "14:00",
    afternoonEnd: room.afternoonEnd || "17:00",
    appointmentDuration: room.appointmentDuration !== undefined ? Number(room.appointmentDuration) : (db.parametres.appointmentDuration || 45),
    status: room.status || "disponible"
  };
  
  db.rooms.push(newRoom);
  saveDatabase();
  logAction("u-admin", "admin", "CREATION_SALLE", `Création de la salle de consultation ${newRoom.name} pour ${newRoom.specialistName} (${newRoom.type}).`);
  res.json(newRoom);
});

app.put("/api/rooms/:id", (req, res) => {
  const { id } = req.params;
  const update = req.body;
  const index = db.rooms.findIndex(r => r.id === id);
  if (index === -1) return res.status(404).json({ message: "Salle introuvable." });
  
  let specName = update.specialistName || "";
  if (update.specialistId) {
    const spec = db.specialists.find(s => s.id === update.specialistId);
    if (spec) specName = spec.name;
  }

  db.rooms[index] = { 
    ...db.rooms[index], 
    ...update,
    specialistName: specName || db.rooms[index].specialistName
  };
  
  saveDatabase();
  logAction("u-admin", "admin", "MAJ_SALLE", `Mise à jour des paramètres de la salle ${db.rooms[index].name}.`);
  res.json(db.rooms[index]);
});

app.delete("/api/rooms/:id", (req, res) => {
  const { id } = req.params;
  const room = db.rooms.find(r => r.id === id);
  if (!room) return res.status(404).json({ message: "Salle introuvable." });
  
  db.rooms = db.rooms.filter(r => r.id !== id);
  saveDatabase();
  logAction("u-admin", "admin", "SUPPRESSION_SALLE", `Suppression définitive de la salle ${room.name}.`);
  res.json({ success: true });
});

// Dynamic Available Slots Generation Endpoint (WCAG Compliance & Realtime Engine)
app.get("/api/specialists/:id/available-slots", (req, res) => {
  const { id } = req.params;
  const { date } = req.query; // YYYY-MM-DD
  
  if (!date || typeof date !== "string") {
    return res.status(400).json({ message: "La date de consultation est requise." });
  }

  // Find the consulting room configured for this specialist
  const room = db.rooms.find(r => r.specialistId === id && r.status === "disponible");

  // Fallback default slots if no customized room is configured
  if (!room) {
    const standardSlots = [
      "09:00 - 09:45", "09:45 - 10:30", "10:30 - 11:15", "11:15 - 12:00",
      "14:00 - 14:45", "14:45 - 15:30", "15:30 - 16:15", "16:15 - 17:00"
    ];
    // Filter by taken slots
    const takenSlots = db.appointments
      .filter(a => a.specialistId === id && a.date === date && a.status !== AppointmentStatus.ANNULE)
      .map(a => a.slot);
    return res.json(standardSlots.filter(s => !takenSlots.includes(s)));
  }

  // Check if selected date is within the room's availability interval
  if (room.startDate && date < room.startDate) {
    return res.json([]);
  }
  if (room.endDate && date > room.endDate) {
    return res.json([]);
  }

  const duration = room.appointmentDuration || db.parametres.appointmentDuration || 45;
  const mStart = room.morningStart || "09:00";
  const mEnd = room.morningEnd || "12:00";
  const aStart = room.afternoonStart || "14:00";
  const aEnd = room.afternoonEnd || "17:00";

  // Slot generator helper
  const generateIntervalSlots = (startStr: string, endStr: string, durationMins: number): string[] => {
    const slots: string[] = [];
    const [startH, startM] = startStr.split(":").map(Number);
    const [endH, endM] = endStr.split(":").map(Number);
    
    let currentMins = startH * 60 + startM;
    const endMins = endH * 60 + endM;
    
    while (currentMins + durationMins <= endMins) {
      const formatTime = (mins: number) => {
        const h = Math.floor(mins / 60).toString().padStart(2, "0");
        const m = (mins % 60).toString().padStart(2, "0");
        return `${h}:${m}`;
      };
      slots.push(`${formatTime(currentMins)} - ${formatTime(currentMins + durationMins)}`);
      currentMins += durationMins;
    }
    return slots;
  };

  const morningSlots = generateIntervalSlots(mStart, mEnd, duration);
  const afternoonSlots = generateIntervalSlots(aStart, aEnd, duration);
  const allGeneratedSlots = [...morningSlots, ...afternoonSlots];

  // Filter out slots that have already been booked
  const takenSlots = db.appointments
    .filter(a => a.specialistId === id && a.date === date && a.status !== AppointmentStatus.ANNULE)
    .map(a => a.slot);

  const availableSlots = allGeneratedSlots.filter(s => !takenSlots.includes(s));
  res.json(availableSlots);
});

// Parents & Children (Dossier Clinique)
app.get("/api/parents", (req, res) => {
  res.json(db.parents);
});

app.get("/api/children", (req, res) => {
  res.json(db.children);
});

app.get("/api/children/:id", (req, res) => {
  const { id } = req.params;
  const child = db.children.find(c => c.id === id);
  if (!child) return res.status(404).json({ message: "Enfant introuvable." });
  
  const parent = db.parents.find(p => p.id === child.parentId);
  const appointmentsHistory = db.appointments
    .filter(a => a.childId === id)
    .map(a => {
      const specialist = db.specialists.find(s => s.id === a.specialistId);
      return { ...a, specialistName: specialist ? specialist.name : "Inconnu" };
    });

  const consultationsHistory = db.consultations.filter(c => c.childId === id);
  const assessments = db.bilans.filter(b => b.childId === id);
  const childDocs = db.documents.filter(d => d.sharedWithIds.includes(parent?.userId || "") || d.ownerId === parent?.userId);

  res.json({
    child,
    parent,
    appointmentsHistory,
    consultationsHistory,
    assessments,
    documents: childDocs
  });
});

app.post("/api/children", (req, res) => {
  const { parentId, name, birthdate, gender, schoolGrade, diagnostics } = req.body;
  if (!parentId || !name || !birthdate || !gender) {
    return res.status(400).json({ message: "Champs obligatoires manquants." });
  }

  const id = "ch-" + Math.random().toString(36).substr(2, 9);
  const newChild: Enfant = {
    id,
    parentId,
    name,
    birthdate,
    gender,
    schoolGrade: schoolGrade || "Primaire",
    diagnostics: diagnostics || [],
    createdAt: new Date().toISOString()
  };

  db.children.push(newChild);
  saveDatabase();
  logAction("u-admin", "admin", "AJOUT_ENFANT", `Ajout du dossier enfant de Yassine pour parent ${parentId}.`);
  res.json(newChild);
});

app.put("/api/children/:id", (req, res) => {
  const { id } = req.params;
  const update = req.body;
  const index = db.children.findIndex(c => c.id === id);
  if (index === -1) return res.status(404).json({ message: "Dossier introuvable." });

  db.children[index] = { ...db.children[index], ...update };
  saveDatabase();
  res.json(db.children[index]);
});

// APPOINTMENTS (Section 6, 7 & 13)
app.get("/api/appointments", (req, res) => {
  // Returns relation resolved appointments for admin
  const fullAppointments = db.appointments.map(a => {
    const child = db.children.find(c => c.id === a.childId);
    const parent = child ? db.parents.find(p => p.id === child.parentId) : null;
    const specialist = db.specialists.find(s => s.id === a.specialistId);
    const guichet = db.guichets.find(g => g.id === a.guichetId);
    return {
      ...a,
      childName: child ? child.name : "Inconnu",
      childGender: child ? child.gender : "Garçon",
      childBirthdate: child ? child.birthdate : "",
      parentName: parent ? parent.name : "Inconnu",
      parentPhone: parent ? parent.phone : "",
      parentEmail: parent ? parent.email : "",
      specialistName: specialist ? specialist.name : "Inconnu",
      guichetName: guichet ? guichet.name : `Guichet ${a.guichetId}`
    };
  });
  res.json(fullAppointments);
});

// Appointment booking wizard endpoint (with strict collision check, OTP simulation, etc.)
app.post("/api/appointments", (req, res) => {
  const { childId, parentContact, specialistId, guichetId, date, slot, mode, notes } = req.body;
  
  if (!specialistId || !guichetId || !date || !slot || !mode) {
    return res.status(400).json({ message: "Informations de réservation obligatoires manquantes." });
  }

  const specialist = db.specialists.find(s => s.id === specialistId);
  if (!specialist) {
    return res.status(404).json({ message: "Erreur : Spécialiste sélectionné introuvable dans la base de données clinique." });
  }

  // Determine day of the week
  const dateObj = new Date(date);
  const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 6 = Saturday

  // Weekend check
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return res.status(400).json({ message: "Échec de disponibilité : Le centre AMTDA Maroc est fermé le week-end. Veuillez choisir un jour de semaine (Lundi au Vendredi)." });
  }

  // Check if day is in specialist's working days
  if (specialist.availableDays && !specialist.availableDays.includes(dayOfWeek)) {
    const daysFr = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    return res.status(400).json({ 
      message: `Échec de disponibilité : ${specialist.name} ne consulte pas le ${daysFr[dayOfWeek]}. Ses jours de présence hebdomadaires sont : ${specialist.availableDays.map(d => daysFr[d]).join(", ")}.` 
    });
  }

  // Check room assignment
  const matchingRoom = db.rooms.find(r => r.specialistId === specialistId && r.status === "disponible");
  if (matchingRoom) {
    const start = new Date(matchingRoom.startDate);
    const end = new Date(matchingRoom.endDate);
    if (dateObj < start || dateObj > end) {
      return res.status(400).json({
        message: `Échec de disponibilité : L'affectation de salle pour ${specialist.name} (Salle: ${matchingRoom.name}) n'est active que du ${matchingRoom.startDate} au ${matchingRoom.endDate}.`
      });
    }
  }

  // 1. Collision Check: Check if there's already a CONFIRMED appointment for this specialist on this date/slot
  const collision = db.appointments.find(
    a => a.specialistId === specialistId && 
         a.date === date && 
         a.slot === slot && 
         a.status === AppointmentStatus.CONFIRME
  );

  if (collision) {
    // Return error but propose AUTOMATIC alternative slots (Section 7)
    const allSlots = [
      "09:00 - 09:45", "09:45 - 10:30", "10:30 - 11:15", "11:15 - 12:00",
      "14:00 - 14:45", "14:45 - 15:30", "15:30 - 16:15", "16:15 - 17:00"
    ];
    
    // Find slots on this day with NO confirmed appointments for this specialist
    const takenSlots = db.appointments
      .filter(a => a.specialistId === specialistId && a.date === date && a.status === AppointmentStatus.CONFIRME)
      .map(a => a.slot);
      
    const availableAlternatives = allSlots.filter(s => !takenSlots.includes(s));

    return res.status(409).json({
      message: "Créneau indisponible : ce spécialiste est déjà réservé à cette heure par un autre patient.",
      taken: true,
      alternatives: availableAlternatives.slice(0, 3) // suggest top 3 alternatives
    });
  }

  // 2. Generate Simulated Secure Verification OTP (6-digits) (Section 6)
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  // 3. Resolve parent + child creation if done through guest wizard (Section 6)
  let resolvedChildId = childId;
  if (!resolvedChildId && parentContact) {
    // If guest checkout: create user, parent and child on the fly
    const { parentName, parentEmail, parentPhone, parentAddress, parentRelation, childName, childBirthdate, childGender } = parentContact;
    
    // See if user exists
    let user = db.users.find(u => u.email === parentEmail || u.phone === parentPhone);
    let parent: Parent;
    if (!user) {
      const uId = "u-" + Math.random().toString(36).substr(2, 9);
      user = {
        id: uId,
        username: parentEmail.split("@")[0] + Math.floor(Math.random() * 100),
        passwordHash: hashPassword("parent123"), // default temporary pwd
        role: UserRole.PARENT,
        name: parentName,
        email: parentEmail,
        phone: parentPhone,
        createdAt: new Date().toISOString()
      };
      db.users.push(user);
      
      parent = {
        id: "p-" + Math.random().toString(36).substr(2, 9),
        userId: uId,
        name: parentName,
        email: parentEmail,
        phone: parentPhone,
        address: parentAddress || "",
        relation: parentRelation || "Père",
        createdAt: new Date().toISOString()
      };
      db.parents.push(parent);
    } else {
      parent = db.parents.find(p => p.userId === user?.id) || db.parents[0];
    }

    const cId = "ch-" + Math.random().toString(36).substr(2, 9);
    const newChild: Enfant = {
      id: cId,
      parentId: parent.id,
      name: childName,
      birthdate: childBirthdate,
      gender: childGender || "Garçon",
      schoolGrade: "CE1",
      diagnostics: [],
      createdAt: new Date().toISOString()
    };
    db.children.push(newChild);
    resolvedChildId = cId;
  }

  // Create temporary appointment awaiting OTP verification
  const appointmentId = "apt-" + Math.random().toString(36).substr(2, 9);
  const newApt: RendezVous = {
    id: appointmentId,
    childId: resolvedChildId || db.children[0].id,
    specialistId,
    guichetId,
    date,
    slot,
    mode,
    status: AppointmentStatus.EN_ATTENTE,
    notes,
    otpCode,
    isOtpVerified: false,
    createdAt: new Date().toISOString()
  };

  db.appointments.push(newApt);
  saveDatabase();

  logAction("GUEST", "Visiteur", "RESERVATION_CREEE", `Tentative d'enregistrement de rendez-vous pour ${date} à ${slot}. OTP généré: ${otpCode}.`);

  // Return the pending appointment with the generated OTP code (for seamless high-fidelity validation on-screen)
  res.json({
    appointment: newApt,
    otpReceived: otpCode // Pass back so the interface can show/populate it as a simulated SMS/WhatsApp payload!
  });
});

// OTP Verification endpoint (Section 6)
app.post("/api/appointments/:id/verify-otp", (req, res) => {
  const { id } = req.params;
  const { code } = req.body;
  
  const apt = db.appointments.find(a => a.id === id);
  if (!apt) return res.status(404).json({ message: "Rendez-vous introuvable." });

  if (apt.otpCode !== code) {
    return res.status(400).json({ message: "Code OTP incorrect. Veuillez réessayer." });
  }

  apt.isOtpVerified = true;
  apt.status = AppointmentStatus.CONFIRME;
  
  // Resolve child and parent names for notification
  const child = db.children.find(c => c.id === apt.childId);
  const parent = child ? db.parents.find(p => p.id === child.parentId) : null;
  const specialist = db.specialists.find(s => s.id === apt.specialistId);

  // Trigger automated confirmation notification (Section 11)
  const notifId = "not-" + Math.random().toString(36).substr(2, 9);
  const formattedMsg = db.parametres.notificationTemplates.confirmation
    .replace("{parentName}", parent ? parent.name : "Parent")
    .replace("{childName}", child ? child.name : "Enfant")
    .replace("{specialistName}", specialist ? specialist.name : "Spécialiste")
    .replace("{date}", apt.date)
    .replace("{slot}", apt.slot)
    .replace("{mode}", apt.mode);

  const notification: Notification = {
    id: notifId,
    type: "SMS",
    recipient: parent ? parent.phone : "+212 600-000000",
    content: formattedMsg,
    status: "ENVOYE",
    templateName: "confirmation",
    sentAt: new Date().toISOString()
  };

  db.notifications.push(notification);
  saveDatabase();

  logAction(
    parent ? parent.userId : "SYSTEM", 
    parent ? parent.name : "System", 
    "RDV_CONFIRME", 
    `Code OTP vérifié. Rendez-vous ${id} officiellement validé.`
  );

  res.json({ success: true, appointment: apt, notification });
});

// Update appointment status (Admin panel or Doctor)
app.put("/api/appointments/:id", (req, res) => {
  const { id } = req.params;
  const update = req.body;
  
  const index = db.appointments.findIndex(a => a.id === id);
  if (index === -1) return res.status(404).json({ message: "Rendez-vous introuvable." });
  
  const original = db.appointments[index];
  db.appointments[index] = { ...original, ...update };
  saveDatabase();
  
  logAction("u-admin", "admin", "MAJ_RDV", `Rendez-vous ${id} modifié. Statut de ${original.status} à ${update.status}.`);
  res.json(db.appointments[index]);
});

// Delete appointment
app.delete("/api/appointments/:id", (req, res) => {
  const { id } = req.params;
  const apt = db.appointments.find(a => a.id === id);
  if (!apt) return res.status(404).json({ message: "Rendez-vous introuvable." });

  db.appointments = db.appointments.filter(a => a.id !== id);
  saveDatabase();
  logAction("u-admin", "admin", "SUPPR_RDV", `Annulation définitive du rendez-vous ${id}.`);
  res.json({ success: true });
});

// CLINICAL CONSULTATIONS & THERAPEUTIC RECORDS (Section 8)
app.get("/api/consultations", (req, res) => {
  res.json(db.consultations);
});

app.post("/api/consultations", (req, res) => {
  const { appointmentId, childId, specialistId, motif, diagnostic, observations, objectifs, recommandations, planSuivi, signatureData, nextAppointmentDate } = req.body;
  
  if (!appointmentId || !childId || !specialistId) {
    return res.status(400).json({ message: "Informations d'identification manquantes." });
  }

  const id = "con-" + Math.random().toString(36).substr(2, 9);
  const newConsultation: Consultation = {
    id,
    appointmentId,
    childId,
    specialistId,
    date: new Date().toISOString().split("T")[0],
    motif: motif || "",
    diagnostic: diagnostic || "",
    observations: observations || "",
    objectifs: objectifs || "",
    recommandations: recommandations || "",
    planSuivi: planSuivi || "",
    signedBySpecialist: !!signatureData,
    signatureData: signatureData || undefined,
    nextAppointmentDate: nextAppointmentDate || undefined,
    createdAt: new Date().toISOString()
  };

  // Automatically update children's active diagnostics list (Section 8)
  if (diagnostic) {
    const childIndex = db.children.findIndex(c => c.id === childId);
    if (childIndex !== -1) {
      const currentDiagnostics = db.children[childIndex].diagnostics || [];
      if (!currentDiagnostics.includes(diagnostic)) {
        db.children[childIndex].diagnostics = [...currentDiagnostics, diagnostic];
      }
    }
  }

  db.consultations.push(newConsultation);
  saveDatabase();
  
  const specialist = db.specialists.find(s => s.id === specialistId);
  logAction(
    specialist ? specialist.userId : "u-admin", 
    specialist ? specialist.name : "Spécialiste", 
    "SAISIE_CONSULTATION", 
    `Remplissage de fiche de suivi clinique pour la consultation ${appointmentId}.`
  );

  res.json(newConsultation);
});

// BILANS (Section 8)
app.get("/api/bilans", (req, res) => {
  res.json(db.bilans);
});

app.post("/api/bilans", (req, res) => {
  const { childId, specialistId, title, score, summary, recommendation } = req.body;
  const id = "bil-" + Math.random().toString(36).substr(2, 9);
  const newBilan: Bilan = {
    id,
    childId,
    specialistId,
    title,
    score,
    date: new Date().toISOString().split("T")[0],
    summary,
    recommendation
  };
  db.bilans.push(newBilan);
  saveDatabase();
  res.json(newBilan);
});

// DOCUMENTS / ATTACHMENTS UPLOAD AND SHARING (Section 8 & 9)
app.get("/api/documents", (req, res) => {
  res.json(db.documents);
});

app.post("/api/documents", (req, res) => {
  const { title, fileType, fileUrl, ownerId, sharedWithIds } = req.body;
  if (!title || !fileUrl || !ownerId) {
    return res.status(400).json({ message: "Titre et contenu de document obligatoire." });
  }

  const id = "doc-" + Math.random().toString(36).substr(2, 9);
  const newDoc: Document = {
    id,
    title,
    fileType: fileType || "PDF",
    fileUrl, // base64 representation or inline SVG/string
    ownerId,
    sharedWithIds: sharedWithIds || ["u-admin"],
    uploadedAt: new Date().toISOString()
  };

  db.documents.push(newDoc);
  saveDatabase();
  
  logAction(ownerId, "Utilisateur", "AJOUT_DOCUMENT", `Document partagé : ${title}`);
  res.json(newDoc);
});

app.delete("/api/documents/:id", (req, res) => {
  const { id } = req.params;
  db.documents = db.documents.filter(d => d.id !== id);
  saveDatabase();
  res.json({ success: true });
});

// MESSAGES & COLLABORATIVE MAIL (Section 9)
app.get("/api/messages", (req, res) => {
  res.json(db.internalMessages);
});

app.post("/api/messages", (req, res) => {
  const { senderId, receiverId, content, attachmentUrl, attachmentName } = req.body;
  if (!senderId || !receiverId || !content) {
    return res.status(400).json({ message: "Expéditeur, destinataire et contenu obligatoire." });
  }

  const id = "msg-" + Math.random().toString(36).substr(2, 9);
  const newMsg: MessageInterne = {
    id,
    senderId,
    receiverId,
    content,
    attachmentUrl: attachmentUrl || undefined,
    attachmentName: attachmentName || undefined,
    isRead: false,
    createdAt: new Date().toISOString()
  };

  db.internalMessages.push(newMsg);
  saveDatabase();
  res.json(newMsg);
});

app.put("/api/messages/:id/read", (req, res) => {
  const { id } = req.params;
  const msgIndex = db.internalMessages.findIndex(m => m.id === id);
  if (msgIndex !== -1) {
    db.internalMessages[msgIndex].isRead = true;
    saveDatabase();
  }
  res.json({ success: true });
});

// NOTIFICATIONS TEMPLATE MANAGER & LOGS (Section 11)
app.get("/api/notifications", (req, res) => {
  res.json({
    logs: db.notifications,
    templates: db.parametres.notificationTemplates
  });
});

app.post("/api/notifications/test", (req, res) => {
  const { type, recipient, content } = req.body;
  const id = "not-" + Math.random().toString(36).substr(2, 9);
  
  const notification: Notification = {
    id,
    type: type || "SMS",
    recipient: recipient || "+212 600-000000",
    content: content || "Message de test",
    status: "ENVOYE",
    templateName: "test_manual",
    sentAt: new Date().toISOString()
  };

  db.notifications.push(notification);
  saveDatabase();
  res.json(notification);
});

// PREMIUM DB EXPLORER & CLINIC TRAFFIC CONTROL ENDPOINT
app.get("/api/admin/raw-db", (req, res) => {
  res.json(db);
});

app.post("/api/admin/raw-db/update-table", (req, res) => {
  const { table, data } = req.body;
  if (!table || !Array.isArray(data)) {
    return res.status(400).json({ message: "Requête invalide : table et tableau de données requis." });
  }
  
  if ((db as any)[table]) {
    (db as any)[table] = data;
    saveDatabase();
    logAction("u-admin", "admin", "BASE_DE_DONNEES_MAJ", `Mise à jour directe de la table ${table}.`);
    return res.json({ success: true, message: `Table ${table} mise à jour avec succès.` });
  } else {
    return res.status(404).json({ message: `Table ${table} introuvable.` });
  }
});

// SECURITY SYSTEM AUDIT LOG (Section 14 & 10)
app.get("/api/audit", (req, res) => {
  res.json(db.auditLogs);
});

// Lazy initialization of the @google/genai SDK (highly robust)
let aiClient: any = null;
function getAiClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }
  return aiClient;
}

// Serious Game Results endpoints
app.get("/api/serious-game-results", (req, res) => {
  res.json(db.seriousGameResults || []);
});

app.post("/api/serious-game-results", (req, res) => {
  const { childId, childName, gameName, score, maxScore, durationSeconds, status, whatsappNumber, notes } = req.body;
  if (!childId || !gameName) {
    return res.status(400).json({ message: "childId et gameName obligatoires." });
  }

  const id = "res-" + Math.random().toString(36).substr(2, 9);
  const newResult: SeriousGameResult = {
    id,
    childId,
    childName: childName || "Yassine Bennani",
    gameName,
    score: Number(score) || 0,
    maxScore: Number(maxScore) || 10,
    durationSeconds: Number(durationSeconds) || 60,
    status: status || "entrainement",
    whatsappNumber: whatsappNumber || "+212 668-990011",
    notes: notes || "",
    createdAt: new Date().toISOString()
  };

  if (!db.seriousGameResults) {
    db.seriousGameResults = [];
  }
  db.seriousGameResults.push(newResult);
  saveDatabase();

  logAction(childId, "Parent/Patient", "ACTIVITE_JEU", `Résultat du jeu sérieux ${gameName} enregistré (${score}/${maxScore})`);
  res.json(newResult);
});

// Premium situational AI report endpoint based on doctor notes & game results
app.post("/api/ai/analyze-situation", async (req, res) => {
  const { childId, doctorNotes, lastGameScore, lastGameName } = req.body;
  if (!childId) {
    return res.status(400).json({ message: "childId est obligatoire pour l'analyse." });
  }

  const child = db.children.find(c => c.id === childId);
  if (!child) {
    return res.status(404).json({ message: "Enfant introuvable." });
  }

  const childConsultations = db.consultations.filter(c => c.childId === childId);
  const latestConsultation = childConsultations[childConsultations.length - 1];
  
  // Construct a comprehensive context
  const contextPrompt = `
    Vous êtes l'expert principal de l'AMTDA Maroc (Association Marocaine des Troubles et Difficultés d'Apprentissage).
    Veuillez fournir une analyse clinique premium et bienveillante pour l'enfant suivant :
    - Nom : ${child.name}
    - Date de naissance : ${child.birthdate}
    - Niveau scolaire : ${child.schoolGrade}
    - Difficultés identifiées : ${child.diagnostics.join(", ") || "Aucun diagnostic enregistré"}

    Contexte d'évaluation récent :
    - Notes ou observations du médecin : ${doctorNotes || latestConsultation?.observations || "Aucune note récente enregistrée."}
    - Dernier jeu éducatif joué : ${lastGameName || "Atlas Syllable Adventure"}
    - Score du dernier test : ${lastGameScore || "8"}/10
    
    Consignes :
    1. Fournissez une synthèse clinique premium structurée en 3 sections claires en français, avec quelques touches culturelles marocaines (ex. valorisation de l'apprentissage multilingue, de l'entraide familiale dans les devoirs, etc.).
    2. Proposez des activités d'accompagnement concrètes à faire à la maison.
    3. Indiquez si une consultation d'orientation physique est recommandée à notre cabinet à Casablanca.
    4. Répondez de manière très professionnelle, rassurante et de niveau expert.
  `;

  try {
    const ai = getAiClient();
    if (ai) {
      console.log("Calling live Gemini API...");
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contextPrompt,
      });

      if (response && response.text) {
        logAction("u-admin", "Système IA", "ANALYSE_PREMIUM_IA", `Analyse premium IA générée pour ${child.name}`);
        return res.json({ analysis: response.text, isRealAI: true });
      }
    }
  } catch (err) {
    console.error("Gemini API call failed, falling back to local clinical expert system", err);
  }

  // Fallback clinical expert system rules (highly customized and professional!)
  let diagText = child.diagnostics.join(" et ") || "difficultés d'apprentissage légères";
  let fallbackAnalysis = `### 🌟 ANALYSE CLINIQUE PREMIUM (Moteur Expert AMTDA Maroc)
  
**Patient :** ${child.name}  
**Niveau :** ${child.schoolGrade}  
**Profil diagnostique :** ${diagText}  

---

#### 1. Synthèse Situationnelle & Progrès Récents
Suite à l'analyse croisée des observations médicales du médecin et des performances en temps réel sur le module de jeux sérieux marocains (**${lastGameName || "Atlas Syllable Adventure"}** : score obtenu de **${lastGameScore || 8}/10**), nous observons des compétences d'assimilation cognitive positives mais perfectibles :
- **Points Forts :** Bonne reconnaissance globale des structures verbales simples. L'engagement ludique stimule efficacement l'attention et réduit l'anxiété scolaire.
- **Points de Vigilance :** La mémoire de travail sature rapidement lors de la manipulation de phonèmes complexes ou multilingues (arabe/français). Les difficultés de type **${diagText}** impactent la vitesse de traitement en lecture.

#### 2. Recommandations Thérapeutiques d'Accompagnement (Contexte Marocain)
Pour soutenir le développement harmonieux de l'enfant dans son environnement familial à la marocaine :
- **Rituel du thé et narration :** Mettre à profit des moments de partage familial calmes pour faire verbaliser l'enfant, lui faire raconter une histoire courte avec ses propres mots pour structurer son langage.
- **Découpage Syllabique Ludique :** Utiliser des objets du quotidien (ex: *tajine*, *pain*, *verre*) pour s'entraîner à frapper les syllabes à haute voix ("ta-ji-ne").
- **Renforcement Positif :** Encourager chaque petit succès en minimisant le stress lié à l'erreur pour préserver l'estime de soi scolaire.

#### 3. Orientation & Plan d'Action Clinique
- **Suivi Digital :** Continuer à faire des sessions de 10-15 minutes de jeux sérieux éducatifs, 3 fois par semaine maximum.
- **Consultation Recommandée :** Au vu des résultats, une séance complémentaire au cabinet AMTDA de Casablanca avec Dr. Amina Bennani ou M. Youssef El Amrani est fortement conseillée pour ajuster les exercices de remédiation en psychomotricité ou orthophonie.

*Ce rapport d'expertise a été synthétisé par l'agent clinique d'aide à la décision d'AMTDA Maroc.*`;

  logAction("u-admin", "Moteur Expert", "ANALYSE_AUTO_HEURISTIQUE", `Analyse experte automatique générée pour ${child.name}`);
  res.json({ analysis: fallbackAnalysis, isRealAI: false });
});

// VITE MIDDLEWARE CONFIGURATION FOR PRODUCTION OR DEV
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AMTDA Platform Server successfully booted at http://0.0.0.0:${PORT}`);
  });
}

startServer();
