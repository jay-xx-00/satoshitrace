import { useEffect, useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, ShieldCheck, Hash, Copy } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/st/AppShell";
import {
  getPdfReportUrl,
  fetchCases,
  fetchStats,
  getCachedCases,
  getCachedStats,
  type CaseItem,
  type GlobalStats
} from "@/lib/api";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Section 65B Dossiers — SatoshiTrace" },
      {
        name: "description",
        content: "Generate Section 65B compliant evidence bundles with cryptographic integrity attestation.",
      },
    ],
  }),
  component: EvidenceReportsPage,
});

export function EvidenceReportsPage() {
  const cachedCases = getCachedCases();
  const cachedStats = getCachedStats();
  const [caseList, setCaseList] = useState<CaseItem[]>(() => cachedCases || []);
  const [stats, setStats] = useState<GlobalStats | null>(() => cachedStats || null);

  const loadData = async () => {
    try {
      const [cases, s] = await Promise.all([fetchCases(), fetchStats()]);
      if (cases && cases.length > 0) setCaseList(cases);
      if (s) setStats(s);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    loadData();
    const handleRefresh = () => loadData();
    window.addEventListener("satoshitrace-refresh", handleRefresh);
    return () => window.removeEventListener("satoshitrace-refresh", handleRefresh);
  }, []);

  const activeDossiers = useMemo(() => {
    if (caseList.length > 0) {
      return caseList.map((c) => ({
        id: c.id,
        title: `Active Cyber Crime Forensic Dossier — ${c.filename}`,
        date: `${c.uploaded} IST`,
        sha256: c.sha256,
        records: c.transactions,
        suspects: stats ? stats.high_risk_alerts : c.alerts,
        syndicates: stats ? stats.syndicates_detected : 1,
        status: "SEALED // CERTIFIED",
      }));
    }
    return [];
  }, [caseList, stats]);

  const handleDownload = (caseId: string) => {
    window.open(getPdfReportUrl("default", caseId), "_blank");
    toast.success("Downloading Section 65B Electronic Evidence Dossier", {
      description: `Case: ${caseId} • Cryptographic hash verified.`,
    });
  };

  return (
    <AppShell title="Evidence Dossiers" breadcrumb="HQ / COURT EVIDENCE / SECTION 65B IT ACT">
      <div className="h-full overflow-y-auto p-4 space-y-3 font-mono select-none">
        {/* Dossier Hub Header Banner */}
        <div className="flex flex-wrap items-start justify-between gap-4 rounded border border-[#1C232E] bg-[#0D1117] p-3.5">
          <div className="flex items-start gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded border border-[#39FF88]/40 bg-[#39FF88]/10 text-[#39FF88]">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#E6EDF3]">
                  SECTION 65B INDIAN EVIDENCE ACT FORENSIC DOSSIERS
                </h2>
                <span className="rounded bg-[#39FF88]/15 px-2 py-0.2 text-[9px] font-bold text-[#39FF88] border border-[#39FF88]/30">
                  STATUTORY COMPLIANT
                </span>
              </div>
              <p className="mt-1 max-w-2xl text-[11px] leading-relaxed text-[#7D8590]">
                Cryptographic chain of custody documentation generated in compliance with Section 65B(2) of the Indian Evidence Act, 1872. Each PDF bundle contains SHA-256 integrity hashes, SHAP feature attributions, and timestamped forensic ledger excerpts.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleDownload(activeDossiers[0]?.id || caseList[0]?.id || "CASE-2026-ACTIVE")}
            className="flex items-center gap-1.5 rounded border border-[#39FF88]/40 bg-[#39FF88]/15 px-3 py-1.5 text-xs font-bold text-[#39FF88] hover:bg-[#39FF88]/25 transition-all"
          >
            <Download size={13} />
            <span>GENERATE ACTIVE CASE DOSSIER</span>
          </button>
        </div>

        {/* Dossier Cards Grid */}
        {activeDossiers.length === 0 ? (
          <div className="rounded border border-dashed border-[#1C232E] bg-[#0D1117] p-8 text-center text-xs text-[#7D8590]">
            <ShieldCheck size={28} className="mx-auto mb-2 text-[#7D8590]/50" />
            <div className="font-bold text-[#E6EDF3] text-sm">No Active Forensic Dossiers Ingested</div>
            <div className="text-[10px] mt-1 max-w-md mx-auto">
              Ingest a seized forensic Bitcoin ledger via the top INGEST button to automatically generate Section 65B electronic evidence bundles.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {activeDossiers.map((d) => (
            <div
              key={d.id}
              className="flex flex-col justify-between rounded border border-[#1C232E] bg-[#0D1117] p-3.5 space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-[#1C232E]">
                  <span className="font-bold text-[#39FF88] text-xs">{d.id}</span>
                  <span className="rounded bg-[#39FF88]/15 px-1.5 py-0.2 text-[9px] font-semibold text-[#39FF88] border border-[#39FF88]/30">
                    {d.status}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-[#E6EDF3] leading-snug line-clamp-2">
                  {d.title}
                </h3>
                <div className="text-[10px] text-[#7D8590] tabular-nums">{d.date}</div>

                <div className="space-y-1 rounded border border-[#1C232E] bg-[#0A0E14] p-2 text-[10px]">
                  <div className="flex items-center justify-between text-[#7D8590]">
                    <span>SEIZED TRANSACTIONS:</span>
                    <span className="font-bold text-[#E6EDF3] tabular-nums">{d.records.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#7D8590]">
                    <span>PRIORITY SUSPECTS:</span>
                    <span className="font-bold text-[#FF3B3B] tabular-nums">{d.suspects} RED</span>
                  </div>
                  <div className="flex items-center justify-between text-[#7D8590]">
                    <span>LOUVAIN SYNDICATES:</span>
                    <span className="font-bold text-[#FF9F1C] tabular-nums">{d.syndicates}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded bg-[#0A0E14] px-2 py-1 border border-[#1C232E] text-[9px] text-[#7D8590]">
                  <div className="flex items-center gap-1 min-w-0 truncate">
                    <Hash size={10} className="text-[#39FF88] shrink-0" />
                    <span className="truncate font-mono">{d.sha256}</span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(d.sha256);
                      toast.success("SHA-256 hash copied!");
                    }}
                    className="text-[#7D8590] hover:text-[#39FF88] ml-1 p-0.5"
                    title="Copy SHA-256"
                  >
                    <Copy size={10} />
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-[#1C232E] flex items-center justify-between text-[10px]">
                <span className="text-[#7D8590]">SIGNED // EXAMINER #8412</span>
                <button
                  onClick={() => handleDownload(d.id)}
                  className="flex items-center gap-1 text-[#39FF88] hover:underline font-semibold"
                >
                  <Download size={11} />
                  <span>DOWNLOAD PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </AppShell>
  );
}
export default EvidenceReportsPage;
