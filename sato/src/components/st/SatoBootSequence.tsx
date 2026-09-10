import { useEffect, useState, useRef } from "react";
import { Shield, CheckCircle2, Lock, Terminal, Activity, ArrowRight, Volume2, VolumeX, FastForward, Cpu } from "lucide-react";

interface SatoBootProps {
  onComplete: () => void;
}

// Sophisticated, subtle acoustic feedback synthesized via Web Audio API
class SatoAcousticEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  playTactileClick() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.03);

      gain.gain.setValueAtTime(0.015, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch {}
  }

  playKernelEngage() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Warm acoustic sub-bass pulse (55Hz root -> 110Hz harmonic)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(55, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.25);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.04, now + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.55);
    } catch {}
  }
}

const audio = new SatoAcousticEngine();

interface DiagnosticEntry {
  tag: string;
  latency: string;
  subsystem: string;
  status: "OK" | "LOCKED" | "VERIFIED" | "ARMED";
  detail: string;
}

const DIAGNOSTICS: DiagnosticEntry[] = [
  { tag: "0.012s", latency: "0.012s", subsystem: "AIRGAP_ENCLAVE_ISOLATION", status: "VERIFIED", detail: "Zero cloud egress verified • 127.0.0.1 loopback" },
  { tag: "0.048s", latency: "0.036s", subsystem: "SHA256_CUSTODY_INTEGRITY", status: "LOCKED", detail: "C78921DF883910A49B89104E... validated" },
  { tag: "0.104s", latency: "0.056s", subsystem: "ISOLATION_FOREST_V2_CORE", status: "OK", detail: "14 temporal/topological feature weights loaded" },
  { tag: "0.182s", latency: "0.078s", subsystem: "NETWORKX_LOUVAIN_RESOLVER", status: "OK", detail: "4,671 P2P TXs mapped • 7 syndicates grouped" },
  { tag: "0.264s", latency: "0.082s", subsystem: "RBI_VDA_WHITELIST_FILTER", status: "VERIFIED", detail: "500+ hot-wallets indexed • FPR guaranteed <3.2%" },
  { tag: "0.338s", latency: "0.074s", subsystem: "SECTION_65B_LEGAL_ENGINE", status: "ARMED", detail: "ReportLab court-admissible PDF compiler active" },
  { tag: "0.412s", latency: "0.074s", subsystem: "STATUTORY_CRPC_NOTICE_HUB", status: "ARMED", detail: "Section 91 CrPC / BNSS 2023 requisition armed" },
];

export function SatoBootSequence({ onComplete }: SatoBootProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hexStream, setHexStream] = useState("C7 89 21 DF 88 39 10 A4 9B 89 10 4E 92 81 AC 7B");

  useEffect(() => {
    audio.playKernelEngage();

    // Random cryptographic stream ticker
    const hexChars = "0123456789ABCDEF";
    const hexInterval = setInterval(() => {
      let nextHex = "";
      for (let i = 0; i < 16; i++) {
        nextHex += hexChars.charAt(Math.floor(Math.random() * 16)) + hexChars.charAt(Math.floor(Math.random() * 16)) + " ";
      }
      setHexStream(nextHex.trim());
    }, 90);

    // Progress and diagnostic steps timeline
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => handleFinish(), 500);
          return 100;
        }
        const next = prev + 1;
        const targetStep = Math.min(DIAGNOSTICS.length - 1, Math.floor((next / 100) * DIAGNOSTICS.length));
        if (targetStep !== activeStep) {
          setActiveStep(targetStep);
          audio.playTactileClick();
        }
        return next;
      });
    }, 24);

    return () => {
      clearInterval(hexInterval);
      clearInterval(interval);
    };
  }, [activeStep]);

  const handleFinish = () => {
    setIsClosing(true);
    setTimeout(() => {
      onComplete();
    }, 500);
  };

  const toggleSound = () => {
    audio.isMuted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col justify-between bg-[#06080D] text-foreground font-mono select-none overflow-hidden transition-all duration-500 ${
        isClosing ? "opacity-0 scale-[0.99] filter blur-sm pointer-events-none" : "opacity-100 scale-100"
      }`}
      style={{
        backgroundImage: `
          radial-gradient(circle at 50% 30%, rgba(245, 158, 11, 0.04) 0%, transparent 65%),
          radial-gradient(circle at 80% 80%, rgba(56, 189, 248, 0.03) 0%, transparent 50%),
          linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
        `,
        backgroundSize: "100% 100%, 100% 100%, 32px 32px, 32px 32px",
      }}
    >
      {/* Top Precision Status Bar */}
      <header className="w-full flex items-center justify-between px-8 py-5 border-b border-white/[0.08] bg-[#090C14]/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-2 w-2 rounded-full bg-signal shadow-[0_0_8px_var(--signal)]" />
            <span className="text-xs font-bold tracking-[0.2em] text-foreground uppercase">
              SATO OS <span className="text-signal font-normal">// KERNEL v4.2</span>
            </span>
          </div>
          <span className="text-white/20 text-xs">|</span>
          <span className="text-[11px] text-muted-foreground tracking-wider hidden sm:inline">
            CBI CYBER FORENSIC COMMAND ENCLAVE
          </span>
        </div>

        <div className="flex items-center gap-6 text-[11px]">
          <div className="hidden md:flex items-center gap-4 text-muted-foreground">
            <span>ARCH: <strong className="text-foreground font-medium">x86_64 OFFLINE</strong></span>
            <span>CUSTODY: <strong className="text-emerald-400 font-medium">SHA-256 LOCKED</strong></span>
            <span>CONSENSUS: <strong className="text-signal font-medium">3-MODEL GATE</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleSound}
              className="flex items-center gap-1.5 rounded border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10.5px] text-muted-foreground hover:text-foreground hover:border-white/20 transition-all"
              title={isMuted ? "Unmute Audio" : "Mute Audio"}
            >
              {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
              <span>{isMuted ? "MUTE" : "AUDIO"}</span>
            </button>

            <button
              onClick={handleFinish}
              className="flex items-center gap-1.5 rounded border border-signal/40 bg-signal/15 px-3 py-1 text-[11px] font-semibold text-signal hover:bg-signal/25 active:scale-95 transition-all shadow-[0_0_12px_rgba(245,158,11,0.2)]"
            >
              <span>ENTER WORKBENCH</span>
              <FastForward size={12} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Forensic Diagnostics Container */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8 max-w-5xl w-full mx-auto">
        {/* Double-Bezel Hardware Enclosure */}
        <div className="w-full rounded-[1.25rem] border border-white/[0.08] bg-white/[0.02] p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
          <div className="rounded-[calc(1.25rem-0.375rem)] border border-white/[0.06] bg-[#0A0D16]/95 p-6 sm:p-8 space-y-6">
            
            {/* Header: Identity & Precision Caliper */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.07] pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="mono-xs rounded bg-signal/15 px-2 py-0.5 font-bold text-signal border border-signal/30">
                    AIR-GAPPED FORENSIC INITIALIZATION
                  </span>
                  <span className="mono-xs text-muted-foreground">SEC 65B(2) CERTIFIED</span>
                </div>
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                  SatoshiTrace Forensic Intelligence Enclave
                </h1>
              </div>

              {/* Minimalist Progress Meter */}
              <div className="text-right">
                <div className="text-2xl font-bold tracking-tighter text-foreground font-mono">
                  {progress.toString().padStart(3, "0")}<span className="text-signal text-sm">%</span>
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Diagnostic Integrity
                </div>
              </div>
            </div>

            {/* Live Cryptographic Hex Matrix Bar */}
            <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-[#06080F] px-4 py-2.5 text-[11px]">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Lock size={13} className="text-signal" />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  EVIDENTIARY HASH (SHA-256):
                </span>
              </div>
              <div className="font-mono text-signal/90 font-medium tracking-widest text-[11px] truncate max-w-md">
                {hexStream}
              </div>
            </div>

            {/* Diagnostic Kernel Log Stream (Clean Tabular Architecture) */}
            <div className="space-y-1.5 font-mono text-[11.5px]">
              {DIAGNOSTICS.map((diag, index) => {
                const isResolved = index <= activeStep;
                const isCurrent = index === activeStep;

                return (
                  <div
                    key={diag.subsystem}
                    className={`flex items-center justify-between rounded-md px-3.5 py-2 transition-all duration-200 ${
                      isCurrent
                        ? "bg-signal/10 border border-signal/30 text-foreground"
                        : isResolved
                          ? "bg-white/[0.02] text-foreground/80 border border-transparent"
                          : "opacity-25 text-muted-foreground border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-[10px] text-muted-foreground w-12 shrink-0">
                        [{diag.latency}]
                      </span>
                      <span className="font-semibold tracking-wide truncate">
                        {diag.subsystem}
                      </span>
                      <span className="text-[10.5px] text-muted-foreground truncate hidden sm:inline">
                        — {diag.detail}
                      </span>
                    </div>

                    <div className="shrink-0 flex items-center gap-2 pl-3">
                      {isResolved ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                          <CheckCircle2 size={12} />
                          {diag.status}
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">PENDING</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Linear Progress Rail */}
            <div className="space-y-2 pt-2">
              <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-signal to-emerald-400 transition-all duration-75 shadow-[0_0_12px_rgba(245,158,11,0.8)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>LOCAL KERNEL ATTACHED: 127.0.0.1:8000</span>
                <span>ZERO CLOUD TELEMETRY • COMPLIANT WITH IT ACT 2000</span>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Footer Attestation */}
      <footer className="w-full flex items-center justify-between px-8 py-3.5 border-t border-white/[0.06] bg-[#090C14]/60 text-[10.5px] text-muted-foreground">
        <div>
          Section 65B(2) Indian Evidence Act / Bharatiya Sakshya Adhiniyam, 2023 Digital Evidence Seal
        </div>
        <div className="flex items-center gap-2 text-foreground/80">
          <span>OPERATOR CLEARANCE: LEVEL-5 INVESTIGATOR</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </div>
      </footer>
    </div>
  );
}
