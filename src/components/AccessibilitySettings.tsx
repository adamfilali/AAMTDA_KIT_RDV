/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Accessibility, Volume2, VolumeX, Eye, Type, Sparkles, RefreshCw, HelpCircle, Sun, Moon } from "lucide-react";

export interface AccessibilityConfig {
  textSize: "normal" | "large" | "extra";
  highContrast: boolean;
  darkMode: boolean;
  dysFont: boolean;
  keyboardNav: boolean;
  screenReader: boolean;
  disableAnimations: boolean;
  voiceGuide: boolean;
}

interface AccessibilitySettingsProps {
  config: AccessibilityConfig;
  onChange: (config: AccessibilityConfig) => void;
}

export default function AccessibilitySettings({ config, onChange }: AccessibilitySettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Toggle utility
  const toggle = (key: keyof AccessibilityConfig) => {
    const next = { ...config, [key]: !config[key] };
    onChange(next);
    
    // Voice feedback if voice guide is on
    if (config.voiceGuide && typeof window !== "undefined" && "speechSynthesis" in window) {
      const msgs: Record<string, string> = {
        highContrast: next.highContrast ? "Contraste élevé activé" : "Contraste élevé désactivé",
        darkMode: next.darkMode ? "Mode sombre activé" : "Mode sombre désactivé",
        dysFont: next.dysFont ? "Police DYS activée" : "Police standard activée",
        keyboardNav: next.keyboardNav ? "Navigation clavier renforcée activée" : "Navigation clavier standard",
        screenReader: next.screenReader ? "Lecteur d'écran virtuel activé" : "Lecteur d'écran virtuel désactivé",
        disableAnimations: next.disableAnimations ? "Animations désactivées" : "Animations activées",
        voiceGuide: next.voiceGuide ? "Guidage vocal activé" : "Guidage vocal désactivé",
      };
      if (msgs[key]) {
        const utterance = new SpeechSynthesisUtterance(msgs[key]);
        utterance.lang = "fr-FR";
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const handleSizeChange = (size: "normal" | "large" | "extra") => {
    const next = { ...config, textSize: size };
    onChange(next);
    if (config.voiceGuide && "speechSynthesis" in window) {
      const words = size === "normal" ? "Taille de texte normale" : size === "large" ? "Grand texte" : "Très grand texte";
      const utterance = new SpeechSynthesisUtterance(words);
      utterance.lang = "fr-FR";
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleReset = () => {
    const resetConfig: AccessibilityConfig = {
      textSize: "normal",
      highContrast: false,
      darkMode: false,
      dysFont: false,
      keyboardNav: false,
      screenReader: false,
      disableAnimations: false,
      voiceGuide: false,
    };
    onChange(resetConfig);
  };

  // Virtual Screen Reader voice logic: reads hovered elements with [data-accessible-text]
  useEffect(() => {
    if (!config.screenReader) return;

    const speakElement = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const accessibleElement = target.closest("[data-accessible-text]");
      if (accessibleElement) {
        const text = accessibleElement.getAttribute("data-accessible-text") || accessibleElement.textContent;
        if (text && "speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = "fr-FR";
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(utterance);
        }
      }
    };

    document.addEventListener("mouseover", speakElement);
    return () => {
      document.removeEventListener("mouseover", speakElement);
    };
  }, [config.screenReader]);

  return (
    <>
      {/* Floating button */}
      <button
        id="btn-accessibility-floating"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-700 text-white shadow-xl hover:scale-105 hover:bg-emerald-800 transition duration-200 focus:outline-none focus:ring-4 focus:ring-orange-500"
        aria-label="Options d'accessibilité (WCAG 2.2)"
        title="Accessibilité & Inclusion"
      >
        <Accessibility className="h-6 w-6 animate-pulse" />
      </button>

      {/* Settings Panel Drawer */}
      {isOpen && (
        <div
          id="panel-accessibility"
          className="fixed bottom-24 left-6 z-50 w-80 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl ring-1 ring-black/5 max-h-[80vh] overflow-y-auto transition duration-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
        >
          {/* Header */}
          <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Accessibility className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100">
                Menu Accessibilité
              </h2>
            </div>
            <button
              id="btn-accessibility-reset"
              onClick={handleReset}
              className="rounded-lg p-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-emerald-600 dark:text-slate-400 dark:hover:bg-slate-800"
              title="Réinitialiser"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            {/* 1. Text Size */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Type className="h-4 w-4" /> Taille du texte
                </span>
                <button
                  id="help-text-size"
                  onMouseEnter={() => setActiveTooltip("text-size")}
                  onMouseLeave={() => setActiveTooltip(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                </button>
              </div>
              {activeTooltip === "text-size" && (
                <p className="mb-2 rounded-lg bg-emerald-50 p-2 text-xs text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                  Agrandit les caractères textuels de la plateforme pour une lecture confortable.
                </p>
              )}
              <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
                {(["normal", "large", "extra"] as const).map((size) => (
                  <button
                    key={size}
                    id={`btn-text-size-${size}`}
                    onClick={() => handleSizeChange(size)}
                    className={`rounded-md py-1.5 text-xs font-semibold uppercase transition-all ${
                      config.textSize === size
                        ? "bg-white text-emerald-700 shadow dark:bg-slate-700 dark:text-emerald-400"
                        : "text-slate-600 hover:bg-white/50 dark:text-slate-300"
                    }`}
                  >
                    {size === "normal" ? "100%" : size === "large" ? "125%" : "150%"}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Dyslexia Friendly Font */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
              <div>
                <span className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Police Spéciale DYS
                </span>
                <span className="text-xs text-slate-500">Pour dyslexie & dysorthographie</span>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  id="chk-dys-font"
                  type="checkbox"
                  checked={config.dysFont}
                  onChange={() => toggle("dysFont")}
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:bg-slate-700"></div>
              </label>
            </div>

            {/* 3. High Contrast Theme */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
              <div>
                <span className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Contraste Élevé
                </span>
                <span className="text-xs text-slate-500">Bords noirs & texte net</span>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  id="chk-high-contrast"
                  type="checkbox"
                  checked={config.highContrast}
                  onChange={() => toggle("highContrast")}
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:bg-slate-700"></div>
              </label>
            </div>

            {/* 4. Dark Mode */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
              <div>
                <span className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Mode Sombre
                </span>
                <span className="text-xs text-slate-500">Confort nocturne</span>
              </div>
              <button
                id="btn-toggle-dark"
                onClick={() => toggle("darkMode")}
                className="flex h-8 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
              >
                {config.darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>

            {/* 5. Virtual Screen Reader (Narration) */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
              <div>
                <span className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Lecteur Vocal d'Écran
                </span>
                <span className="text-xs text-slate-500">Lit le texte sous le curseur</span>
              </div>
              <button
                id="btn-toggle-reader"
                onClick={() => toggle("screenReader")}
                className={`flex h-8 w-12 items-center justify-center rounded-lg transition ${
                  config.screenReader 
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" 
                    : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                }`}
              >
                {config.screenReader ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>
            </div>

            {/* 6. Active Guidage Vocal (Voice Guide) */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
              <div>
                <span className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Assistance Vocale Active
                </span>
                <span className="text-xs text-slate-500">Synthèse sonore des actions</span>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  id="chk-voice-guide"
                  type="checkbox"
                  checked={config.voiceGuide}
                  onChange={() => toggle("voiceGuide")}
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:bg-slate-700"></div>
              </label>
            </div>

            {/* 7. Stop Animations */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
              <div>
                <span className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Désactiver Animations
                </span>
                <span className="text-xs text-slate-500">Soulage les troubles de l'attention</span>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  id="chk-disable-animations"
                  type="checkbox"
                  checked={config.disableAnimations}
                  onChange={() => toggle("disableAnimations")}
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:bg-slate-700"></div>
              </label>
            </div>
          </div>

          <div className="mt-4 border-t border-slate-100 pt-3 text-center text-[10px] text-slate-400 dark:border-slate-800">
            Plateforme Clinique AMTDA Maroc • WCAG 2.2 AA Compliant
          </div>
        </div>
      )}
    </>
  );
}
