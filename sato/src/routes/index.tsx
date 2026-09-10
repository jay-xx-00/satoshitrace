import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/st/AppShell";
import { GraphCanvas } from "@/components/st/GraphCanvas";
import { Inspector } from "@/components/st/Inspector";
import { gNodes, type GNode } from "@/lib/graph-data";

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

  return (
    <AppShell
      title="Graph Explorer"
      breadcrumb="CASE CBI-2026-0471 / CLUSTER BLACKRIVER / DEPTH 3"
      aside={
        <Inspector
          node={selected}
          onClose={() => setSelected(null)}
          onOpen={() => setSelected(gNodes[0] ?? null)}
        />
      }
    >
      <GraphCanvas selected={selected} onSelect={setSelected} />
    </AppShell>
  );
}
