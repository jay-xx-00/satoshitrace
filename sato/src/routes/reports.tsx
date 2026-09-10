import { createFileRoute } from "@tanstack/react-router";
import { FileText, Download, ShieldCheck, Hash, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/st/AppShell";
import { getPdfReportUrl } from "@/lib/api";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Evidence Reports — SatoshiTrace" },
      { name: "description", content: "Generate Section 65B compliant evidence bundles with cryptographic integrity attestation." },
      { property: "og:title", content: "Evidence Reports — SatoshiTrace" },
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
    status: "CERTIFIED",
  },
  {
    id: "CASE-2026-ED-0233",
    title: "Enforcement Directorate — UPI-Crypto Mule Structuring Ring",
    date: "24-August-2026 12:15 IST",
    sha256: "9F8381A92B1048C881920DF89104192039BA8219018491029318920183918204",
    records: 12890,
    suspects: 12,
    syndicates: 3,
    status: "CERTIFIED",
  },
  {
    id: "CASE-2026-NCB-0119",
    title: "Narcotics Control Bureau — Darknet Market Equal-Output CoinJoin",
    date: "23-August-2026 19:40 IST",
    sha256: "3189A89102938104E8910294182901AF910283910481920B8918201948192048",
    records: 3410,
    suspects: 6,
    syndicates: 2,
    status: "CERTIFIED",
  },
];

function EvidenceReportsPage() {
  const handleDownload = (caseId: string) => {
    window.open(getPdfReportUrl("default", caseId), "_blank");
    toast.success("Downloading Section 65B Electronic Evidence Dossier", {
      description: `Case: ${caseId} • Cryptographic hash verified.`,
    });
  };

  return (
    <AppShell title="Evidence Reports" breadcrumb="HOME / EVIDENCE DOSSIERS / SECTION 65B IT ACT">
      <div className="h-full overflow-y-auto p-5 space-y-5">
        <div className="glass flex items-start justify-between p-5">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
              <ShieldCheck size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[16px] font-bold tracking-wide text-foreground">
                  Section 65B IT Act Forensic Evidence Dossiers
                </h2>
                <span className="mono-xs rounded bg-emerald-500/20 px-2 py-0.5 font-semibold text-emerald-400 ring-1 ring-emerald-500/30">
                  Indian Evidence Act 1872 Compliant
                </span>
              </div>
              <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
                Automated legal dossiers certified under Section 65B(2) of the Indian Evidence Act, 1872. Each PDF includes cryptographic SHA-256 integrity hashes, SHAP feature attributions, and chain of custody documentation ready for judicial scrutiny.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleDownload("CASE-2026-CBI-0891")}
            className="flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2.5 text-[12px] font-bold text-white shadow-lg hover:bg-emerald-500 active:scale-95 transition-all"
          >
            <Download size={15} /> Generate Active Case Dossier
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {DOSSIERS.map((d) => (
            <div key={d.id} className="glass flex flex-col justify-between p-4 space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="mono-xs font-bold text-signal">{d.id}</span>
                  <span className="mono-xs rounded bg-emerald-500/15 px-2 py-0.5 text-emerald-400 font-semibold">
                    {d.status}
                  </span>
                </div>
                <h3 className="mt-2 text-[14px] font-bold text-foreground line-clamp-2">{d.title}</h3>
                <div className="mt-1 text-[11px] text-muted-foreground">{d.date}</div>

                <div className="mt-3 space-y-1 rounded bg-background/50 p-2.5 font-mono text-[10px]">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Transactions:</span>
                    <span className="text-foreground">{d.records.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Priority Suspects:</span>
                    <span className="font-bold text-critical">{d.suspects} RED</span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Syndicates:</span>
                    <span className="text-foreground">{d.syndicates}</span>
                  </div>
                </div>

                <div className="mt-2.5 flex items-center gap-1.5 font-mono text-[9.5px] text-muted-foreground truncate">
                  <Hash size={11} className="shrink-0 text-signal" />
                  <span className="truncate">{d.sha256}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                <span className="mono-xs text-muted-foreground">Signed by LEA Examiner</span>
                <button
                  onClick={() => handleDownload(d.id)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline"
                >
                  <Download size={13} /> Download PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
