/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Users, 
  Calendar, 
  Settings, 
  Lock, 
  Activity, 
  ShieldAlert, 
  Plus, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  Search, 
  Download, 
  Upload, 
  RefreshCw, 
  Sliders, 
  FileText,
  BookOpen,
  HelpCircle
} from "lucide-react";
import { AppointmentStatus, ConsultationMode, UserRole } from "../types.js";
import { playPhoneRingSound } from "../utils/audio.js";

interface BackOfficeProps {
  disableAnimations: boolean;
}

export default function BackOffice({ disableAnimations }: BackOfficeProps) {
  const [adminLoggedIn, setAdminLoggedIn] = useState(true);
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Tab views
  const [activeTab, setActiveTab] = useState<"appointments" | "specialists" | "guichets" | "rooms" | "settings" | "audit" | "guide" | "database">("appointments");

  // DB Data states
  const [appointments, setAppointments] = useState<any[]>([]);
  const [specialists, setSpecialists] = useState<any[]>([]);
  const [guichets, setGuichets] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedSpecialistForDoc, setSelectedSpecialistForDoc] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  
  // Premium DB Explorer states
  const [rawDb, setRawDb] = useState<any>(null);
  const [selectedDbTable, setSelectedDbTable] = useState<string>("users");
  const [dbSearchQuery, setDbSearchQuery] = useState<string>("");
  const [trafficMetrics, setTrafficMetrics] = useState<any>({
    activeSessions: 14,
    queriesPerSecond: 2.8,
    memoryFootprint: "41.2 MB",
    lastSyncTime: new Date().toLocaleTimeString()
  });

  // Specialist adding form state
  const [showAddSpecialist, setShowAddSpecialist] = useState(false);
  const [newSpecName, setNewSpecName] = useState("");
  const [newSpecEmail, setNewSpecEmail] = useState("");
  const [newSpecPhone, setNewSpecPhone] = useState("");
  const [newSpecSpecialty, setNewSpecSpecialty] = useState("Orthophonie");
  const [newSpecBio, setNewSpecBio] = useState("");
  const [newSpecGuichet, setNewSpecGuichet] = useState("1");

  // Room adding/editing form states
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [roomName, setRoomName] = useState("");
  const [roomSpecialty, setRoomSpecialty] = useState("Orthophonie");
  const [roomSpecialistId, setRoomSpecialistId] = useState("");
  const [roomStartDate, setRoomStartDate] = useState("2026-07-20");
  const [roomEndDate, setRoomEndDate] = useState("2026-08-20");
  const [roomMorningStart, setRoomMorningStart] = useState("09:00");
  const [roomMorningEnd, setRoomMorningEnd] = useState("12:00");
  const [roomAfternoonStart, setRoomAfternoonStart] = useState("14:00");
  const [roomAfternoonEnd, setRoomAfternoonEnd] = useState("17:00");
  const [roomDuration, setRoomDuration] = useState(45);
  const [roomStatus, setRoomStatus] = useState<"disponible" | "occupee" | "maintenance">("disponible");

  // Settings form editing
  const [siteName, setSiteName] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [whatsappContact, setWhatsappContact] = useState("");
  const [emailContact, setEmailContact] = useState("");
  const [phoneContact, setPhoneContact] = useState("");
  const [appointmentDuration, setAppointmentDuration] = useState(45);
  const [notifConf, setNotifConf] = useState<any>({ confirmation: "", rappel: "", annulation: "" });

  // Backup file uploading ref
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "admin", password })
    })
      .then(async (res) => {
        setLoading(false);
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || "Identifiants administratifs invalides.");
        } else {
          setAdminLoggedIn(true);
          loadAdminData();
        }
      })
      .catch((err) => {
        setLoading(false);
        setError("Erreur serveur.");
      });
  };

  const loadAdminData = () => {
    fetch("/api/appointments")
      .then((res) => res.json())
      .then((data) => setAppointments(data))
      .catch((err) => console.error(err));

    fetch("/api/specialists")
      .then((res) => res.json())
      .then((data) => setSpecialists(data))
      .catch((err) => console.error(err));

    fetch("/api/guichets")
      .then((res) => res.json())
      .then((data) => setGuichets(data))
      .catch((err) => console.error(err));

    fetch("/api/rooms")
      .then((res) => res.json())
      .then((data) => setRooms(data))
      .catch((err) => console.error(err));

    fetch("/api/audit")
      .then((res) => res.json())
      .then((data) => setAuditLogs(data))
      .catch((err) => console.error(err));

    fetch("/api/admin/raw-db")
      .then((res) => res.json())
      .then((data) => setRawDb(data))
      .catch((err) => console.error("Error loading raw DB state", err));

    fetch("/api/documents")
      .then((res) => res.json())
      .then((data) => setDocuments(data))
      .catch((err) => console.error("Error loading documents", err));

    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setSiteSettings(data);
        setSiteName(data.siteName);
        setAlertMessage(data.alertMessage || "");
        setWhatsappContact(data.whatsappContact);
        setEmailContact(data.emailContact);
        setPhoneContact(data.phoneContact);
        setAppointmentDuration(data.appointmentDuration || 45);
        setNotifConf(data.notificationTemplates);
      })
      .catch((err) => console.error(err));
  };

  // Appointment confirmation approval (Section 10)
  const handleApproveAppointment = (aptId: string) => {
    fetch(`/api/appointments/${aptId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: AppointmentStatus.CONFIRME })
    })
      .then(() => {
        setAppointments(appointments.map(a => a.id === aptId ? { ...a, status: AppointmentStatus.CONFIRME } : a));
        loadAdminData(); // refresh logs
      })
      .catch((err) => console.error(err));
  };

  // Appointment cancellation
  const handleCancelAppointment = (aptId: string) => {
    fetch(`/api/appointments/${aptId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: AppointmentStatus.ANNULE })
    })
      .then(() => {
        setAppointments(appointments.map(a => a.id === aptId ? { ...a, status: AppointmentStatus.ANNULE } : a));
        loadAdminData(); // refresh logs
      })
      .catch((err) => console.error(err));
  };

  // Delete appointment définitivement
  const handleDeleteAppointment = (aptId: string) => {
    if (!confirm("Voulez-vous supprimer définitivement ce rendez-vous ?")) return;
    fetch(`/api/appointments/${aptId}`, {
      method: "DELETE"
    })
      .then(() => {
        setAppointments(appointments.filter(a => a.id !== aptId));
        loadAdminData(); // refresh logs
      })
      .catch((err) => console.error(err));
  };

  // Specialist submission CRUD (Section 10)
  const handleAddSpecialist = () => {
    if (!newSpecName || !newSpecEmail || !newSpecPhone) {
      alert("Veuillez saisir au moins le nom, email et téléphone du spécialiste.");
      return;
    }

    const payload = {
      name: newSpecName,
      email: newSpecEmail,
      phone: newSpecPhone,
      specialties: [newSpecSpecialty],
      bio: newSpecBio,
      guichetId: newSpecGuichet,
      availableDays: [1, 2, 3, 4, 5]
    };

    fetch("/api/specialists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then((res) => res.json())
      .then((newSpec) => {
        setSpecialists([...specialists, newSpec]);
        setShowAddSpecialist(false);
        setNewSpecName("");
        setNewSpecEmail("");
        setNewSpecPhone("");
        setNewSpecBio("");
        loadAdminData(); // refresh logs
      })
      .catch((err) => console.error(err));
  };

  const handleDeleteSpecialist = (specId: string) => {
    if (!confirm("Voulez-vous supprimer ce profil de spécialiste ? Cela désactivera son compte de connexion.")) return;
    fetch(`/api/specialists/${specId}`, {
      method: "DELETE"
    })
      .then(() => {
        setSpecialists(specialists.filter(s => s.id !== specId));
        loadAdminData(); // refresh logs
      })
      .catch((err) => console.error(err));
  };

  // Rooms CRUD actions
  const handleCreateOrUpdateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) {
      alert("Le nom de la salle est obligatoire.");
      return;
    }

    const payload = {
      name: roomName,
      type: roomSpecialty,
      specialistId: roomSpecialistId,
      startDate: roomStartDate,
      endDate: roomEndDate,
      morningStart: roomMorningStart,
      morningEnd: roomMorningEnd,
      afternoonStart: roomAfternoonStart,
      afternoonEnd: roomAfternoonEnd,
      appointmentDuration: Number(roomDuration),
      status: roomStatus
    };

    if (editingRoomId) {
      // Edit Mode
      fetch(`/api/rooms/${editingRoomId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then((res) => res.json())
        .then((updated) => {
          setRooms(rooms.map(r => r.id === editingRoomId ? updated : r));
          setEditingRoomId(null);
          setShowAddRoom(false);
          resetRoomForm();
          loadAdminData();
        })
        .catch((err) => console.error(err));
    } else {
      // Create Mode
      fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then((res) => res.json())
        .then((created) => {
          setRooms([...rooms, created]);
          setShowAddRoom(false);
          resetRoomForm();
          loadAdminData();
        })
        .catch((err) => console.error(err));
    }
  };

  const resetRoomForm = () => {
    setRoomName("");
    setRoomSpecialty("Orthophonie");
    setRoomSpecialistId("");
    setRoomStartDate("2026-07-20");
    setRoomEndDate("2026-08-20");
    setRoomMorningStart("09:00");
    setRoomMorningEnd("12:00");
    setRoomAfternoonStart("14:00");
    setRoomAfternoonEnd("17:00");
    setRoomDuration(siteSettings?.appointmentDuration || 45);
    setRoomStatus("disponible");
  };

  const handleFileUpload = (file: File) => {
    if (!selectedSpecialistForDoc) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const fileUrl = e.target?.result as string;
      const fileType = file.name.split('.').pop()?.toUpperCase() || "PDF";
      const payload = {
        title: file.name,
        fileType,
        fileUrl,
        ownerId: "admin",
        sharedWithIds: [selectedSpecialistForDoc]
      };
      
      try {
        const res = await fetch("/api/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          loadAdminData();
        }
      } catch (err) {
        console.error("Error sharing file", err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        loadAdminData();
      }
    } catch (err) {
      console.error("Error deleting document", err);
    }
  };

  const handleEditRoomClick = (room: any) => {
    setEditingRoomId(room.id);
    setRoomName(room.name);
    setRoomSpecialty(room.type);
    setRoomSpecialistId(room.specialistId || "");
    setRoomStartDate(room.startDate || "2026-07-20");
    setRoomEndDate(room.endDate || "2026-08-20");
    setRoomMorningStart(room.morningStart || "09:00");
    setRoomMorningEnd(room.morningEnd || "12:00");
    setRoomAfternoonStart(room.afternoonStart || "14:00");
    setRoomAfternoonEnd(room.afternoonEnd || "17:00");
    setRoomDuration(room.appointmentDuration || 45);
    setRoomStatus(room.status || "disponible");
    setShowAddRoom(true);
  };

  const handleDeleteRoom = (roomId: string) => {
    if (!confirm("Voulez-vous supprimer définitivement cette salle de consultation ? Tous ses paramètres de disponibilité seront perdus.")) return;
    fetch(`/api/rooms/${roomId}`, {
      method: "DELETE"
    })
      .then(() => {
        setRooms(rooms.filter(r => r.id !== roomId));
        loadAdminData();
      })
      .catch((err) => console.error(err));
  };

  // Settings update submit
  const handleSaveSettings = () => {
    const payload = {
      siteName,
      alertMessage,
      whatsappContact,
      emailContact,
      phoneContact,
      appointmentDuration: Number(appointmentDuration),
      notificationTemplates: notifConf
    };

    fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then((res) => res.json())
      .then((saved) => {
        setSiteSettings(saved);
        alert("Paramètres de la plateforme mis à jour avec succès.");
        loadAdminData();
      })
      .catch((err) => console.error(err));
  };

  // Backup download tool (Section 10)
  const handleExportDB = () => {
    fetch("/api/db/backup")
      .then((res) => res.json())
      .then((data) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `amtda_backup_${new Date().toISOString().split("T")[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch((err) => alert("Erreur d'exportation."));
  };

  // Restore DB tool (Section 10)
  const handleImportDB = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        fetch("/api/db/restore", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed)
        })
          .then((res) => {
            if (res.ok) {
              alert("Base de données restaurée avec succès. Rechargement des données...");
              loadAdminData();
            } else {
              alert("Erreur: Le fichier est invalide.");
            }
          })
          .catch((err) => console.error(err));
      } catch (err) {
        alert("Fichier JSON invalide.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div id="back-office-container" className="space-y-6">
      {/* LOGIN VIEW */}
      {!adminLoggedIn ? (
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-xl text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 flex items-center justify-center mb-4">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Back Office AMTDA Maroc</h2>
          <p className="text-xs text-slate-500 mb-6">Accès réservé exclusivement aux administrateurs autorisés.</p>

          {error && (
            <div className="mb-4 text-xs font-semibold text-orange-700 bg-orange-50 p-2.5 rounded-lg border border-orange-100">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-500 uppercase">Identifiant</label>
              <input
                id="inp-admin-username"
                type="text"
                disabled
                value="admin"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs bg-slate-50 text-slate-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-500 uppercase">Mot de passe d'administration *</label>
              <input
                id="inp-admin-password"
                type="txt"
                placeholder="Entrez admin123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <button
              id="btn-admin-login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 font-bold text-xs text-white rounded-xl shadow transition duration-150"
            >
              {loading ? "Connexion en cours..." : "Accéder à l'Administration"}
            </button>
          </form>
          
          <p className="mt-4 text-[10px] text-slate-400">
            Note: Entrez "admin123" pour tester la gestion clinique et les outils de sauvegarde.
          </p>
        </div>
      ) : (
        /* ADMIN WORKSPACE PANEL */
        <div className="space-y-6">
          {/* Header section with switchers */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                Direction AMTDA Maroc <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 font-bold dark:bg-orange-950 dark:text-orange-300">Administrateur</span>
              </h1>
              <p className="text-xs text-slate-400">Administration centrale, audit et paramètres de contenu.</p>
            </div>

            {/* Menu tab switcher (Section 10) */}
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold text-slate-500 overflow-x-auto">
              <button
                id="btn-tab-admin-apts"
                onClick={() => setActiveTab("appointments")}
                className={`px-4 py-2 rounded-lg shrink-0 transition-all ${activeTab === "appointments" ? "bg-white text-emerald-800 shadow dark:bg-slate-700 dark:text-emerald-400" : "hover:text-slate-700 dark:hover:text-slate-300"}`}
              >
                Rendez-vous ({appointments.length})
              </button>
              <button
                id="btn-tab-admin-specs"
                onClick={() => setActiveTab("specialists")}
                className={`px-4 py-2 rounded-lg shrink-0 transition-all ${activeTab === "specialists" ? "bg-white text-emerald-800 shadow dark:bg-slate-700 dark:text-emerald-400" : "hover:text-slate-700 dark:hover:text-slate-300"}`}
              >
                Spécialistes ({specialists.length})
              </button>
              <button
                id="btn-tab-admin-guichets"
                onClick={() => setActiveTab("guichets")}
                className={`px-4 py-2 rounded-lg shrink-0 transition-all ${activeTab === "guichets" ? "bg-white text-emerald-800 shadow dark:bg-slate-700 dark:text-emerald-400" : "hover:text-slate-700 dark:hover:text-slate-300"}`}
              >
                Les 6 Guichets
              </button>
              <button
                id="btn-tab-admin-rooms"
                onClick={() => setActiveTab("rooms")}
                className={`px-4 py-2 rounded-lg shrink-0 transition-all ${activeTab === "rooms" ? "bg-white text-emerald-800 shadow dark:bg-slate-700 dark:text-emerald-400" : "hover:text-slate-700 dark:hover:text-slate-300"}`}
              >
                Salles de consultation ({rooms.length})
              </button>
              <button
                id="btn-tab-admin-settings"
                onClick={() => setActiveTab("settings")}
                className={`px-4 py-2 rounded-lg shrink-0 transition-all ${activeTab === "settings" ? "bg-white text-emerald-800 shadow dark:bg-slate-700 dark:text-emerald-400" : "hover:text-slate-700 dark:hover:text-slate-300"}`}
              >
                Configuration & Sauvegardes
              </button>
              <button
                id="btn-tab-admin-audit"
                onClick={() => setActiveTab("audit")}
                className={`px-4 py-2 rounded-lg shrink-0 transition-all ${activeTab === "audit" ? "bg-white text-emerald-800 shadow dark:bg-slate-700 dark:text-emerald-400" : "hover:text-slate-700 dark:hover:text-slate-300"}`}
              >
                Journal d'Audit ({auditLogs.length})
              </button>
              <button
                id="btn-tab-admin-guide"
                onClick={() => setActiveTab("guide")}
                className={`px-4 py-2 rounded-lg shrink-0 transition-all flex items-center gap-1.5 ${activeTab === "guide" ? "bg-white text-emerald-800 shadow dark:bg-slate-700 dark:text-emerald-400" : "hover:text-slate-700 dark:hover:text-slate-300"}`}
              >
                <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
                Guide Admin
              </button>
              <button
                id="btn-tab-admin-database"
                onClick={() => {
                  setActiveTab("database");
                  // refresh raw database representation
                  fetch("/api/admin/raw-db").then(res => res.json()).then(data => setRawDb(data)).catch(e => console.log(e));
                }}
                className={`px-4 py-2 rounded-lg shrink-0 transition-all flex items-center gap-1.5 ${activeTab === "database" ? "bg-white text-emerald-800 shadow dark:bg-slate-700 dark:text-emerald-400" : "hover:text-slate-700 dark:hover:text-slate-300"}`}
              >
                <Activity className="h-3.5 w-3.5 text-orange-500 animate-pulse" />
                Base de Données & Trafic
              </button>
            </div>
          </div>

          {/* TAB 1: MASTER APPOINTMENTS LIST */}
          {activeTab === "appointments" && (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">Gestion des réservations en ligne</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase font-bold text-[10px] bg-slate-50 dark:bg-slate-850/50">
                      <th className="py-3 px-4">Patient</th>
                      <th className="py-3 px-4">Contact Parent</th>
                      <th className="py-3 px-4">Praticien / Guichet</th>
                      <th className="py-3 px-4">Date & Heure</th>
                      <th className="py-3 px-4">Mode</th>
                      <th className="py-3 px-4">Statut</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {appointments.map((apt) => (
                      <tr key={apt.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-white">{apt.childName}</td>
                        <td className="py-3.5 px-4 text-slate-500">
                          <p>{apt.parentName}</p>
                          <p className="text-[10px] opacity-85">{apt.parentPhone}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-emerald-800 dark:text-emerald-400">{apt.specialistName}</p>
                          <p className="text-[10px] text-slate-400">{apt.guichetName}</p>
                        </td>
                        <td className="py-3.5 px-4 font-mono">{apt.date} à {apt.slot}</td>
                        <td className="py-3.5 px-4">{apt.mode}</td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            apt.status === AppointmentStatus.CONFIRME 
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" 
                              : apt.status === AppointmentStatus.ANNULE 
                              ? "bg-slate-100 text-slate-400" 
                              : "bg-orange-100 text-orange-800"
                          }`}>
                            {apt.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            {apt.status === AppointmentStatus.EN_ATTENTE && (
                              <button
                                id={`btn-approve-apt-${apt.id}`}
                                onClick={() => handleApproveAppointment(apt.id)}
                                className="p-1.5 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded-lg transition"
                                title="Approuver"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                            )}
                            {apt.status !== AppointmentStatus.ANNULE && (
                              <button
                                id={`btn-cancel-apt-${apt.id}`}
                                onClick={() => handleCancelAppointment(apt.id)}
                                className="p-1.5 bg-orange-100 text-orange-800 hover:bg-orange-200 rounded-lg transition"
                                title="Annuler"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              id={`btn-delete-apt-${apt.id}`}
                              onClick={() => handleDeleteAppointment(apt.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg transition"
                              title="Supprimer définitivement"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: SPECIALISTS MANAGEMENT */}
          {activeTab === "specialists" && (
            <div className="space-y-6">
              {/* Add Specialist Trigger */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Gestion de l'équipe médicale de l'association</h3>
                <button
                  id="btn-trigger-add-spec"
                  onClick={() => setShowAddSpecialist(!showAddSpecialist)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition"
                >
                  <Plus className="h-4 w-4" /> Ajouter un Spécialiste
                </button>
              </div>

              {/* Add form section */}
              {showAddSpecialist && (
                <div className="p-6 rounded-2xl border border-emerald-500/20 bg-emerald-50/10 dark:bg-slate-850/20 space-y-4 max-w-xl text-xs">
                  <h4 className="font-bold text-slate-800 dark:text-white">Création du profil professionnel</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-slate-500 font-semibold">Nom complet</label>
                      <input
                        id="inp-new-spec-name"
                        type="text"
                        placeholder="Ex: Dr. Karima Alami"
                        value={newSpecName}
                        onChange={(e) => setNewSpecName(e.target.value)}
                        className="w-full rounded-lg border px-3 py-2 focus:border-emerald-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-slate-500 font-semibold">Email professionnel</label>
                      <input
                        id="inp-new-spec-email"
                        type="email"
                        placeholder="Ex: karima@amtda.ma"
                        value={newSpecEmail}
                        onChange={(e) => setNewSpecEmail(e.target.value)}
                        className="w-full rounded-lg border px-3 py-2 focus:border-emerald-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-slate-500 font-semibold">Téléphone mobile GSM</label>
                      <input
                        id="inp-new-spec-phone"
                        type="text"
                        placeholder="Ex: +212 661-445522"
                        value={newSpecPhone}
                        onChange={(e) => setNewSpecPhone(e.target.value)}
                        className="w-full rounded-lg border px-3 py-2 focus:border-emerald-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-slate-500 font-semibold">Spécialité principale</label>
                      <select
                        id="sel-new-spec-specialty"
                        value={newSpecSpecialty}
                        onChange={(e) => setNewSpecSpecialty(e.target.value)}
                        className="w-full rounded-lg border px-3 py-2 focus:border-emerald-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                      >
                        <option value="Orthophonie">Orthophonie</option>
                        <option value="Psychomotricité">Psychomotricité</option>
                        <option value="Neuropsychologie">Neuropsychologie</option>
                        <option value="Psychologie clinique">Psychologie clinique</option>
                        <option value="Ergothérapie">Ergothérapie</option>
                        <option value="Orthoptie">Orthoptie</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-slate-500 font-semibold">Guichet assigné</label>
                      <select
                        id="sel-new-spec-guichet"
                        value={newSpecGuichet}
                        onChange={(e) => setNewSpecGuichet(e.target.value)}
                        className="w-full rounded-lg border px-3 py-2 focus:border-emerald-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                      >
                        <option value="1">Guichet 1 - Orthophonie</option>
                        <option value="2">Guichet 2 - Psychomotricité</option>
                        <option value="3">Guichet 3 - Neuropsychologie</option>
                        <option value="4">Guichet 4 - Psychologie clinique</option>
                        <option value="5">Guichet 5 - Ergothérapie</option>
                        <option value="6">Guichet 6 - Orthoptie</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <label className="block text-slate-500 font-semibold">Courte biographie professionnelle</label>
                      <input
                        id="inp-new-spec-bio"
                        type="text"
                        placeholder="Saisissez son cursus et spécialisations"
                        value={newSpecBio}
                        onChange={(e) => setNewSpecBio(e.target.value)}
                        className="w-full rounded-lg border px-3 py-2 focus:border-emerald-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <button id="btn-cancel-add-spec" onClick={() => setShowAddSpecialist(false)} className="px-4 py-1.5 bg-slate-100 rounded-lg hover:bg-slate-200">Annuler</button>
                    <button id="btn-submit-add-spec" onClick={handleAddSpecialist} className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow">Créer profil</button>
                  </div>
                </div>
              )}

              {/* Specialists List Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {specialists.map((spec) => (
                  <div key={spec.id} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
                    <div className="space-y-3 text-xs">
                      <div className="flex items-center justify-between border-b pb-2">
                        <span className="font-extrabold text-slate-800 dark:text-white text-sm">{spec.name}</span>
                        <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded dark:bg-slate-800 dark:text-slate-300">
                          Guichet {spec.guichetId}
                        </span>
                      </div>
                      <p className="font-semibold text-emerald-800 dark:text-emerald-400">Spécialité : {spec.specialties.join(", ")}</p>
                      <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px] line-clamp-3">{spec.bio}</p>
                      <p className="text-[10px] text-slate-400">Email : {spec.email}</p>
                      <p className="text-[10px] text-slate-400">Phone : {spec.phone}</p>
                    </div>

                    <div className="pt-4 border-t mt-4 flex items-center justify-end">
                      <button
                        id={`btn-delete-spec-${spec.id}`}
                        onClick={() => handleDeleteSpecialist(spec.id)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="Retirer ce spécialiste"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* DOCUMENT SHARING CENTER (PDF, Image, TXT, DOC) */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 mt-8 space-y-6 shadow-sm">
                <div className="border-b pb-4">
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                    <BookOpen className="h-4.5 w-4.5 text-emerald-700 shrink-0" />
                    Centre d'Échange Clinique (Partage de Fichiers PDF, Image, TXT, DOC)
                  </h3>
                  <p className="text-[11px] text-slate-400">Échange sécurisé de rapports de diagnostics, images cliniques, et documents d'évaluation entre l'administration et les médecins.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Selector & Drag-and-Drop */}
                  <div className="lg:col-span-1 space-y-4">
                    <div className="space-y-1 text-xs">
                      <label className="block text-slate-500 font-bold">Destinataire (Médecin Spécialiste) :</label>
                      <select
                        id="sel-doc-spec-recipient"
                        value={selectedSpecialistForDoc}
                        onChange={(e) => setSelectedSpecialistForDoc(e.target.value)}
                        className="w-full rounded-xl border px-3 py-2.5 bg-slate-50 focus:border-emerald-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                      >
                        <option value="">-- Sélectionner un Spécialiste --</option>
                        {specialists.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.specialties?.join(", ")})
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedSpecialistForDoc ? (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDragging(false);
                          const files = e.dataTransfer.files;
                          if (files && files.length > 0) {
                            handleFileUpload(files[0]);
                          }
                        }}
                        className={`border-2 border-dashed rounded-2xl p-6 text-center transition flex flex-col items-center justify-center gap-3 cursor-pointer ${
                          isDragging
                            ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20"
                            : "border-slate-200 hover:border-emerald-500/50 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850/50"
                        }`}
                        onClick={() => document.getElementById("admin-file-upload-input")?.click()}
                      >
                        <Upload className="h-8 w-8 text-slate-400 animate-pulse" />
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Glissez-déposez un fichier ici</p>
                          <p className="text-[10px] text-slate-400">PDF, Image, TXT ou DOC (max 10MB)</p>
                        </div>
                        <span className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-300 transition">
                          Parcourir les fichiers
                        </span>
                        <input
                          id="admin-file-upload-input"
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg,.gif,.txt,.doc,.docx"
                          className="hidden"
                          onChange={(e) => {
                            const files = e.target.files;
                            if (files && files.length > 0) {
                              handleFileUpload(files[0]);
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <div className="bg-slate-50 dark:bg-slate-800/20 border rounded-2xl p-6 text-center text-[11px] text-slate-400 italic">
                        Veuillez d'abord sélectionner un médecin pour activer le glisser-déposer de fichiers cliniques.
                      </div>
                    )}
                  </div>

                  {/* Right Column: Shared Documents List */}
                  <div className="lg:col-span-2 space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Documents partagés</h4>
                    {selectedSpecialistForDoc ? (
                      (() => {
                        const filteredDocs = documents.filter(
                          (d) => d.ownerId === "admin" && d.sharedWithIds?.includes(selectedSpecialistForDoc)
                        );

                        if (filteredDocs.length > 0) {
                          return (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                              {filteredDocs.map((doc) => (
                                <div key={doc.id} className="p-3 border rounded-xl bg-slate-50/50 dark:bg-slate-800/10 flex flex-col justify-between gap-3 text-xs">
                                  <div className="space-y-1">
                                    <p className="font-bold text-slate-800 dark:text-white truncate" title={doc.title}>{doc.title}</p>
                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                      <span className="px-1.5 py-0.5 bg-slate-150 dark:bg-slate-800 rounded font-bold">{doc.fileType}</span>
                                      <span>Partagé le {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                  <div className="flex gap-2 justify-end">
                                    <a
                                      href={doc.fileUrl}
                                      download={doc.title}
                                      className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 rounded text-[10px] font-bold text-slate-700 dark:text-slate-300 transition"
                                    >
                                      Télécharger
                                    </a>
                                    <button
                                      onClick={() => handleDeleteDocument(doc.id)}
                                      className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded text-[10px] font-bold transition"
                                    >
                                      Supprimer
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        } else {
                          return (
                            <p className="text-xs text-slate-400 italic py-8 text-center bg-slate-50/50 dark:bg-slate-800/10 rounded-2xl border border-dashed">
                              Aucun document partagé avec ce spécialiste pour le moment.
                            </p>
                          );
                        }
                      })()
                    ) : (
                      <p className="text-xs text-slate-400 italic py-12 text-center bg-slate-50/50 dark:bg-slate-800/10 rounded-2xl border border-dashed">
                        Sélectionnez un spécialiste pour afficher les fichiers partagés.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: THE 6 GUICHETS AND ROOMS */}
          {activeTab === "guichets" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Guichets */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="font-bold text-slate-800 dark:text-white text-sm">Les 6 Guichets AMTDA</h3>
                <p className="text-xs text-slate-500">Chaque guichet est configuré avec sa spécialité et sa salle d'examen.</p>

                <div className="space-y-3.5 text-xs">
                  {guichets.map((gui) => (
                    <div key={gui.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between dark:border-slate-800 dark:bg-slate-800/40">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white">{gui.name}</p>
                        <p className="text-[10px] text-slate-400">Salle physique : {gui.roomNumber} • Capacité: {gui.capacity} patient/créneau</p>
                      </div>
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded font-bold text-[9px] dark:bg-orange-950 dark:text-orange-300">
                        {gui.specialty}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rooms */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="font-bold text-slate-800 dark:text-white text-sm">Salles cliniques physiques</h3>
                <p className="text-xs text-slate-500">Statut en temps réel de nos salles de rééducation.</p>

                <div className="space-y-3.5 text-xs">
                  {rooms.map((room) => (
                    <div key={room.id} className="p-3.5 rounded-xl border border-slate-100 bg-white flex items-center justify-between dark:border-slate-800 dark:bg-slate-900">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white">{room.name}</p>
                        <p className="text-[10px] text-slate-400">Type de pôle : {room.type}</p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                        room.status === "disponible" 
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" 
                          : "bg-orange-100 text-orange-800"
                      }`}>
                        {room.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: ROOMS (SALLES DE CONSULTATION) */}
          {activeTab === "rooms" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-base">Gestion des Salles de consultation</h3>
                  <p className="text-xs text-slate-500">Configurez l'affectation des spécialistes aux salles physiques et l'intervalle d'ouverture des créneaux de consultation.</p>
                </div>
                <button
                  id="btn-admin-add-room"
                  onClick={() => {
                    if (showAddRoom) {
                      setShowAddRoom(false);
                      setEditingRoomId(null);
                      resetRoomForm();
                    } else {
                      resetRoomForm();
                      setShowAddRoom(true);
                    }
                  }}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow transition"
                >
                  {showAddRoom ? "Fermer le formulaire" : "Ajouter une Salle de consultation"}
                </button>
              </div>

              {/* Add/Edit Room Form */}
              {showAddRoom && (
                <form
                  id="form-add-room"
                  onSubmit={handleCreateOrUpdateRoom}
                  className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-6 shadow-md space-y-4 text-xs animate-fadeIn"
                >
                  <h4 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider">
                    {editingRoomId ? "Modifier la Salle de consultation" : "Créer une Salle de consultation"}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Room Name */}
                    <div className="space-y-1">
                      <label className="block font-semibold text-slate-600 dark:text-slate-400">Nom / Numéro de la salle *</label>
                      <input
                        id="inp-room-name"
                        type="text"
                        required
                        placeholder="Ex: Salle B02, Bureau 101"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-emerald-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                      />
                    </div>

                    {/* Specialty */}
                    <div className="space-y-1">
                      <label className="block font-semibold text-slate-600 dark:text-slate-400">Spécialité clinique *</label>
                      <select
                        id="sel-room-specialty"
                        value={roomSpecialty}
                        onChange={(e) => setRoomSpecialty(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-emerald-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                      >
                        <option value="Orthophonie">Orthophonie</option>
                        <option value="Psychologie clinique">Psychologie clinique</option>
                        <option value="Psychomotricité">Psychomotricité</option>
                        <option value="Neuropsychologie">Neuropsychologie</option>
                        <option value="Ergothérapie">Ergothérapie</option>
                        <option value="Orthoptie">Orthoptie</option>
                      </select>
                    </div>

                    {/* Specialist */}
                    <div className="space-y-1">
                      <label className="block font-semibold text-slate-600 dark:text-slate-400">Spécialiste affecté</label>
                      <select
                        id="sel-room-specialist"
                        value={roomSpecialistId}
                        onChange={(e) => setRoomSpecialistId(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-emerald-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                      >
                        <option value="">-- Aucun spécialiste affecté --</option>
                        {specialists.map((spec) => (
                          <option key={spec.id} value={spec.id}>
                            {spec.name} ({spec.specialties.join(", ")})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Start Date */}
                    <div className="space-y-1">
                      <label className="block font-semibold text-slate-600 dark:text-slate-400">Date de début de disponibilité *</label>
                      <input
                        id="inp-room-startdate"
                        type="date"
                        required
                        value={roomStartDate}
                        onChange={(e) => setRoomStartDate(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-emerald-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                      />
                    </div>

                    {/* End Date */}
                    <div className="space-y-1">
                      <label className="block font-semibold text-slate-600 dark:text-slate-400">Date de fin de disponibilité *</label>
                      <input
                        id="inp-room-enddate"
                        type="date"
                        required
                        value={roomEndDate}
                        onChange={(e) => setRoomEndDate(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-emerald-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Morning & Afternoon times */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 dark:border-slate-800 pt-4">
                    <div className="space-y-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl">
                      <h5 className="font-bold text-slate-700 dark:text-slate-300">Horaires Matinée</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="block text-[10px] text-slate-500">Heure Début (Matin)</label>
                          <input
                            id="inp-room-mstart"
                            type="time"
                            value={roomMorningStart}
                            onChange={(e) => setRoomMorningStart(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-3 py-1.5 focus:border-emerald-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] text-slate-500">Heure Fin (Matin)</label>
                          <input
                            id="inp-room-mend"
                            type="time"
                            value={roomMorningEnd}
                            onChange={(e) => setRoomMorningEnd(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-3 py-1.5 focus:border-emerald-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl">
                      <h5 className="font-bold text-slate-700 dark:text-slate-300">Horaires Après-midi</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="block text-[10px] text-slate-500">Heure Début (Après-midi)</label>
                          <input
                            id="inp-room-astart"
                            type="time"
                            value={roomAfternoonStart}
                            onChange={(e) => setRoomAfternoonStart(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-3 py-1.5 focus:border-emerald-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] text-slate-500">Heure Fin (Après-midi)</label>
                          <input
                            id="inp-room-aend"
                            type="time"
                            value={roomAfternoonEnd}
                            onChange={(e) => setRoomAfternoonEnd(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-3 py-1.5 focus:border-emerald-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                    {/* Duration */}
                    <div className="space-y-1">
                      <label className="block font-semibold text-slate-600 dark:text-slate-400">
                        Durée du rendez-vous (en minutes)
                      </label>
                      <input
                        id="inp-room-duration"
                        type="number"
                        min="15"
                        max="180"
                        value={roomDuration}
                        onChange={(e) => setRoomDuration(Number(e.target.value))}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-emerald-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                      />
                      <p className="text-[10px] text-slate-400">
                        Par défaut: {siteSettings?.appointmentDuration || 45} minutes (défini par la plateforme)
                      </p>
                    </div>

                    {/* Room Status */}
                    <div className="space-y-1">
                      <label className="block font-semibold text-slate-600 dark:text-slate-400">Statut de la salle *</label>
                      <select
                        id="sel-room-status"
                        value={roomStatus}
                        onChange={(e) => setRoomStatus(e.target.value as any)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-emerald-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                      >
                        <option value="disponible">Disponible (Génération active)</option>
                        <option value="occupee">Occupée (Génération inactive)</option>
                        <option value="maintenance">En Maintenance (Génération inactive)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      id="btn-room-cancel"
                      type="button"
                      onClick={() => {
                        setShowAddRoom(false);
                        setEditingRoomId(null);
                        resetRoomForm();
                      }}
                      className="px-4 py-2 border rounded-xl text-slate-700 dark:text-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold transition"
                    >
                      Annuler
                    </button>
                    <button
                      id="btn-room-submit"
                      type="submit"
                      className="px-5 py-2 bg-emerald-700 text-white hover:bg-emerald-800 font-bold rounded-xl shadow transition"
                    >
                      {editingRoomId ? "Enregistrer les modifications" : "Générer les créneaux disponibles"}
                    </button>
                  </div>
                </form>
              )}

              {/* Rooms Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room) => {
                  const spec = specialists.find(s => s.id === room.specialistId);
                  return (
                    <div
                      key={room.id}
                      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-slate-800 dark:text-white text-sm">{room.name}</h4>
                            <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                              {room.type}
                            </span>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                            room.status === "disponible"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                              : room.status === "occupee"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"
                              : "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300"
                          }`}>
                            {room.status === "disponible" ? "Disponible" : room.status === "occupee" ? "Occupée" : "Maintenance"}
                          </span>
                        </div>

                        <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-400">
                          <p className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-700 dark:text-slate-300">Spécialiste :</span>
                            {room.specialistName || spec?.name || "Non affecté"}
                          </p>
                          <p className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-700 dark:text-slate-300">Période :</span>
                            {room.startDate && room.endDate ? `Du ${room.startDate} au ${room.endDate}` : "Non définie"}
                          </p>
                          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg space-y-1 text-[10px]">
                            <p>🌅 <span className="font-bold text-slate-700 dark:text-slate-300">Matinée :</span> {room.morningStart || "09:00"} - {room.morningEnd || "12:00"}</p>
                            <p>🌇 <span className="font-bold text-slate-700 dark:text-slate-300">Après-midi :</span> {room.afternoonStart || "14:00"} - {room.afternoonEnd || "17:00"}</p>
                            <p>⏱️ <span className="font-bold text-slate-700 dark:text-slate-300">Durée RDV :</span> {room.appointmentDuration || siteSettings?.appointmentDuration || 45} min</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 border-t border-slate-50 dark:border-slate-800/80 pt-3 mt-3">
                        <button
                          id={`btn-edit-room-${room.id}`}
                          onClick={() => handleEditRoomClick(room)}
                          type="button"
                          className="flex-1 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1"
                        >
                          Modifier params
                        </button>
                        <button
                          id={`btn-delete-room-${room.id}`}
                          onClick={() => handleDeleteRoom(room.id)}
                          type="button"
                          className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 rounded-lg text-[10px] font-bold transition flex items-center justify-center"
                          title="Supprimer la salle"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: SYSTEM CONFIGURATION & BACKUP TOOLS */}
          {activeTab === "settings" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Content configuration parameters (Section 10) */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-6">
                <h3 className="font-bold text-slate-800 dark:text-white text-sm">Paramètres généraux du site & Contenus</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="block font-semibold text-slate-500">Nom du site</label>
                    <input
                      id="inp-settings-sitename"
                      type="text"
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      className="w-full rounded-lg border px-3 py-2 focus:border-emerald-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-semibold text-slate-500">Numéro WhatsApp (Rappels de masse)</label>
                    <input
                      id="inp-settings-whatsapp"
                      type="text"
                      value={whatsappContact}
                      onChange={(e) => setWhatsappContact(e.target.value)}
                      className="w-full rounded-lg border px-3 py-2 focus:border-emerald-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-semibold text-slate-500">Email de contact</label>
                    <input
                      id="inp-settings-email"
                      type="email"
                      value={emailContact}
                      onChange={(e) => setEmailContact(e.target.value)}
                      className="w-full rounded-lg border px-3 py-2 focus:border-emerald-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-semibold text-slate-500">Téléphone Fixe</label>
                    <input
                      id="inp-settings-phone"
                      type="text"
                      value={phoneContact}
                      onChange={(e) => setPhoneContact(e.target.value)}
                      className="w-full rounded-lg border px-3 py-2 focus:border-emerald-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-semibold text-slate-500">Durée d'un rendez-vous par défaut (min) *</label>
                    <input
                      id="inp-settings-duration"
                      type="number"
                      min="15"
                      max="180"
                      value={appointmentDuration}
                      onChange={(e) => setAppointmentDuration(Number(e.target.value))}
                      className="w-full rounded-lg border px-3 py-2 focus:border-emerald-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-1">
                    <label className="block font-semibold text-slate-500">Bannière d'alerte en page d'accueil</label>
                    <input
                      id="inp-settings-alert"
                      type="text"
                      value={alertMessage}
                      onChange={(e) => setAlertMessage(e.target.value)}
                      className="w-full rounded-lg border px-3 py-2 focus:border-emerald-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    />
                  </div>
                  
                  {/* Notifications templates */}
                  <div className="md:col-span-2 border-t pt-4 space-y-3">
                    <h4 className="font-bold text-slate-700 dark:text-slate-300">Modèles de messages configurables (Section 11)</h4>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="block font-semibold text-slate-500">Confirmation de rendez-vous (Email/SMS)</label>
                        <textarea
                          id="txt-template-conf"
                          rows={2}
                          value={notifConf.confirmation}
                          onChange={(e) => setNotifConf({ ...notifConf, confirmation: e.target.value })}
                          className="w-full rounded-lg border px-3 py-1.5 focus:border-emerald-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-semibold text-slate-500">Rappel automatique de rendez-vous (Email/SMS)</label>
                        <textarea
                          id="txt-template-rappel"
                          rows={2}
                          value={notifConf.rappel}
                          onChange={(e) => setNotifConf({ ...notifConf, rappel: e.target.value })}
                          className="w-full rounded-lg border px-3 py-1.5 focus:border-emerald-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    id="btn-save-settings"
                    onClick={handleSaveSettings}
                    className="rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 shadow"
                  >
                    Mettre à jour les paramètres
                  </button>
                </div>
              </div>

              {/* Database Export/Import Backup Tool (Section 10) */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-4 h-fit">
                <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-1.5">
                  <RefreshCw className="h-4.5 w-4.5 text-emerald-600" /> Sauvegarde de la Clinique
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Exportez l'intégralité de la base de données (séances, diagnostics, tuteurs, messages) au format JSON sécurisé, ou restaurez un fichier existant.
                </p>

                <div className="space-y-3 pt-2">
                  <button
                    id="btn-db-export"
                    onClick={handleExportDB}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <Download className="h-4 w-4" /> Sauvegarder (Exporter JSON)
                  </button>

                  <div className="border-t pt-4">
                    <input
                      id="file-import-db"
                      type="file"
                      ref={fileInputRef}
                      accept=".json"
                      onChange={handleImportDB}
                      className="hidden"
                    />
                    <button
                      id="btn-db-import-trigger"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 py-3 text-xs font-bold text-slate-700 transition dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      <Upload className="h-4 w-4" /> Restaurer (Importer JSON)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SECURITY AUDIT JOURNAL */}
          {activeTab === "audit" && (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                    <Activity className="h-4.5 w-4.5 text-emerald-600 animate-pulse" /> Journal de Sécurité Clinique (Audit Log)
                  </h3>
                  <p className="text-[10px] text-slate-400">Journalisation en temps réel de toutes les actions d'écriture et de lecture sensibles (WCAG & RGPD).</p>
                </div>
                <button
                  id="btn-refresh-audit"
                  onClick={loadAdminData}
                  className="rounded-lg p-1.5 hover:bg-slate-100 text-slate-500"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2.5 max-h-[55vh] overflow-y-auto pr-1">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-slate-50 dark:bg-slate-850/50 rounded-xl border border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 dark:text-white">{log.username}</span>
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100">
                          {log.action}
                        </span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px]">{log.details}</p>
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: COMPREHENSIVE ADMINISTRATOR USER GUIDE */}
          {activeTab === "guide" && (
            <div className="space-y-6 text-xs animate-fadeIn">
              <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl"></div>
                <div className="relative space-y-3 max-w-3xl">
                  <span className="px-3 py-1 bg-emerald-500/20 backdrop-blur text-emerald-300 rounded-full font-bold text-[10px] uppercase tracking-wider">
                    Espace Direction AMTDA Maroc
                  </span>
                  <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">
                    Manuel Complet de Gestion & d'Exploitation Technique
                  </h2>
                  <p className="text-emerald-100 text-xs">
                    Ce guide détaille les procédures de paramétrage clinique, les protocoles d'envois de notifications et les outils d'audit nécessaires à l'opérabilité optimale de la plateforme AMTDA Maroc.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chapters & Procedures (Left Columns) */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Step 1: Physical Rooms Configuration */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                      <span className="h-6 w-6 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xs dark:bg-emerald-950 dark:text-emerald-400">1</span>
                      Paramétrage Clinique (Salles & Créneaux horaires)
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      L'administrateur coordonne les 6 Guichets d'apprentissage en affectant des spécialistes à des <strong>salles de consultation</strong> physiques.
                    </p>
                    <div className="p-4 bg-slate-50 dark:bg-slate-850/50 rounded-xl space-y-2 border border-slate-100 dark:border-slate-800">
                      <p className="font-bold text-slate-800 dark:text-white">⚙️ Procédure d'affectation :</p>
                      <ul className="list-decimal pl-4 space-y-1.5 text-slate-600 dark:text-slate-300">
                        <li>Accédez à l'onglet <strong>Salles de consultation</strong> et cliquez sur "Ajouter une Salle".</li>
                        <li>Spécifiez la spécialité du Guichet, le praticien affecté, et l'intervalle de date (début et fin).</li>
                        <li>Configurez les tranches horaires de la matinée (ex: 09:00 - 12:00) et de l'après-midi (ex: 14:00 - 17:00), ainsi que la durée des consultations (par défaut 45 minutes).</li>
                        <li>À la validation, le serveur génère automatiquement l'ensemble des créneaux de rendez-vous disponibles.</li>
                      </ul>
                    </div>
                  </div>

                  {/* Step 2: Anti-Collision Engine and Alternatives */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                      <span className="h-6 w-6 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xs dark:bg-emerald-950 dark:text-emerald-400">2</span>
                      Moteur Anti-Collision de Rendez-vous
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      La plateforme intègre un algorithme d'exclusion mutuelle pour empêcher les doubles réservations. Si un tuteur tente de réserver un créneau déjà confirmé :
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="p-3.5 rounded-xl border border-orange-100 bg-orange-50/50 dark:border-orange-950/40 dark:bg-orange-950/10">
                        <p className="font-bold text-orange-800 dark:text-orange-400">🚨 Détection des collisions</p>
                        <p className="text-[10px] text-slate-500 mt-1">Le serveur bloque immédiatement l'insertion en base de données et renvoie un statut de conflit HTTP 409.</p>
                      </div>
                      <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/50 dark:border-emerald-950/40 dark:bg-emerald-950/10">
                        <p className="font-bold text-emerald-800 dark:text-emerald-400">🔄 Alternatives Intelligentes</p>
                        <p className="text-[10px] text-slate-500 mt-1">L'API recherche automatiquement les 3 créneaux disponibles les plus proches le même jour et les propose au parent.</p>
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Notifications and Backup Procedures */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                      <span className="h-6 w-6 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xs dark:bg-emerald-950 dark:text-emerald-400">3</span>
                      Gestion des Notifications & Sauvegardes
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      L'administrateur dispose de modèles personnalisables pour l'envoi automatisé de SMS/WhatsApp.
                    </p>
                    <div className="p-4 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900 text-[11px] space-y-2">
                      <p className="font-bold text-emerald-800 dark:text-emerald-400">💾 Procédure de sauvegarde et de restauration :</p>
                      <ul className="list-disc pl-4 space-y-1.5 text-slate-600 dark:text-slate-300">
                        <li><strong>Exportation :</strong> Cliquez sur "Sauvegarder (Exporter JSON)" pour télécharger l'intégralité de la base clinique en local.</li>
                        <li><strong>Restauration :</strong> Utilisez "Restaurer (Importer JSON)" pour recharger une configuration de la clinique sur n'importe quel serveur (local ou hébergé).</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* FAQ and Quick links (Right column) */}
                <div className="space-y-4">
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
                    <h4 className="font-bold text-slate-800 dark:text-white text-xs flex items-center gap-1.5 uppercase tracking-wider">
                      <HelpCircle className="h-4 w-4 text-emerald-600" />
                      Assistance Rapide Admin
                    </h4>
                    
                    <div className="space-y-3 text-[11px]">
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1">
                        <p className="font-bold text-slate-800 dark:text-white">Comment réinitialiser le mot de passe d'un médecin ?</p>
                        <p className="text-slate-500">Par défaut, tout nouveau spécialiste créé possède le mot de passe "therapist123" associé à son nom d'utilisateur (sans espaces, minuscule).</p>
                      </div>

                      <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1">
                        <p className="font-bold text-slate-800 dark:text-white">Où consulter le Journal d'Audit ?</p>
                        <p className="text-slate-500">Sélectionnez l'onglet "Journal d'Audit" pour voir la chronologie complète des accès, inscriptions et signatures médicales.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
                    <h4 className="font-bold text-slate-800 dark:text-white text-xs flex items-center gap-1.5 uppercase tracking-wider">
                      📞 Test Sonnerie Administrative
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      Survoler l'élément ci-dessous pour déclencher la simulation de sonnerie classique pour le standard téléphonique.
                    </p>
                    <div className="pt-2">
                      <button
                        onMouseEnter={() => playPhoneRingSound()}
                        className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400 hover:border-emerald-600 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 hover:scale-105 transition-all duration-300"
                      >
                        🔔 Tester la Sonnerie
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: PREMIUM BASE DE DONNEES & TRAFIC INTERFACE */}
          {activeTab === "database" && (
            <div className="space-y-6 text-xs animate-fadeIn">
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-orange-600 to-amber-700 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="relative space-y-3 max-w-3xl">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur text-orange-100 rounded-full font-bold text-[10px] uppercase tracking-wider">
                    Console d'Ingénierie Clinic-Database v1.0
                  </span>
                  <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">
                    Contrôle des Flux Cliniques & Sessions
                  </h2>
                  <p className="text-orange-50 text-xs">
                    Supervisez les transactions en temps réel, auditez l'architecture des tables, simulez du trafic patient et modifiez directement les enregistrements de la clinique.
                  </p>
                </div>
              </div>

              {/* 1. Real-time Traffic Simulator & Metrics Dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Sessions Actives</p>
                    <p className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">{trafficMetrics.activeSessions}</p>
                    <p className="text-[10px] text-emerald-500 mt-0.5">● Appareils mobiles & PC</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
                    <Users className="h-5 w-5" />
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Requêtes par Seconde</p>
                    <p className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">{trafficMetrics.queriesPerSecond.toFixed(1)} Q/s</p>
                    <p className="text-[10px] text-emerald-500 mt-0.5">↑ Stable sous charge</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center text-orange-600">
                    <Activity className="h-5 w-5 animate-pulse" />
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Empreinte Mémoire DB</p>
                    <p className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">{trafficMetrics.memoryFootprint}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Cache JSON optimisé</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
                    <Sliders className="h-5 w-5" />
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Dernier Sync Serveur</p>
                    <p className="text-lg font-bold text-slate-850 dark:text-slate-100 mt-2 font-mono">{trafficMetrics.lastSyncTime}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">État: Prêt pour Vercel</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-600">
                    <RefreshCw className="h-5 w-5 animate-spin" style={{ animationDuration: "10s" }} />
                  </div>
                </div>
              </div>

              {/* Simulator Actions Bar */}
              <div className="bg-slate-50 dark:bg-slate-850/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="font-bold text-slate-800 dark:text-white text-xs">Simulateur d'événements cliniques</p>
                  <p className="text-slate-400 text-[10px]">Déclenchez des requêtes fictives pour évaluer le comportement et le routage des guichets.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setTrafficMetrics((prev: any) => ({
                        ...prev,
                        activeSessions: prev.activeSessions + 2,
                        queriesPerSecond: prev.queriesPerSecond + 1.5,
                        lastSyncTime: new Date().toLocaleTimeString()
                      }));
                      alert("Trafic simulé : +2 tuteurs connectés, requêtes incrémentées.");
                    }}
                    className="px-3.5 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition"
                  >
                    🚀 Simuler 2 Connexions
                  </button>
                  <button
                    onClick={() => {
                      setTrafficMetrics((prev: any) => ({
                        ...prev,
                        queriesPerSecond: 0.5,
                        memoryFootprint: "32.1 MB",
                        lastSyncTime: new Date().toLocaleTimeString()
                      }));
                      alert("Cache libéré et compacté avec succès ! Mémoire optimisée à 32.1 Mo.");
                    }}
                    className="px-3.5 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition"
                  >
                    🧹 Vider le Cache Clinique
                  </button>
                </div>
              </div>

              {/* 2. Real-time Database Explorer */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-150 dark:border-slate-800 pb-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Explorateur de Schémas & Enregistrements Cliniques</h3>
                    <p className="text-slate-400 text-[11px]">Accès en lecture et suppression directe sur toutes les tables de db.json.</p>
                  </div>
                  
                  {/* Table Selector */}
                  <div className="flex flex-wrap gap-1.5 bg-slate-100 dark:bg-slate-850 p-1 rounded-xl">
                    {[
                      { key: "users", label: "Utilisateurs" },
                      { key: "parents", label: "Parents" },
                      { key: "children", label: "Enfants" },
                      { key: "appointments", label: "RDV" },
                      { key: "rooms", label: "Salles" },
                      { key: "consultations", label: "Consultations" },
                      { key: "notifications", label: "Notifications" }
                    ].map((tbl) => (
                      <button
                        key={tbl.key}
                        onClick={() => setSelectedDbTable(tbl.key)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${selectedDbTable === tbl.key ? "bg-white text-orange-600 shadow dark:bg-slate-800 dark:text-orange-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                      >
                        {tbl.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filter Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder={`Filtrer dans la table ${selectedDbTable}...`}
                    value={dbSearchQuery}
                    onChange={(e) => setDbSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-150 dark:border-slate-800/80 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                {/* Table Data View */}
                {rawDb && rawDb[selectedDbTable] ? (
                  <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold text-[10px] uppercase">
                          <th className="py-3 px-4">ID</th>
                          {/* Dynamic column headers based on first item */}
                          {rawDb[selectedDbTable].length > 0 && 
                            Object.keys(rawDb[selectedDbTable][0])
                              .filter(k => k !== "id" && typeof rawDb[selectedDbTable][0][k] !== "object")
                              .slice(0, 4)
                              .map((key) => (
                                <th key={key} className="py-3 px-4">{key}</th>
                              ))
                          }
                          <th className="py-3 px-4 text-center">Contrôle</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                        {rawDb[selectedDbTable]
                          .filter((row: any) => {
                            if (!dbSearchQuery) return true;
                            const searchStr = JSON.stringify(row).toLowerCase();
                            return searchStr.includes(dbSearchQuery.toLowerCase());
                          })
                          .map((row: any) => (
                            <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20">
                              <td className="py-3 px-4 font-mono font-bold text-orange-600 dark:text-orange-400">{row.id}</td>
                              {/* Dynamic cells based on row keys */}
                              {Object.keys(row)
                                .filter(k => k !== "id" && typeof row[k] !== "object")
                                .slice(0, 4)
                                .map((key) => (
                                  <td key={key} className="py-3 px-4 text-slate-600 dark:text-slate-350 truncate max-w-[200px]">
                                    {String(row[key])}
                                  </td>
                                ))
                              }
                              <td className="py-3 px-4 text-center">
                                <button
                                  onClick={() => {
                                    if (confirm(`Êtes-vous sûr de vouloir supprimer définitivement l'enregistrement ${row.id} de la table ${selectedDbTable} ?`)) {
                                      const updatedTableData = rawDb[selectedDbTable].filter((item: any) => item.id !== row.id);
                                      
                                      fetch("/api/admin/raw-db/update-table", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ table: selectedDbTable, data: updatedTableData })
                                      })
                                        .then(res => res.json())
                                        .then(response => {
                                          alert(response.message || "Opération réussie.");
                                          // Reload DB state locally
                                          setRawDb((prev: any) => ({
                                            ...prev,
                                            [selectedDbTable]: updatedTableData
                                          }));
                                        })
                                        .catch(e => {
                                          console.error(e);
                                          alert("Erreur technique lors de la suppression.");
                                        });
                                    }
                                  }}
                                  className="p-1 px-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-md transition font-bold text-[10px]"
                                >
                                  Supprimer
                                </button>
                              </td>
                            </tr>
                          ))
                        }
                        {rawDb[selectedDbTable].length === 0 && (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-400 italic">Aucun enregistrement trouvé dans cette table.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400 italic">Chargement des données du serveur...</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
