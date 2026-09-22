import { createFileRoute } from "@tanstack/react-router";
import { Download, ShieldCheck, Hash, Copy } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/st/AppShell";
import { getPdfReportUrl } from "@/lib/api";

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

const DOSSIERS = [
  {
    id: "CASE-2026-CBI-0891",
    title: "National Cyber Crime Taskforce — LockBit 3.0 Laundering Nexus",
    date: "24-August-2026 15:30 IST",
    sha256: "C78921DF883910A49B89104E9281AC7B910481920AF89102B91823901A849201",
    records: 4671,
    suspects: 4,
    syndicates: 7,
    status: "SEALED // CERTIFIED",
  },
  {
    id: "CASE-2026-ED-0233",
    title: "Enforcement Directorate — UPI-Crypto Mule Structuring Ring",
    date: "24-August-2026 12:15 IST",
    sha256: "9F8381A92B1048C881920DF89104192039BA8219018491029318920183918204",
    records: 12890,
    suspects: 12,
    syndicates: 3,
    status: "SEALED // CERTIFIED",
  },
  {
    id: "CASE-2026-NCB-0119",
    title: "Narcotics Control Bureau — Darknet Market Equal-Output CoinJoin",
    date: "23-August-2026 19:40 IST",
    sha256: "3189A89102938104E8910294182901AF910283910481920B8918201948192048",
    records: 3410,
    suspects: 6,
    syndicates: 2,
    status: "SEALED // CERTIFIED",
  },
];

export function EvidenceReportsPage() {
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
            onClick={() => handleDownload("CASE-2026-CBI-0891")}
            className="flex items-center gap-1.5 rounded border border-[#39FF88]/40 bg-[#39FF88]/15 px-3 py-1.5 text-xs font-bold text-[#39FF88] hover:bg-[#39FF88]/25 transition-all"
          >
            <Download size={13} />
            <span>GENERATE ACTIVE CASE DOSSIER</span>
          </button>
        </div>

        {/* Dossier Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {DOSSIERS.map((d) => (
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
      </div>
    </AppShell>
  );
}
export default EvidenceReportsPage;
