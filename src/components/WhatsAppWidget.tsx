/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { playPremiumChimeSound } from "../utils/audio.js";

interface WhatsAppWidgetProps {
  disableAnimations?: boolean;
}

export default function WhatsAppWidget({ disableAnimations = false }: WhatsAppWidgetProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    setShowTooltip(true);
    if (!disableAnimations) {
      playPremiumChimeSound();
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowTooltip(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Premium Tooltip Container */}
      {showTooltip && (
        <div className={`mb-3 max-w-[240px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3.5 rounded-2xl shadow-xl ring-1 ring-black/5 text-[11px] font-medium leading-normal animate-fadeIn text-slate-700 dark:text-slate-200 transition-all duration-300 ${isHovered ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"}`}>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">Assistance Clientèle</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400">
            Une question ? Discutez en direct sur <strong>WhatsApp</strong> avec Siham du secrétariat clinique.
          </p>
        </div>
      )}

      {/* Pulsing Outer Wave */}
      <a
        href="https://wa.me/212661089336"
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 to-emerald-600 text-white shadow-xl hover:scale-110 hover:shadow-emerald-500/20 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-orange-500 group"
        aria-label="Contacter le secrétariat de l'AMTDA Maroc sur WhatsApp"
        title="Secrétariat WhatsApp AMTDA Maroc"
      >
        {/* Pulsing ring animation */}
        {!disableAnimations && (
          <span className="absolute -inset-1.5 rounded-full border-2 border-emerald-500/30 animate-ping opacity-75"></span>
        )}

        {/* Premium Hand-drawn style SVG WhatsApp path */}
        <svg 
          viewBox="0 0 24 24" 
          className={`h-6 w-6 fill-current transition-transform duration-500 ${isHovered ? "rotate-[15deg] scale-110" : ""}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.413 9.863-9.847.001-2.63-1.019-5.101-2.873-6.958C16.602 1.943 14.133 1.05 11.51 1.05c-5.44 0-9.866 4.415-9.87 9.85-.001 1.745.485 3.447 1.408 4.908l-.929 3.394 3.483-.913zM18.15 14.93c-.361-.18-2.137-1.055-2.467-1.176-.331-.121-.572-.182-.813.18-.242.364-.934 1.176-1.145 1.418-.21.242-.421.272-.782.091-.361-.18-1.524-.562-2.903-1.79-1.072-.956-1.795-2.137-2.006-2.499-.211-.361-.022-.557.159-.737.163-.162.361-.422.542-.633.18-.211.241-.361.361-.602.12-.241.06-.452-.03-.633-.09-.18-.813-1.96-1.115-2.684-.294-.707-.592-.61-.813-.621-.21-.01-.451-.012-.692-.012-.242 0-.632.091-.963.452-.331.362-1.264 1.236-1.264 3.013 0 1.777 1.294 3.496 1.474 3.737.18.242 2.547 3.89 6.168 5.456.862.373 1.534.596 2.06.763.865.275 1.652.236 2.274.143.693-.105 2.136-.874 2.438-1.718.301-.843.301-1.567.21-1.718-.09-.15-.331-.241-.692-.421z"/>
        </svg>
      </a>
    </div>
  );
}
