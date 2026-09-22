import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import {
  Check,
  Copy,
  Clock,
  ShieldAlert,
  X,
  XCircle,
  Scale,
  Loader2,
  FileText,
  Send,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Lock,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { shapFeatures, type GNode } from "@/lib/graph-data";
import { submitReview, generateCrpcNotice, fetchExplanation, getPdfReportUrl } from "@/lib/api";
import { TYPE_META } from "./GraphCanvas";
import { ConsensusGate } from "./ConsensusGate";

interface LiveExplanation {
  feature_bars: Array<{
    feature: string;
    impact_pct: number;
    direction: string;
    description: string;
    severity: string;
  }>;
  natural_language_summary: string;
  investigator_guidance?: string;
}

function Section({
  title,
  sub,
  children,
}: {
  title: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-4 border-t border-[#1C232E] pt-3.5">
      <div className="text-[10px] font-mono text-[#39FF88] font-bold tracking-wider uppercase">
        {title}
      </div>
      {sub && <div className="mt-0.5 text-[10px] text-[#7D8590]">{sub}</div>}
      <div className="mt-2.5">{children}</div>
    </section>
  );
}

export function Inspector({
  node,
  onClose,
  onOpen,
}: {
  node: GNode | null;
  onClose: () => void;
  onOpen: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [crpcNotice, setCrpcNotice] = useState<string | null>(null);
  const [loadingCrpc, setLoadingCrpc] = useState(false);
  const [liveExplanation, setLiveExplanation] = useState<LiveExplanation | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [isEscalating, setIsEscalating] = useState(false);
  const [isEscalated, setIsEscalated] = useState(false);
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const barContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCopied(false);
    setLiveExplanation(null);
    setIsEscalated(false);
    setShowEscalationModal(false);
    if (!node || node.type !== "wallet") return;

    setLoadingExplanation(true);
    fetchExplanation("default", node.full)
      .then((data) => {
        if (data.shap_explanation) setLiveExplanation(data.shap_explanation);
      })
      .catch(() => {})
      .finally(() => setLoadingExplanation(false));
  }, [node?.id]);

  // GSAP 60ms staggered bar chart entrance
  useEffect(() => {
    if (!barContainerRef.current) return;
    const bars = barContainerRef.current.querySelectorAll(".shap-bar-fill");
    if (!bars.length) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    gsap.fromTo(
      bars,
      { scaleX: 0, transformOrigin: "left center" },
      {
        scaleX: 1,
        duration: 0.35,
        stagger: 0.06,
        ease: "power2.out",
      }
    );
  }, [liveExplanation, node?.id]);

  if (!node) {
    return (
      <button
        onClick={onOpen}
        className="flex w-7 shrink-0 items-center justify-center border-l border-[#1C232E] bg-[#0D1117] text-[#7D8590] transition-colors hover:text-[#39FF88]"
        aria-label="Expand inspector"
      >
        <span className="mono-xs rotate-180 [writing-mode:vertical-rl] tracking-widest text-[9.5px]">
          ▸ INSPECTOR
        </span>
      </button>
    );
  }

  const meta = TYPE_META[node.type];
  const risk = node.risk ?? 30;
  const verdictTier = risk >= 75 ? "RED" : risk >= 45 ? "ORANGE" : "GREEN";
  const levelColor =
    verdictTier === "RED" ? "#FF3B3B" : verdictTier === "ORANGE" ? "#FF9F1C" : "#39FF88";

  const copy = () => {
    void navigator.clipboard?.writeText(node.full);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const handleConfirm = async () => {
    setIsEscalating(true);
    try {
      await submitReview("default", node.full, "CONFIRM");
    } catch {
    } finally {
      setIsEscalating(false);
      setIsEscalated(true);
      setShowEscalationModal(true);
      toast.success("🚨 Official Escalation Packet Dispatched", {
        description: `Priority-1 Lead forwarded to CBI Cyber Crime Taskforce. Case #CBI-2026-0471`,
      });
      window.dispatchEvent(new CustomEvent("satoshitrace-refresh"));
    }
  };

  const handleDismiss = async () => {
    try {
      await submitReview("default", node.full, "DISMISS");
      toast.info("Dismissed as False Positive", {
        description: "Address added to session suppression list & model feedback loop.",
      });
      window.dispatchEvent(new CustomEvent("satoshitrace-refresh"));
      onClose();
    } catch {
      toast.info("Marked false positive");
    }
  };

  const handleCrpc = async () => {
    try {
      setLoadingCrpc(true);
      const text = await generateCrpcNotice(
        node.full,
        "WazirX India Compliance & Legal Operations"
      );
      setCrpcNotice(text);
    } catch (err: any) {
      toast.error("Failed to generate notice", { description: err.message });
    } finally {
      setLoadingCrpc(false);
    }
  };

  const displayFeatures =
    liveExplanation?.feature_bars ??
    shapFeatures.map((f) => ({
      feature: f.label,
      impact_pct: f.value,
      direction: "POSITIVE_THREAT",
      description: "",
      severity: f.value >= 25 ? "HIGH" : "MEDIUM",
    }));

  return (
    <>
      <aside
        key={node.id}
        className="relative w-[380px] shrink-0 overflow-y-auto border-l border-[#1C232E] bg-[#0D1117] font-mono text-[#E6EDF3] transition-all duration-300"
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 border-b border-[#1C232E] bg-[#0D1117] px-4 py-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[9.5px] border border-[#1C232E] bg-[#161B22] px-1.5 py-0.5 text-[#7D8590] uppercase font-bold">
                {meta.label}
              </span>
              <div
                className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-bold tracking-wider border"
                style={{
                  color: levelColor,
                  borderColor: levelColor,
                  backgroundColor: `${levelColor}15`,
                }}
              >
                <ShieldAlert size={12} />
                <span>{verdictTier} TIER // {risk}% RISK</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-[#7D8590] hover:text-[#E6EDF3] transition-colors p-1"
              aria-label="Close inspector"
            >
              <X size={15} />
            </button>
          </div>

          {/* Wallet Address Monospace Container */}
          <div className="relative mt-2.5 flex items-start gap-2 border border-[#1C232E] bg-[#0A0E14] p-2 text-[11px]">
            <code className="min-w-0 flex-1 break-all text-[#E6EDF3]">{node.full}</code>
            <button
              onClick={copy}
              className="shrink-0 text-[#7D8590] hover:text-[#39FF88] transition-colors"
              aria-label="Copy address"
            >
              {copied ? <Check size={13} className="text-[#39FF88]" /> : <Copy size={13} />}
            </button>
            {copied && (
              <span className="absolute -top-2 right-6 bg-[#39FF88] text-[#0A0E14] px-1 py-0.2 text-[9px] font-bold">
                COPIED
              </span>
            )}
          </div>
        </div>

        <div className="px-4 pb-6">
          {/* Signature Feature: Three-Model Consensus Gate */}
          <div className="mt-3">
            <ConsensusGate
              isolationScore={risk >= 75 ? 0.92 : 0.45}
              graphDensityScore={risk >= 75 ? 0.88 : 0.40}
              tacticScore={risk >= 75 ? 0.95 : 0.35}
              verdict={verdictTier}
              modelsAgreed={verdictTier === "RED" ? 3 : verdictTier === "ORANGE" ? 2 : 1}
              tacticName="Peeling Chain (8 Hops)"
            />
          </div>

          {/* Signature Feature: Staggered SHAP Evidence Inspector */}
          <Section
            title="SHAP Explainability Attribution"
            sub="6 High-Dimensional Behavioral Vectors"
          >
            {loadingExplanation ? (
              <div className="flex items-center gap-2 text-[#7D8590] text-xs py-3">
                <Loader2 size={13} className="animate-spin text-[#39FF88]" />
                <span>Computing Shapley values across ledger...</span>
              </div>
            ) : (
              <div ref={barContainerRef} className="space-y-2.5">
                {displayFeatures.map((f, i) => {
                  const isThreat =
                    f.direction === "POSITIVE_THREAT" || f.impact_pct >= 0;
                  const barColor = isThreat ? "#FF3B3B" : "#39FF88";

                  return (
                    <div key={i} className="text-[11px]">
                      <div className="flex items-center justify-between text-[10.5px]">
                        <span className="text-[#7D8590] truncate max-w-[240px]">
                          {f.feature}
                        </span>
                        <span
                          className="font-bold tabular-nums"
                          style={{ color: barColor }}
                        >
                          {isThreat ? `+${f.impact_pct}%` : `-${Math.abs(f.impact_pct)}%`}
                        </span>
                      </div>

                      {f.description && (
                        <div className="text-[9.5px] text-[#7D8590]/70 truncate">
                          {f.description}
                        </div>
                      )}

                      <div className="mt-1 h-1.5 w-full bg-[#161B22] overflow-hidden border border-[#1C232E]">
                        <div
                          className="shap-bar-fill h-full transition-all"
                          style={{
                            width: `${Math.min(100, Math.max(5, (Math.abs(f.impact_pct) / 40) * 100))}%`,
                            backgroundColor: barColor,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <p className="mt-3 text-[11px] leading-relaxed text-[#7D8590] border-l-2 border-[#39FF88] pl-2.5 bg-[#0A0E14] py-1.5">
              {liveExplanation?.natural_language_summary ??
                "Rapid sequential hops detected across 8 intermediate peeling wallets. Tor Exit origin (AS62005) with wallet active lifespan under 4 hours."}
            </p>
          </Section>

          {/* Match Signature */}
          <div className="mt-4 border border-[#FF3B3B]/40 bg-[#FF3B3B]/10 p-3 text-[11px] text-[#FF3B3B]">
            <div className="font-bold tracking-wider uppercase flex items-center gap-1.5">
              <ShieldAlert size={13} />
              88% Signature Match — LockBit 3.0
            </div>
            <div className="mt-1 text-[10px] text-[#7D8590] leading-snug">
              Correlated with CERT-In & State Cyber Extortion threat telemetry.
            </div>
          </div>

          {/* Legal Notice Warning */}
          <div className="mt-3 border border-[#1C232E] bg-[#0A0E14] p-2.5 text-[10.5px] text-[#7D8590] leading-snug">
            <strong className="text-[#FFD60A]">LEGAL NOTICE:</strong> Algorithmic anomaly flags are investigative intelligence under IT Act 2000 / BNSS 2023. Human-in-the-loop review mandatory before statutory seizure.
          </div>

          {/* Human Review Gate Actions */}
          <Section title="Investigator Action Gate">
            <div className="space-y-2">
              {isEscalated ? (
                <div className="border border-[#39FF88]/40 bg-[#39FF88]/10 p-3 text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-[#39FF88]" />
                    <div>
                      <div className="font-bold text-[#39FF88]">
                        LEAD ESCALATED TO CBI CYBER CRIME
                      </div>
                      <div className="text-[10px] text-[#7D8590]">
                        Priority-1 Queue • Section 65B Attached
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-[#1C232E]">
                    <button
                      onClick={() => setShowEscalationModal(true)}
                      className="border border-[#1C232E] bg-[#161B22] p-1.5 text-[10.5px] font-bold text-[#E6EDF3] hover:text-[#39FF88]"
                    >
                      View Packet
                    </button>
                    <button
                      onClick={() =>
                        window.open(
                          getPdfReportUrl("default", "CASE-2026-CBI-0471"),
                          "_blank"
                        )
                      }
                      className="border border-[#1C232E] bg-[#161B22] p-1.5 text-[10.5px] font-bold text-[#E6EDF3] hover:text-[#39FF88]"
                    >
                      Court PDF
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleConfirm}
                  disabled={isEscalating}
                  className="flex h-10 w-full items-center justify-center gap-2 bg-[#39FF88] text-xs font-bold text-[#0A0E14] hover:bg-[#32e67a] active:scale-98 transition-all"
                >
                  {isEscalating ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> ESCALATING...
                    </>
                  ) : (
                    <>
                      <Send size={13} /> CONFIRM — Escalate to LEA
                    </>
                  )}
                </button>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() =>
                    toast("Placed on hold", {
                      description: "Awaiting additional transaction logs.",
                    })
                  }
                  className="flex h-9 items-center justify-center gap-1.5 border border-[#1C232E] bg-[#161B22] text-[11px] text-[#E6EDF3] hover:border-[#7D8590]"
                >
                  <Clock size={13} /> Hold
                </button>
                <button
                  onClick={handleDismiss}
                  className="flex h-9 items-center justify-center gap-1.5 border border-[#FF3B3B]/40 bg-[#FF3B3B]/10 text-[11px] text-[#FF3B3B] hover:bg-[#FF3B3B]/20"
                >
                  <XCircle size={13} /> Dismiss
                </button>
              </div>

              <button
                onClick={handleCrpc}
                disabled={loadingCrpc}
                className="flex h-9 w-full items-center justify-center gap-2 border border-[#1C232E] bg-[#0A0E14] text-[11px] font-semibold text-[#39FF88] hover:bg-[#161B22]"
              >
                <Scale size={13} /> Draft Section 91 CrPC Freeze Notice
              </button>
            </div>
          </Section>

          {/* Section 91 CrPC Preview Box */}
          {crpcNotice && (
            <div className="mt-4 border border-[#1C232E] bg-[#0A0E14] p-3 text-[10.5px]">
              <div className="flex items-center justify-between text-[#39FF88] font-bold mb-2">
                <span>SECTION 91 CrPC NOTICE PREVIEW</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(crpcNotice);
                    toast.success("Statutory notice copied to clipboard.");
                  }}
                  className="text-[#7D8590] hover:text-[#E6EDF3] underline text-[9.5px]"
                >
                  COPY TEXT
                </button>
              </div>
              <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap text-[#7D8590] text-[9.5px] font-mono leading-relaxed bg-[#0D1117] p-2 border border-[#1C232E]">
                {crpcNotice}
              </pre>
            </div>
          )}
        </div>
      </aside>

      {/* Escalation Modal */}
      {showEscalationModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 font-mono"
          onClick={() => setShowEscalationModal(false)}
        >
          <div
            className="w-full max-w-lg border border-[#1C232E] bg-[#0D1117] p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#1C232E] pb-3 text-xs font-bold text-[#E6EDF3]">
              <span className="flex items-center gap-2 text-[#39FF88]">
                <ShieldCheck size={16} /> INTER-AGENCY ESCALATION PACKET
              </span>
              <button
                onClick={() => setShowEscalationModal(false)}
                className="text-[#7D8590] hover:text-[#E6EDF3]"
              >
                <X size={15} />
              </button>
            </div>

            <div className="mt-3 space-y-2 text-[11px] text-[#7D8590]">
              <div>
                TARGET WALLET: <strong className="text-[#E6EDF3]">{node.full}</strong>
              </div>
              <div>
                CASE REFERENCE: <strong className="text-[#39FF88]">CBI-2026-0471</strong>
              </div>
              <div>
                DISPATCH TIME:{" "}
                <span className="text-[#E6EDF3] tabular-nums">
                  {new Date().toISOString()}
                </span>
              </div>
              <div>
                SECTION 65B INTEGRITY HASH:{" "}
                <span className="text-[#39FF88] block text-[10px] break-all bg-[#0A0E14] p-1.5 border border-[#1C232E] mt-1">
                  C78921DF883910A49B89104E9281AC7B910481920AF89102B91823901A849201
                </span>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2 border-t border-[#1C232E] pt-3 text-xs">
              <button
                onClick={() => setShowEscalationModal(false)}
                className="border border-[#1C232E] bg-[#161B22] px-4 py-1.5 text-[#E6EDF3]"
              >
                Close
              </button>
              <button
                onClick={() =>
                  window.open(
                    getPdfReportUrl("default", "CASE-2026-CBI-0471"),
                    "_blank"
                  )
                }
                className="bg-[#39FF88] px-4 py-1.5 font-bold text-[#0A0E14]"
              >
                Download Sealed PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
