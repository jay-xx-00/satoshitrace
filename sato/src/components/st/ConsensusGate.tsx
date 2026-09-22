import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ShieldAlert, CheckCircle2, Lock, Cpu, Network, Zap } from "lucide-react";

interface ConsensusGateProps {
  isolationScore?: number; // 0..1
  graphDensityScore?: number; // 0..1
  tacticScore?: number; // 0..1
  verdict?: "RED" | "ORANGE" | "YELLOW" | "GREEN";
  modelsAgreed?: number; // 0..3
  tacticName?: string;
  className?: string;
}

export function ConsensusGate({
  isolationScore = 0.92,
  graphDensityScore = 0.87,
  tacticScore = 0.95,
  verdict = "RED",
  modelsAgreed = 3,
  tacticName = "Peeling Chain (8 Hops)",
  className = "",
}: ConsensusGateProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gateRef = useRef<HTMLDivElement>(null);
  const bar1Ref = useRef<HTMLDivElement>(null);
  const bar2Ref = useRef<HTMLDivElement>(null);
  const bar3Ref = useRef<HTMLDivElement>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [dispScore1, setDispScore1] = useState(0);
  const [dispScore2, setDispScore2] = useState(0);
  const [dispScore3, setDispScore3] = useState(0);

  const TIER_COLORS = {
    RED: { color: "#FF3B3B", bg: "rgba(255, 59, 59, 0.12)", border: "#FF3B3B" },
    ORANGE: { color: "#FF9F1C", bg: "rgba(255, 159, 28, 0.12)", border: "#FF9F1C" },
    YELLOW: { color: "#FFD60A", bg: "rgba(255, 214, 10, 0.12)", border: "#FFD60A" },
    GREEN: { color: "#39FF88", bg: "rgba(57, 255, 136, 0.12)", border: "#39FF88" },
  }[verdict];

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setDispScore1(Math.round(isolationScore * 100));
      setDispScore2(Math.round(graphDensityScore * 100));
      setDispScore3(Math.round(tacticScore * 100));
      setIsLocked(true);
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Sweeping signal bars
      tl.fromTo(
        [bar1Ref.current, bar2Ref.current, bar3Ref.current],
        { width: "0%", opacity: 0.3 },
        {
          width: "100%",
          opacity: 1,
          duration: 0.45,
          stagger: 0.08,
          ease: "power2.out",
          onUpdate: function () {
            const prog = this.progress();
            setDispScore1(Math.round(prog * isolationScore * 100));
            setDispScore2(Math.round(prog * graphDensityScore * 100));
            setDispScore3(Math.round(prog * tacticScore * 100));
          },
        }
      );

      // Gate snap lock
      tl.to(gateRef.current, {
        scale: 1.06,
        borderColor: TIER_COLORS.border,
        duration: 0.1,
        ease: "power1.out",
        onComplete: () => setIsLocked(true),
      }).to(gateRef.current, {
        scale: 1.0,
        duration: 0.15,
        ease: "power2.inOut",
      });
    }, containerRef);

    return () => ctx.revert();
  }, [isolationScore, graphDensityScore, tacticScore, verdict]);

  return (
    <div
      ref={containerRef}
      className={`border border-[#1C232E] bg-[#0D1117] p-3.5 font-mono ${className}`}
    >
      <div className="flex items-center justify-between border-b border-[#1C232E] pb-2 text-[10.5px]">
        <span className="text-[#7D8590] tracking-wider uppercase flex items-center gap-1.5">
          <Cpu size={12} className="text-[#39FF88]" />
          Three-Model Consensus Engine
        </span>
        <span
          className="px-1.5 py-0.5 text-[9px] font-bold tracking-widest uppercase border"
          style={{
            borderColor: TIER_COLORS.border,
            color: TIER_COLORS.color,
            backgroundColor: TIER_COLORS.bg,
          }}
        >
          {verdict} // {modelsAgreed}/3 GATE LOCK
        </span>
      </div>

      {/* Converging Signal Bars */}
      <div className="mt-3 space-y-2 text-[11px]">
        {/* Model 1: Isolation Forest */}
        <div>
          <div className="flex items-center justify-between text-[#7D8590] text-[10px]">
            <span>[M1] ISOLATION FOREST ANOMALY</span>
            <span className="tabular-nums font-bold text-[#E6EDF3]">{dispScore1}%</span>
          </div>
          <div className="mt-1 h-1.5 w-full bg-[#161B22] overflow-hidden">
            <div
              ref={bar1Ref}
              className="h-full bg-[#39FF88] transition-all"
              style={{ width: `${dispScore1}%` }}
            />
          </div>
        </div>

        {/* Model 2: Subgraph Density */}
        <div>
          <div className="flex items-center justify-between text-[#7D8590] text-[10px]">
            <span>[M2] SUBGRAPH DENSITY (8.3σ)</span>
            <span className="tabular-nums font-bold text-[#E6EDF3]">{dispScore2}%</span>
          </div>
          <div className="mt-1 h-1.5 w-full bg-[#161B22] overflow-hidden">
            <div
              ref={bar2Ref}
              className="h-full bg-[#39FF88] transition-all"
              style={{ width: `${dispScore2}%` }}
            />
          </div>
        </div>

        {/* Model 3: Tactic Rule Match */}
        <div>
          <div className="flex items-center justify-between text-[#7D8590] text-[10px]">
            <span>[M3] TACTIC: {tacticName.toUpperCase()}</span>
            <span className="tabular-nums font-bold text-[#E6EDF3]">{dispScore3}%</span>
          </div>
          <div className="mt-1 h-1.5 w-full bg-[#161B22] overflow-hidden">
            <div
              ref={bar3Ref}
              className="h-full bg-[#FF3B3B] transition-all"
              style={{ width: `${dispScore3}%` }}
            />
          </div>
        </div>
      </div>

      {/* Central Consensus Locking Gate */}
      <div
        ref={gateRef}
        className="mt-3.5 flex items-center justify-between border border-[#1C232E] bg-[#0A0E14] px-3 py-2 text-[11px] transition-colors"
        style={{
          boxShadow: isLocked ? `inset 0 0 12px -4px ${TIER_COLORS.color}40` : "none",
        }}
      >
        <div className="flex items-center gap-2">
          <Lock
            size={12}
            style={{ color: isLocked ? TIER_COLORS.color : "#7D8590" }}
          />
          <span className="text-[#7D8590] text-[10px]">GATE STATUS:</span>
          <span
            className="font-bold tracking-wider text-[10.5px]"
            style={{ color: isLocked ? TIER_COLORS.color : "#E6EDF3" }}
          >
            {isLocked ? `CONSENSUS RESOLVED (${verdict})` : "SWEEPING SIGNALS..."}
          </span>
        </div>

        <div className="text-[10px] text-[#7D8590] tabular-nums">
          LATENCY: <strong className="text-[#39FF88]">0.8ms</strong>
        </div>
      </div>
    </div>
  );
}
