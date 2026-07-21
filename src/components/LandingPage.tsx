/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { 
  Calendar, 
  Users, 
  BookOpen, 
  Phone, 
  MapPin, 
  Mail, 
  Clock, 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  HelpCircle,
  Award
} from "lucide-react";
import PhoneLink from "./PhoneLink.js";

interface LandingPageProps {
  onStartBooking: () => void;
  disableAnimations: boolean;
  onNavigateToPortal: (portal: "parent" | "specialist" | "admin") => void;
}

export default function LandingPage({ onStartBooking, disableAnimations, onNavigateToPortal }: LandingPageProps) {
  // Wrapper for framer motion to support WCAG animation disabling
  const animateOrStatic = (animProps: any) => {
    return disableAnimations ? {} : animProps;
  };

  const services = [
    {
      id: "1",
      title: "Orthophonie",
      description: "Bilan et rééducation des troubles du langage écrit (dyslexie, dysorthographie) et oral, retard de parole et difficultés d'articulation.",
      guichet: "Guichet 1",
      bg: "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300"
    },
    {
      id: "2",
      title: "Psychomotricité",
      description: "Accompagnement du schéma corporel, de l'organisation spatio-temporelle, de la dyspraxie, de la motricité fine et globale.",
      guichet: "Guichet 2",
      bg: "bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-300"
    },
    {
      id: "3",
      title: "Neuropsychologie",
      description: "Bilans de quotient intellectuel (WISC-V), analyse de l'attention (TDA/H) et évaluation des fonctions exécutives de l'enfant.",
      guichet: "Guichet 3",
      bg: "bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300"
    },
    {
      id: "4",
      title: "Psychologie Clinique",
      description: "Soutien psycho-affectif face à l'échec scolaire, au manque de confiance en soi, à l'anxiété ou aux phobies scolaires.",
      guichet: "Guichet 4",
      bg: "bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300"
    },
    {
      id: "5",
      title: "Ergothérapie",
      description: "Aménagement de l'écriture (dysgraphie), apprentissage de l'ordinateur à l'école et aides techniques pour l'autonomie.",
      guichet: "Guichet 5",
      bg: "bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300"
    },
    {
      id: "6",
      title: "Orthoptie",
      description: "Rééducation visuelle, convergence oculaire, troubles neuro-visuels impactant la fluidité de la poursuite de lecture.",
      guichet: "Guichet 6",
      bg: "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300"
    }
  ];

  return (
    <div id="landing-page" className="space-y-16 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 to-emerald-950 px-6 py-16 text-white md:px-12 md:py-24 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-600/20 via-transparent to-transparent"></div>
        
        <div className="relative mx-auto max-w-4xl text-center space-y-6">
          <motion.div
            {...animateOrStatic({
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.6 }
            })}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-700/50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-200 border border-emerald-600/30"
          >
            <Award className="h-4 w-4 text-orange-400" /> Association Marocaine Reconnue
          </motion.div>
          
          <motion.h1
            {...animateOrStatic({
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.6, delay: 0.1 }
            })}
            className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl"
            data-accessible-text="Association Marocaine des Troubles et Difficultés d'Apprentissage. Ensemble pour l'épanouissement scolaire de votre enfant."
          >
            Donner des ailes à chaque <span className="text-orange-400">Enfant DYS</span>
          </motion.h1>

          <motion.p
            {...animateOrStatic({
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.6, delay: 0.2 }
            })}
            className="mx-auto max-w-2xl text-lg text-emerald-100/90 leading-relaxed font-light"
          >
            Soutien et prise en charge globale des enfants présentant des troubles d'apprentissage : Dyslexie, Dyspraxie, Dysgraphie, TDAH et Échec Scolaire.
          </motion.p>

          <motion.div
            {...animateOrStatic({
              initial: { opacity: 0, scale: 0.95 },
              animate: { opacity: 1, scale: 1 },
              transition: { duration: 0.6, delay: 0.3 }
            })}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <button
              id="btn-hero-booking"
              onClick={onStartBooking}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-full bg-orange-500 px-8 py-4 text-base font-bold text-white shadow-xl hover:bg-orange-600 transition hover:scale-105 active:scale-95 duration-150 focus:outline-none focus:ring-4 focus:ring-emerald-400"
              aria-label="Prendre rendez-vous"
            >
              <Calendar className="h-5 w-5" />
              Je prends rendez-vous pour mon enfant
            </button>
            <button
              id="btn-hero-portals"
              onClick={() => onNavigateToPortal("parent")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-emerald-700 px-6 py-4 text-base font-semibold text-white border border-emerald-600 hover:bg-emerald-800 transition duration-150"
            >
              Espace Parent / Suivi
            </button>
          </motion.div>
          
          {/* Slogan pill */}
          <div className="pt-6 flex justify-center">
            <span className="text-xs tracking-[0.2em] font-medium text-orange-300 uppercase bg-black/15 px-6 py-2 rounded-full border border-orange-400/20">
              Dépistage • Suivi • Accompagnement
            </span>
          </div>
        </div>
      </section>

      {/* 2. Key Facts / Statistics Section (Directly from Image 1) */}
      <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-3xl p-8 shadow-md">
        <div className="mx-auto max-w-5xl space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
              Les Troubles de l'Apprentissage au Maroc
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              Des données réelles issues de nos enquêtes scolaires et de nos dépistages menés à Casablanca.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Fact 1 */}
            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-3 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950/40 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">12% à 13%</div>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                d'enfants atteints de dyslexie par école primaire à Casablanca.
              </p>
            </div>
            
            {/* Fact 2 */}
            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-3 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950/40 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
                <BookOpen className="h-6 w-6" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">2 / 150</div>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                enseignants seulement connaissent et identifient les troubles DYS en classe.
              </p>
            </div>

            {/* Fact 3 */}
            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-3 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950/40 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">
                <Users className="h-6 w-6" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">63% / 37%</div>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Répartition des diagnostics : les garçons sont statistiquement plus identifiés (63%).
              </p>
            </div>

            {/* Fact 4 */}
            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-3 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950/40 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400">
                <Activity className="h-6 w-6" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">43 Écoles</div>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                bénéficiant de nos programmes de dépistage précoce et d'accompagnement.
              </p>
            </div>
          </div>
          
          {/* Explanatory quote block from Image 1 */}
          <div className="border-l-4 border-orange-500 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-r-xl">
            <p className="text-sm italic text-slate-600 dark:text-slate-300 leading-relaxed">
              « C'est un véritable problème de santé publique... l'école n'est souvent pas armée pour identifier les enfants dyslexiques, qui se retrouvent exclus ou étiquetés à tort d'incompétents. Un dépistage précoce change toute leur trajectoire scolaire. »
            </p>
            <span className="block mt-2 text-xs font-bold text-slate-700 dark:text-slate-400">
              — Zhour Le Quider, Présidente de l'AMTDA Maroc
            </span>
          </div>
        </div>
      </section>

      {/* 3. The 6 Specialty Windows (6 Guichets) */}
      <section className="space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            Nos 6 Guichets Pluridisciplinaires
          </h2>
          <p className="mx-auto max-w-2xl text-sm text-slate-500 dark:text-slate-400">
            Une organisation optimisée en six guichets de consultations spécialisées pour une prise en charge rapide et un suivi clinique continu.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, idx) => (
            <motion.div
              key={service.id}
              id={`service-card-${service.id}`}
              {...animateOrStatic({
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.4, delay: idx * 0.05 }
              })}
              className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition duration-200 dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${service.bg}`}>
                    {service.guichet}
                  </span>
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{service.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{service.description}</p>
              </div>
              <button
                id={`btn-select-spec-${service.id}`}
                onClick={onStartBooking}
                className="mt-6 text-xs font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 inline-flex items-center gap-1 focus:outline-none"
              >
                Réserver un créneau &rarr;
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. Practical Info section (Directly from Image 3 Flyer) */}
      <section className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Contact and address info */}
        <div className="bg-slate-50 dark:bg-slate-800/20 rounded-2xl p-8 border border-slate-100 dark:border-slate-800 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">AMTDA Maroc — Siège Social</h3>
            <p className="text-xs text-slate-500 leading-relaxed dark:text-slate-400">
              L'Association Marocaine des Troubles et Difficultés d'Apprentissage est à votre écoute pour accompagner vos enfants et guider les familles dans leur parcours clinique.
            </p>
          </div>
          
          <div className="space-y-3 text-xs font-medium text-slate-700 dark:text-slate-300">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-orange-500 shrink-0" />
              <div>
                <p className="font-bold">Adresse du centre :</p>
                <p className="text-slate-500">École de l'Akhtal Banat, Rue Afghanistan, Quartier El Mâarif / Hay Hassani, Casablanca, Maroc</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-emerald-600 shrink-0 mt-1" />
              <div className="space-y-2">
                <p className="font-bold text-slate-800 dark:text-slate-200">Téléphones de contact (survolez pour sonnerie) :</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <PhoneLink number="+212 522-013444" label="Fixe Centre" />
                  <PhoneLink number="+212 661-089336" label="GSM Secrétariat" />
                  <PhoneLink number="+212 661-078045" label="GSM Clinique" />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">Email officiel :</p>
                <p className="text-slate-500">association.amtda@gmail.com</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">Heures d'ouverture :</p>
                <p className="text-slate-500">Lundi au Vendredi : 08h30 - 12h30, 14h00 - 17h30</p>
                <p className="text-slate-500">Samedi (Dépistages externes uniquement) : 09h00 - 12h00</p>
              </div>
            </div>
          </div>
        </div>

        {/* Accompagnement Card */}
        <div className="rounded-2xl border border-slate-100 bg-gradient-to-tr from-emerald-500 to-emerald-700 p-8 text-white shadow-lg flex flex-col justify-between">
          <div className="space-y-4">
            <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-100">
              Inclusion Scolaire
            </span>
            <h3 className="text-2xl font-extrabold tracking-tight">Votre enfant rencontre des difficultés d'apprentissage ?</h3>
            <p className="text-sm text-emerald-100 font-light leading-relaxed">
              Ne laissez pas l'échec s'installer. Nos spécialistes vous accueillent au centre ou à distance pour réaliser un bilan complet et structurer un projet thérapeutique personnalisé de remédiation cognitive et motrice.
            </p>
          </div>
          
          <div className="pt-6">
            <button
              id="btn-footer-booking"
              onClick={onStartBooking}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-bold text-emerald-800 shadow hover:bg-slate-100 transition duration-150"
            >
              Je prends rendez-vous en ligne
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
