import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { Terminal, Lock, CheckCircle2, Shield, FastForward, Activity } from "lucide-react";

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
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [hexStream, setHexStream] = useState("0x7F4A9B... INITIALIZING");
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    // Generate streaming SHA-256 hex bits
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

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setProgress(100);
      setCurrentStage(5);
      return;
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
      "[2.100] SATO OS Forensic Engine operational. Handing control to command console.",
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
        if (logIndex === 10) setCurrentStage(5);
      } else {
        clearInterval(logInterval);
      }
    }, 220);

    // Smooth progress counter
    const startTime = performance.now();
    const duration = 2400;

    const animateProgress = (now: number) => {
      const elapsed = now - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);
      if (pct < 100) {
        requestAnimationFrame(animateProgress);
      }
    };

    const rafId = requestAnimationFrame(animateProgress);

    return () => {
      clearInterval(logInterval);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Keyboard shortcut: ESC or Space to skip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === " ") {
        onComplete();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      className="crt-boot-screen fixed inset-0 z-50 flex flex-col justify-between bg-[#0A0E14] p-6 text-[#E6EDF3] font-mono select-none"
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
            onClick={onComplete}
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
            {STAGES.map((s, idx) => {
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
                        className="text-[10px] font-bold px-1.5 py-0.5 border"
                        style={{
                          borderColor: isPassed ? "#39FF88" : "#1C232E",
                          color: isPassed ? "#39FF88" : "#7D8590",
                        }}
                      >
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
                <span className={log.includes("[PASS]") || log.includes("[MATCH]") ? "text-[#E6EDF3]" : "text-[#7D8590]"}>
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
          <span className="text-[#7D8590]">INITIALIZATION PROGRESS</span>
          <span className="text-[#39FF88] font-bold tabular-nums">{progress}%</span>
        </div>

        <div className="h-2 w-full bg-[#161B22] overflow-hidden border border-[#1C232E]">
          <div
            className="h-full bg-[#39FF88] transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-[10px] text-[#7D8590]">
            COMPLIANCE: INDIAN EVIDENCE ACT SEC 65B(2) • BNSS 2023 SEC 94
          </span>
          {progress >= 100 && (
            <button
              onClick={onComplete}
              className="px-4 py-1.5 bg-[#39FF88] text-[#0A0E14] font-bold text-xs hover:bg-[#32e67a] active:scale-95 transition-all shadow-md animate-pulse"
            >
              PROCEED TO COMMAND CONSOLE →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
