/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  User, 
  FileText, 
  MessageSquare, 
  Phone, 
  Activity, 
  Download, 
  Printer, 
  Send, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  FileBadge,
  Clock,
  Video,
  Sparkles,
  Award,
  HelpCircle
} from "lucide-react";
import { AppointmentStatus } from "../types.js";
import VideoRoom from "./VideoRoom.js";

interface ParentPortalProps {
  disableAnimations: boolean;
}

export default function ParentPortal({ disableAnimations }: ParentPortalProps) {
  const [parentLoggedIn, setParentLoggedIn] = useState(false);
  const [parentPhone, setParentPhone] = useState("+212 668-990011"); // Seeded parent
  const [parentPassword, setParentPassword] = useState("parent123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Portal active view tab
  const [activeTab, setActiveTab] = useState<"summary" | "dossier" | "messages" | "games">("summary");

  // Loaded parent session details
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [sessionParent, setSessionParent] = useState<any>(null);
  const [childData, setChildData] = useState<any>(null);

  // Active Video Call Appointment
  const [activeVideoApt, setActiveVideoApt] = useState<any | null>(null);

  // Messaging state
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessageText, setNewMessageText] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "samir", password: parentPassword }) // using the seeded account
    })
      .then(async (res) => {
        setLoading(false);
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || "Identifiants invalides.");
        } else {
          setSessionUser(data.user);
          setSessionParent(data.profile);
          setParentLoggedIn(true);
          loadChildData("ch-yassine"); // Load seeded child
          loadMessages(data.user.id);
        }
      })
      .catch((err) => {
        setLoading(false);
        setError("Erreur de connexion avec le serveur.");
      });
  };

  const loadChildData = (childId: string) => {
    fetch(`/api/children/${childId}`)
      .then((res) => res.json())
      .then((data) => setChildData(data))
      .catch((err) => console.error("Error loading child clinical file", err));
  };

  const loadMessages = (userId: string) => {
    fetch("/api/messages")
      .then((res) => res.json())
      .then((data) => {
        // filter messages between this parent user and specialists
        const filtered = data.filter((m: any) => m.senderId === userId || m.receiverId === userId);
        setMessages(filtered);
      })
      .catch((err) => console.error("Error loading messages", err));
  };

  const handleSendMessage = () => {
    if (!newMessageText.trim()) return;

    // Send to default specialist (Dr Amina Bennani - u-ben)
    const payload = {
      senderId: sessionUser.id,
      receiverId: "u-ben",
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
        
        // Automated simulated response from Specialist after 2s (Section 9)
        setTimeout(() => {
          const mockReply = {
            id: "msg-reply-" + Math.random(),
            senderId: "u-ben",
            receiverId: sessionUser.id,
            content: "Bonjour Samir. J'ai bien reçu votre message. J'analyse l'évolution de Yassine lors de sa prochaine séance et je vous ferai un retour détaillé.",
            isRead: false,
            createdAt: new Date().toISOString()
          };
          setMessages((prev) => [...prev, mockReply]);
        }, 2000);
      })
      .catch((err) => console.error("Error sending message", err));
  };

  return (
    <div id="parent-portal-container" className="space-y-6">
      {/* LOGIN VIEW */}
      {!parentLoggedIn ? (
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-xl text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 flex items-center justify-center mb-4">
            <User className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Espace Parent AMTDA</h2>
          <p className="text-xs text-slate-500 mb-6">Saisissez vos identifiants pour suivre les séances et consulter le dossier numérique de votre enfant.</p>
          
          {error && (
            <div className="mb-4 text-xs font-semibold text-orange-700 bg-orange-50 p-2.5 rounded-lg border border-orange-100">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-500 uppercase">Nom d'utilisateur d'essai</label>
              <input
                id="inp-parent-login-phone"
                type="text"
                disabled
                value="samir"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs bg-slate-50 text-slate-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
              />
            </div>
            
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-500 uppercase">Mot de passe *</label>
              <input
                id="inp-parent-login-pwd"
                type="password"
                placeholder="Entrez parent123"
                value={parentPassword}
                onChange={(e) => setParentPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <button
              id="btn-parent-login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 font-bold text-xs text-white rounded-xl shadow transition duration-150"
            >
              {loading ? "Chargement..." : "Se connecter"}
            </button>
          </form>

          <p className="mt-4 text-[10px] text-slate-400">
            Note: Utilisez les identifiants de test pré-configurés (samir / parent123) pour tester directement le parcours client.
          </p>
        </div>
      ) : (
        /* PORTAL ACTIVE DASHBOARD */
        <div className="space-y-6">
          {/* Portal header with summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white" data-accessible-text={`Bienvenue dans l'espace parent de ${sessionParent?.name}`}>
                Bonjour, <span className="text-emerald-700 dark:text-emerald-400">{sessionParent?.name}</span>
              </h1>
              <p className="text-xs text-slate-400">Dossier de suivi clinique de l'enfant : <strong>{childData?.child?.name}</strong></p>
            </div>

            {/* Portal Tab Switcher */}
            <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold text-slate-500 w-full md:max-w-xl">
              <button
                id="btn-tab-parent-summary"
                onClick={() => setActiveTab("summary")}
                className={`px-4 py-2 rounded-lg transition-all ${activeTab === "summary" ? "bg-white text-emerald-800 shadow dark:bg-slate-700 dark:text-emerald-400" : "hover:text-slate-700 dark:hover:text-slate-300"}`}
              >
                Général
              </button>
              <button
                id="btn-tab-parent-dossier"
                onClick={() => setActiveTab("dossier")}
                className={`px-4 py-2 rounded-lg transition-all ${activeTab === "dossier" ? "bg-white text-emerald-800 shadow dark:bg-slate-700 dark:text-emerald-400" : "hover:text-slate-700 dark:hover:text-slate-300"}`}
              >
                Dossier Médical
              </button>
              <button
                id="btn-tab-parent-messages"
                onClick={() => setActiveTab("messages")}
                className={`px-4 py-2 rounded-lg transition-all ${activeTab === "messages" ? "bg-white text-emerald-800 shadow dark:bg-slate-700 dark:text-emerald-400" : "hover:text-slate-700 dark:hover:text-slate-300"}`}
              >
                Messagerie Spécialiste
              </button>
              <button
                id="btn-tab-parent-games"
                onClick={() => setActiveTab("games")}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1 ${activeTab === "games" ? "bg-white text-emerald-800 shadow dark:bg-slate-700 dark:text-emerald-400" : "hover:text-slate-700 dark:hover:text-slate-300"}`}
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" /> Jeux & Activités
              </button>
            </div>
          </div>

          {/* TAB 1: SUMMARY TAB */}
          {activeTab === "summary" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left col: Child Card & Teleconsultation shortcut */}
              <div className="space-y-6">
                <div className="bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-orange-100 text-orange-800 flex items-center justify-center font-extrabold text-lg">
                      {childData?.child?.name[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-white text-sm">{childData?.child?.name}</h3>
                      <p className="text-[10px] text-slate-400">{childData?.child?.schoolGrade}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <p><strong>Né(e) le :</strong> {childData?.child?.birthdate}</p>
                    <p><strong>Genre :</strong> {childData?.child?.gender}</p>
                    <p><strong>Difficultés identifiées :</strong></p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {childData?.child?.diagnostics.length > 0 ? (
                        childData.child.diagnostics.map((diag: string) => (
                          <span key={diag} className="px-2 py-0.5 bg-orange-100 text-orange-800 font-bold rounded-md text-[10px] dark:bg-orange-950 dark:text-orange-300">
                            {diag}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] italic text-slate-400">Aucun diagnostic enregistré</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* PREMIUM TELECONSULTATION LINK CARD */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden flex flex-col justify-between gap-4 text-white">
                  <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-24 h-24 bg-emerald-600/20 rounded-full blur-xl"></div>
                  <div className="space-y-1.5 relative">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 bg-emerald-600/30 text-emerald-300 rounded text-[8px] font-bold uppercase tracking-wider">
                        Cabinet Virtuel Actif
                      </span>
                      <span className="text-[9px] text-slate-400 flex items-center gap-1 font-mono">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span> Live
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-100 text-xs">Visioconférence Thérapeutique</h4>
                    <p className="text-slate-400 text-[10px] leading-relaxed">
                      Rejoignez directement le cabinet de rééducation virtuel de l'association pour votre consultation programmée ou en un clic pour tester notre système de téléconsultation.
                    </p>
                  </div>
                  
                  <button
                    id="btn-parent-join-general-videoroom"
                    onClick={() => {
                      // Find any teleconsultation appointment in history, or fallback to mock
                      const teleApt = childData?.appointmentsHistory?.find((a: any) => a.mode === "TELECONSULTATION") || {
                        id: "TC-SAMIR",
                        childName: childData?.child?.name || "Yassine",
                        childBirthdate: childData?.child?.birthdate || "14/10/2018",
                        specialistName: "Dr. Amina Bennani",
                        notes: "Suivi d'apprentissage",
                        mode: "TELECONSULTATION"
                      };
                      setActiveVideoApt(teleApt);
                    }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 shadow"
                  >
                    <Video className="h-3.5 w-3.5 animate-pulse" />
                    Rejoindre le Cabinet Virtuel
                  </button>
                </div>
              </div>

              {/* Right cols: Upcoming Appointments & Timeline progress */}
              <div className="md:col-span-2 space-y-6">
                {/* Appointments timeline */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                    <Calendar className="h-4.5 w-4.5 text-emerald-600" /> Vos Prochaines Séances
                  </h3>

                  <div className="space-y-3">
                    {childData?.appointmentsHistory && childData.appointmentsHistory.some((a: any) => a.status === AppointmentStatus.CONFIRME) ? (
                      childData.appointmentsHistory
                        .filter((a: any) => a.status === AppointmentStatus.CONFIRME)
                        .slice(0, 2)
                        .map((apt: any) => (
                          <div key={apt.id} className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/50">
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-slate-800 dark:text-white">Séance avec {apt.specialistName}</p>
                              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {apt.date} • {apt.slot}
                              </p>
                              <p className="text-[9px] text-slate-500 font-medium">Mode d'accès : <span className="font-bold text-slate-700 dark:text-slate-300">{apt.mode}</span></p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                              {apt.mode === "TELECONSULTATION" && (
                                <button
                                  onClick={() => setActiveVideoApt(apt)}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[9px] rounded-lg shadow-sm transition flex items-center gap-1"
                                >
                                  <Video className="h-3 w-3" />
                                  Rejoindre
                                </button>
                              )}
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] dark:bg-emerald-900 dark:text-emerald-200">
                                Confirmé
                              </span>
                            </div>
                          </div>
                        ))
                    ) : (
                      <p className="text-xs text-slate-400 italic">Aucun rendez-vous planifié.</p>
                    )}
                  </div>
                </div>

                {/* Therapeutic evolution timeline tracking */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                    <TrendingUp className="h-4.5 w-4.5 text-emerald-600" /> Évolution Clinique & Progrès
                  </h3>

                  <div className="relative border-l border-emerald-100 dark:border-emerald-900 pl-4 space-y-6">
                    <div className="relative">
                      {/* Timeline Node */}
                      <span className="absolute -left-[21px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-emerald-600 bg-white"></span>
                      <p className="text-[10px] text-slate-400">15 Juillet 2026</p>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white">Bilan initial validé</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        Diagnostic de dyslexie phonologique établi. Mise en place de l'aménagement de tiers-temps scolaire recommandé par le Dr Bennani.
                      </p>
                    </div>

                    <div className="relative">
                      {/* Timeline Node */}
                      <span className="absolute -left-[21px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-orange-400 bg-white"></span>
                      <p className="text-[10px] text-slate-400">En cours</p>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white">Rééducation de la conscience phonologique</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        Objectif principal : automatiser les correspondances de graphèmes complexes et améliorer la vitesse globale de déchiffrage syllabique.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DOSSIER MEDICAL TAB */}
          {activeTab === "dossier" && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                    <FileText className="h-4.5 w-4.5 text-emerald-600" /> Fiches de Consultation de Suivi (Historique)
                  </h3>
                  <button id="btn-print-full-dossier" onClick={() => window.print()} className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-lg hover:bg-slate-100 border text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                    <Printer className="h-3 w-3" /> Imprimer dossier
                  </button>
                </div>

                <div className="space-y-4">
                  {childData?.consultationsHistory && childData.consultationsHistory.length > 0 ? (
                    childData.consultationsHistory.map((cons: any) => (
                      <div key={cons.id} className="p-5 rounded-xl border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/20 space-y-3 text-xs">
                        <div className="flex items-center justify-between border-b border-dashed pb-2">
                          <div>
                            <span className="font-bold text-slate-800 dark:text-white">Consultation du {cons.date}</span>
                            <span className="block text-[10px] text-slate-400">Motif : {cons.motif}</span>
                          </div>
                          {cons.signedBySpecialist && (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold dark:bg-emerald-950 dark:text-emerald-400">
                              Signée électroniquement
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <p><strong>Diagnostic :</strong> {cons.diagnostic}</p>
                          <p><strong>Observations thérapeutiques :</strong> {cons.observations}</p>
                        </div>
                        
                        <div className="space-y-1 bg-white p-2.5 rounded-lg border dark:bg-slate-900">
                          <p className="font-semibold text-emerald-800 dark:text-emerald-400">Recommandations & Plan d'Action Parentale :</p>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 whitespace-pre-line">{cons.recommandations}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">Aucune fiche de consultation enregistrée pour l'instant.</p>
                  )}
                </div>
              </div>

              {/* Bilans & documents uploaded */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                  <FileBadge className="h-4.5 w-4.5 text-emerald-600" /> Bilans Psychométriques & Comptes-rendus
                </h3>

                <div className="space-y-2">
                  {childData?.assessments && childData.assessments.length > 0 ? (
                    childData.assessments.map((bil: any) => (
                      <div key={bil.id} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-800 dark:text-white">{bil.title}</p>
                          <p className="text-[10px] text-slate-400">Score de référence : {bil.score} • {bil.date}</p>
                        </div>
                        <button id={`btn-download-bilan-${bil.id}`} className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition" title="Télécharger">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">Aucun bilan formalisé.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SECURE MESSAGING Direct with Specialist (Section 9) */}
          {activeTab === "messages" && (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="border-b pb-3 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-emerald-600" />
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm">Messagerie de Coordination Directe</h3>
                  <p className="text-[10px] text-slate-400">Échangez de manière sécurisée avec le Dr. Amina Bennani (Orthophoniste)</p>
                </div>
              </div>

              {/* Message scroll container */}
              <div className="h-80 overflow-y-auto border border-slate-100 rounded-xl bg-slate-50/50 p-4 space-y-4 dark:border-slate-800 dark:bg-slate-950/20">
                {messages.length > 0 ? (
                  messages.map((msg: any) => {
                    const isMe = msg.senderId === sessionUser.id;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-xs p-3 rounded-2xl text-xs space-y-1.5 ${
                          isMe 
                            ? "bg-emerald-700 text-white rounded-tr-none" 
                            : "bg-white text-slate-800 rounded-tl-none border shadow-sm dark:bg-slate-900 dark:text-slate-100 dark:border-slate-800"
                        }`}>
                          <p>{msg.content}</p>
                          <span className="block text-[9px] text-right opacity-60">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-xs text-slate-400 py-12">Aucun message échangé. Écrivez votre premier message ci-dessous.</p>
                )}
              </div>

              {/* Chat Input form */}
              <div className="flex gap-2 pt-2">
                <input
                  id="inp-parent-chat-msg"
                  type="text"
                  placeholder="Écrivez un message ou posez une question clinique..."
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <button
                  id="btn-parent-chat-send"
                  onClick={handleSendMessage}
                  className="px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl flex items-center justify-center transition duration-150"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {activeTab === "games" && (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-850 dark:text-white flex items-center gap-2">
                    <Sparkles className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                    L'Aventure des Syllabes de l'Atlas (Jeux Thérapeutiques)
                  </h3>
                  <p className="text-[11px] text-slate-400">Activités ludo-éducatives adaptées pour l'évaluation cognitive en contexte marocain.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Développement Infantile
                  </span>
                </div>
              </div>

              {/* Game Layout */}
              <AtlasSyllablesGame child={childData?.child} parentPhone={parentPhone} />
            </div>
          )}
        </div>
      )}

      {/* FULL-SCREEN IMMERSIVE VIDEO ROOM PORTAL (Section 8) */}
      {activeVideoApt && (
        <VideoRoom
          role="parent"
          appointment={activeVideoApt}
          onClose={() => setActiveVideoApt(null)}
        />
      )}
    </div>
  );
}

interface AtlasSyllablesGameProps {
  child: any;
  parentPhone: string;
}

const AtlasSyllablesGame: React.FC<AtlasSyllablesGameProps> = ({ child, parentPhone }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState("");
  const [consultationRequested, setConsultationRequested] = useState(false);
  const [requesting, setRequesting] = useState(false);

  const questions = [
    {
      word: "Tajine",
      prompt: "Complétez la syllabe manquante de ce délicieux plat de notre gastronomie marocaine :",
      formula: "Ta - [ ? ] - ne",
      options: ["ji", "ma", "ba", "ka"],
      answer: "ji",
      fact: "Le Tajine est un plat traditionnel marocain mijoté lentement dans un plat en argile."
    },
    {
      word: "Thé",
      prompt: "Associez l'accueil chaleureux traditionnel marocain à son mot correspondant :",
      formula: "[ ? ] à la menthe",
      options: ["Thé", "Café", "Lait", "Jus"],
      answer: "Thé",
      fact: "Le thé à la menthe est le symbole par excellence de l'hospitalité marocaine."
    },
    {
      word: "Atlas",
      prompt: "Trouvez la première syllabe de la célèbre chaîne de montagnes marocaine :",
      formula: "[ ? ] - las",
      options: ["At", "Ot", "It", "Ar"],
      answer: "At",
      fact: "Les montagnes de l'Atlas abritent des paysages magnifiques et le mont Toubkal."
    },
    {
      word: "Sidi",
      prompt: "Complétez le mot de politesse et respect marocain traditionnel :",
      formula: "Si - [ ? ]",
      options: ["di", "li", "mi", "ba"],
      answer: "di",
      fact: "'Sidi' est un terme honorifique utilisé pour s'adresser poliment à un homme au Maroc."
    },
    {
      word: "Bab",
      prompt: "Trouvez la consonne manquante pour désigner la porte de la médina :",
      formula: "Ba - [ ? ]",
      options: ["b", "r", "t", "l"],
      answer: "b",
      fact: "Les anciennes médinas marocaines sont entourées de remparts percés de magnifiques 'Babs' (portes)."
    }
  ];

  const playChime = (isCorrect: boolean) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      if (isCorrect) {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      } else {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch (e) {
      console.warn("Web Audio API warning", e);
    }
  };

  const handleSelectOption = (opt: string) => {
    if (answered) return;
    setSelectedOption(opt);
    setAnswered(true);
    const correct = opt === questions[currentStep].answer;
    if (correct) {
      setScore(score + 1);
    }
    playChime(correct);
  };

  const handleNext = () => {
    setSelectedOption(null);
    setAnswered(false);
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const saveResults = async () => {
    setSaving(true);
    try {
      const payload = {
        childId: child?.id || "ch-yassine",
        childName: child?.name || "Yassine Bennani",
        gameName: "L'Aventure des Syllabes de l'Atlas",
        score: score * 2, // convert 5 questions to a base 10 score
        maxScore: 10,
        durationSeconds: 150,
        status: score >= 4 ? "reussite" : score >= 2 ? "entrainement" : "besoin_aide",
        whatsappNumber: parentPhone || "+212 668-990011",
        notes: notes || "Participation active de l'enfant avec accompagnement du parent."
      };

      const res = await fetch("/api/serious-game-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setSaved(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const resetGame = () => {
    setCurrentStep(0);
    setScore(0);
    setSelectedOption(null);
    setAnswered(false);
    setIsCompleted(false);
    setSaved(false);
    setConsultationRequested(false);
  };

  const specialistWa = "212661554433"; // Doctor Amina Bennani's contact link
  const waMsg = encodeURIComponent(
    `Bonjour Docteur, voici le rapport d'activités ludo-éducatives de mon enfant ${child?.name || "Yassine Bennani"}. Jeu : L'Aventure des Syllabes de l'Atlas. Score : ${score * 2}/10. Statut : ${score >= 4 ? "Réussite" : "Besoin d'aide"}. Pouvons-nous prévoir une consultation d'accompagnement ?`
  );

  return (
    <div className="space-y-4">
      {!isCompleted ? (
        <div className="bg-slate-50 dark:bg-slate-800/10 rounded-2xl p-5 border space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Étape {currentStep + 1} sur {questions.length}</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">Score en cours : {score} / {questions.length}</span>
          </div>

          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-600 transition-all duration-300" 
              style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{questions[currentStep].prompt}</p>
            <div className="bg-white dark:bg-slate-900 border rounded-xl p-4 flex items-center justify-center">
              <span className="font-display font-black text-xl text-emerald-800 dark:text-emerald-400 tracking-widest uppercase">
                {questions[currentStep].formula}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {questions[currentStep].options.map((opt) => {
              const isSelected = selectedOption === opt;
              const isAnswer = opt === questions[currentStep].answer;
              let btnClass = "bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-800 dark:text-white border-slate-200";

              if (answered) {
                if (isAnswer) {
                  btnClass = "bg-emerald-50 border-emerald-500 text-emerald-850 dark:bg-emerald-950/40 dark:text-emerald-300";
                } else if (isSelected) {
                  btnClass = "bg-red-50 border-red-400 text-red-800 dark:bg-red-950/20 dark:text-red-300";
                } else {
                  btnClass = "opacity-40 bg-white dark:bg-slate-900 text-slate-400 border-slate-200";
                }
              }

              return (
                <button
                  key={opt}
                  onClick={() => handleSelectOption(opt)}
                  disabled={answered}
                  className={`py-3.5 px-4 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${btnClass}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {answered && (
            <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-3 text-[11px] space-y-2">
              <p className="font-bold text-emerald-900 dark:text-emerald-400">
                {selectedOption === questions[currentStep].answer ? "🌟 Correct ! Bien joué !" : `❌ Oups ! La bonne réponse était "${questions[currentStep].answer}"`}
              </p>
              <p className="text-slate-500 dark:text-slate-400 italic">
                <strong>Le Saviez-vous ?</strong> {questions[currentStep].fact}
              </p>
              <button
                onClick={handleNext}
                className="w-full mt-1 py-2 bg-slate-850 dark:bg-slate-700 text-white rounded-lg font-bold text-[11px] hover:bg-slate-900 transition"
              >
                {currentStep < questions.length - 1 ? "Question Suivante →" : "Voir mon Résultat Final 🎉"}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-50 dark:bg-slate-800/10 border rounded-2xl p-6 text-center space-y-6">
          <div className="max-w-md mx-auto space-y-3">
            <div className="h-16 w-16 bg-amber-100 dark:bg-amber-950/40 rounded-full mx-auto flex items-center justify-center text-amber-500 animate-bounce">
              <Award className="h-10 w-10" />
            </div>
            <h4 className="font-display font-extrabold text-slate-850 dark:text-white">Aventure Terminée !</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Félicitations à l'enfant <strong>{child?.name || "Yassine"}</strong> pour avoir complété l'évaluation.
            </p>

            <div className="bg-white dark:bg-slate-900 border rounded-2xl p-4 space-y-1">
              <p className="text-[10px] uppercase text-slate-400 font-bold">Score d'Apprentissage</p>
              <p className="text-3xl font-black text-emerald-700 dark:text-emerald-400">{score * 2} / 10</p>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                {score >= 4 ? "Niveau de consolidation : Excellent ! ✅" : "Niveau de consolidation : Séance d'entraînement suggérée 🔍"}
              </p>
            </div>

            <div className="space-y-3 pt-2 text-left">
              <label className="block text-[11px] font-bold text-slate-500">Ajouter une note d'accompagnement du parent (Facultatif) :</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex. A montré de la facilité sur Tajine, mais a bloqué un peu sur Bab..."
                className="w-full text-xs rounded-xl border p-2.5 bg-white dark:bg-slate-900 dark:border-slate-800 focus:border-emerald-500 focus:outline-none"
                rows={2}
              />

              <div className="flex flex-col gap-3 pt-2">
                {!saved ? (
                  <button
                    onClick={saveResults}
                    disabled={saving}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow"
                  >
                    {saving ? "Enregistrement clinique..." : "Sauvegarder et Transmettre au Spécialiste (Base de données)"}
                  </button>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center text-[11px] text-emerald-800 font-bold dark:bg-emerald-950/20 dark:border-emerald-900/30">
                    ✓ Résultats enregistrés avec succès dans le dossier clinique national !
                  </div>
                )}

                {/* CLINICAL OUTCOME EVALUATION & AUTOMATED RECOMMENDATION */}
                {score * 2 <= 6 ? (
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl text-left space-y-2.5">
                    <p className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 text-xs">
                      ⚠️ Note d'orientation clinique : Risque d'apprentissage suspecté ({score * 2}/10)
                    </p>
                    <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      Le score de l'enfant suggère un besoin d'approfondissement orthophonique (Guichet 1). L'association AMTDA recommande d'orienter l'enfant vers une consultation d'orientation gratuite.
                    </p>
                    {!consultationRequested ? (
                      <button
                        onClick={async () => {
                          setRequesting(true);
                          try {
                            const payload = {
                              senderId: "u-parent-samir", // using Parent Samir's user account
                              receiverId: "u-ben", // Specialist Dr. Amina Bennani
                              content: `[DEMANDE DE CONSULTATION RECOMMANDEE - JEU SERIEUX] L'enfant ${child?.name || "Yassine Bennani"} (ID : ${child?.id || "ch-yassine"}) a réalisé l'activité "L'Aventure des Syllabes de l'Atlas" et obtenu un score de dépistage de ${score * 2}/10 (Besoin d'aide). Une consultation gratuite d'évaluation est fortement conseillée. Contact Parent : WhatsApp ${parentPhone || "+212 668-990011"}.`,
                              isRead: false
                            };
                            const res = await fetch("/api/messages", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify(payload)
                            });
                            if (res.ok) {
                              setConsultationRequested(true);
                            }
                          } catch (err) {
                            console.error(err);
                          } finally {
                            setRequesting(false);
                          }
                        }}
                        disabled={requesting}
                        className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition shadow-sm"
                      >
                        {requesting ? "Génération du dossier d'orientation..." : "Transmettre le Rapport & Demander Consultation Gratuite"}
                      </button>
                    ) : (
                      <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-2.5 rounded-lg text-center text-[10px] font-bold dark:bg-emerald-950/20 dark:text-emerald-300">
                        ✓ Rapport d'orientation envoyé à l'orthophoniste (Dr. Amina Bennani) ! Elle dispose de votre ID et WhatsApp pour planifier l'examen clinique.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 rounded-xl text-left">
                    <p className="font-bold text-emerald-800 dark:text-emerald-400 text-xs">🌟 Niveau de consolidation satisfaisant ({score * 2}/10)</p>
                    <p className="text-[10px] text-slate-500 mt-1">Excellent travail ! L'enfant montre de solides compétences en lecture syllabique. Pensez à rejouer périodiquement pour maintenir sa plasticité neuronale.</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <a
                    href={`https://wa.me/${specialistWa}?text=${waMsg}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs rounded-xl text-center transition flex items-center justify-center gap-1.5 shadow"
                  >
                    Contacter Dr. Amina (WhatsApp)
                  </a>
                  <button
                    onClick={resetGame}
                    className="px-4 py-2 border rounded-xl hover:bg-white text-xs font-bold text-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 transition"
                  >
                    Rejouer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
