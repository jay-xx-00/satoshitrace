import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Settings, Shield, Cpu, Award, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/st/AppShell";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Platform Configuration — SatoshiTrace" },
      {
        name: "description",
        content: "Offline-first deployment controls, detection thresholds, and AI model parameters.",
      },
    ],
  }),
  component: SettingsPage,
});

export function SettingsPage() {
  const [contamination, setContamination] = useState("0.05");
  const [minHops, setMinHops] = useState("3");
  const [examinerName, setExaminerName] = useState("Authorized Cyber Forensics Examiner (CBI/ED)");
  const [autoLockSha, setAutoLockSha] = useState(true);
  const [whitelistFilter, setWhitelistFilter] = useState(true);

  const handleSave = () => {
    toast.success("Forensic Engine Settings Saved", {
      description: "Updated hyperparameters written to local secure config.",
    });
  };

  const triggerSato = () => {
    window.dispatchEvent(new CustomEvent("satoshitrace-open-sato"));
  };

  const triggerTour = () => {
    window.dispatchEvent(new CustomEvent("satoshitrace-open-tour"));
  };

  return (
    <AppShell title="System Configuration" breadcrumb="HQ / SETTINGS / FORENSIC HYPERPARAMETERS">
      <div className="h-full overflow-y-auto p-4 space-y-3 font-mono select-none">
        {/* Top Header Card */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-[#1C232E] bg-[#0D1117] p-3.5">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded border border-[#1C232E] bg-[#0A0E14] text-[#39FF88]">
              <Settings size={18} />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#E6EDF3]">
                SATOSHITRACE ENGINE & HYPERPARAMETER TUNING
              </h2>
              <p className="text-[10.5px] text-[#7D8590] mt-0.5">
                Configure Three-Model Consensus Gate, Section 65B legal attestations, and air-gap telemetry.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={triggerSato}
              className="flex items-center gap-1.5 rounded border border-[#1C232E] bg-[#0A0E14] px-2.5 py-1 text-xs text-[#7D8590] hover:text-[#39FF88] hover:border-[#39FF88]/40 transition-all"
            >
              <Cpu size={12} className="text-[#39FF88]" />
              <span>RE-RUN BOOT</span>
            </button>

            <button
              onClick={triggerTour}
              className="flex items-center gap-1.5 rounded border border-[#39FF88]/30 bg-[#39FF88]/10 px-2.5 py-1 text-xs font-semibold text-[#39FF88] hover:bg-[#39FF88]/20 transition-all"
            >
              <Award size={12} />
              <span>DEMO TOUR</span>
            </button>

            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 rounded border border-[#39FF88]/40 bg-[#39FF88]/15 px-3 py-1 text-xs font-bold text-[#39FF88] hover:bg-[#39FF88]/25 transition-all"
            >
              <CheckCircle2 size={12} />
              <span>SAVE CHANGES</span>
            </button>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Column 1: AI Model Parameters */}
          <div className="rounded border border-[#1C232E] bg-[#0D1117] p-3.5 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#1C232E]">
              <Cpu size={14} className="text-[#39FF88]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#E6EDF3]">
                THREE-MODEL CONSENSUS AI PARAMETERS
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between text-[#7D8590] mb-1">
                  <span>MODEL A: ISOLATION FOREST CONTAMINATION</span>
                  <span className="font-bold text-[#39FF88] tabular-nums">{contamination}</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.15"
                  step="0.01"
                  value={contamination}
                  onChange={(e) => setContamination(e.target.value)}
                  className="w-full accent-[#39FF88] bg-[#0A0E14] cursor-pointer"
                />
                <span className="text-[9.5px] text-[#7D8590]">Threshold for unsupervised outlier classification in seized logs.</span>
              </div>

              <div>
                <div className="flex justify-between text-[#7D8590] mb-1">
                  <span>MODEL C: PEELING CHAIN MINIMUM HOPS</span>
                  <span className="font-bold text-[#39FF88] tabular-nums">{minHops}</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="10"
                  step="1"
                  value={minHops}
                  onChange={(e) => setMinHops(e.target.value)}
                  className="w-full accent-[#39FF88] bg-[#0A0E14] cursor-pointer"
                />
                <span className="text-[9.5px] text-[#7D8590]">Minimum consecutive peeling transfers before escalating threat tier.</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#1C232E]">
                <div>
                  <div className="font-semibold text-[#E6EDF3]">500+ EXCHANGE WHITELIST FILTER</div>
                  <div className="text-[9.5px] text-[#7D8590]">Suppress false alerts from WazirX, CoinDCX, Binance, Coinbase</div>
                </div>
                <input
                  type="checkbox"
                  checked={whitelistFilter}
                  onChange={(e) => setWhitelistFilter(e.target.checked)}
                  className="h-3.5 w-3.5 accent-[#39FF88] rounded"
                />
              </div>
            </div>
          </div>

          {/* Column 2: Legal & Evidentiary Attestation */}
          <div className="rounded border border-[#1C232E] bg-[#0D1117] p-3.5 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#1C232E]">
              <Shield size={14} className="text-[#39FF88]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#E6EDF3]">
                SECTION 65B INDIAN EVIDENCE ACT ATTESTATION
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#7D8590] text-[10px] uppercase mb-1">
                  LEAD EXAMINER DESIGNATION
                </label>
                <input
                  type="text"
                  value={examinerName}
                  onChange={(e) => setExaminerName(e.target.value)}
                  className="w-full rounded border border-[#1C232E] bg-[#0A0E14] px-2.5 py-1.5 text-xs text-[#E6EDF3] outline-none focus:border-[#39FF88]/50"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#1C232E]">
                <div>
                  <div className="font-semibold text-[#E6EDF3]">AUTOMATIC SHA-256 INTEGRITY LOCK</div>
                  <div className="text-[9.5px] text-[#7D8590]">Cryptographically bind each seized file upon ingestion</div>
                </div>
                <input
                  type="checkbox"
                  checked={autoLockSha}
                  onChange={(e) => setAutoLockSha(e.target.checked)}
                  className="h-3.5 w-3.5 accent-[#39FF88] rounded"
                />
              </div>

              <div className="rounded border border-[#1C232E] bg-[#0A0E14] p-2 text-[9.5px] text-[#7D8590] space-y-0.5">
                <div>STATUTORY BASIS: SECTION 65B(2) IT ACT 2000</div>
                <div>LOCAL HASH INTEGRITY: SHA-256 AIR-GAPPED</div>
                <div>LOCAL REPO PATH: 127.0.0.1:8000 (ISOLATED)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
export default SettingsPage;
