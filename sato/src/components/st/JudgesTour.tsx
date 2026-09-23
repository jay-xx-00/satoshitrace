import { useState } from "react";
import { Award, ChevronLeft, ChevronRight, Sparkles, X } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

const TOUR_STEPS = [
  {
    title: "1. NetworkX Forensic Graph Canvas",
    badge: "CORE FORENSIC TOPOLOGY",
    desc: "Ingests 4,671 seized Bitcoin transactions and resolves multi-hop money laundering topologies (wallets, IP relays, TXIDs) at 60 FPS in 100% offline isolation.",
    route: "/",
    highlight: "Pulsing red suspect nodes, Louvain community grouping, and directional transfer flow.",
  },
  {
    title: "2. Three-Model Consensus AI Gate",
    badge: "FPR < 3.2% GATE",
    desc: "Eliminates false accusations through triple agreement: Isolation Forest outlier scoring, Subgraph density, and Peeling Chain heuristic filters.",
    route: "/alerts",
    highlight: "Converging model consensus bars with 500+ exchange whitelist filtering.",
  },
  {
    title: "3. Explainable AI (SHAP Feature Attributions)",
    badge: "JUDICIAL TRANSPARENCY",
    desc: "Every flagged suspect includes mathematical feature contribution percentages (+38% velocity burst, +30% Tor exit broadcast) rather than black-box guesses.",
    route: "/",
    highlight: "Slide-in SHAP Inspector drawer justifying every lead to court standards.",
  },
  {
    title: "4. Section 91 CrPC Statutory Exchange Notice Drafter",
    badge: "STATUTORY FREEZE REQUISITION",
    desc: "One-click generation of statutory freezing notices to compel compliance officers at WazirX, CoinDCX, and Binance to freeze suspect vaults within 24 hours.",
    route: "/investigation",
    highlight: "Auto-populated case numbers, suspect addresses, and formal legal citations.",
  },
  {
    title: "5. Section 65B(2) Evidence Act Certified PDF Dossier",
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
    highlight: "Interactive time scrubber with sequential hop telemetry.",
  },
];

export function JudgesTour({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("satoshitrace-tour-step");
      const idx = saved ? parseInt(saved, 10) : 0;
      return idx >= 0 && idx < TOUR_STEPS.length ? idx : 0;
    }
    return 0;
  });

  const step = TOUR_STEPS[currentStep] ?? TOUR_STEPS[0]!;

  const goToStep = (idx: number) => {
    if (idx < 0 || idx >= TOUR_STEPS.length) return;
    const targetStep = TOUR_STEPS[idx];
    setCurrentStep(idx);
    sessionStorage.setItem("satoshitrace-tour-active", "true");
    sessionStorage.setItem("satoshitrace-tour-step", String(idx));
    if (targetStep) {
      navigate({ to: targetStep.route as any });
      toast.info(`Demo Tour Step ${idx + 1} of ${TOUR_STEPS.length}: ${targetStep.title}`);
    }
  };

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      goToStep(currentStep + 1);
    } else {
      sessionStorage.removeItem("satoshitrace-tour-active");
      sessionStorage.removeItem("satoshitrace-tour-step");
      onClose();
      toast.success("2-Minute Forensic Demo Tour Complete!");
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  };

  const handleExit = () => {
    sessionStorage.removeItem("satoshitrace-tour-active");
    sessionStorage.removeItem("satoshitrace-tour-step");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-rise font-mono select-none">
      <div className="relative w-full max-w-lg rounded border border-[#1C232E] bg-[#0D1117] shadow-2xl p-5 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1C232E] pb-2.5">
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded border border-[#1C232E] bg-[#0A0E14] text-[#39FF88]">
              <Award size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#E6EDF3] flex items-center gap-2">
                <span>FORENSIC OPERATIONAL WALKTHROUGH</span>
                <span className="rounded bg-[#39FF88]/15 px-1.5 py-0.2 text-[9px] text-[#39FF88] border border-[#39FF88]/30">
                  STEP {currentStep + 1} / {TOUR_STEPS.length}
                </span>
              </h3>
              <p className="text-[9.5px] text-[#7D8590]">Automated 2-Minute High-Impact Briefing</p>
            </div>
          </div>
          <button onClick={handleExit} className="rounded p-1 text-[#7D8590] hover:text-[#E6EDF3]">
            <X size={15} />
          </button>
        </div>

        {/* Step Content */}
        <div className="rounded border border-[#1C232E] bg-[#0A0E14] p-3 space-y-2">
          <div className="flex items-center justify-between text-[9px]">
            <span className="rounded bg-[#39FF88]/15 px-1.5 py-0.2 text-[#39FF88] font-bold border border-[#39FF88]/30">
              {step.badge}
            </span>
            <span className="text-[#7D8590]">ROUTE: {step.route}</span>
          </div>

          <h4 className="text-xs font-bold text-[#E6EDF3]">{step.title}</h4>
          <p className="text-[11px] leading-relaxed text-[#7D8590]">{step.desc}</p>

          <div className="rounded bg-[#0D1117] p-2 border border-[#1C232E] text-[10px] text-[#39FF88] flex items-center gap-2">
            <Sparkles size={12} className="shrink-0 animate-pulse text-[#39FF88]" />
            <span><strong>DEMO HIGHLIGHT:</strong> {step.highlight}</span>
          </div>
        </div>

        {/* Actions & Step Indicator */}
        <div className="flex items-center justify-between pt-1">
          {/* Clickable Progress Dots */}
          <div className="flex items-center gap-1.5">
            {TOUR_STEPS.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goToStep(i)}
                title={`Jump to Step ${i + 1}: ${s.title}`}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  i === currentStep
                    ? "w-6 bg-[#39FF88] shadow-[0_0_8px_#39FF88]"
                    : i < currentStep
                      ? "w-3 bg-[#39FF88]/40 hover:bg-[#39FF88]"
                      : "w-3 bg-[#1C232E] hover:bg-[#7D8590]"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={handleExit}
              className="rounded px-2 py-1 text-[10px] text-[#7D8590] hover:text-[#E6EDF3]"
            >
              EXIT
            </button>
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center gap-1 rounded border border-[#1C232E] bg-[#0A0E14] px-2.5 py-1 text-[10.5px] font-bold text-[#7D8590] hover:text-[#E6EDF3] hover:border-[#39FF88]/40 active:scale-95 transition-all"
              >
                <ChevronLeft size={13} />
                <span>PREV</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1 rounded bg-[#39FF88]/20 border border-[#39FF88]/40 px-3 py-1 text-[10.5px] font-bold text-[#39FF88] hover:bg-[#39FF88]/30 active:scale-95 transition-all"
            >
              <span>{currentStep === TOUR_STEPS.length - 1 ? "COMPLETE" : "NEXT STEP"}</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default JudgesTour;
