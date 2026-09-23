import { useEffect, useState, useRef, useCallback } from "react";
import gsap from "gsap";
import { Terminal, Shield, FastForward, CheckCircle2, ArrowRight } from "lucide-react";

interface SatoBootProps {
  onComplete: () => void;
}

const STAGES = [
  { id: 1, label: "AIR-GAP ENCLAVE ISOLATION & KERNEL SELF-TEST", status: "VERIFIED", latency: "0.4ms" },
  { id: 2, label: "SEIZED TRANSACTION METADATA (14 FIELDS / 4,671 TXs)", status: "PARSED", latency: "1.2ms" },
  { id: 3, label: "THREE-MODEL CONSENSUS GATE (ISOFOREST + GRAPH DENSITY)", status: "INITIALIZED", latency: "2.8ms" },
  { id: 4, label: "500+ EXCHANGE HOT-WALLET WHITELIST (<3.2% FPR)", status: "MOUNTED", latency: "0.6ms" },
  { id: 5, label: "SECTION 65B(2) INDIAN EVIDENCE ACT SHA-256 SEAL", status: "LOCKED", latency: "0.3ms" },
];

export function SatoBootSequence({ onComplete }: SatoBootProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isExitingRef = useRef(false);
  const autoLoginTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [hexStream, setHexStream] = useState("0x7F4A9B... INITIALIZING");
  const [logs, setLogs] = useState<string[]>([]);
  const [isAutoLoggingIn, setIsAutoLoggingIn] = useState(false);

  const handleExit = useCallback(() => {
    if (isExitingRef.current) return;
    isExitingRef.current = true;
    if (autoLoginTimerRef.current) clearTimeout(autoLoginTimerRef.current);

    if (containerRef.current) {
      gsap.to(containerRef.current, {
        opacity: 0,
        scale: 0.985,
        duration: 0.4,
        ease: "power2.inOut",
        onComplete: () => {
          onComplete();
        },
      });
    } else {
      onComplete();
    }
  }, [onComplete]);

  // GSAP Entrance animation on mount
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, scale: 1.01 },
        { opacity: 1, scale: 1, duration: 0.35, ease: "power2.out" }
      );
    }
  }, []);

  // Live Hex stream generator
  useEffect(() => {
    const hexChars = "0123456789ABCDEF";
    const interval = setInterval(() => {
      let str = "";
      for (let i = 0; i < 64; i++) {
        str += hexChars[Math.floor(Math.random() * hexChars.length)];
      }
      setHexStream(str);
    }, 60);

    return () => clearInterval(interval);
  }, []);

  // Diagnostic boot sequence and staged log messages
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setProgress(100);
      setCurrentStage(5);
      setIsAutoLoggingIn(true);
      const timer = setTimeout(() => handleExit(), 300);
      return () => clearTimeout(timer);
    }

    const logMessages = [
      "[0.002] Booting SatoshiTrace Kernel v4.2.0 (x86_64-linux-gnu / win64 air-gap)",
      "[0.045] Verifying zero external sockets: 127.0.0.1 bound, WAN unreachable [PASS]",
      "[0.120] Ingesting test dataset: 4,671 raw transaction hashes parsed in 1.2ms",
      "[0.340] Computing Section 65B(2) SHA-256 integrity digest: C78921DF8839... [MATCH]",
      "[0.650] Loading Isolation Forest anomaly scoring matrix (6 behavioral features)",
      "[0.890] Executing Louvain community detection on bipartite transaction graph",
      "[1.120] Partitioning 7 criminal syndicate clusters (Cluster #4 BlackRiver isolated)",
      "[1.450] Pre-filtering 500+ Indian & global exchange hot wallets (CoinDCX, WazirX, Binance)",
      "[1.780] Consensus Gate locked: 4 critical threat leads prioritized (<3.2% FPR validated)",
      "[2.100] SATO OS Forensic Engine operational. Examiner credentials authenticated.",
      "[2.240] Access Token locked: EXAMINER #8412 [CBI / ED FORENSICS] — LEVEL 1 CLEARANCE",
      "[2.380] Auto-login authenticated. Launching SatoshiTrace Command Console...",
    ];

    let logIndex = 0;
    const logInterval = setInterval(() => {
      if (logIndex < logMessages.length) {
        const nextLog = logMessages[logIndex];
        setLogs((prev) => [...prev, nextLog]);
        logIndex++;

        // Stagger stage advancement
        if (logIndex === 2) setCurrentStage(1);
        if (logIndex === 4) setCurrentStage(2);
        if (logIndex === 6) setCurrentStage(3);
        if (logIndex === 8) setCurrentStage(4);
        if (logIndex >= 10) setCurrentStage(5);
      } else {
        clearInterval(logInterval);
      }
    }, 180);

    // Smooth progress counter (approx 2.2 seconds total boot time)
    const startTime = performance.now();
    const duration = 2200;

    let hasFinished = false;
    const animateProgress = (now: number) => {
      const elapsed = now - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);
      if (pct < 100) {
        requestAnimationFrame(animateProgress);
      } else if (!hasFinished) {
        hasFinished = true;
        setCurrentStage(5);
        setIsAutoLoggingIn(true);
        // AUTO-LOGIN: Automatically transition to command console after 750ms
        autoLoginTimerRef.current = setTimeout(() => {
          handleExit();
        }, 750);
      }
    };

    const rafId = requestAnimationFrame(animateProgress);

    return () => {
      clearInterval(logInterval);
      cancelAnimationFrame(rafId);
      if (autoLoginTimerRef.current) clearTimeout(autoLoginTimerRef.current);
    };
  }, [handleExit]);

  // Keyboard shortcut: ESC, Enter, or Space to skip/enter immediately
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleExit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleExit]);

  return (
    <div
      ref={containerRef}
      className="crt-boot-screen fixed inset-0 z-[9999] w-screen h-screen flex flex-col justify-between bg-[#0A0E14] p-6 text-[#E6EDF3] font-mono select-none"
    >
      {/* Top Telemetry Header */}
      <div className="flex items-center justify-between border-b border-[#1C232E] pb-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="flex h-2.5 w-2.5 items-center justify-center">
            <span className="h-2 w-2 rounded-full bg-[#39FF88] animate-pulse" />
          </span>
          <span className="font-bold tracking-wider text-[#39FF88]">
            SATO OS // FORENSIC KERNEL BOOT SEQUENCE
          </span>
          <span className="text-[#7D8590]">|</span>
          <span className="text-[#7D8590]">AIR-GAP CLUSTER 127.0.0.1</span>
        </div>

        <div className="flex items-center gap-4 text-[#7D8590] text-[11px]">
          <span>CMOS TIMESTAMP: {new Date().toISOString()}</span>
          <button
            onClick={handleExit}
            className="flex items-center gap-1.5 border border-[#1C232E] bg-[#161B22] px-2.5 py-1 text-[#39FF88] hover:bg-[#1C232E] active:scale-95 transition-all text-[10.5px]"
          >
            <FastForward size={12} />
            <span>[ESC] SKIP BOOT</span>
          </button>
        </div>
      </div>

      {/* Main Staged Checks & Hex Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-auto max-w-6xl w-full mx-auto">
        {/* Left Column: Staged Hardware / Algorithm Tests */}
        <div className="border border-[#1C232E] bg-[#0D1117] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1C232E] pb-2 text-xs">
            <span className="font-bold text-[#E6EDF3] flex items-center gap-2">
              <Shield size={14} className="text-[#39FF88]" />
              SYSTEM DIAGNOSTIC SUBSYSTEMS
            </span>
            <span className="text-[#7D8590] tabular-nums">{currentStage} / 5 COMPLETE</span>
          </div>

          <div className="space-y-3">
            {STAGES.map((s) => {
              const isPassed = currentStage >= s.id;
              const isCurrent = currentStage === s.id - 1;

              return (
                <div
                  key={s.id}
                  className={`border px-3 py-2.5 text-[11.5px] transition-colors ${
                    isPassed
                      ? "border-[#1C232E] bg-[#0A0E14] text-[#E6EDF3]"
                      : isCurrent
                        ? "border-[#39FF88]/40 bg-[#161B22] text-[#39FF88]"
                        : "border-[#1C232E]/40 opacity-40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] text-[#7D8590]">0{s.id}</span>
                      <span className="truncate font-semibold">{s.label}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] text-[#7D8590] tabular-nums">{s.latency}</span>
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 border flex items-center gap-1"
                        style={{
                          borderColor: isPassed ? "#39FF88" : "#1C232E",
                          color: isPassed ? "#39FF88" : "#7D8590",
                        }}
                      >
                        {isPassed && <CheckCircle2 size={10} />}
                        {isPassed ? s.status : "TESTING"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Monospace Log Terminal */}
        <div className="border border-[#1C232E] bg-[#0D1117] p-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between border-b border-[#1C232E] pb-2 text-xs">
            <span className="font-bold text-[#E6EDF3] flex items-center gap-2">
              <Terminal size={14} className="text-[#39FF88]" />
              SECURE LOG STREAM // SATO-DIAG
            </span>
            <span className="text-[10.5px] text-[#39FF88]">● RECORDING</span>
          </div>

          <div className="h-64 overflow-y-auto space-y-1.5 text-[11px] pr-2 text-[#7D8590]">
            {logs.map((log, idx) => (
              <div key={idx} className="leading-relaxed">
                <span className="text-[#39FF88]">&gt; </span>
                <span className={log.includes("[PASS]") || log.includes("[MATCH]") || log.includes("AUTHENTICATED") || log.includes("EXAMINER") ? "text-[#E6EDF3]" : "text-[#7D8590]"}>
                  {log}
                </span>
              </div>
            ))}
          </div>

          {/* Live SHA-256 Hash Display */}
          <div className="border-t border-[#1C232E] pt-2.5">
            <div className="text-[9.5px] text-[#7D8590] mb-1">CRYPTO DIGEST (SHA-256 LIVE HASH):</div>
            <div className="truncate text-[10.5px] text-[#39FF88] font-bold bg-[#0A0E14] p-1.5 border border-[#1C232E]">
              {hexStream}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Progress Bar & Launch Bar */}
      <div className="border-t border-[#1C232E] pt-3 max-w-6xl w-full mx-auto">
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[#7D8590]">INITIALIZATION PROGRESS</span>
            {isAutoLoggingIn && (
              <span className="text-[#39FF88] text-[11px] font-bold flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#39FF88] animate-ping" />
                <span>EXAMINER #8412 AUTHENTICATED // AUTO-CONNECTING...</span>
              </span>
            )}
          </div>
          <span className="text-[#39FF88] font-bold tabular-nums">{progress}%</span>
        </div>

        <div className="h-2 w-full bg-[#161B22] overflow-hidden border border-[#1C232E]">
          <div
            className="h-full bg-[#39FF88] transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
          <span className="text-[10px] text-[#7D8590]">
            COMPLIANCE: INDIAN EVIDENCE ACT SEC 65B(2) • BNSS 2023 SEC 94
          </span>
          {progress >= 100 && (
            <button
              onClick={handleExit}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#39FF88] text-[#0A0E14] font-bold text-xs hover:bg-[#32e67a] active:scale-95 transition-all shadow-md animate-pulse cursor-pointer"
            >
              <span>ENTER COMMAND CONSOLE NOW</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
