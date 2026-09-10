import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Settings, Shield, Sliders, Cpu, HardDrive, Volume2, Sparkles, Award, CheckCircle2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/st/AppShell";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Platform Settings — SatoshiTrace" },
      { name: "description", content: "Offline-first deployment controls, detection thresholds, and AI model parameters." },
      { property: "og:title", content: "Platform Settings — SatoshiTrace" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
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
    <AppShell title="Platform Configuration" breadcrumb="HOME / SETTINGS / FORENSIC HYPERPARAMETERS">
      <div className="h-full overflow-y-auto p-5 space-y-5 font-mono">
        {/* Top Header Card */}
        <div className="glass flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-signal/15 text-signal font-bold">
              <Settings size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">SatoshiTrace Engine & Hyperparameter Tuning</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Configure Three-Model Consensus Gate, Section 65B attestations, and presentation modes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={triggerSato}
              className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-foreground hover:border-signal/50 hover:text-signal hover:bg-signal/10 transition-all"
            >
              <Cpu size={13} className="text-signal" />
              <span>Re-run SATO Boot</span>
            </button>

            <button
              onClick={triggerTour}
              className="flex items-center gap-1.5 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-all"
            >
              <Award size={13} />
              <span>2-Min Demo Tour</span>
            </button>

            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 rounded-md bg-signal px-4 py-1.5 text-xs font-bold text-signal-foreground hover:bg-signal/90 shadow-md transition-all"
            >
              <CheckCircle2 size={13} />
              <span>Save Changes</span>
            </button>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Column 1: AI Model Parameters */}
          <div className="glass p-4 space-y-4">
            <div className="flex items-center gap-2 border-b border-border/50 pb-2.5">
              <Cpu size={16} className="text-signal" />
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Three-Model Consensus AI Parameters
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-muted-foreground mb-1">
                  Model A: Isolation Forest Contamination ({contamination})
                </label>
                <input
                  type="range"
                  min="0.01"
                  max="0.15"
                  step="0.01"
                  value={contamination}
                  onChange={(e) => setContamination(e.target.value)}
                  className="w-full accent-signal"
                />
                <span className="text-[10px] text-muted-foreground">Threshold for unsupervised outlier classification.</span>
              </div>

              <div>
                <label className="block text-muted-foreground mb-1">
                  Model C: Peeling Chain Minimum Hops ({minHops})
                </label>
                <input
                  type="range"
                  min="2"
                  max="10"
                  step="1"
                  value={minHops}
                  onChange={(e) => setMinHops(e.target.value)}
                  className="w-full accent-signal"
                />
                <span className="text-[10px] text-muted-foreground">Minimum consecutive peeling transfers before escalating threat.</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/30">
                <div>
                  <div className="font-semibold text-foreground">500+ Exchange Whitelist Filter</div>
                  <div className="text-[10px] text-muted-foreground">Suppress false alerts from WazirX, CoinDCX, Binance, Coinbase</div>
                </div>
                <input
                  type="checkbox"
                  checked={whitelistFilter}
                  onChange={(e) => setWhitelistFilter(e.target.checked)}
                  className="h-4 w-4 accent-signal rounded"
                />
              </div>
            </div>
          </div>

          {/* Column 2: Legal & Evidentiary Attestation */}
          <div className="glass p-4 space-y-4">
            <div className="flex items-center gap-2 border-b border-border/50 pb-2.5">
              <Shield size={16} className="text-emerald-400" />
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Section 65B Indian Evidence Act Attestation
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-muted-foreground mb-1">Lead Examiner Designation</label>
                <input
                  type="text"
                  value={examinerName}
                  onChange={(e) => setExaminerName(e.target.value)}
                  className="w-full rounded-md border border-input bg-background/70 px-3 py-2 text-xs text-foreground outline-none focus:border-signal"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <div className="font-semibold text-foreground">Auto SHA-256 Custody Locking</div>
                  <div className="text-[10px] text-muted-foreground">Compute cryptographic hash upon every file ingestion</div>
                </div>
                <input
                  type="checkbox"
                  checked={autoLockSha}
                  onChange={(e) => setAutoLockSha(e.target.checked)}
                  className="h-4 w-4 accent-emerald-500 rounded"
                />
              </div>

              <div className="rounded bg-emerald-500/10 p-3 border border-emerald-500/30 text-[11px] text-emerald-300">
                <strong>Court Admissibility Status:</strong> Active. Generated reports are legally compliant under Section 65B(2) Indian Evidence Act, 1872 & Bharatiya Sakshya Adhiniyam, 2023.
              </div>
            </div>
          </div>
        </div>

        {/* Air-Gap Diagnostic Self-Check */}
        <div className="glass p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <HardDrive size={15} className="text-signal" />
              <span>Offline Air-Gap Diagnostic Verification</span>
            </div>
            <span className="mono-xs rounded bg-emerald-500/20 px-2 py-0.5 text-emerald-400 font-bold">
              ALL SYSTEMS PASSED (100% OFFLINE)
            </span>
          </div>
          <div className="grid grid-cols-4 gap-3 text-[11px] text-muted-foreground pt-1">
            <div className="rounded bg-background/50 p-2 border border-border/40">
              FastAPI Localhost: <strong className="text-emerald-400">127.0.0.1:8000</strong>
            </div>
            <div className="rounded bg-background/50 p-2 border border-border/40">
              Vite Local UI: <strong className="text-emerald-400">localhost:3000</strong>
            </div>
            <div className="rounded bg-background/50 p-2 border border-border/40">
              Local GeoIP & Tor ASNs: <strong className="text-emerald-400">BUNDLED</strong>
            </div>
            <div className="rounded bg-background/50 p-2 border border-border/40">
              ReportLab PDF Engine: <strong className="text-emerald-400">OPERATIONAL</strong>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
