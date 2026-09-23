import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/st/AppShell";
import { GraphCanvas } from "@/components/st/GraphCanvas";
import { Inspector } from "@/components/st/Inspector";
import { type GNode } from "@/lib/graph-data";
import { type CaseInfo } from "@/lib/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Graph Explorer — SatoshiTrace Forensic Intelligence" },
      {
        name: "description",
        content:
          "Trace Bitcoin flows across wallets, transactions and IP infrastructure with SatoshiTrace's forensic graph explorer built for law enforcement.",
      },
      { property: "og:title", content: "Graph Explorer — SatoshiTrace" },
      {
        property: "og:description",
        content: "From seized logs to court-ready leads in 3 seconds.",
      },
    ],
  }),
  component: GraphExplorer,
});

function GraphExplorer() {
  const [selected, setSelected] = useState<GNode | null>(null);
  const [caseInfo, setCaseInfo] = useState<CaseInfo | null>(null);

  useEffect(() => {
    const handleCaseUpdate = (e: any) => {
      if (e.detail) {
        setCaseInfo(e.detail);
      }
    };
    window.addEventListener("satoshitrace-case-updated", handleCaseUpdate);
    return () => window.removeEventListener("satoshitrace-case-updated", handleCaseUpdate);
  }, []);

  const breadcrumb = caseInfo
    ? `CASE ${caseInfo.job_id.slice(4, 12).toUpperCase()} / ${caseInfo.filename.toUpperCase()} / ${caseInfo.total_records.toLocaleString()} TXS`
    : "ACTIVE EVIDENCE CASE / LIVE GRAPH EXPLORER";

  return (
    <AppShell
      title="Graph Explorer"
      breadcrumb={breadcrumb}
      aside={
        <Inspector
          node={selected}
          onClose={() => setSelected(null)}
          onOpen={() => setSelected(null)}
        />
      }
    >
      <GraphCanvas selected={selected} onSelect={setSelected} />
    </AppShell>
  );
}
