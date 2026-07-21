/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Calendar, 
  Users, 
  FileText, 
  MessageSquare, 
  Check, 
  Plus, 
  Search, 
  ChevronRight, 
  Send, 
  Shield, 
  Edit3,
  Trash2,
  Lock,
  Download,
  Upload,
  BookOpen,
  HelpCircle,
  Video,
  Sparkles
} from "lucide-react";
import { UserRole, AppointmentStatus, ConsultationMode } from "../types.js";
import { playPhoneRingSound } from "../utils/audio.js";
import VideoRoom from "./VideoRoom.js";

interface SpecialistPortalProps {
  disableAnimations: boolean;
}

export default function SpecialistPortal({ disableAnimations }: SpecialistPortalProps) {
  const [specLoggedIn, setSpecLoggedIn] = useState(false);
  const [username, setUsername] = useState("amina"); // Test specialist login
  const [password, setPassword] = useState("therapist123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Specialist Session details
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [sessionSpec, setSessionSpec] = useState<any>(null);

  // Tab views
  const [activeTab, setActiveTab] = useState<"agenda" | "patients" | "messages" | "guide" | "documents">("agenda");
  const [documents, setDocuments] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Clinical data states
  const [appointments, setAppointments] = useState<any[]>([]);
  const [childrenList, setChildrenList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [seriousGameResults, setSeriousGameResults] = useState<any[]>([]);

  // Messaging state
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessageText, setNewMessageText] = useState("");

  // Active consultation filling form modal/section
  const [fillingConsultationApt, setFillingConsultationApt] = useState<any>(null);

  // Active Video Call Appointment
  const [activeVideoApt, setActiveVideoApt] = useState<any | null>(null);

  const handleSaveClinicalNotesFromVideo = (clinicalData: any) => {
    const payload = {
      appointmentId: clinicalData.appointmentId,
      childId: fillingConsultationApt?.childId || clinicalData.childId,
      specialistId: sessionSpec?.id,
      motif: clinicalData.motif,
      diagnostic: clinicalData.diagnostic,
      observations: clinicalData.observations,
      objectifs: clinicalData.objectifs,
      recommandations: clinicalData.recommandations,
      planSuivi: clinicalData.recommandations,
      signatureData: "",
      nextAppointmentDate: ""
    };

    fetch("/api/consultations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then((res) => {
        if (res.ok) {
          const updated = appointments.map(a => 
            a.id === clinicalData.appointmentId ? { ...a, status: AppointmentStatus.CONFIRME } : a
          );
          setAppointments(updated);
          alert("Fiche clinique de téléconsultation enregistrée, signée et indexée avec succès.");
          setFillingConsultationApt(null);
        } else {
          alert("Erreur lors de la sauvegarde clinique de téléconsultation.");
        }
      })
      .catch((err) => console.error(err));
  };

  // Form Fields for Clinical Consultation Sheet (Section 8)
  const [motif, setMotif] = useState("");
  const [diagnostic, setDiagnostic] = useState("Dyslexie");
  const [observations, setObservations] = useState("");
  const [objectifs, setObjectifs] = useState("");
  const [recommandations, setRecommandations] = useState("");
  const [planSuivi, setPlanSuivi] = useState("");
  const [nextAppointmentDate, setNextAppointmentDate] = useState("");

  // Signature Canvas Reference
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Authenticate Specialist
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    })
      .then(async (res) => {
        setLoading(false);
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || "Identifiants invalides.");
        } else {
          setSessionUser(data.user);
          setSessionSpec(data.profile);
          setSpecLoggedIn(true);
          loadSpecialistData(data.profile.id);
          loadMessages(data.user.id);
        }
      })
      .catch((err) => {
        setLoading(false);
        setError("Erreur de connexion.");
      });
  };

  const loadSpecialistData = (specId: string) => {
    // Load appointments linked to this specialist
    fetch("/api/appointments")
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter((a: any) => a.specialistId === specId);
        setAppointments(filtered);
      })
      .catch((err) => console.error(err));

    // Load full patient database
    fetch("/api/children")
      .then((res) => res.json())
      .then((data) => setChildrenList(data))
      .catch((err) => console.error(err));

    // Load serious game logs
    fetch("/api/serious-game-results")
      .then((res) => res.json())
      .then((data) => setSeriousGameResults(data))
      .catch((err) => console.error(err));

    // Load shared documents
    fetch("/api/documents")
      .then((res) => res.json())
      .then((data) => setDocuments(data))
      .catch((err) => console.error(err));
  };

  const loadMessages = (userId: string) => {
    fetch("/api/messages")
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter((m: any) => m.senderId === userId || m.receiverId === userId);
        setMessages(filtered);
      })
      .catch((err) => console.error(err));
  };

  const handleFileUpload = (file: File) => {
    if (!sessionSpec) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const fileUrl = e.target?.result as string;
      const fileType = file.name.split('.').pop()?.toUpperCase() || "PDF";
      const payload = {
        title: file.name,
        fileType,
        fileUrl,
        ownerId: sessionSpec.id,
        sharedWithIds: ["admin"]
      };
      
      try {
        const res = await fetch("/api/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          loadSpecialistData(sessionSpec.id);
        }
      } catch (err) {
        console.error("Error sharing file", err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteDocument = async (id: string) => {
    if (!sessionSpec) return;
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        loadSpecialistData(sessionSpec.id);
      }
    } catch (err) {
      console.error("Error deleting document", err);
    }
  };

  // Canvas Drawing Actions for Signature Pad
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "blue";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";

    const { x, y } = getCoord(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoord(e, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const getCoord = (e: any, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Submit Completed Clinical consultation (Section 8)
  const handleSubmitConsultation = () => {
    if (!motif || !observations) {
      alert("Veuillez remplir au moins les motifs et observations cliniques de la séance.");
      return;
    }

    // Get signature image as Base64 string
    let signatureData = "";
    if (canvasRef.current) {
      signatureData = canvasRef.current.toDataURL("image/png");
    }

    const payload = {
      appointmentId: fillingConsultationApt.id,
      childId: fillingConsultationApt.childId,
      specialistId: sessionSpec.id,
      motif,
      diagnostic,
      observations,
      objectifs,
      recommandations,
      planSuivi,
      signatureData,
      nextAppointmentDate
    };

    fetch("/api/consultations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then((res) => {
        if (res.ok) {
          // Update local appointment list status to reflect clinical entry
          const updated = appointments.map(a => 
            a.id === fillingConsultationApt.id ? { ...a, status: AppointmentStatus.CONFIRME } : a
          );
          setAppointments(updated);
          
          alert("Fiche clinique enregistrée, signée et indexée dans le dossier numérique du patient.");
          
          // Reset form
          setFillingConsultationApt(null);
          setMotif("");
          setObservations("");
          setObjectifs("");
          setRecommandations("");
          setPlanSuivi("");
          setNextAppointmentDate("");
        } else {
          alert("Erreur lors de la sauvegarde clinique.");
        }
      })
      .catch((err) => console.error(err));
  };

  const handleSendMessage = () => {
    if (!newMessageText.trim()) return;

    // Send to administrator by default
    const payload = {
      senderId: sessionUser.id,
      receiverId: "u-admin",
      content: newMessageText
    };

    fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then((res) => res.json())
      .then((newMsg) => {
        setMessages([...messages, newMsg]);
        setNewMessageText("");
      })
      .catch((err) => console.error(err));
  };

  // Filtering patients by name
  const filteredPatients = childrenList.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="specialist-portal-container" className="space-y-6">
      {/* LOGIN VIEW */}
      {!specLoggedIn ? (
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-xl text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 flex items-center justify-center mb-4">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Espace Spécialiste / Clinique</h2>
          <p className="text-xs text-slate-500 mb-6">Interface sécurisée de gestion des consultations et dossiers numériques patients.</p>

          {error && (
            <div className="mb-4 text-xs font-semibold text-orange-700 bg-orange-50 p-2.5 rounded-lg border border-orange-100">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-500 uppercase">Nom d'utilisateur d'essai</label>
              <select
                id="sel-spec-login-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white font-semibold"
              >
                <option value="amina">Dr. Amina Bennani (Orthophonie)</option>
                <option value="youssef">M. Youssef El Amrani (Psychomotricien)</option>
                <option value="sofia">Dr. Sofia Alami (Neuropsychologue)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-500 uppercase">Mot de passe *</label>
              <input
                id="inp-spec-login-pwd"
                type="password"
                placeholder="Entrez therapist123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <button
              id="btn-spec-login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 font-bold text-xs text-white rounded-xl shadow transition duration-150"
            >
              {loading ? "Authentification..." : "S'authentifier"}
            </button>
          </form>
          
          <p className="mt-4 text-[10px] text-slate-400">
            Note: Utilisez le mot de passe "therapist123" pour vous connecter avec n'importe quel spécialiste de test.
          </p>
        </div>
      ) : (
        /* PORTAL ACTIVE WORKSPACE */
        <div className="space-y-6">
          {/* Header block */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center font-bold dark:bg-emerald-900 dark:text-emerald-100 border">
                {sessionSpec?.name.split(" ").slice(-1)[0][0]}
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-white">{sessionSpec?.name}</h1>
                <p className="text-[10px] text-slate-400">Pôle Clinique : <strong>{sessionSpec?.specialties.join(", ")}</strong> • Guichet {sessionSpec?.guichetId}</p>
              </div>
            </div>

            {/* Menu tab switcher */}
            <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold text-slate-500">
              <button
                id="btn-tab-spec-agenda"
                onClick={() => setActiveTab("agenda")}
                className={`px-4 py-2 rounded-lg transition-all ${activeTab === "agenda" ? "bg-white text-emerald-800 shadow dark:bg-slate-700 dark:text-emerald-400" : "hover:text-slate-700 dark:hover:text-slate-300"}`}
              >
                Agenda du Jour
              </button>
              <button
                id="btn-tab-spec-patients"
                onClick={() => setActiveTab("patients")}
                className={`px-4 py-2 rounded-lg transition-all ${activeTab === "patients" ? "bg-white text-emerald-800 shadow dark:bg-slate-700 dark:text-emerald-400" : "hover:text-slate-700 dark:hover:text-slate-300"}`}
              >
                Base Patients (Dossiers)
              </button>
              <button
                id="btn-tab-spec-messages"
                onClick={() => setActiveTab("messages")}
                className={`px-4 py-2 rounded-lg transition-all ${activeTab === "messages" ? "bg-white text-emerald-800 shadow dark:bg-slate-700 dark:text-emerald-400" : "hover:text-slate-700 dark:hover:text-slate-300"}`}
              >
                Courrier Interne ({messages.filter(m => !m.isRead && m.receiverId === sessionUser.id).length})
              </button>
              <button
                id="btn-tab-spec-guide"
                onClick={() => setActiveTab("guide")}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${activeTab === "guide" ? "bg-white text-emerald-800 shadow dark:bg-slate-700 dark:text-emerald-400" : "hover:text-slate-700 dark:hover:text-slate-300"}`}
              >
                <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
                Guide Clinique
              </button>
              <button
                id="btn-tab-spec-documents"
                onClick={() => setActiveTab("documents")}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${activeTab === "documents" ? "bg-white text-emerald-800 shadow dark:bg-slate-700 dark:text-emerald-400" : "hover:text-slate-700 dark:hover:text-slate-300"}`}
              >
                <FileText className="h-3.5 w-3.5 text-emerald-600" />
                Partage Fichiers
              </button>
            </div>
          </div>

          {/* ACTIVE TAB: AGENDA / CONSULTATION FILLER */}
          {activeTab === "agenda" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Daily Consultations Queue (Left) */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-4 h-[75vh] overflow-y-auto">
                <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                  <Calendar className="h-4.5 w-4.5 text-emerald-600" /> Vos rendez-vous assignés
                </h3>

                <div className="space-y-3">
                  {appointments.length > 0 ? (
                    appointments.map((apt) => (
                      <div
                        key={apt.id}
                        onClick={() => setFillingConsultationApt(apt)}
                        className={`p-4 rounded-xl border text-left cursor-pointer transition ${
                          fillingConsultationApt?.id === apt.id
                            ? "border-emerald-600 bg-emerald-50/20 dark:bg-emerald-950/20"
                            : "border-slate-100 bg-slate-50/40 hover:border-slate-200 dark:bg-slate-800/40 dark:border-slate-800"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-slate-800 dark:text-white">{apt.childName}</span>
                          <span className="text-[9px] text-slate-400">{apt.slot}</span>
                        </div>
                        <p className="text-[10px] text-slate-500">Tuteur : {apt.parentName} • {apt.parentPhone}</p>
                        <div className="mt-2.5 flex items-center justify-between">
                          <span className="text-[9px] font-semibold text-emerald-800 dark:text-emerald-400">Mode : {apt.mode}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase ${
                            apt.status === AppointmentStatus.CONFIRME 
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" 
                              : "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300"
                          }`}>
                            {apt.status === AppointmentStatus.CONFIRME ? "Dossier traité" : "En attente"}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">Aucun rendez-vous assigné.</p>
                  )}
                </div>
              </div>

              {/* Consultation record sheet Form (Right / Middle columns) (Section 8) */}
              <div className="lg:col-span-2">
                {fillingConsultationApt ? (
                  <div className="bg-white dark:bg-slate-900 border border-emerald-600/30 rounded-2xl p-6 space-y-6 shadow-sm">
                    {/* Header info */}
                    <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                      <div>
                        <h3 className="font-bold text-slate-800 dark:text-white text-base">Fiche Clinique Numérique Patient</h3>
                        <p className="text-xs text-slate-400">Saisie des conclusions pour : <strong>{fillingConsultationApt.childName}</strong></p>
                      </div>
                      <span className="text-xs font-mono bg-slate-50 border px-3 py-1 rounded-lg dark:bg-slate-800 dark:text-slate-300">
                        Réf: {fillingConsultationApt.id}
                      </span>
                    </div>

                    {/* Teleconsultation launcher banner */}
                    {fillingConsultationApt.mode === "TELECONSULTATION" && (
                      <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white rounded-xl p-4.5 border border-emerald-600/30 flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h4 className="font-bold text-xs flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                            Séance en Téléconsultation Vidéo Live
                          </h4>
                          <p className="text-[10px] text-emerald-100 leading-relaxed max-w-md">
                            Cette consultation se déroule à distance. Démarrez l'espace visioconférence pour interagir avec le patient et remplir ce dossier clinique simultanément.
                          </p>
                        </div>
                        <button
                          id="btn-spec-start-teleconsultation"
                          onClick={() => setActiveVideoApt(fillingConsultationApt)}
                          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 font-extrabold text-[11px] text-slate-950 rounded-xl transition shadow flex items-center gap-1.5 shrink-0"
                        >
                          <Video className="h-4 w-4 animate-pulse" />
                          Lancer la visioconférence
                        </button>
                      </div>
                    )}

                    {/* Inputs fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1">
                        <label className="block font-semibold text-slate-500">Motif clinique de consultation *</label>
                        <input
                          id="inp-spec-motif"
                          type="text"
                          required
                          placeholder="Ex: Retard d'acquisition de la lecture phonémique"
                          value={motif}
                          onChange={(e) => setMotif(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block font-semibold text-slate-500">Diagnostic clinique posé</label>
                        <select
                          id="sel-spec-diag"
                          value={diagnostic}
                          onChange={(e) => setDiagnostic(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        >
                          <option value="Dyslexie">Dyslexie phonologique / de surface</option>
                          <option value="Dysorthographie">Dysorthographie d'usage / grammaticale</option>
                          <option value="Dyscalculie">Dyscalculie développementale</option>
                          <option value="Dyspraxie">Dyspraxie visuo-spatiale</option>
                          <option value="TDAH">TDAH (Trouble déficitaire de l'attention)</option>
                          <option value="Retard de langage">Retard simple du langage oral</option>
                        </select>
                      </div>

                      <div className="md:col-span-2 space-y-1">
                        <label className="block font-semibold text-slate-500">Observations thérapeutiques & cliniques *</label>
                        <textarea
                          id="txt-spec-obs"
                          rows={3}
                          required
                          placeholder="Ex: Enfant très attentif au début mais fatigabilité marquée. Confusions phonémiques b/d et p/q confirmées..."
                          value={observations}
                          onChange={(e) => setObservations(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block font-semibold text-slate-500">Objectifs de rééducation</label>
                        <textarea
                          id="txt-spec-obj"
                          rows={2}
                          placeholder="Ex: Automatisation de l'association graphème/phonème, amélioration de la fluidité de balayage visuel..."
                          value={objectifs}
                          onChange={(e) => setObjectifs(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block font-semibold text-slate-500">Recommandations pour la famille & école</label>
                        <textarea
                          id="txt-spec-rec"
                          rows={2}
                          placeholder="Ex: Tiers-temps scolaire, lecture sur fond vert pour apaiser les contrastes, double interligne..."
                          value={recommandations}
                          onChange={(e) => setRecommandations(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block font-semibold text-slate-500">Plan de suivi & Fréquence</label>
                        <input
                          id="inp-spec-plan"
                          type="text"
                          placeholder="Ex: 2 séances par semaine pendant 3 mois"
                          value={planSuivi}
                          onChange={(e) => setPlanSuivi(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block font-semibold text-slate-500">Date proposée prochain rendez-vous</label>
                        <input
                          id="inp-spec-next-date"
                          type="date"
                          value={nextAppointmentDate}
                          onChange={(e) => setNextAppointmentDate(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* ELECTRONIC SIGNATURE PAD CANVAS (Section 8) */}
                    <div className="space-y-2 border-t pt-4">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-slate-500 uppercase">Signature Électronique Obligatoire *</label>
                        <button
                          id="btn-clear-sig"
                          onClick={clearSignature}
                          className="text-[10px] text-orange-600 hover:underline"
                        >
                          Effacer signature
                        </button>
                      </div>

                      <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-1">
                        <canvas
                          id="signature-canvas"
                          ref={canvasRef}
                          width={400}
                          height={120}
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={startDrawing}
                          onTouchMove={draw}
                          onTouchEnd={stopDrawing}
                          className="w-full max-w-sm h-28 bg-white dark:bg-slate-900 border rounded cursor-crosshair border-slate-200"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 text-center">Signez à l'aide de votre souris ou de votre écran tactile à l'intérieur du cadre blanc.</p>
                    </div>

                    {/* Footer buttons */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                      <button
                        id="btn-cancel-clinical-form"
                        onClick={() => setFillingConsultationApt(null)}
                        className="px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300"
                      >
                        Annuler
                      </button>
                      <button
                        id="btn-save-clinical-form"
                        onClick={handleSubmitConsultation}
                        className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 rounded-xl text-xs font-bold text-white shadow"
                      >
                        Enregistrer & Clôturer dossier
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/80 flex flex-col items-center justify-center text-center p-12 text-slate-400">
                    <FileText className="h-10 w-10 text-slate-300 mb-3 animate-pulse" />
                    <p className="text-xs font-bold">Sélectionnez une séance d'attente à gauche pour remplir la fiche d'observations cliniques.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ACTIVE TAB: PATIENTS LIST */}
          {activeTab === "patients" && (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-3">
                <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                  <Users className="h-4.5 w-4.5 text-emerald-600" /> Dossiers Cliniques d'Apprentissage (Patientèle)
                </h3>
                
                {/* Search query input */}
                <div className="relative max-w-xs">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                    <Search className="h-3.5 w-3.5" />
                  </span>
                  <input
                    id="inp-search-patient"
                    type="text"
                    placeholder="Rechercher un enfant..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Patient cards list */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((child) => {
                    const childGames = seriousGameResults.filter(
                      (r) => r.childId === child.id || r.childName.toLowerCase().includes(child.name.toLowerCase())
                    );
                    const defaultWhatsapp = "212668990011";
                    const activeWhatsapp = childGames[0]?.whatsappNumber 
                      ? childGames[0].whatsappNumber.replace(/[^0-9]/g, "") 
                      : defaultWhatsapp;

                    const reviewMsg = encodeURIComponent(
                      `Bonjour, c'est l'équipe thérapeutique de l'AMTDA Maroc. Suite à notre évaluation du dossier de ${child.name} et de ses activités de jeux éducatifs, voici nos conseils d'accompagnement...`
                    );

                    return (
                      <div key={child.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/20 space-y-3.5 text-xs flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 border-b border-dashed pb-2">
                            <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                              {child.name[0]}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 dark:text-white">{child.name}</p>
                              <p className="text-[10px] text-slate-400">Né(e) le : {child.birthdate}</p>
                            </div>
                          </div>
                          <p><strong>Niveau Scolaire :</strong> {child.schoolGrade}</p>
                          <div className="flex flex-wrap gap-1">
                            {child.diagnostics.map((diag: string) => (
                              <span key={diag} className="px-2 py-0.5 bg-orange-100 text-orange-800 font-bold rounded text-[9px] dark:bg-orange-950 dark:text-orange-300">
                                {diag}
                              </span>
                            ))}
                          </div>

                          {/* Serious Games Results Section */}
                          <div className="border-t pt-2.5 space-y-2">
                            <span className="block font-bold text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
                              <Sparkles className="h-3 w-3 text-amber-500" /> Jeux & Activités Récentes
                            </span>
                            {childGames.length > 0 ? (
                              <div className="space-y-1.5 bg-white dark:bg-slate-900 border rounded-lg p-2">
                                {childGames.map((g: any) => (
                                  <div key={g.id} className="flex items-center justify-between text-[11px] border-b last:border-b-0 pb-1.5 last:pb-0">
                                    <div>
                                      <p className="font-bold text-slate-850 dark:text-slate-200">{g.gameName}</p>
                                      <p className="text-[9px] text-slate-400">{new Date(g.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                      <span className="font-extrabold text-emerald-700 dark:text-emerald-400">{g.score}/10</span>
                                      <p className="text-[9px] text-slate-400 uppercase italic font-medium">{g.status === "reussite" ? "Réussi" : "Entraînement"}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[10px] text-slate-400 italic">Aucune activité de jeu ludo-éducatif enregistrée pour le moment.</p>
                            )}
                          </div>
                        </div>

                        {/* WhatsApp Communication & reviewed results dispatch */}
                        <div className="pt-2">
                          <a
                            href={`https://wa.me/${activeWhatsapp}?text=${reviewMsg}`}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full py-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-[10px] rounded-lg text-center transition flex items-center justify-center gap-1 shadow-sm"
                          >
                            WhatsApp : Envoyer Résultats & Conseils
                          </a>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-xs text-slate-400 py-12 md:col-span-3">Aucun dossier trouvé pour cette recherche.</p>
                )}
              </div>
            </div>
          )}

          {/* ACTIVE TAB: MESSAGES Direct with Admins / Parents */}
          {activeTab === "messages" && (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="border-b pb-3 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-emerald-600" />
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm">Courrier Interne & Coordination Clinique</h3>
                  <p className="text-[10px] text-slate-400">Échangez instantanément avec l'administration ou la direction d'AMTDA Maroc.</p>
                </div>
              </div>

              {/* Messaging scroll area */}
              <div className="h-80 overflow-y-auto border border-slate-100 rounded-xl bg-slate-50/50 p-4 space-y-4 dark:border-slate-800 dark:bg-slate-950/20">
                {messages.length > 0 ? (
                  messages.map((msg) => {
                    const isMe = msg.senderId === sessionUser.id;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-xs p-3 rounded-2xl text-xs space-y-1 ${
                          isMe 
                            ? "bg-emerald-700 text-white rounded-tr-none" 
                            : "bg-white text-slate-800 rounded-tl-none border shadow-sm dark:bg-slate-900 dark:text-slate-100 dark:border-slate-800"
                        }`}>
                          <p>{msg.content}</p>
                          <span className="block text-[8px] text-right opacity-60">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-xs text-slate-400 py-12">Aucun message échangé.</p>
                )}
              </div>

              {/* Send message form */}
              <div className="flex gap-2 pt-2">
                <input
                  id="inp-spec-chat-msg"
                  type="text"
                  placeholder="Écrivez une note professionnelle pour l'administration..."
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <button
                  id="btn-spec-chat-send"
                  onClick={handleSendMessage}
                  className="px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl flex items-center justify-center transition duration-150"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ACTIVE TAB: DETAILED SPECIALIST GUIDE */}
          {activeTab === "guide" && (
            <div className="space-y-6 text-xs animate-fadeIn">
              <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-48 h-48 bg-emerald-700/10 rounded-full blur-2xl"></div>
                <div className="relative space-y-3 max-w-2xl">
                  <span className="px-3 py-1 bg-emerald-500/20 backdrop-blur text-emerald-300 rounded-full font-bold text-[10px] uppercase tracking-wider">
                    Pôle Clinique AMTDA Maroc
                  </span>
                  <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">
                    Manuel de Pratique & d'Orientation Thérapeutique
                  </h2>
                  <p className="text-emerald-100 text-xs">
                    Ce guide interactif vous accompagne dans la mise en oeuvre clinique, la rédaction des fiches de suivi, et l'évaluation diagnostique pour garantir le respect rigoureux de notre protocole des 6 Guichets d'apprentissage.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chapters list (Left) */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Chapter 1 */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                      <span className="h-6 w-6 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xs dark:bg-emerald-950 dark:text-emerald-400">1</span>
                      Protocole clinique des 6 Guichets d'Apprentissage
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      L'association AMTDA Maroc structure son pôle d'intervention en 6 disciplines d'apprentissage distinctes pour une rééducation globale et coordonnée :
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                        <p className="font-bold text-emerald-800 dark:text-emerald-400">1. Orthophonie (Guichet 1)</p>
                        <p className="text-[10px] text-slate-500 mt-1">Diagnostic et rééducation des troubles du langage écrit et oral (Dyslexie, Dysorthographie).</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                        <p className="font-bold text-emerald-800 dark:text-emerald-400">2. Psychomotricité (Guichet 2)</p>
                        <p className="text-[10px] text-slate-500 mt-1">Prise en charge des praxies, de la latéralité, de l'orientation spatio-temporelle et de la dysgraphie.</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                        <p className="font-bold text-emerald-800 dark:text-emerald-400">3. Neuropsychologie (Guichet 3)</p>
                        <p className="text-[10px] text-slate-500 mt-1">Bilans cognitifs globaux, évaluation attentionnelle (TDAH) et fonctions exécutives.</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                        <p className="font-bold text-emerald-800 dark:text-emerald-400">4. Psychologie Clinique (Guichet 4)</p>
                        <p className="text-[10px] text-slate-500 mt-1">Gestion de l'anxiété scolaire, soutien émotionnel des enfants et guidance parentale.</p>
                      </div>
                    </div>
                  </div>

                  {/* Chapter 2 */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                      <span className="h-6 w-6 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xs dark:bg-emerald-950 dark:text-emerald-400">2</span>
                      Saisie Clinique et Traçabilité Tactile
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      Pour chaque consultation, vous devez impérativement saisir vos conclusions cliniques. Le système automatise le partage sécurisé avec la famille :
                    </p>
                    <div className="p-4 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900 text-[11px] space-y-2">
                      <p className="font-bold text-emerald-800 dark:text-emerald-400">📋 Règles de conformité de saisie :</p>
                      <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-300">
                        <li><strong>Observations objectives :</strong> Notez la fatigabilité, le score ou l'avancée de la lecture syllabique.</li>
                        <li><strong>Signature Électronique :</strong> Utilisez le pad tactile pour apposer votre signature professionnelle avant l'enregistrement.</li>
                        <li><strong>Archivage RGPD :</strong> Le document est automatiquement chiffré et indexé dans le dossier numérique du patient, accessible en temps réel par les parents.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* FAQ & Simulation Tools (Right column) */}
                <div className="space-y-4">
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                    <h4 className="font-bold text-slate-800 dark:text-white text-xs flex items-center gap-1.5 uppercase tracking-wider">
                      <HelpCircle className="h-4 w-4 text-emerald-600" />
                      Questions Fréquentes (FAQ)
                    </h4>
                    
                    <div className="space-y-3 text-[11px]">
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1">
                        <p className="font-bold text-slate-800 dark:text-white">Q: Comment modifier un créneau d'agenda ?</p>
                        <p className="text-slate-500 leading-relaxed">R: Les créneaux horaires sont générés automatiquement selon la disponibilité de la salle physique attribuée par l'administrateur dans le Back Office.</p>
                      </div>

                      <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1">
                        <p className="font-bold text-slate-800 dark:text-white">Q: Les parents reçoivent-ils mes comptes-rendus ?</p>
                        <p className="text-slate-500 leading-relaxed">R: Oui, dès que vous validez la fiche clinique et la signez, un rapport PDF est partagé en temps réel sur l'Espace Parent.</p>
                      </div>

                      <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1">
                        <p className="font-bold text-slate-800 dark:text-white">Q: Comment contacter l'administration ?</p>
                        <p className="text-slate-500 leading-relaxed">R: Utilisez l'onglet "Courrier Interne" pour envoyer un message direct instantané à la direction.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
                    <h4 className="font-bold text-slate-800 dark:text-white text-xs flex items-center gap-1.5 uppercase tracking-wider">
                      ☎️ Test Sonnerie Téléphone
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      Survoler l'élément ci-dessous pour tester l'animation et la sonnerie premium intégrée aux numéros de la plateforme.
                    </p>
                    <div className="pt-2">
                      <a
                        href="tel:+212522458900"
                        onMouseEnter={() => playPhoneRingSound()}
                        className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400 hover:border-emerald-600 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 hover:scale-105 transition-all duration-300"
                      >
                        🔔 Survoler pour téléphoner
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CLINICAL DOCUMENTS CENTER */}
          {activeTab === "documents" && (
            <div className="space-y-6 text-xs animate-fadeIn">
              <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-48 h-48 bg-emerald-700/10 rounded-full blur-2xl"></div>
                <div className="relative space-y-3 max-w-2xl">
                  <span className="px-3 py-1 bg-emerald-500/20 backdrop-blur text-emerald-300 rounded-full font-bold text-[10px] uppercase tracking-wider">
                    Espace d'Échange Documentaire Clinique
                  </span>
                  <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">
                    Partage Sécurisé de Fichiers (Administration ⇄ Médecins)
                  </h2>
                  <p className="text-emerald-100 text-xs">
                    Déposez ou téléchargez des documents diagnostiques officiels, des prescriptions types, des bilans de psychomotricité ou d'orthophonie, ainsi que des fiches de suivi validées. Tous les documents respectent les exigences de protection des données cliniques.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Upload container */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm">Transférer un fichier clinique</h3>
                    <p className="text-slate-500 leading-relaxed text-[11px]">
                      Partagez instantanément un fichier avec l'administration de l'association AMTDA. Format admis : PDF, Image, TXT ou DOC.
                    </p>

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
                      className={`border-2 border-dashed rounded-2xl p-8 text-center transition flex flex-col items-center justify-center gap-3 cursor-pointer ${
                        isDragging
                          ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20"
                          : "border-slate-200 hover:border-emerald-500/50 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850/50"
                      }`}
                      onClick={() => document.getElementById("spec-file-upload-input")?.click()}
                    >
                      <Upload className="h-8 w-8 text-slate-400 animate-pulse" />
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Glissez-déposez le fichier ici</p>
                        <p className="text-[10px] text-slate-400">PDF, PNG, JPG, TXT, DOC (max 10MB)</p>
                      </div>
                      <span className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-300 transition">
                        Parcourir l'ordinateur
                      </span>
                      <input
                        id="spec-file-upload-input"
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
                  </div>
                </div>

                {/* Right Column: Files received and files sent */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Documents received from Admin */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                      <Download className="h-4 w-4 text-emerald-600" /> Documents reçus de la Direction
                    </h3>
                    {(() => {
                      const received = documents.filter(
                        (d) => d.ownerId === "admin" && d.sharedWithIds?.includes(sessionSpec.id)
                      );
                      if (received.length > 0) {
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto">
                            {received.map((doc) => (
                              <div key={doc.id} className="p-3 border rounded-xl bg-slate-50/50 dark:bg-slate-800/10 flex flex-col justify-between gap-3 text-xs">
                                <div className="space-y-1">
                                  <p className="font-bold text-slate-800 dark:text-white truncate" title={doc.title}>{doc.title}</p>
                                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                    <span className="px-1.5 py-0.5 bg-slate-150 dark:bg-slate-800 rounded font-bold">{doc.fileType}</span>
                                    <span>Reçu le {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                                  </div>
                                </div>
                                <div className="flex gap-2 justify-end">
                                  <a
                                    href={doc.fileUrl}
                                    download={doc.title}
                                    className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[10px] font-bold shadow-sm transition"
                                  >
                                    Télécharger
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      } else {
                        return (
                          <p className="text-xs text-slate-400 italic py-8 text-center bg-slate-50/30 rounded-xl border border-dashed">
                            Aucun document reçu de l'administration pour le moment.
                          </p>
                        );
                      }
                    })()}
                  </div>

                  {/* Documents uploaded by Specialist */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                      <Upload className="h-4 w-4 text-emerald-600" /> Documents partagés avec la Direction
                    </h3>
                    {(() => {
                      const sent = documents.filter((d) => d.ownerId === sessionSpec.id);
                      if (sent.length > 0) {
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto">
                            {sent.map((doc) => (
                              <div key={doc.id} className="p-3 border rounded-xl bg-slate-50/50 dark:bg-slate-800/10 flex flex-col justify-between gap-3 text-xs">
                                <div className="space-y-1">
                                  <p className="font-bold text-slate-800 dark:text-white truncate" title={doc.title}>{doc.title}</p>
                                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                    <span className="px-1.5 py-0.5 bg-slate-150 dark:bg-slate-800 rounded font-bold">{doc.fileType}</span>
                                    <span>Mis en ligne le {new Date(doc.uploadedAt).toLocaleDateString()}</span>
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
                          <p className="text-xs text-slate-400 italic py-8 text-center bg-slate-50/30 rounded-xl border border-dashed">
                            Vous n'avez pas encore partagé de document avec la direction.
                          </p>
                        );
                      }
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FULL-SCREEN IMMERSIVE VIDEO ROOM PORTAL (Section 8) */}
      {activeVideoApt && (
        <VideoRoom
          role="specialist"
          appointment={activeVideoApt}
          onClose={() => setActiveVideoApt(null)}
          onSaveClinicalNotes={handleSaveClinicalNotesFromVideo}
        />
      )}
    </div>
  );
}
