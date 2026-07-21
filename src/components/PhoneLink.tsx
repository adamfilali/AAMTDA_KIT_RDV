/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Phone } from "lucide-react";
import { playPhoneRingSound } from "../utils/audio.js";

interface PhoneLinkProps {
  number: string;
  label?: string;
  className?: string;
}

export default function PhoneLink({ number, label, className = "" }: PhoneLinkProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    playPhoneRingSound();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <a
      href={`tel:${number.replace(/[^0-9+]/g, "")}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md transition-all duration-300 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10 group ${
        isHovered ? "scale-105" : ""
      } ${className}`}
      style={{ touchAction: "manipulation" }}
    >
      <div className={`p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 transition-all duration-300 group-hover:bg-emerald-600 group-hover:text-white ${
        isHovered ? "animate-bounce" : ""
      }`}>
        <Phone className={`h-4 w-4 ${isHovered ? "rotate-12" : ""}`} />
      </div>
      <div className="text-left">
        {label && <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{label}</p>}
        <p className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors duration-200">
          {number}
        </p>
      </div>
    </a>
  );
}
