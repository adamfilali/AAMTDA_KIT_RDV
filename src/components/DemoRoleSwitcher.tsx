import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, User, Users, Lock, Brain, FileText, X, Check, Eye, HelpCircle } from "lucide-react";

interface DemoRoleSwitcherProps {
  currentView: string;
  onNavigate: (view: any) => void;
  disableAnimations?: boolean;
}

export const DemoRoleSwitcher: React.FC<DemoRoleSwitcherProps> = ({
  currentView,
  onNavigate,
  disableAnimations = false
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [showAiModal, setShowAiModal] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiReport, setAiReport] = useState<string>("");
  const [isRealAI, setIsRealAI] = useState(false);
  const [recentGamesCount, setRecentGamesCount] = useState(0);

  // Poll serious game results count to reflect "real-time database status tracking"
  useEffect(() => {
    const fetchStats = () => {
      fetch("/api/serious-game-results")
        .then((res) => res.json())
        .then((data) => {
          setRecentGamesCount(data.length);
        })
        .catch((err) => console.error("Error fetching stats:", err));
    };
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const triggerPremiumAiAnalysis = async () => {
    setLoadingAi(true);
    setShowAiModal(true);
    try {
      const response = await fetch("/api/ai/analyze-situation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId: "ch-yassine",
          lastGameName: "Atlas Syllable Adventure",
          lastGameScore: 9
        })
      });
      const data = await response.json();
      setAiReport(data.analysis || "Une erreur est survenue lors de la génération.");
      setIsRealAI(!!data.isRealAI);
    } catch (err) {
      console.error(err);
      setAiReport("Impossible de contacter le service de diagnostic IA pour le moment.");
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <>
      {/* Sticky Top-Bar Notification for Demo Switching */}
      <div className="bg-emerald-950 text-emerald-100 border-b border-emerald-800 text-xs py-2 px-4 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <p className="font-medium">
              <strong className="text-white">Console d'Évaluation de Démonstration :</strong> Naviguez facilement entre les espaces pour tester les flux et l'analyse de situation en temps réel.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate("parent")}
              className={`px-2.5 py-1 rounded bg-emerald-800/60 hover:bg-emerald-700/80 text-[11px] font-bold transition flex items-center gap-1 ${currentView === "parent" ? "ring-2 ring-emerald-400 bg-emerald-700" : ""}`}
            >
              <User className="h-3 w-3" /> Parent
            </button>
            <button
              onClick={() => onNavigate("specialist")}
              className={`px-2.5 py-1 rounded bg-emerald-800/60 hover:bg-emerald-700/80 text-[11px] font-bold transition flex items-center gap-1 ${currentView === "specialist" ? "ring-2 ring-emerald-400 bg-emerald-700" : ""}`}
            >
              <Users className="h-3 w-3" /> Spécialiste
            </button>
            <button
              onClick={() => onNavigate("admin")}
              className={`px-2.5 py-1 rounded bg-emerald-800/60 hover:bg-emerald-700/80 text-[11px] font-bold transition flex items-center gap-1 ${currentView === "admin" ? "ring-2 ring-emerald-400 bg-emerald-700" : ""}`}
            >
              <Lock className="h-3 w-3" /> Administrateur
            </button>

            <span className="h-4 w-[1px] bg-emerald-850 mx-1" />

            <button
              onClick={triggerPremiumAiAnalysis}
              className="px-3 py-1 rounded bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-[11px] flex items-center gap-1 transition shadow-sm animate-pulse"
            >
              <Brain className="h-3.5 w-3.5" /> Analyse IA Patient
            </button>
          </div>
        </div>
      </div>

      {/* Floating Database & Compliance Status Widget (Bottom-Left) */}
      <div className="fixed bottom-6 left-6 z-40 hidden lg:block">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-emerald-100 dark:border-emerald-950 rounded-2xl p-4.5 shadow-xl w-72 space-y-3"
            >
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Brain className="h-4 w-4" /> Statut Clinique AMTDA
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-2 text-[11px] text-slate-600 dark:text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Patient Actif (Démo) :</span>
                  <span className="font-bold text-slate-800 dark:text-white">Yassine Bennani</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Résultats Jeux Sérieux :</span>
                  <span className="font-bold px-2 py-0.5 rounded-full bg-emerald-55/60 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    {recentGamesCount} enregistrés
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Conformité RGPD :</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                    <Check className="h-3 w-3" /> Chiffré AES-256
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Audit Système :</span>
                  <span className="text-slate-400">Actif en continu</span>
                </div>
              </div>

              <div className="pt-1.5">
                <button
                  onClick={triggerPremiumAiAnalysis}
                  className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-[11px] rounded-lg transition shadow flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5" /> Lancer l'Analyse IA
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="h-10 w-10 rounded-full bg-emerald-600 text-white shadow-lg flex items-center justify-center hover:bg-emerald-700 transition"
          >
            <Brain className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Premium AI Clinical Analysis Modal */}
      <AnimatePresence>
        {showAiModal && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
            >
              <div className="p-6 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-xl">
                    <Brain className="h-6 w-6 text-emerald-200" />
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-base tracking-tight">Analyse Clinique IA Premium</h3>
                    <p className="text-xs text-emerald-200">Recommandations AMTDA basées sur le rapport du médecin et l'activité de l'enfant</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAiModal(false)}
                  className="p-1.5 bg-white/10 hover:bg-white/20 rounded-xl transition text-white/80"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                {loadingAi ? (
                  <div className="flex flex-col items-center justify-center py-16 space-y-4">
                    <div className="h-10 w-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                    <p className="font-bold text-slate-800 dark:text-white">Analyse des observations cliniques...</p>
                    <p className="text-[11px] text-slate-400">Interrogation sécurisée de l'IA d'aide au diagnostic d'AMTDA Maroc</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl p-3 text-amber-850 dark:text-amber-300 text-[11px]">
                      <span className="flex items-center gap-1.5 font-bold">
                        <Sparkles className="h-4 w-4 shrink-0" />
                        {isRealAI ? "Analyse active en direct via Gemini" : "Généré par le Moteur Expert local (Simulé)"}
                      </span>
                      <span>Habilité AMTDA</span>
                    </div>

                    <div className="prose prose-slate dark:prose-invert max-w-none text-xs leading-relaxed space-y-4">
                      {aiReport.split("\n\n").map((para, i) => {
                        if (para.startsWith("###") || para.startsWith("####")) {
                          return (
                            <h4 key={i} className="font-bold text-emerald-800 dark:text-emerald-400 border-b pb-1 pt-2">
                              {para.replace(/[#*]/g, "").trim()}
                            </h4>
                          );
                        }
                        if (para.includes("- ")) {
                          return (
                            <ul key={i} className="list-disc pl-5 space-y-1.5">
                              {para.split("\n").map((line, li) => {
                                const cleanLine = line.replace(/^[*\s-]/g, "").trim();
                                if (!cleanLine) return null;
                                return (
                                  <li key={li}>
                                    {cleanLine.includes(":") ? (
                                      <>
                                        <strong className="text-slate-900 dark:text-white">
                                          {cleanLine.split(":")[0]}:
                                        </strong>
                                        {cleanLine.split(":")[1]}
                                      </>
                                    ) : (
                                      cleanLine
                                    )}
                                  </li>
                                );
                              })}
                            </ul>
                          );
                        }
                        return <p key={i}>{para.replace(/\*\*/g, "")}</p>;
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-t flex items-center justify-end gap-3 shrink-0">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 border rounded-xl hover:bg-white text-xs font-bold text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition flex items-center gap-1.5"
                >
                  <FileText className="h-4 w-4" /> Imprimer le Rapport
                </button>
                <button
                  onClick={() => setShowAiModal(false)}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
