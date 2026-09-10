import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Play, Pause, RotateCcw, FastForward, Clock, ShieldAlert, ArrowRight, Activity } from "lucide-react";
import { AppShell } from "@/components/st/AppShell";
import { API_BASE } from "@/lib/api";

export const Route = createFileRoute("/timeline")({
  head: () => ({
    meta: [
      { title: "4D Fund Replay — SatoshiTrace" },
      { name: "description", content: "Temporal Bitcoin fund flow and peeling chain reconstruction player." },
      { property: "og:title", content: "4D Fund Replay — SatoshiTrace" },
    ],
  }),
  component: TimelinePage,
});

interface TimelineStep {
  step: number;
  time: string;
  event: string;
  amount: string;
  origin: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  txid?: string;
}

const DEFAULT_TIMELINE_STEPS: TimelineStep[] = [
  {
    step: 1,
    time: "10:32:15 IST",
    event: "Ransomware Vault Ingress: LockBit 3.0 affiliate creates seed wallet bc1q_lockbit_exploit_hub_99182",
    amount: "25.0000 BTC",
    origin: "Origin IP: 185.220.101.44 (Tor Exit Node, Frankfurt)",
    severity: "CRITICAL",
  },
  {
    step: 2,
    time: "10:32:28 IST",
    event: "Peeling Chain Hop #1: 2.0000 BTC peeled off to cashout mule; 22.9995 BTC forwarded to next hop",
    amount: "22.9995 BTC",
    origin: "Origin IP: 185.220.101.52 (Tor Relay)",
    severity: "HIGH",
  },
  {
    step: 3,
    time: "10:32:41 IST",
    event: "Peeling Chain Hop #2: Rapid burst transfer in 13 seconds across European VPS proxy",
    amount: "21.1590 BTC",
    origin: "Origin ASN: AS62005 (Mullvad VPN)",
    severity: "HIGH",
  },
  {
    step: 4,
    time: "10:33:02 IST",
    event: "CoinJoin Mixer Ingress: 8 equal-denomination 0.5000 BTC inputs joined into Wasabi Whirlpool",
    amount: "4.0000 BTC",
    origin: "Entropy fingerprint: 1.94 bits (Anonymity set = 8)",
    severity: "CRITICAL",
  },
  {
    step: 5,
    time: "10:33:45 IST",
    event: "Off-Ramp Liquidation Requisition: Terminating deposit hop detected into Indian exchange KYC vault",
    amount: "1.8400 BTC",
    origin: "Flagged for Section 91 CrPC Statutory Freeze Notice",
    severity: "CRITICAL",
  },
];

function TimelinePage() {
  const [steps, setSteps] = useState<TimelineStep[]>(DEFAULT_TIMELINE_STEPS);
  const [currentStep, setCurrentStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    // Attempt to load dynamic temporal snapshots from FastAPI backend
    fetch(`${API_BASE}/timeline/default?steps=5`)
      .then((res) => res.json())
      .then((data) => {
        if (data.snapshots && data.snapshots.length > 0) {
          const dynamicSteps: TimelineStep[] = data.snapshots.map((s: any, idx: number) => {
            const ev = s.recent_events?.[0];
            return {
              step: s.step,
              time: `${s.formatted_time} UTC`,
              event: ev ? `Temporal Slice #${s.step}: ${ev.tactic} observed on ${ev.txid}` : `Temporal Slice #${s.step}: ${s.tx_count} cumulative transactions verified`,
              amount: ev?.amount_btc ? `${parseFloat(ev.amount_btc).toFixed(4)} BTC` : `${(idx + 1) * 4.2} BTC`,
              origin: `Timestamp: ${s.timestamp} • Cumulative Volume: ${s.tx_count} TXs`,
              severity: idx === 0 || idx === data.snapshots.length - 1 ? "CRITICAL" : "HIGH",
              txid: ev?.txid,
            };
          });
          setSteps(dynamicSteps);
        }
      })
      .catch(() => {
        // Fallback gracefully to forensic template
      });
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
    <AppShell title="4D Fund Replay & Temporal Slicing" breadcrumb="HOME / TIMELINE REPLAY / PEELING CHAIN RECONSTRUCTION">
      <div className="h-full overflow-y-auto p-5 space-y-4">
        {/* Playback Controls Pill */}
        <div className="glass flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentStep(1)}
              className="rounded p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              title="Reset Timeline"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-2 rounded-md bg-signal px-4 py-2 text-xs font-bold text-signal-foreground shadow-md hover:bg-signal/90"
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              {isPlaying ? "Pause Replay" : "Play Reconstruction"}
            </button>
            <div className="h-4 w-px bg-border mx-1" />
            <span className="mono-xs text-muted-foreground">Speed:</span>
            {[1, 2, 5].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`mono-xs rounded px-2 py-1 font-bold ${
                  speed === s ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground">
            <Activity size={14} className="text-signal animate-pulse" />
            <span>Step {currentStep} of {steps.length}</span>
            <span className="rounded bg-panel-2 px-2 py-1 text-signal font-bold">
              {steps[currentStep - 1]?.time}
            </span>
          </div>
        </div>

        {/* Scrubber Progress Bar */}
        <div className="glass p-4 space-y-2">
          <div className="flex items-center justify-between mono-xs text-muted-foreground">
            <span>{steps[0]?.time} (Initial Ingress)</span>
            <span>{steps[steps.length - 1]?.time} (Off-Ramp Frozen)</span>
          </div>
          <div className="h-3 w-full rounded-full bg-background/80 overflow-hidden relative cursor-pointer">
            <div
              className="h-full rounded-full bg-signal transition-all duration-500 shadow-[0_0_12px_rgba(232,150,15,0.6)]"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Events Sequence */}
        <div className="grid grid-cols-5 gap-3">
          {steps.map((s) => {
            const isPassed = s.step <= currentStep;
            const isCurrent = s.step === currentStep;

            return (
              <div
                key={s.step}
                onClick={() => setCurrentStep(s.step)}
                className={`glass p-3.5 space-y-2 cursor-pointer transition-all ${
                  isCurrent
                    ? "ring-2 ring-signal bg-signal/10 shadow-lg scale-[1.02]"
                    : isPassed
                      ? "border-signal/40 opacity-90"
                      : "opacity-40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="mono-xs font-bold text-signal">HOP #{s.step}</span>
                  <span className="mono-xs text-[10px] text-muted-foreground">{s.time}</span>
                </div>
                <div className="font-mono text-xs font-bold text-critical">{s.amount}</div>
                <p className="text-[11px] leading-snug text-foreground line-clamp-3">{s.event}</p>
                <div className="mono-xs text-[9.5px] text-muted-foreground pt-1 border-t border-border/30 truncate">
                  {s.origin}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
