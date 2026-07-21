import React, { useState, useEffect, useRef } from "react";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  MonitorUp, 
  Settings, 
  MessageSquare, 
  Users, 
  PhoneOff, 
  Sparkles, 
  Maximize2, 
  Activity, 
  PenTool, 
  Eraser, 
  ShieldCheck, 
  Wifi, 
  Send, 
  FileText, 
  Layout, 
  ChevronRight,
  Info,
  Sliders,
  Check
} from "lucide-react";

interface VideoRoomProps {
  role: "parent" | "specialist";
  appointment: any;
  onClose: () => void;
  onSaveClinicalNotes?: (clinicalData: any) => void;
}

export default function VideoRoom({ role, appointment, onClose, onSaveClinicalNotes }: VideoRoomProps) {
  // Call controls states
  const [micActive, setMicActive] = useState<boolean>(true);
  const [videoActive, setVideoActive] = useState<boolean>(true);
  const [screenShareActive, setScreenShareActive] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"chat" | "whiteboard" | "materials">("chat");
  
  // Simulated stats
  const [signalStrength, setSignalStrength] = useState<number>(98);
  const [qoeMetrics, setQoeMetrics] = useState({
    fps: 30,
    bitrate: "2.4 Mbps",
    latency: "18 ms",
    resolution: "1080p (FHD)"
  });

  // Whiteboard drawing ref & states
  const whiteboardCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [brushColor, setBrushColor] = useState<string>("#10b981"); // Default emerald
  const [brushSize, setBrushSize] = useState<number>(4);
  const [isEraser, setIsEraser] = useState<boolean>(false);

  // Chat messages states
  const [chatMessages, setChatMessages] = useState<any[]>([
    { id: 1, sender: "Système", text: "Connexion sécurisée établie (Chiffrement AES-256 de bout en bout).", isSystem: true, time: "10:00" },
    { 
      id: 2, 
      sender: role === "specialist" ? "Parent (Samir)" : "Dr. Amina Bennani", 
      text: "Bonjour ! Est-ce que vous m'entendez et me voyez correctement ?", 
      isSystem: false, 
      time: "10:01" 
    },
  ]);
  const [newMsgText, setNewMsgText] = useState<string>("");

  // Specialist-specific real-time clinical notes states
  const [motif, setMotif] = useState<string>(appointment?.notes || "Bilan de suivi orthophonique");
  const [observations, setObservations] = useState<string>("");
  const [objectifs, setObjectifs] = useState<string>("");
  const [diagnostic, setDiagnostic] = useState<string>("Dyslexie");
  const [recommandations, setRecommandations] = useState<string>("");

  // Canvas drawing simulation for video feeds (creates beautiful animation loops to simulate live video feed with waveforms)
  const localVideoCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const remoteVideoCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sound meter visualizer simulation
  const [localAudioLevel, setLocalAudioLevel] = useState<number>(30);
  const [remoteAudioLevel, setRemoteAudioLevel] = useState<number>(45);

  // Auto-drawing loop on video preview canvases
  useEffect(() => {
    let animationId: number;
    let tick = 0;

    const renderCanvas = () => {
      tick += 0.05;
      
      // Render Local Video Stream Simulator
      if (localVideoCanvasRef.current) {
        const canvas = localVideoCanvasRef.current;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          if (videoActive) {
            // Draw gradient background simulating room interior
            const grad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 10, canvas.width / 2, canvas.height / 2, canvas.width);
            grad.addColorStop(0, "#334155");
            grad.addColorStop(1, "#0f172a");
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw simulated user silhouette/avatar outline
            ctx.strokeStyle = "#10b981";
            ctx.lineWidth = 2;
            ctx.fillStyle = "#1e293b";
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2 - 10, 30, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Draw body silhouette
            ctx.fillStyle = "#1e293b";
            ctx.beginPath();
            ctx.ellipse(canvas.width / 2, canvas.height / 2 + 55, 50, 40, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Draw animated clinical focus crosshairs/wireframes to represent "Live tracking"
            ctx.strokeStyle = "rgba(16, 185, 129, 0.3)";
            ctx.lineWidth = 1;
            ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
            
            // Draw focus corners
            ctx.strokeStyle = "#10b981";
            ctx.lineWidth = 3;
            // Top Left
            ctx.beginPath(); ctx.moveTo(15, 30); ctx.lineTo(15, 15); ctx.lineTo(30, 15); ctx.stroke();
            // Top Right
            ctx.beginPath(); ctx.moveTo(canvas.width - 15, 30); ctx.lineTo(canvas.width - 15, 15); ctx.lineTo(canvas.width - 30, 15); ctx.stroke();
            // Bottom Left
            ctx.beginPath(); ctx.moveTo(15, canvas.height - 30); ctx.lineTo(15, canvas.height - 15); ctx.lineTo(30, canvas.height - 15); ctx.stroke();
            // Bottom Right
            ctx.beginPath(); ctx.moveTo(canvas.width - 15, canvas.height - 30); ctx.lineTo(canvas.width - 15, canvas.height - 15); ctx.lineTo(canvas.width - 30, canvas.height - 15); ctx.stroke();

            // Live tag
            ctx.fillStyle = "#10b981";
            ctx.font = "bold 9px Inter, sans-serif";
            ctx.fillText("VOUS (MOCK-CAM)", 25, 35);

            // Simulated face tracking landmark dots
            ctx.fillStyle = "rgba(16, 185, 129, 0.8)";
            const pulse = Math.sin(tick * 2) * 2;
            ctx.beginPath(); ctx.arc(canvas.width / 2 - 10, canvas.height / 2 - 12 + pulse, 2, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(canvas.width / 2 + 10, canvas.height / 2 - 12 + pulse, 2, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(canvas.width / 2, canvas.height / 2 + pulse, 2, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(canvas.width / 2 - 5, canvas.height / 2 + 10 + pulse, 1.5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(canvas.width / 2 + 5, canvas.height / 2 + 10 + pulse, 1.5, 0, Math.PI * 2); ctx.fill();
          } else {
            // Camera Disabled Black Screen
            ctx.fillStyle = "#020617";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#ef4444";
            ctx.font = "11px Inter, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("CAMÉRA DÉSACTIVÉE", canvas.width / 2, canvas.height / 2);
          }
        }
      }

      // Render Remote Video Stream Simulator (Specialist or Patient, always active)
      if (remoteVideoCanvasRef.current) {
        const canvas = remoteVideoCanvasRef.current;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw gradient interior
          const grad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 20, canvas.width / 2, canvas.height / 2, canvas.width);
          grad.addColorStop(0, "#1e1b4b"); // Cozy dark indigo/emerald tone
          grad.addColorStop(1, "#020617");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw partner outline
          ctx.strokeStyle = "#3b82f6";
          ctx.lineWidth = 2;
          ctx.fillStyle = "#0f172a";
          ctx.beginPath();
          ctx.arc(canvas.width / 2, canvas.height / 2 - 20, 45, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Draw body outline
          ctx.beginPath();
          ctx.ellipse(canvas.width / 2, canvas.height / 2 + 75, 80, 55, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Draw sound waveform overlay representing speaker audio activity
          ctx.strokeStyle = "rgba(59, 130, 246, 0.4)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          for (let x = 0; x < canvas.width; x += 5) {
            const y = (canvas.height - 30) + Math.sin(x * 0.05 + tick * 4) * (remoteAudioLevel * 0.4);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();

          // Face Landmarks
          ctx.fillStyle = "rgba(59, 130, 246, 0.7)";
          const pulse = Math.cos(tick * 3) * 2.5;
          ctx.beginPath(); ctx.arc(canvas.width / 2 - 15, canvas.height / 2 - 22 + pulse, 3, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(canvas.width / 2 + 15, canvas.height / 2 - 22 + pulse, 3, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(canvas.width / 2, canvas.height / 2 - 5 + pulse, 3, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(canvas.width / 2, canvas.height / 2 + 10 + pulse, 3, 0, Math.PI * 2); ctx.fill();

          // Target labels
          ctx.fillStyle = "#3b82f6";
          ctx.font = "bold 11px Inter, sans-serif";
          ctx.textAlign = "left";
          const partnerLabel = role === "specialist" ? `${appointment?.childName} (Patient)` : `${appointment?.specialistName} (Spécialiste)`;
          ctx.fillText(`⚡ EN DIRECT : ${partnerLabel}`, 30, 40);

          // Quality badge
          ctx.fillStyle = "rgba(16, 185, 129, 0.2)";
          ctx.fillRect(canvas.width - 150, 25, 120, 22);
          ctx.strokeStyle = "#10b981";
          ctx.lineWidth = 1;
          ctx.strokeRect(canvas.width - 150, 25, 120, 22);
          ctx.fillStyle = "#10b981";
          ctx.font = "bold 9px JetBrains Mono, sans-serif";
          ctx.fillText("FLUX HDR SECURE", canvas.width - 140, 39);
        }
      }

      // Simulate slight signal changes
      if (Math.random() > 0.85) {
        setSignalStrength(prev => Math.max(90, Math.min(100, prev + (Math.random() > 0.5 ? 1 : -1))));
        setLocalAudioLevel(Math.floor(Math.random() * 45) + 10);
        setRemoteAudioLevel(Math.floor(Math.random() * 65) + 15);
      }

      animationId = requestAnimationFrame(renderCanvas);
    };

    renderCanvas();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [videoActive, localAudioLevel, remoteAudioLevel, role, appointment]);

  // Initial setup of whiteboard canvas size
  useEffect(() => {
    if (whiteboardCanvasRef.current) {
      const canvas = whiteboardCanvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw helper guidelines for child therapy (dotted lines like a notebook)
        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, 50); ctx.lineTo(canvas.width, 50);
        ctx.moveTo(0, 100); ctx.lineTo(canvas.width, 100);
        ctx.moveTo(0, 150); ctx.lineTo(canvas.width, 150);
        ctx.stroke();
        ctx.setLineDash([]); // Reset
      }
    }
  }, [activeTab]);

  // Whiteboard drawing mechanics
  const startWhiteboardDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = whiteboardCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = isEraser ? "#ffffff" : brushColor;
    ctx.lineWidth = isEraser ? brushSize * 4 : brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const { x, y } = getWhiteboardCoords(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const drawWhiteboard = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = whiteboardCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getWhiteboardCoords(e, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopWhiteboardDrawing = () => {
    setIsDrawing(false);
  };

  const clearWhiteboard = () => {
    const canvas = whiteboardCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw guidelines back
    ctx.strokeStyle = "#f1f5f9";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, 50); ctx.lineTo(canvas.width, 50);
    ctx.moveTo(0, 100); ctx.lineTo(canvas.width, 100);
    ctx.moveTo(0, 150); ctx.lineTo(canvas.width, 150);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  const getWhiteboardCoords = (e: any, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    // Account for styling scale
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  // Send a chat message
  const handleSendChatMessage = () => {
    if (!newMsgText.trim()) return;

    const myMessage = {
      id: Date.now(),
      sender: role === "specialist" ? "Dr. Amina Bennani" : "Parent (Samir)",
      text: newMsgText,
      isSystem: false,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setChatMessages(prev => [...prev, myMessage]);
    setNewMsgText("");

    // Simulate partner typing back a smart clinical/reassuring response after 2 seconds
    setTimeout(() => {
      const responseText = role === "specialist" 
        ? "D'accord Docteur, mon enfant est prêt et concentré pour l'exercice." 
        : "Excellent, nous allons commencer par l'exercice de conscience syllabique sur le tableau blanc !";
      
      const partnerMessage = {
        id: Date.now() + 1,
        sender: role === "specialist" ? "Parent (Samir)" : "Dr. Amina Bennani",
        text: responseText,
        isSystem: false,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      
      setChatMessages(prev => [...prev, partnerMessage]);
    }, 2500);
  };

  // Quick clinical prompts on the whiteboard (e.g. template letters)
  const drawTemplateLetter = (letter: string) => {
    const canvas = whiteboardCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.font = "bold 90px Inter, sans-serif";
    ctx.fillStyle = "rgba(59, 130, 246, 0.15)";
    ctx.textAlign = "center";
    ctx.fillText(letter, canvas.width / 2, canvas.height / 2 + 30);
    
    // Draw help arrows for orthography direction
    ctx.font = "14px Inter, sans-serif";
    ctx.fillStyle = "#3b82f6";
    ctx.fillText("↓ Tracez ici", canvas.width / 2, canvas.height / 2 - 70);
  };

  const handleSaveAndEndCall = () => {
    if (role === "specialist" && onSaveClinicalNotes) {
      // Save data compiled in the video session
      const clinicalPayload = {
        appointmentId: appointment?.id,
        motif,
        observations,
        diagnostic,
        objectifs,
        recommandations,
        signedBySpecialist: true
      };
      onSaveClinicalNotes(clinicalPayload);
    }
    onClose();
  };

  return (
    <div id="telecon-live-viewport" className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col md:flex-row font-sans overflow-hidden">
      
      {/* LEFT SECTION: VIDEO VIEWS & DRAWING BOARD (Occupies 70% width) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden p-4 space-y-4">
        
        {/* TOP STATUS BAR */}
        <div className="flex items-center justify-between bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl px-5 py-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Téléconsultation Active</p>
              <h1 className="text-xs font-bold text-slate-100">
                Pôle Clinique AMTDA - Réf: {appointment?.id || "A-9923"}
              </h1>
            </div>
          </div>

          {/* Telemetry signals */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="hidden sm:flex items-center gap-1.5 text-emerald-400 font-bold">
              <ShieldCheck className="h-4 w-4" />
              <span>Chiffré AES-256</span>
            </div>
            <div className="flex items-center gap-1">
              <Wifi className="h-4 w-4 text-emerald-400" />
              <span className="text-slate-200 font-bold">{signalStrength}%</span>
            </div>
          </div>
        </div>

        {/* INTERACTIVE SCREENS GRID (GRID Layout based on tab) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 overflow-hidden min-h-0">
          
          {/* VIDEO FEEDS PANEL (Occupies 7/12 layout columns normally, but fills more if tab is simple) */}
          <div className="md:col-span-6 flex flex-col gap-4 overflow-hidden">
            
            {/* REMOTE VIDEO FRAME (Large viewport) */}
            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden relative shadow-inner group">
              <canvas 
                id="canvas-remote-video"
                ref={remoteVideoCanvasRef} 
                className="w-full h-full object-cover rounded-3xl"
                width={640}
                height={480}
              />
              
              {/* Bottom tag info */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-slate-950/70 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-800/80">
                <span className="text-xs font-bold">
                  {role === "specialist" ? `Enfant: ${appointment?.childName}` : `${appointment?.specialistName}`}
                </span>
                <div className="flex gap-1.5">
                  <span className="px-2 py-0.5 bg-blue-600 text-[9px] font-extrabold uppercase rounded">1080p FHD</span>
                  <span className="px-2 py-0.5 bg-emerald-700 text-[9px] font-extrabold uppercase rounded">Son actif</span>
                </div>
              </div>
            </div>

            {/* LOCAL VIDEO FRAME (Picture-in-picture size, but wider stack on mobile) */}
            <div className="h-44 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden relative shadow-lg group">
              <canvas 
                id="canvas-local-video"
                ref={localVideoCanvasRef} 
                className="w-full h-full object-cover rounded-3xl"
                width={320}
                height={240}
              />
              
              {/* Bottom user tag */}
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-slate-950/70 backdrop-blur px-3 py-1 rounded-lg border border-slate-800">
                <span className="text-[10px] font-bold text-slate-300">Votre caméra</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
            </div>
          </div>

          {/* RIGHT VIEW: TAB CONTENT (WHITEBOARD / SEANCE MATERIALS) (Occupies 6/12 columns) */}
          <div className="md:col-span-6 flex flex-col bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            
            {/* TABS SWITCHER BUTTONS */}
            <div className="flex bg-slate-950/60 p-1.5 border-b border-slate-800 gap-1">
              <button
                onClick={() => setActiveTab("chat")}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${activeTab === "chat" ? "bg-slate-800 text-emerald-400 border border-slate-700" : "text-slate-400 hover:text-slate-200"}`}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Chat de Séance
              </button>
              <button
                onClick={() => setActiveTab("whiteboard")}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${activeTab === "whiteboard" ? "bg-slate-800 text-emerald-400 border border-slate-700" : "text-slate-400 hover:text-slate-200"}`}
              >
                <PenTool className="h-3.5 w-3.5" />
                Tableau Blanc
              </button>
              <button
                onClick={() => setActiveTab("materials")}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${activeTab === "materials" ? "bg-slate-800 text-emerald-400 border border-slate-700" : "text-slate-400 hover:text-slate-200"}`}
              >
                <Sliders className="h-3.5 w-3.5" />
                Dossier de Séance
              </button>
            </div>

            {/* TAB CONTAINER BODY */}
            <div className="flex-1 p-4 overflow-y-auto min-h-0 flex flex-col">
              
              {/* CHAT TAB CONTENT */}
              {activeTab === "chat" && (
                <div className="flex-1 flex flex-col min-h-0">
                  {/* Message scroll list */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs mb-3">
                    {chatMessages.map(msg => (
                      <div key={msg.id} className={`flex flex-col ${msg.isSystem ? "items-center" : "items-start"}`}>
                        {msg.isSystem ? (
                          <div className="bg-slate-950 border border-slate-850 px-3 py-1 rounded-full text-[9px] text-slate-400 font-bold">
                            {msg.text}
                          </div>
                        ) : (
                          <div className={`p-3 rounded-2xl max-w-[85%] space-y-1 ${msg.sender.includes("Amina") || msg.sender.includes("Spécialiste") ? "bg-emerald-900/60 border border-emerald-800 text-emerald-100" : "bg-slate-850 border border-slate-800 text-slate-100"}`}>
                            <p className="text-[9px] font-bold uppercase text-slate-400">{msg.sender}</p>
                            <p>{msg.text}</p>
                            <span className="block text-[8px] text-right text-slate-500">{msg.time}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Chat sender inputs */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Écrivez un message en temps réel..."
                      value={newMsgText}
                      onChange={(e) => setNewMsgText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      onClick={handleSendChatMessage}
                      className="h-10 w-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center transition shadow-lg"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* WHITEBOARD TAB CONTENT (With Canvas drawing for learning/orthophony exercises) */}
              {activeTab === "whiteboard" && (
                <div className="flex-1 flex flex-col space-y-3 min-h-0">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsEraser(false)}
                        className={`p-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1 ${!isEraser ? "bg-emerald-600 border-emerald-500 text-white" : "bg-slate-800 border-slate-700 text-slate-300"}`}
                      >
                        <PenTool className="h-3 w-3" /> Crayon
                      </button>
                      <button
                        onClick={() => setIsEraser(true)}
                        className={`p-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1 ${isEraser ? "bg-orange-600 border-orange-500 text-white" : "bg-slate-800 border-slate-700 text-slate-300"}`}
                      >
                        <Eraser className="h-3 w-3" /> Gomme
                      </button>
                    </div>

                    <button
                      onClick={clearWhiteboard}
                      className="px-2.5 py-1.5 text-[10px] font-bold bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white"
                    >
                      Tout effacer
                    </button>
                  </div>

                  {/* Canvas area */}
                  <div className="flex-1 bg-white rounded-2xl p-1 shadow-inner relative overflow-hidden min-h-[220px]">
                    <canvas
                      id="canvas-whiteboard"
                      ref={whiteboardCanvasRef}
                      className="w-full h-full bg-white cursor-crosshair rounded-xl border border-slate-200"
                      width={500}
                      height={300}
                      onMouseDown={startWhiteboardDrawing}
                      onMouseMove={drawWhiteboard}
                      onMouseUp={stopWhiteboardDrawing}
                      onMouseLeave={stopWhiteboardDrawing}
                      onTouchStart={startWhiteboardDrawing}
                      onTouchMove={drawWhiteboard}
                      onTouchEnd={stopWhiteboardDrawing}
                    />
                  </div>

                  {/* Color selectors & brush parameters */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-850">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Palette :</span>
                      {["#10b981", "#3b82f6", "#ef4444", "#f59e0b", "#8b5cf6", "#090d16"].map(col => (
                        <button
                          key={col}
                          onClick={() => {
                            setBrushColor(col);
                            setIsEraser(false);
                          }}
                          className={`h-5 w-5 rounded-full border-2 transition ${brushColor === col && !isEraser ? "border-white scale-125" : "border-transparent"}`}
                          style={{ backgroundColor: col }}
                        />
                      ))}
                    </div>

                    {/* Pre-designed clinical tracers to draw with */}
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Gabarit :</span>
                      {["b / d", "p / q", "M / N", "S / C"].map(pattern => (
                        <button
                          key={pattern}
                          onClick={() => {
                            clearWhiteboard();
                            drawTemplateLetter(pattern);
                          }}
                          className="px-2 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded text-[9px] font-bold text-slate-300"
                        >
                          {pattern}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* MATERIALS / SESSIONS DOSSIER CONTENT */}
              {activeTab === "materials" && (
                <div className="flex-1 space-y-4 text-xs">
                  <div className="p-4 bg-emerald-950/20 border border-emerald-800/40 rounded-2xl space-y-2">
                    <h3 className="font-bold text-emerald-400 flex items-center gap-1">
                      <Sparkles className="h-4 w-4 text-emerald-400 animate-spin" style={{ animationDuration: "12s" }} />
                      Fiche Patient & Diagnostics Importés
                    </h3>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      L'enfant {appointment?.childName} suit une rééducation active. Le Dr. Amina Bennani supervise ce protocole en continu.
                    </p>
                    <div className="pt-2 grid grid-cols-2 gap-2 font-mono text-[10px] text-slate-400">
                      <div>• Date de Naissance: {appointment?.childBirthdate || "12/04/2018"}</div>
                      <div>• Niveau Scolaire: {appointment?.childGrade || "Maternelle / Primaire"}</div>
                      <div>• Mode de séance: Vidéo Conférence</div>
                      <div>• Salle Physique: Non assignée</div>
                    </div>
                  </div>

                  <div className="bg-slate-950/40 border border-slate-850 rounded-2xl p-4 space-y-3">
                    <h4 className="font-bold text-slate-200">Recommandations AMTDA pour la Séance à Distance :</h4>
                    <ul className="list-disc pl-4 space-y-1.5 text-slate-400 text-[11px]">
                      <li>Assurez-vous que l'enfant est assis confortablement devant l'écran dans un endroit calme.</li>
                      <li>Vérifiez la luminosité ambiante pour réduire la fatigue oculaire.</li>
                      <li>Utilisez de préférence un casque audio pour éviter l'écho et isoler le bruit environnant.</li>
                      <li>Encouragez l'enfant à utiliser la palette tactile pour tracer sur le tableau blanc virtuel.</li>
                    </ul>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

        {/* BOTTOM CALL CONTROL PANEL (Mute, camera, end call) */}
        <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-3xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
          
          {/* Audio levels monitor */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">Volume Micro :</span>
            <div className="flex gap-0.5 items-end h-5 w-16">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(bar => {
                const height = bar * 3;
                const active = bar * 10 <= (micActive ? localAudioLevel : 0);
                return (
                  <div
                    key={bar}
                    className={`w-1.5 rounded-full transition-all duration-150 ${active ? "bg-emerald-500" : "bg-slate-800"}`}
                    style={{ height: `${height}px` }}
                  />
                );
              })}
            </div>
          </div>

          {/* Action keys */}
          <div className="flex items-center gap-2.5">
            {/* Toggle Mic */}
            <button
              onClick={() => setMicActive(prev => !prev)}
              className={`p-3.5 rounded-2xl border transition duration-150 flex items-center justify-center ${
                micActive 
                  ? "bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-750" 
                  : "bg-rose-950/80 border-rose-900 text-rose-500 hover:bg-rose-900"
              }`}
              title={micActive ? "Couper le micro" : "Activer le micro"}
            >
              {micActive ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </button>

            {/* Toggle Cam */}
            <button
              onClick={() => setVideoActive(prev => !prev)}
              className={`p-3.5 rounded-2xl border transition duration-150 flex items-center justify-center ${
                videoActive 
                  ? "bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-750" 
                  : "bg-rose-950/80 border-rose-900 text-rose-500 hover:bg-rose-900"
              }`}
              title={videoActive ? "Couper la caméra" : "Activer la caméra"}
            >
              {videoActive ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </button>

            {/* Share screen */}
            <button
              onClick={() => {
                setScreenShareActive(prev => !prev);
                alert(screenShareActive ? "Partage d'écran désactivé." : "Partage d'écran simulé : Les parents voient désormais vos supports de rééducation.");
              }}
              className={`p-3.5 rounded-2xl border transition duration-150 flex items-center justify-center ${
                screenShareActive 
                  ? "bg-emerald-950 border-emerald-800 text-emerald-400 hover:bg-emerald-900" 
                  : "bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-750"
              }`}
              title="Partager mon écran"
            >
              <MonitorUp className="h-5 w-5" />
            </button>

            {/* HANG UP BUTTON */}
            <button
              id="btn-hangup-session"
              onClick={handleSaveAndEndCall}
              className="px-6 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-2xl shadow-lg flex items-center gap-2 transition hover:scale-105 active:scale-95"
            >
              <PhoneOff className="h-5 w-5" />
              {role === "specialist" ? "Terminer & Enregistrer" : "Quitter la Séance"}
            </button>
          </div>

          <div className="text-[10px] font-mono text-slate-500 hidden md:inline">
            FHD 60FPS • WebRTC Peer Connection (DTLS/SRTP)
          </div>

        </div>

      </div>

      {/* RIGHT PANEL: SPECIALIST CLINICAL NOTEPAD (Side-by-side) - Visible only for specialists! */}
      {role === "specialist" && (
        <div className="w-full md:w-96 bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800 flex flex-col h-full overflow-hidden text-xs">
          
          <div className="p-5 border-b border-slate-800 bg-slate-950/40 flex items-center gap-2 shrink-0">
            <FileText className="h-4.5 w-4.5 text-emerald-400" />
            <div>
              <h2 className="font-bold text-slate-200">Observations Directes</h2>
              <p className="text-[10px] text-slate-500">Rédigez la fiche clinique en temps réel pendant l'appel.</p>
            </div>
          </div>

          {/* Form fields */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Motif Clinique</label>
              <input
                type="text"
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                placeholder="Motif de la consultation..."
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Diagnostic Sélectionné</label>
              <select
                value={diagnostic}
                onChange={(e) => setDiagnostic(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
              >
                <option value="Dyslexie">Dyslexie phonologique</option>
                <option value="Dysorthographie">Dysorthographie d'usage</option>
                <option value="Dyscalculie">Dyscalculie développementale</option>
                <option value="Dyspraxie">Dyspraxie visuo-spatiale</option>
                <option value="TDAH">TDAH (Trouble de l'attention)</option>
                <option value="Retard de langage">Retard simple du langage</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Observations Séance *</label>
              <textarea
                rows={4}
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                placeholder="Entrez vos remarques cliniques de séance..."
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Objectifs de Rééducation</label>
              <textarea
                rows={3}
                value={objectifs}
                onChange={(e) => setObjectifs(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                placeholder="Objectifs poursuivis..."
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Recommandations Parentales</label>
              <textarea
                rows={3}
                value={recommandations}
                onChange={(e) => setRecommandations(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                placeholder="Tâches et conseils à faire à la maison..."
              />
            </div>

            <div className="pt-2 bg-emerald-950/20 border border-emerald-900/40 p-3 rounded-xl flex items-start gap-2.5">
              <Info className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-emerald-300 leading-normal">
                En cliquant sur <strong>Terminer & Enregistrer</strong>, la fiche clinique de cette séance sera instantanément signée électroniquement, sauvegardée dans db.json, et partagée sur l'espace parent de suivi.
              </p>
            </div>

          </div>

          {/* Action trigger footer */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 shrink-0">
            <button
              id="btn-save-video-clinical-notes"
              onClick={handleSaveAndEndCall}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition shadow-lg"
            >
              <Check className="h-4 w-4" /> Enregistrer la Fiche Clinique
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
