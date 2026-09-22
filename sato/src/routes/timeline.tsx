import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Play, Pause, RotateCcw, Activity, ArrowRight, ShieldAlert, Clock } from "lucide-react";
import { AppShell } from "@/components/st/AppShell";
import { API_BASE } from "@/lib/api";

export const Route = createFileRoute("/timeline")({
  head: () => ({
    meta: [
      { title: "4D Fund Flow Replay — SatoshiTrace" },
      {
        name: "description",
        content: "Temporal Bitcoin fund flow and peeling chain reconstruction player for Indian law enforcement.",
      },
    ],
  }),
  component: TimelinePage,
});

interface TimelineStep {
  step: number;
  elapsed: string;
  time: string;
  event: string;
  amount: string;
  source: string;
  target: string;
  origin: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  txid?: string;
}

const DEFAULT_TIMELINE_STEPS: TimelineStep[] = [
  {
    step: 1,
    elapsed: "T+00:00",
    time: "10:32:15 IST",
    event: "Ransomware Vault Ingress: LockBit 3.0 affiliate receives ransom deposit",
    amount: "25.0000 BTC",
    source: "External P2P / Victim",
    target: "bc1q_lockbit_exploit_hub_99182",
    origin: "Origin IP: 185.220.101.44 (Frankfurt Tor Exit Node)",
    severity: "CRITICAL",
  },
  {
    step: 2,
    elapsed: "T+00:13",
    time: "10:32:28 IST",
    event: "Peeling Chain Hop #1: 2.0 BTC peeled off to cashout mule; 22.9995 BTC forwarded",
    amount: "22.9995 BTC",
    source: "bc1q_lockbit_exploit_hub_99182",
    target: "tx_peel_fa1e // Mule-01",
    origin: "Origin IP: 185.220.101.52 (Tor Relay)",
    severity: "HIGH",
  },
  {
    step: 3,
    elapsed: "T+00:26",
    time: "10:32:41 IST",
    event: "Peeling Chain Hop #2: Rapid burst transfer in 13 seconds across European VPS proxy",
    amount: "21.1590 BTC",
    source: "tx_peel_fa1e",
    target: "tx_peel_7b29 // Mule-02",
    origin: "Origin ASN: AS62005 (Mullvad VPN)",
    severity: "HIGH",
  },
  {
    step: 4,
    elapsed: "T+00:47",
    time: "10:33:02 IST",
    event: "Wasabi CoinJoin Mixer Ingress: 8 equal-denomination 0.5000 BTC inputs joined",
    amount: "4.0000 BTC",
    source: "tx_peel_7b29",
    target: "Wasabi Whirlpool Nexus",
    origin: "Entropy fingerprint: 1.94 bits (Anonymity set = 8)",
    severity: "CRITICAL",
  },
  {
    step: 5,
    elapsed: "T+01:30",
    time: "10:33:45 IST",
    event: "Off-Ramp Liquidation Requisition: Terminating deposit hop detected into Indian exchange KYC vault",
    amount: "1.8400 BTC",
    source: "Wasabi Whirlpool Nexus",
    target: "WazirX KYC Ingress // bc1q_smu",
    origin: "Flagged for Section 91 CrPC Statutory Freeze Notice",
    severity: "CRITICAL",
  },
];

export function TimelinePage() {
  const [steps, setSteps] = useState<TimelineStep[]>(DEFAULT_TIMELINE_STEPS);
  const [currentStep, setCurrentStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    fetch(`${API_BASE}/timeline/default?steps=5`)
      .then((res) => res.json())
      .then((data) => {
        if (data.snapshots && data.snapshots.length > 0) {
          const dynamicSteps: TimelineStep[] = data.snapshots.map((s: any, idx: number) => {
            const ev = s.recent_events?.[0];
            return {
              step: s.step,
              elapsed: `T+00:${(idx * 15).toString().padStart(2, "0")}`,
              time: `${s.formatted_time} UTC`,
              event: ev
                ? `Temporal Slice #${s.step}: ${ev.tactic} observed on ${ev.txid}`
                : `Temporal Slice #${s.step}: ${s.tx_count} cumulative transactions verified`,
              amount: ev?.amount_btc ? `${parseFloat(ev.amount_btc).toFixed(4)} BTC` : `${(idx + 1) * 4.2} BTC`,
              source: `Hop #${s.step - 1 >= 0 ? s.step - 1 : "Origin"}`,
              target: `Hop #${s.step}`,
              origin: `Timestamp: ${s.timestamp} • Cumulative Volume: ${s.tx_count} TXs`,
              severity: idx === 0 || idx === data.snapshots.length - 1 ? "CRITICAL" : "HIGH",
              txid: ev?.txid,
            };
          });
          setSteps(dynamicSteps);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= steps.length) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2500 / speed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, speed, steps.length]);

  return (
    <AppShell title="4D Fund Flow Replay" breadcrumb="HQ / TEMPORAL ANALYSIS / PEELING CHAIN RECONSTRUCTION">
      <div className="h-full overflow-y-auto p-4 space-y-3 font-mono select-none">
        {/* Playback Controls & Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-[#1C232E] bg-[#0D1117] p-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentStep(1)}
              className="rounded border border-[#1C232E] bg-[#0A0E14] p-1.5 text-[#7D8590] hover:text-[#E6EDF3] transition-colors"
              title="Reset Timeline to Step 1"
            >
              <RotateCcw size={13} />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1.5 rounded border border-[#39FF88]/40 bg-[#39FF88]/15 px-3 py-1.5 text-xs font-bold text-[#39FF88] hover:bg-[#39FF88]/25 transition-all"
            >
              {isPlaying ? <Pause size={12} /> : <Play size={12} />}
              <span>{isPlaying ? "PAUSE" : "PLAY REPLAY"}</span>
            </button>

            <span className="h-4 w-px bg-[#1C232E] mx-1" />

            <span className="text-[10px] text-[#7D8590] uppercase tracking-wider">SPEED:</span>
            {[1, 2, 5].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`rounded px-2 py-0.5 text-[10px] font-mono transition-all ${
                  speed === s
                    ? "bg-[#39FF88]/20 text-[#39FF88] border border-[#39FF88]/40 font-bold"
                    : "text-[#7D8590] hover:text-[#E6EDF3] bg-[#0A0E14] border border-[#1C232E]"
                }`}
              >
                {s}X
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs text-[#7D8590]">
            <span className="flex items-center gap-1.5">
              <Activity size={12} className="text-[#39FF88] animate-pulse" />
              <span>HOP <span className="font-bold text-[#E6EDF3] tabular-nums">{currentStep}</span> / <span className="tabular-nums">{steps.length}</span></span>
            </span>
            <span className="text-[#1C232E]">|</span>
            <span className="text-[#39FF88] font-bold tabular-nums">
              {steps[currentStep - 1]?.elapsed}
            </span>
            <span className="text-[#1C232E]">|</span>
            <span className="rounded bg-[#0A0E14] px-2 py-0.5 text-[10px] text-[#E6EDF3] border border-[#1C232E]">
              {steps[currentStep - 1]?.time}
            </span>
          </div>
        </div>

        {/* Tactical Scrubber Range Bar */}
        <div className="rounded border border-[#1C232E] bg-[#0D1117] p-3 space-y-2">
          <div className="flex items-center justify-between text-[10px] text-[#7D8590]">
            <span>INITIAL INGRESS ({steps[0]?.time})</span>
            <span className="text-[#39FF88] font-bold">DRAGGABLE TIME SCRUBBER</span>
            <span>EXCHANGE OFF-RAMP ({steps[steps.length - 1]?.time})</span>
          </div>

          {/* Interactive Range Input Slider */}
          <div className="relative pt-1 pb-1">
            <input
              type="range"
              min={1}
              max={steps.length}
              step={1}
              value={currentStep}
              onChange={(e) => setCurrentStep(parseInt(e.target.value, 10))}
              className="w-full accent-[#39FF88] bg-[#0A0E14] cursor-pointer"
            />
          </div>

          {/* Step Tick Marks */}
          <div className="flex justify-between text-[9px] text-[#7D8590]">
            {steps.map((s) => (
              <button
                key={s.step}
                onClick={() => setCurrentStep(s.step)}
                className={`transition-colors ${
                  s.step === currentStep ? "text-[#39FF88] font-bold" : "hover:text-[#E6EDF3]"
                }`}
              >
                HOP #{s.step}
              </button>
            ))}
          </div>
        </div>

        {/* Step Events Sequence Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {steps.map((s) => {
            const isPassed = s.step <= currentStep;
            const isCurrent = s.step === currentStep;

            return (
              <div
                key={s.step}
                onClick={() => setCurrentStep(s.step)}
                className={`rounded border p-3 space-y-2 cursor-pointer transition-all ${
                  isCurrent
                    ? "border-[#39FF88] bg-[#0D1117] shadow-lg shadow-[#39FF88]/5 scale-[1.01]"
                    : isPassed
                      ? "border-[#1C232E] bg-[#0D1117] opacity-90 hover:border-[#39FF88]/40"
                      : "border-[#1C232E]/40 bg-[#0A0E14]/40 opacity-40 hover:opacity-70"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded px-1.5 py-0.2 text-[9px] font-bold ${
                      isCurrent
                        ? "bg-[#39FF88]/20 text-[#39FF88] border border-[#39FF88]/40"
                        : "bg-[#0A0E14] text-[#7D8590] border border-[#1C232E]"
                    }`}
                  >
                    HOP #{s.step} • {s.elapsed}
                  </span>
                  <span className="text-[9px] text-[#7D8590] tabular-nums">{s.time}</span>
                </div>

                <div className="font-mono text-sm font-bold text-[#FF3B3B] tabular-nums">
                  {s.amount}
                </div>

                <p className="text-[10px] leading-snug text-[#E6EDF3] line-clamp-3">
                  {s.event}
                </p>

                <div className="text-[9px] text-[#7D8590] pt-1.5 border-t border-[#1C232E] truncate">
                  {s.origin}
                </div>
              </div>
            );
          })}
        </div>

        {/* Step Detail Ledger */}
        <div className="rounded border border-[#1C232E] bg-[#0D1117] p-3.5 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-[#1C232E]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#E6EDF3]">
              ACTIVE REPLAY HOP TELEMETRY // HOP #{currentStep}
            </span>
            <span className="rounded bg-[#FF3B3B]/15 px-2 py-0.5 text-[9px] font-bold text-[#FF3B3B] border border-[#FF3B3B]/30">
              {steps[currentStep - 1]?.severity} THREAT
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
            <div className="space-y-1">
              <span className="text-[10px] text-[#7D8590]">SOURCE ENTITY:</span>
              <div className="font-mono text-[11px] text-[#E6EDF3] truncate bg-[#0A0E14] p-1.5 rounded border border-[#1C232E]">
                {steps[currentStep - 1]?.source}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-[#7D8590]">DESTINATION HOP:</span>
              <div className="font-mono text-[11px] text-[#39FF88] truncate bg-[#0A0E14] p-1.5 rounded border border-[#1C232E]">
                {steps[currentStep - 1]?.target}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-[#7D8590]">FLOW CONDUIT:</span>
              <div className="font-mono text-[11px] text-[#FF9F1C] truncate bg-[#0A0E14] p-1.5 rounded border border-[#1C232E]">
                {steps[currentStep - 1]?.origin}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
export default TimelinePage;
