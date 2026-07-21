/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  MapPin, 
  Video, 
  Home, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  User, 
  AlertCircle, 
  Clock, 
  Phone, 
  Mail, 
  Printer, 
  Download,
  CheckCircle,
  HelpCircle,
  Smartphone
} from "lucide-react";
import { ConsultationMode, AppointmentStatus } from "../types.js";

interface Specialist {
  id: string;
  name: string;
  specialties: string[];
  bio: string;
  avatar: string;
  availableDays: number[];
  guichetId: string;
}

interface Guichet {
  id: string;
  name: string;
  specialty: string;
  roomNumber: string;
}

interface BookingWizardProps {
  onSuccess: () => void;
  disableAnimations: boolean;
  onNavigateToPortal: (portal: "parent" | "specialist" | "admin") => void;
}

export default function BookingWizard({ onSuccess, disableAnimations, onNavigateToPortal }: BookingWizardProps) {
  // Wizard steps: 1 to 6
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [successApt, setSuccessApt] = useState<any>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCodeInput, setOtpCodeInput] = useState("");
  const [otpReceivedFromServer, setOtpReceivedFromServer] = useState("");
  const [loading, setLoading] = useState(false);

  // Lists loaded from DB
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [guichets, setGuichets] = useState<Guichet[]>([]);
  const [alternativeSlots, setAlternativeSlots] = useState<string[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Selected values
  const [selectedMode, setSelectedMode] = useState<ConsultationMode>(ConsultationMode.CENTRE);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [selectedSpecialist, setSelectedSpecialist] = useState<Specialist | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string>("");

  // Load available slots dynamically based on specialist and date selection
  useEffect(() => {
    if (selectedSpecialist && selectedDate) {
      setLoadingSlots(true);
      fetch(`/api/specialists/${selectedSpecialist.id}/available-slots?date=${selectedDate}`)
        .then((res) => res.json())
        .then((data) => {
          setAvailableSlots(data);
          setLoadingSlots(false);
        })
        .catch((err) => {
          console.error("Error loading available slots", err);
          setAvailableSlots([]);
          setLoadingSlots(false);
        });
    } else {
      setAvailableSlots([]);
    }
  }, [selectedSpecialist, selectedDate]);

  // Contact info
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentAddress, setParentAddress] = useState("");
  const [parentRelation, setParentRelation] = useState("Père");
  const [childName, setChildName] = useState("");
  const [childBirthdate, setChildBirthdate] = useState("");
  const [childGender, setChildGender] = useState<"Garçon" | "Fille">("Garçon");

  // Load specialists & guichets
  useEffect(() => {
    fetch("/api/specialists")
      .then((res) => res.json())
      .then((data) => setSpecialists(data))
      .catch((err) => console.error("Error loading specialists", err));

    fetch("/api/guichets")
      .then((res) => res.json())
      .then((data) => setGuichets(data))
      .catch((err) => console.error("Error loading guichets", err));
  }, []);

  const specialties = [
    "Orthophonie",
    "Psychomotricité",
    "Neuropsychologie",
    "Psychologie clinique",
    "Ergothérapie",
    "Orthoptie"
  ];

  const standardSlots = [
    "09:00 - 09:45",
    "09:45 - 10:30",
    "10:30 - 11:15",
    "11:15 - 12:00",
    "14:00 - 14:45",
    "14:45 - 15:30",
    "15:30 - 16:15",
    "16:15 - 17:00"
  ];

  // Filtering specialists by specialty
  const filteredSpecialists = specialists.filter(s => 
    !selectedSpecialty || s.specialties.includes(selectedSpecialty)
  );

  // Find guichet assigned to specialist
  const activeGuichet = guichets.find(g => selectedSpecialist && g.id === selectedSpecialist.guichetId);

  // Validate fields for each step
  const handleNext = () => {
    setError(null);
    if (step === 1) {
      // Mode choice - always valid, defaults to CENTRE
      setStep(2);
    } else if (step === 2) {
      if (!selectedSpecialty) {
        setError("Veuillez sélectionner une spécialité.");
        return;
      }
      // Auto assign first specialist for the specialty if available
      const firstSpec = specialists.find(s => s.specialties.includes(selectedSpecialty));
      if (firstSpec && !selectedSpecialist) {
        setSelectedSpecialist(firstSpec);
      }
      setStep(3);
    } else if (step === 3) {
      if (!selectedSpecialist) {
        setError("Veuillez choisir un spécialiste.");
        return;
      }
      setStep(4);
    } else if (step === 4) {
      if (!selectedDate || !selectedSlot) {
        setError("Veuillez sélectionner une date et un créneau horaire.");
        return;
      }
      // Check if selected date is weekend
      const d = new Date(selectedDate);
      const dayOfWeek = d.getDay(); // 0 = Sunday, 6 = Saturday
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        setError("Le centre AMTDA est fermé le week-end. Veuillez choisir un jour de semaine (Lundi au Vendredi).");
        return;
      }
      // Check if day is within specialist available days
      // If we have dynamic slots from the admin-configured rooms, trust those. Otherwise fall back.
      if (selectedSpecialist && availableSlots.length === 0 && !selectedSpecialist.availableDays.includes(dayOfWeek)) {
        setError("Ce spécialiste n'est pas disponible ce jour de la semaine. Veuillez consulter un autre jour.");
        return;
      }
      setStep(5);
    } else if (step === 5) {
      if (!parentName || !parentEmail || !parentPhone || !childName || !childBirthdate) {
        setError("Veuillez remplir toutes les informations obligatoires marquées d'une étoile.");
        return;
      }
      setStep(6);
      triggerBookingSubmit(); // Call server to obtain OTP
    }
  };

  const handleBack = () => {
    setError(null);
    setAlternativeSlots([]);
    if (step > 1) setStep(step - 1);
  };

  // Step 6: Submit to Server and request OTP Code
  const triggerBookingSubmit = () => {
    setLoading(true);
    setError(null);

    const bookingPayload = {
      childId: null, // will create on flight
      specialistId: selectedSpecialist?.id,
      guichetId: selectedSpecialist?.guichetId || "1",
      date: selectedDate,
      slot: selectedSlot,
      mode: selectedMode,
      notes: `Troubles signalés par le parent. Relation: ${parentRelation}.`,
      parentContact: {
        parentName,
        parentEmail,
        parentPhone,
        parentAddress,
        parentRelation,
        childName,
        childBirthdate,
        childGender
      }
    };

    fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingPayload)
    })
      .then(async (res) => {
        setLoading(false);
        const data = await res.json();
        if (res.status === 409) {
          // Collision! (Section 7)
          setError(data.message);
          if (data.alternatives) {
            setAlternativeSlots(data.alternatives);
          }
          setStep(4); // send back to calendar slot selection
        } else if (!res.ok) {
          setError(data.message || "Erreur lors de la réservation.");
        } else {
          // Awaiting OTP verification
          setSuccessApt(data.appointment);
          setOtpReceivedFromServer(data.otpReceived);
          setOtpSent(true);
        }
      })
      .catch((err) => {
        setLoading(false);
        setError("Erreur réseau. Impossible de contacter le serveur.");
      });
  };

  // Step 6: Verify OTP Code and confirm booking (Section 6)
  const handleVerifyOtp = () => {
    if (!otpCodeInput) {
      setError("Veuillez saisir le code OTP reçu.");
      return;
    }
    setLoading(true);
    setError(null);

    fetch(`/api/appointments/${successApt.id}/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: otpCodeInput })
    })
      .then(async (res) => {
        setLoading(false);
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || "Code OTP incorrect.");
        } else {
          // Success confirm!
          setSuccessApt(data.appointment);
          setStep(7); // Final step
        }
      })
      .catch((err) => {
        setLoading(false);
        setError("Erreur réseau lors de la validation OTP.");
      });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 p-8 shadow-2xl relative overflow-hidden">
      {/* Decorative colored accents */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-600 via-orange-500 to-emerald-700"></div>

      {/* Progress Stepper Headers */}
      {step <= 6 && (
        <div className="mb-8 hidden sm:flex items-center justify-between text-xs font-semibold text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className={`${step >= 1 ? "text-emerald-700 dark:text-emerald-400" : ""} flex items-center gap-1.5`}>
            <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] ${step > 1 ? "bg-emerald-600 text-white" : "border border-emerald-600 text-emerald-600"}`}>1</span>
            Mode
          </div>
          <ChevronRight className="h-3 w-3" />
          <div className={`${step >= 2 ? "text-emerald-700 dark:text-emerald-400" : ""} flex items-center gap-1.5`}>
            <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] ${step > 2 ? "bg-emerald-600 text-white" : step === 2 ? "border border-emerald-600 text-emerald-600" : "border"}`}>2</span>
            Spécialité
          </div>
          <ChevronRight className="h-3 w-3" />
          <div className={`${step >= 3 ? "text-emerald-700 dark:text-emerald-400" : ""} flex items-center gap-1.5`}>
            <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] ${step > 3 ? "bg-emerald-600 text-white" : step === 3 ? "border border-emerald-600 text-emerald-600" : "border"}`}>3</span>
            Thérapeute
          </div>
          <ChevronRight className="h-3 w-3" />
          <div className={`${step >= 4 ? "text-emerald-700 dark:text-emerald-400" : ""} flex items-center gap-1.5`}>
            <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] ${step > 4 ? "bg-emerald-600 text-white" : step === 4 ? "border border-emerald-600 text-emerald-600" : "border"}`}>4</span>
            Créneau
          </div>
          <ChevronRight className="h-3 w-3" />
          <div className={`${step >= 5 ? "text-emerald-700 dark:text-emerald-400" : ""} flex items-center gap-1.5`}>
            <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] ${step > 5 ? "bg-emerald-600 text-white" : step === 5 ? "border border-emerald-600 text-emerald-600" : "border"}`}>5</span>
            Informations
          </div>
          <ChevronRight className="h-3 w-3" />
          <div className={`${step >= 6 ? "text-emerald-700 dark:text-emerald-400" : ""} flex items-center gap-1.5`}>
            <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] ${step === 6 ? "border border-emerald-600 text-emerald-600" : "border"}`}>6</span>
            Validation
          </div>
        </div>
      )}

      {/* Error alert banner */}
      {error && (
        <div className="mb-6 rounded-xl bg-orange-50 border border-orange-200 p-4 text-orange-800 text-sm flex items-start gap-2.5 dark:bg-orange-950/20 dark:border-orange-900/40 dark:text-orange-300">
          <AlertCircle className="h-5 w-5 shrink-0 text-orange-500" />
          <div>
            <p className="font-semibold">{error}</p>
            {alternativeSlots.length > 0 && (
              <div className="mt-2.5 space-y-1">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">Créneaux alternatifs disponibles ce jour :</p>
                <div className="flex gap-2 flex-wrap pt-1">
                  {alternativeSlots.map((altSlot) => (
                    <button
                      key={altSlot}
                      id={`btn-use-alternative-${altSlot}`}
                      onClick={() => {
                        setSelectedSlot(altSlot);
                        setError(null);
                        setAlternativeSlots([]);
                      }}
                      className="px-3 py-1 bg-white border border-emerald-600 rounded-lg text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition"
                    >
                      {altSlot}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 1: CONSULTATION MODE (Section 6) */}
      {step === 1 && (
        <div id="booking-step-1" className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
              1. Choisissez le mode de consultation
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Sélectionnez comment vous souhaitez effectuer le bilan ou la consultation thérapeutique de votre enfant.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Mode CENTRE */}
            <button
              id="btn-mode-centre"
              onClick={() => setSelectedMode(ConsultationMode.CENTRE)}
              className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 text-center transition gap-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                selectedMode === ConsultationMode.CENTRE
                  ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300"
                  : "border-slate-100 bg-white hover:border-slate-200 dark:bg-slate-900 dark:border-slate-800"
              }`}
            >
              <div className={`p-3 rounded-full ${selectedMode === ConsultationMode.CENTRE ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500 dark:bg-slate-800"}`}>
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <span className="block font-bold text-sm">Au centre AMTDA</span>
                <span className="block text-[10px] text-slate-400 mt-1">Salles équipées à Casablanca</span>
              </div>
            </button>

            {/* Mode TELECONSULTATION */}
            <button
              id="btn-mode-tele"
              onClick={() => setSelectedMode(ConsultationMode.TELECONSULTATION)}
              className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 text-center transition gap-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                selectedMode === ConsultationMode.TELECONSULTATION
                  ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300"
                  : "border-slate-100 bg-white hover:border-slate-200 dark:bg-slate-900 dark:border-slate-800"
              }`}
            >
              <div className={`p-3 rounded-full ${selectedMode === ConsultationMode.TELECONSULTATION ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500 dark:bg-slate-800"}`}>
                <Video className="h-6 w-6" />
              </div>
              <div>
                <span className="block font-bold text-sm">Téléconsultation</span>
                <span className="block text-[10px] text-slate-400 mt-1">Consultation vidéo sécurisée</span>
              </div>
            </button>

            {/* Mode DOMICILE */}
            <button
              id="btn-mode-domicile"
              onClick={() => setSelectedMode(ConsultationMode.DOMICILE)}
              className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 text-center transition gap-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                selectedMode === ConsultationMode.DOMICILE
                  ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300"
                  : "border-slate-100 bg-white hover:border-slate-200 dark:bg-slate-900 dark:border-slate-800"
              }`}
            >
              <div className={`p-3 rounded-full ${selectedMode === ConsultationMode.DOMICILE ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500 dark:bg-slate-800"}`}>
                <Home className="h-6 w-6" />
              </div>
              <div>
                <span className="block font-bold text-sm">À domicile</span>
                <span className="block text-[10px] text-slate-400 mt-1">Déplacement du thérapeute</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: CHOOSE CLINICAL SPECIALTY (Section 6 & 7) */}
      {step === 2 && (
        <div id="booking-step-2" className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
              2. Sélectionnez la spécialité requise
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Nos consultations s'effectuent sur six guichets dédiés aux troubles de l'apprentissage.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {specialties.map((spec) => (
              <button
                key={spec}
                id={`btn-specialty-option-${spec}`}
                onClick={() => {
                  setSelectedSpecialty(spec);
                  // Reset specialist if it doesn't match selected specialty
                  if (selectedSpecialist && !selectedSpecialist.specialties.includes(spec)) {
                    setSelectedSpecialist(null);
                  }
                }}
                className={`flex items-center justify-between p-4 rounded-xl border transition text-left focus:outline-none ${
                  selectedSpecialty === spec
                    ? "border-emerald-600 bg-emerald-50/30 text-emerald-800 font-bold dark:bg-emerald-950/10 dark:text-emerald-300"
                    : "border-slate-100 bg-white hover:border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100"
                }`}
              >
                <span className="text-sm">{spec}</span>
                {selectedSpecialty === spec && (
                  <span className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3: CHOOSE SPECIALIST (Section 6) */}
      {step === 3 && (
        <div id="booking-step-3" className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
              3. Choisissez votre spécialiste AMTDA
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Chaque spécialiste de l'association est rattaché à un des six guichets d'accueil de la clinique.
            </p>
          </div>

          <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
            {filteredSpecialists.length > 0 ? (
              filteredSpecialists.map((spec) => (
                <button
                  key={spec.id}
                  id={`btn-specialist-card-${spec.id}`}
                  onClick={() => setSelectedSpecialist(spec)}
                  className={`w-full flex items-start gap-4 p-4 rounded-xl border text-left transition ${
                    selectedSpecialist?.id === spec.id
                      ? "border-emerald-600 bg-emerald-50/30 dark:bg-emerald-950/20"
                      : "border-slate-100 bg-white hover:border-slate-200 dark:bg-slate-900 dark:border-slate-800"
                  }`}
                >
                  <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100 text-lg border">
                    {spec.name.split(" ").slice(-1)[0][0]}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-800 dark:text-white">{spec.name}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full dark:bg-slate-800 dark:text-slate-300">
                        Guichet {spec.guichetId}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-700 font-semibold dark:text-emerald-400">{spec.specialties.join(", ")}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-2 dark:text-slate-400">{spec.bio}</p>
                  </div>
                </button>
              ))
            ) : (
              <p className="text-center text-sm text-slate-400 py-6">Aucun spécialiste trouvé pour cette spécialité.</p>
            )}
          </div>
        </div>
      )}

      {/* STEP 4: CHOOSE DATE & TIME SLOT (Section 7) */}
      {step === 4 && (
        <div id="booking-step-4" className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
              4. Choisissez un créneau horaire (45 min)
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {selectedSpecialist?.name} est rattaché au <strong>{activeGuichet?.name}</strong>. Les séances s'effectuent par intervalles stricts de 45 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Calendar Input picker */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase dark:text-slate-400">Date de consultation</label>
              <div className="relative">
                <input
                  id="inp-booking-date"
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedSlot(""); // reset slot on date change
                  }}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <p className="text-[10px] text-slate-400">
                Fermé le week-end. Les jours disponibles pour {selectedSpecialist?.name} : Lundi au Vendredi.
              </p>
            </div>

            {/* Slots selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase dark:text-slate-400">Créneaux horaires disponibles</label>
              {!selectedDate ? (
                <div className="h-32 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center text-xs text-slate-400">
                  Veuillez d'abord choisir une date
                </div>
              ) : loadingSlots ? (
                <div className="h-32 flex flex-col items-center justify-center text-xs text-slate-400 gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-emerald-600 border-t-transparent"></div>
                  Chargement des créneaux...
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-orange-200 bg-orange-50/50 dark:border-orange-950 dark:bg-orange-950/20 text-xs text-orange-800 dark:text-orange-300 space-y-1">
                  <p className="font-bold">Aucun créneau disponible</p>
                  <p className="text-[10px]">Cette salle n'est pas ouverte ou tous les créneaux ont déjà été réservés pour cette journée. Veuillez choisir un autre jour de la semaine (Lundi-Vendredi) ou changer de spécialiste.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-[30vh] overflow-y-auto">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      id={`btn-select-slot-${slot.replace(/ /g, "").replace(/:/g, "")}`}
                      onClick={() => setSelectedSlot(slot)}
                      type="button"
                      className={`py-2 px-3 text-xs font-bold rounded-lg border text-center transition ${
                        selectedSlot === slot
                          ? "border-emerald-600 bg-emerald-600 text-white shadow-md"
                          : "border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: PARENT & CHILD CLINICAL INFORMATIONS (Section 6 & 8) */}
      {step === 5 && (
        <div id="booking-step-5" className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
              5. Saisie des informations du parent et de l'enfant
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Un dossier numérique unique sera créé pour votre enfant afin de garantir le suivi thérapeutique.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[48vh] overflow-y-auto pr-1">
            {/* Parent section */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 uppercase border-b pb-1">
                Informations du Parent
              </h3>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-500">Nom complet du parent *</label>
                <input
                  id="inp-parent-name"
                  type="text"
                  required
                  placeholder="Ex: Samir Bennani"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-500">Email du parent *</label>
                <input
                  id="inp-parent-email"
                  type="email"
                  required
                  placeholder="Ex: samir@gmail.com"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-500">Téléphone Mobile (WhatsApp) *</label>
                <input
                  id="inp-parent-phone"
                  type="tel"
                  required
                  placeholder="Ex: +212 668-990011"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-500">Relation avec l'enfant</label>
                <select
                  id="sel-parent-relation"
                  value={parentRelation}
                  onChange={(e) => setParentRelation(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="Mère">Mère</option>
                  <option value="Père">Père</option>
                  <option value="Tuteur">Tuteur / Tutrice</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-500">Adresse de résidence</label>
                <input
                  id="inp-parent-address"
                  type="text"
                  placeholder="Ex: Maarif, Casablanca"
                  value={parentAddress}
                  onChange={(e) => setParentAddress(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Child section */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 uppercase border-b pb-1">
                Informations de l'Enfant
              </h3>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-500">Nom complet de l'enfant *</label>
                <input
                  id="inp-child-name"
                  type="text"
                  required
                  placeholder="Ex: Yassine Bennani"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-500">Date de naissance *</label>
                <input
                  id="inp-child-birthdate"
                  type="date"
                  required
                  value={childBirthdate}
                  onChange={(e) => setChildBirthdate(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-500">Sexe</label>
                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <input
                      id="rad-child-boy"
                      type="radio"
                      name="child_gender"
                      checked={childGender === "Garçon"}
                      onChange={() => setChildGender("Garçon")}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    Garçon
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <input
                      id="rad-child-girl"
                      type="radio"
                      name="child_gender"
                      checked={childGender === "Fille"}
                      onChange={() => setChildGender("Fille")}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    Fille
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 6: VERIFICATION SUMMARY & OTP CONFIRMATION (Section 6) */}
      {step === 6 && (
        <div id="booking-step-6" className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
              6. Validation par Code de Sécurité
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Un code de validation à usage unique (OTP) a été transmis au numéro mobile du parent pour sécuriser l'enregistrement.
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-5 space-y-4 dark:border-slate-800 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-300">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Récapitulatif de votre rendez-vous :</h3>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4">
              <p><strong>Enfant :</strong> {childName} ({childGender})</p>
              <p><strong>Thérapeute :</strong> {selectedSpecialist?.name}</p>
              <p><strong>Guichet assigné :</strong> {activeGuichet?.name}</p>
              <p><strong>Date & Heure :</strong> {selectedDate} à {selectedSlot}</p>
              <p><strong>Mode :</strong> {selectedMode}</p>
              <p><strong>Parent tuteur :</strong> {parentName} ({parentRelation})</p>
            </div>
          </div>

          {/* SIMULATED SMS NOTIFICATION DISPLAY FOR HIGH FIDELITY TESTING */}
          {otpReceivedFromServer && (
            <div className="rounded-xl border border-dashed border-orange-300 bg-orange-50/40 p-4 space-y-2 dark:border-orange-800/40 dark:bg-orange-950/10">
              <div className="flex items-center gap-1.5 text-xs font-bold text-orange-700 dark:text-orange-400">
                <Smartphone className="h-4 w-4" /> Simulation d'envoi SMS / WhatsApp (Testeur Premium) :
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                « AMTDA MAROC : Le code de confirmation pour Yassine est <strong className="text-sm text-orange-600 underline font-mono">{otpReceivedFromServer}</strong>. Veuillez le saisir pour valider le rendez-vous. »
              </p>
            </div>
          )}

          <div className="space-y-2 max-w-sm">
            <label className="block text-xs font-bold text-slate-500 uppercase dark:text-slate-400">Saisir le Code OTP reçu *</label>
            <div className="flex gap-2">
              <input
                id="inp-otp-code"
                type="text"
                maxLength={6}
                placeholder="Ex: 582914"
                value={otpCodeInput}
                onChange={(e) => setOtpCodeInput(e.target.value)}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-mono tracking-widest text-center focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <button
                id="btn-verify-otp-submit"
                disabled={loading}
                onClick={handleVerifyOtp}
                className="px-6 py-2 bg-emerald-700 text-white font-bold rounded-lg hover:bg-emerald-800 text-xs transition duration-150 disabled:opacity-50"
              >
                {loading ? "Vérification..." : "Valider"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 7: FINAL CONFIRMATION & RECEIPT */}
      {step === 7 && (
        <div id="booking-step-7" className="space-y-6 text-center py-6">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <CheckCircle className="h-10 w-10" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Rendez-vous Confirmé !</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Le rendez-vous de votre enfant <strong>{childName}</strong> a été officiellement enregistré dans l'agenda de la clinique de l'AMTDA Maroc.
            </p>
          </div>

          <div className="max-w-md mx-auto rounded-xl border border-slate-100 bg-slate-50 p-6 space-y-3 text-left dark:border-slate-800 dark:bg-slate-800/20 text-xs">
            <p className="border-b pb-2 text-center text-sm font-extrabold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">Reçu Clinique Officiel</p>
            <p><strong>N° de référence :</strong> {successApt?.id}</p>
            <p><strong>Date & Heure :</strong> {selectedDate} à {selectedSlot}</p>
            <p><strong>Thérapeute affecté :</strong> {selectedSpecialist?.name}</p>
            <p><strong>Guichet & Lieu :</strong> Guichet {selectedSpecialist?.guichetId} • {activeGuichet?.roomNumber}</p>
            <p><strong>Statut :</strong> <span className="inline-flex px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">CONFIRMÉ</span></p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto pt-4">
            <button
              id="btn-print-receipt"
              onClick={handlePrint}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Printer className="h-4 w-4" /> Imprimer le reçu
            </button>
            <button
              id="btn-goto-portal-success"
              onClick={() => onNavigateToPortal("parent")}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 transition"
            >
              Suivre sur l'Espace Parent
            </button>
          </div>
        </div>
      )}

      {/* Wizard Footer Controls */}
      {step < 6 && (
        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <button
            id="btn-wizard-back"
            onClick={handleBack}
            disabled={step === 1}
            className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 disabled:opacity-30 dark:hover:bg-slate-800"
          >
            <ChevronLeft className="h-4 w-4" /> Retour
          </button>
          <button
            id="btn-wizard-next"
            onClick={handleNext}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition"
          >
            Continuer <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
