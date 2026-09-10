import { useState } from "react";
import { Award, CheckCircle2, ChevronRight, Sparkles, X, Play, FileText, ShieldAlert, Cpu, Globe2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { getPdfReportUrl } from "@/lib/api";

const TOUR_STEPS = [
  {
    title: "1. Holographic NetworkX Forensic Canvas",
    badge: "CORE FORENSIC ENGINE",
    desc: "Ingests 4,671 seized Bitcoin transactions and resolves multi-hop money laundering topologies (wallets, IP relays, TXIDs) at 60 FPS offline.",
    route: "/",
    highlight: "Pulsing red suspect nodes with Louvain community grouping.",
  },
  {
    title: "2. Three-Model Consensus AI (Isolation Forest + Graph + Rules)",
    badge: "FPR < 3.2% DEFENSE",
    desc: "Eliminates false accusations through triple agreement: Isolation Forest outlier scoring, subgraph density, and Peeling Chain heuristic filters.",
    route: "/alerts",
    highlight: "Consensus agreement bars with 500+ exchange whitelist filtering.",
  },
  {
    title: "3. Explainable AI (SHAP Feature Attributions)",
    badge: "JUDICIAL TRANSPARENCY",
    desc: "Every flagged suspect includes mathematical feature contribution percentages (+38% velocity burst, +30% Tor exit broadcast) rather than black-box guesses.",
    route: "/",
    highlight: "Slide-in SHAP Inspector drawer justifying every lead.",
  },
  {
    title: "4. Section 91 CrPC Statutory Exchange Notice Drafter",
    badge: "INSTANT LEGAL REQUISITION",
    desc: "One-click generation of statutory freezing notices to compel compliance officers at WazirX, CoinDCX, and Binance to freeze suspect vaults within 24 hours.",
    route: "/investigation",
    highlight: "Auto-populated case numbers, suspect addresses, and legal citations.",
  },
  {
    title: "5. Section 65B(2) Indian Evidence Act Certified PDF Dossier",
    badge: "COURT ADMISSIBILITY",
    desc: "Automated electronic evidence dossier compiler with cryptographic SHA-256 chain of custody hashes, OS timestamps, and judicial certification.",
    route: "/reports",
    highlight: "Downloadable court-ready PDF matching forensic admissibility standards.",
  },
  {
    title: "6. 4D Temporal Fund Replay Player",
    badge: "TEMPORAL RECONSTRUCTION",
    desc: "Scrub backwards and forwards through time to observe peeling chain fund dissipation, mixer ingress, and cashout structuring in real-time.",
    route: "/timeline",
    highlight: "Step-by-step temporal slicing player.",
  },
];

export function JudgesTour({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const step = TOUR_STEPS[currentStep] ?? TOUR_STEPS[0]!;

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      const nextIdx = currentStep + 1;
      const nextStep = TOUR_STEPS[nextIdx];
      setCurrentStep(nextIdx);
      if (nextStep) {
        navigate({ to: nextStep.route as any });
        toast.info(`Demo Tour Step ${nextIdx + 1} of ${TOUR_STEPS.length}: ${nextStep.title}`);
      }
    } else {
      onClose();
      toast.success("🏆 2-Minute Winning Demo Tour Complete!");
    }
  };

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in font-mono">
      <div className="relative w-full max-w-xl rounded-xl border border-signal/60 bg-panel/95 shadow-[0_0_50px_rgba(245,158,11,0.3)] p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-signal/20 text-signal border border-signal/40">
              <Award size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <span>SIH 2026 JUDGES WINNING TOUR</span>
                <span className="rounded bg-signal/20 px-1.5 py-0.5 text-[9.5px] text-signal font-bold">
                  STEP {currentStep + 1} / {TOUR_STEPS.length}
                </span>
              </h3>
              <p className="text-[10px] text-muted-foreground">Automated 2-Minute High-Impact Presentation Walkthrough</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded p-1 text-muted-foreground hover:text-foreground">
            <X size={16} />
          </button>
        </div>

        {/* Step Content */}
        <div className="rounded-lg border border-border/60 bg-background/50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="mono-xs rounded bg-signal/15 px-2 py-0.5 text-signal font-bold border border-signal/30">
              {step.badge}
            </span>
            <span className="mono-xs text-muted-foreground">Route: {step.route}</span>
          </div>

          <h4 className="text-base font-bold text-foreground">{step.title}</h4>
          <p className="text-xs leading-relaxed text-muted-foreground">{step.desc}</p>

          <div className="rounded bg-panel-2/60 p-2.5 border border-border/40 text-[11px] text-signal flex items-center gap-2">
            <Sparkles size={14} className="shrink-0 animate-pulse" />
            <span><strong>Judge Demo Highlight:</strong> {step.highlight}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-1.5">
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-6 rounded-full transition-all ${
                  i === currentStep ? "bg-signal shadow-[0_0_8px_rgba(245,158,11,0.8)]" : i < currentStep ? "bg-emerald-400" : "bg-muted"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              Exit Tour
            </button>
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 rounded-md bg-signal px-4 py-1.5 text-xs font-bold text-signal-foreground hover:bg-signal/90 shadow-md active:scale-95 transition-all"
            >
              <span>{currentStep === TOUR_STEPS.length - 1 ? "Complete Tour" : "Next Demo Step"}</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
