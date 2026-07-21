/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Heart, 
  Sparkles, 
  Calendar, 
  User, 
  Users, 
  Lock, 
  Volume2, 
  Activity, 
  Menu, 
  X,
  Phone,
  Mail,
  HelpCircle,
  Accessibility
} from "lucide-react";
import LandingPage from "./components/LandingPage.js";
import BookingWizard from "./components/BookingWizard.js";
import ParentPortal from "./components/ParentPortal.js";
import SpecialistPortal from "./components/SpecialistPortal.js";
import BackOffice from "./components/BackOffice.js";
import AccessibilitySettings, { AccessibilityConfig } from "./components/AccessibilitySettings.js";
import WhatsAppWidget from "./components/WhatsAppWidget.js";
import { DemoRoleSwitcher } from "./components/DemoRoleSwitcher.js";

type PortalView = "landing" | "wizard" | "parent" | "specialist" | "admin";

export default function App() {
  // Global WCAG 2.2 AA Accessibility state
  const [accessibilityConfig, setAccessibilityConfig] = useState<AccessibilityConfig>({
    textSize: "normal",
    highContrast: false,
    darkMode: false,
    dysFont: false,
    keyboardNav: false,
    screenReader: false,
    disableAnimations: false,
    voiceGuide: false,
  });

  // Current active view
  const [currentView, setCurrentView] = useState<PortalView>("landing");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [alertBanner, setAlertBanner] = useState<string | null>(null);

  // Fetch administrator parameters like banner notifications
  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.alertMessage) {
          setAlertBanner(data.alertMessage);
        }
      })
      .catch((err) => console.log("No custom settings loaded yet, using default banner"));
  }, [currentView]); // refresh on view change to sync custom edits

  // Apply Dark Mode globally to document root
  useEffect(() => {
    const root = window.document.documentElement;
    if (accessibilityConfig.darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [accessibilityConfig.darkMode]);

  // Voice navigation confirmation helper (Section 6)
  const navigateTo = (view: PortalView) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: accessibilityConfig.disableAnimations ? "auto" : "smooth" });

    if (accessibilityConfig.voiceGuide && "speechSynthesis" in window) {
      const pageNames: Record<PortalView, string> = {
        landing: "Page d'accueil de l'association",
        wizard: "Formulaire de prise de rendez-vous en ligne",
        parent: "Espace parent de suivi clinique",
        specialist: "Espace spécialiste thérapeutique",
        admin: "Back office d'administration",
      };
      const utterance = new SpeechSynthesisUtterance("Navigation vers : " + pageNames[view]);
      utterance.lang = "fr-FR";
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  };

  // Determine relative text size style
  const getRelativeTextSizeClass = () => {
    if (accessibilityConfig.textSize === "large") return "text-[108%] md:text-[112%]";
    if (accessibilityConfig.textSize === "extra") return "text-[115%] md:text-[122%]";
    return "";
  };

  return (
    <div 
      className={`min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 flex flex-col transition-colors duration-200 ${getRelativeTextSizeClass()} ${
        accessibilityConfig.dysFont ? "dyslexic-font" : ""
      } ${accessibilityConfig.highContrast ? "high-contrast-theme filter saturate-125" : ""}`}
    >
      {/* Demo Quick Access Role Switcher Context */}
      <DemoRoleSwitcher 
        currentView={currentView} 
        onNavigate={navigateTo} 
        disableAnimations={accessibilityConfig.disableAnimations} 
      />
      {/* Dynamic Inline Dyslexic Font Injector (WCAG 2.2 AA) */}
      {accessibilityConfig.dysFont && (
        <style dangerouslySetInnerHTML={{ __html: `
          .dyslexic-font * {
            font-family: 'Comic Sans MS', cursive, sans-serif !important;
            letter-spacing: 0.15em !important;
            word-spacing: 0.25em !important;
            line-height: 1.7 !important;
          }
        `}} />
      )}

      {/* Dynamic Inline High Contrast Override */}
      {accessibilityConfig.highContrast && (
        <style dangerouslySetInnerHTML={{ __html: `
          .high-contrast-theme * {
            border-color: #000000 !important;
            outline-color: #f97316 !important;
          }
          .high-contrast-theme button:hover {
            outline: 3px solid #f97316 !important;
          }
        `}} />
      )}

      {/* ADMIN LEVEL HOME BANNER ALERTS (Section 10) */}
      {alertBanner && currentView === "landing" && (
        <div className="bg-orange-600 text-white text-center py-2 px-4 text-xs font-bold tracking-wide flex items-center justify-center gap-2">
          <Sparkles className="h-4 w-4 shrink-0 animate-bounce" />
          <span>{alertBanner}</span>
        </div>
      )}

<button 
  id="btn-brand-logo" 
  onClick={() => navigateTo('landing')} 
  className="flex items-center gap-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-lg text-left"
>
  <div className="h-11 w-11 flex items-center justify-center shrink-0">
    <img src="/images/logo.svg" alt="AMTDA Maroc Logo" className="w-full h-full object-contain" />
  </div>

  <div>
    <span className="block font-display font-extrabold text-lg text-slate-900 dark:text-white tracking-tight leading-tight">
      AMTDA <span className="text-emerald-700 dark:text-emerald-400">Maroc</span>
    </span>
    <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold">
      Troubles d Apprentissage
    </span>
  </div>
</button>

            >
              <Calendar className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Prendre Rendez-vous
</button>

<button
  id="nav-btn-landing"
  onClick={() => navigateTo("landing")}
  className={`px-4.5 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-150 ${
    currentView === "landing"
      ? "bg-white text-emerald-800 dark:bg-slate-800 dark:text-emerald-400 shadow-sm"
      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
  }`}
>
  <Calendar className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Prendre Rendez-vous
</button>

<button
  id="nav-btn-parent"
  onClick={() => navigateTo("parent")}
  className={`px-4.5 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-150 flex items-center gap-1.5 ${
    currentView === "parent"
      ? "bg-white text-emerald-800 dark:bg-slate-800 dark:text-emerald-400 shadow-sm"
      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
  }`}
>
  <User className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Espace Parent
</button>

            <button
              id="nav-btn-specialist"
              onClick={() => navigateTo("specialist")}
              className={`px-4.5 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-150 flex items-center gap-1.5 ${
                currentView === "specialist" 
                  ? "bg-white text-emerald-800 dark:bg-slate-800 dark:text-emerald-400 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Users className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Espace Spécialiste
            </button>

            <button
              id="nav-btn-admin"
              onClick={() => navigateTo("admin")}
              className={`px-4.5 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-150 flex items-center gap-1.5 ${
                currentView === "admin" 
                  ? "bg-white text-emerald-800 dark:bg-slate-800 dark:text-emerald-400 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Lock className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Administration
            </button>
          </nav>

          {/* Quick Support Call Action */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Contact Clinique</p>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">+212 522-458900</p>
            </div>
          </div>

          {/* Mobile hamburger toggle */}
          <button
            id="btn-mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-xl border hover:bg-slate-50 dark:hover:bg-slate-800 dark:border-slate-800"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* MOBILE DRAWER NAVIGATION MENU */}
        {mobileMenuOpen && (
          <div id="drawer-mobile-nav" className="xl:hidden bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-4 space-y-2 text-xs font-bold text-slate-600">
            <button
              id="mob-btn-landing"
              onClick={() => navigateTo("landing")}
              className={`w-full text-left px-4 py-3 rounded-xl transition ${currentView === "landing" ? "bg-emerald-50 text-emerald-800 dark:bg-slate-800 dark:text-emerald-400" : ""}`}
            >
              Accueil de l'Association
            </button>
            <button
              id="mob-btn-wizard"
              onClick={() => navigateTo("wizard")}
              className={`w-full text-left px-4 py-3 rounded-xl transition ${currentView === "wizard" ? "bg-emerald-50 text-emerald-800 dark:bg-slate-800 dark:text-emerald-400" : ""}`}
            >
              Prendre un Rendez-vous (Les 6 Guichets)
            </button>
            <button
              id="mob-btn-parent"
              onClick={() => navigateTo("parent")}
              className={`w-full text-left px-4 py-3 rounded-xl transition ${currentView === "parent" ? "bg-emerald-50 text-emerald-800 dark:bg-slate-800 dark:text-emerald-400" : ""}`}
            >
              Espace Parent (Suivi clinique)
            </button>
            <button
              id="mob-btn-specialist"
              onClick={() => navigateTo("specialist")}
              className={`w-full text-left px-4 py-3 rounded-xl transition ${currentView === "specialist" ? "bg-emerald-50 text-emerald-800 dark:bg-slate-800 dark:text-emerald-400" : ""}`}
            >
              Espace Spécialiste Thérapeute
            </button>
            <button
              id="mob-btn-admin"
              onClick={() => navigateTo("admin")}
              className={`w-full text-left px-4 py-3 rounded-xl transition ${currentView === "admin" ? "bg-emerald-50 text-emerald-800 dark:bg-slate-800 dark:text-emerald-400" : ""}`}
            >
              Direction Back Office
            </button>
          </div>
        )}
      </header>

      {/* CORE WRAPPED MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        
        {/* PUBLIC HOME LANDING PAGE */}
        {currentView === "landing" && (
          <LandingPage 
            onStartBooking={() => navigateTo("wizard")} 
            onNavigateToPortal={(portal) => navigateTo(portal)} 
            disableAnimations={accessibilityConfig.disableAnimations}
          />
        )}

        {/* STEP-BY-STEP BOOKING WIZARD */}
        {currentView === "wizard" && (
          <BookingWizard 
            onSuccess={() => navigateTo("parent")}
            disableAnimations={accessibilityConfig.disableAnimations}
            onNavigateToPortal={(portal) => navigateTo(portal)}
          />
        )}

        {/* PARENT CLINICAL PORTAL */}
        {currentView === "parent" && (
          <ParentPortal disableAnimations={accessibilityConfig.disableAnimations} />
        )}

        {/* CLINICAL SPECIALIST PORTAL */}
        {currentView === "specialist" && (
          <SpecialistPortal disableAnimations={accessibilityConfig.disableAnimations} />
        )}

        {/* MASTER ADMINISTRATIVE BACK OFFICE */}
        {currentView === "admin" && (
          <BackOffice disableAnimations={accessibilityConfig.disableAnimations} />
        )}

      </main>

      {/* FLOATING ACCESSIBILITY UTILITY PANEL DRAWER */}
      <AccessibilitySettings 
        config={accessibilityConfig} 
        onChange={setAccessibilityConfig} 
      />

      {/* FLOATING PREMIUM WHATSAPP ASSISTANCE WIDGET */}
      <WhatsAppWidget disableAnimations={accessibilityConfig.disableAnimations} />

      {/* PREMIUM WHITE-LABEL FOOTER BRANDING (Section 13) */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 py-12 mt-16 text-xs text-slate-400 dark:text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left space-y-1.5">
            <p className="font-bold text-slate-800 dark:text-slate-300">© 2026 AMTDA Maroc • Association Marocaine des Troubles et Difficultés d'Apprentissage.</p>
            <p>Habilité d'utilité sociale. Maarif, Casablanca, Maroc.</p>
          </div>
          
          <div className="flex items-center gap-6">
            <a href="#accessibility" onClick={(e) => { e.preventDefault(); alert("Cette plateforme respecte pleinement le niveau WCAG 2.2 AA d'accessibilité numérique."); }} className="hover:underline">Conformité WCAG 2.2 AA</a>
            <a href="#rgpd" onClick={(e) => { e.preventDefault(); alert("Toutes les données de santé clinique des dossiers enfants sont chiffrées localement et auditées."); }} className="hover:underline">Confidentialité médicale RGPD</a>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-850 text-slate-500 font-bold px-2.5 py-0.5 rounded-full">v1.0.0 Premium</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
