import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, Filter, ShieldAlert, ArrowUpRight, CheckCircle2, Clock, XCircle } from "lucide-react";
import { AppShell } from "@/components/st/AppShell";
import { fetchAlerts, type BackendAlert, submitReview } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Prioritized Threat Leads — SatoshiTrace" },
      { name: "description", content: "Consensus-ranked Bitcoin money laundering and ransomware alert queue for forensic investigators." },
      { property: "og:title", content: "Prioritized Threat Leads — SatoshiTrace" },
    ],
  }),
  component: AlertsPage,
});

function AlertsPage() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<BackendAlert[]>([]);
  const [selectedTier, setSelectedTier] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");

  const loadAlerts = async () => {
    try {
      const data = await fetchAlerts("default");
      setAlerts(data);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    loadAlerts();
    const handleRefresh = () => loadAlerts();
    window.addEventListener("satoshitrace-refresh", handleRefresh);
    return () => window.removeEventListener("satoshitrace-refresh", handleRefresh);
  }, []);

  const filtered = alerts.filter((a) => {
    if (selectedTier !== "ALL" && a.tier !== selectedTier) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        a.address.toLowerCase().includes(q) ||
        a.primary_tactic.toLowerCase().includes(q) ||
        a.country.toLowerCase().includes(q) ||
        a.asn.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleReview = async (address: string, decision: "CONFIRM" | "DISMISS") => {
    try {
      await submitReview("default", address, decision);
      toast.success(`Action recorded: ${decision}`, {
        description: `Lead updated for ${address.slice(0, 16)}...`,
      });
      loadAlerts();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <AppShell title="Prioritized Threat Leads Queue" breadcrumb="HOME / ALERT QUEUE / THREE-MODEL CONSENSUS">
      <div className="h-full overflow-y-auto p-5 space-y-4">
        {/* Filter & Action Toolbar */}
        <div className="glass flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-signal" />
            <span className="mono-xs text-muted-foreground mr-2 font-bold uppercase tracking-wider">Tier Filter:</span>
            {["ALL", "RED", "ORANGE", "YELLOW", "GREEN"].map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`mono-xs rounded px-2.5 py-1 font-bold transition-all ${
                  selectedTier === tier
                    ? "bg-signal text-signal-foreground shadow-md"
                    : "border border-border bg-background/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                {tier} {tier === "RED" && `(${alerts.filter((a) => a.tier === "RED").length})`}
              </button>
            ))}
          </div>

          <div className="w-72">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by wallet, ASN, tactic..."
              className="h-8 w-full rounded-md border border-input bg-background/60 px-3 font-mono text-[11px] text-foreground outline-none focus:border-signal"
            />
          </div>
        </div>

        {/* Alerts Table */}
        <div className="glass overflow-hidden">
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr className="mono-xs border-b border-border bg-panel-2/50 text-muted-foreground">
                <th className="p-3 font-normal">Risk Tier</th>
                <th className="p-3 font-normal">Entity Wallet Address</th>
                <th className="p-3 font-normal">Consensus Score</th>
                <th className="p-3 font-normal">Detected Laundering Tactic</th>
                <th className="p-3 font-normal">Geo / Relay ASN</th>
                <th className="p-3 text-right font-normal">Volume</th>
                <th className="p-3 text-right font-normal">Human Review Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filtered.map((a, idx) => (
                <tr key={`${a.address}_${idx}`} className="hover:bg-muted/20 transition-colors">
                  <td className="p-3">
                    <span
                      className={`mono-xs rounded px-2 py-0.5 font-bold ring-1 ${
                        a.tier === "RED"
                          ? "bg-critical/20 text-critical ring-critical/40"
                          : a.tier === "ORANGE"
                            ? "bg-signal/20 text-signal ring-signal/40"
                            : "bg-warn/15 text-warn ring-warn/40"
                      }`}
                    >
                      {a.tier} ({a.models_agreed}/3)
                    </span>
                  </td>
                  <td className="p-3 font-mono text-[11.5px] font-bold text-foreground">
                    <div className="flex items-center gap-1.5">
                      <span>{a.address}</span>
                      <button
                        onClick={() => navigate({ to: "/" })}
                        className="text-muted-foreground hover:text-signal"
                        title="View in Graph"
                      >
                        <ArrowUpRight size={12} />
                      </button>
                    </div>
                  </td>
                  <td className="p-3 font-mono font-bold text-critical text-[13px]">
                    {a.risk_score_pct}%
                  </td>
                  <td className="p-3">
                    <span className="font-semibold text-foreground">{a.primary_tactic}</span>
                  </td>
                  <td className="p-3 text-muted-foreground font-mono text-[11px]">
                    {a.flag} {a.country} • {a.asn.slice(0, 18)}...
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-foreground">
                    {a.total_btc_moved} BTC
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleReview(a.address, "CONFIRM")}
                        className="flex items-center gap-1 rounded bg-success/15 px-2 py-1 text-[11px] font-bold text-success ring-1 ring-success/30 hover:bg-success/25"
                      >
                        <CheckCircle2 size={12} /> Confirm
                      </button>
                      <button
                        onClick={() => handleReview(a.address, "DISMISS")}
                        className="flex items-center gap-1 rounded bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground hover:bg-critical/20 hover:text-critical"
                      >
                        <XCircle size={12} /> Dismiss
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
