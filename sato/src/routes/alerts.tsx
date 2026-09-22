import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Filter, ArrowUpRight, Check, X, ShieldAlert, Radio } from "lucide-react";
import { AppShell } from "@/components/st/AppShell";
import { fetchAlerts, type BackendAlert, submitReview } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Prioritized Threat Leads — SatoshiTrace" },
      {
        name: "description",
        content: "Consensus-ranked Bitcoin money laundering and ransomware alert queue for forensic investigators.",
      },
    ],
  }),
  component: AlertsPage,
});

const TIER_GLOW: Record<string, string> = {
  RED: "tier-glow-red border-[#FF3B3B]/40",
  ORANGE: "tier-glow-orange border-[#FF9F1C]/40",
  YELLOW: "tier-glow-yellow border-[#FFD60A]/40",
  GREEN: "tier-glow-green border-[#39FF88]/40",
};

const TIER_BADGE: Record<string, string> = {
  RED: "bg-[#FF3B3B]/15 text-[#FF3B3B] border border-[#FF3B3B]/30",
  ORANGE: "bg-[#FF9F1C]/15 text-[#FF9F1C] border border-[#FF9F1C]/30",
  YELLOW: "bg-[#FFD60A]/15 text-[#FFD60A] border border-[#FFD60A]/30",
  GREEN: "bg-[#39FF88]/15 text-[#39FF88] border border-[#39FF88]/30",
};

export function AlertsPage() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<BackendAlert[]>([]);
  const [selectedTier, setSelectedTier] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [justRefreshed, setJustRefreshed] = useState(false);

  const loadAlerts = async () => {
    try {
      const data = await fetchAlerts("default");
      setAlerts(data);
      setJustRefreshed(true);
      setTimeout(() => setJustRefreshed(false), 1500);
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
    <AppShell title="Threat Leads Queue" breadcrumb="HQ / PRIORITIZED LEADS / THREE-MODEL CONSENSUS GATE">
      <div className="h-full overflow-y-auto p-4 space-y-3 font-mono select-none">
        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-[#1C232E] bg-[#0D1117] p-3">
          <div className="flex items-center gap-1.5">
            <Filter size={12} className="text-[#39FF88] mr-1" />
            <span className="text-[10px] text-[#7D8590] uppercase tracking-wider mr-1">
              TIER:
            </span>
            {(["ALL", "RED", "ORANGE", "YELLOW", "GREEN"] as const).map((tier) => {
              const count = tier === "ALL" ? alerts.length : alerts.filter((a) => a.tier === tier).length;
              return (
                <button
                  key={tier}
                  onClick={() => setSelectedTier(tier)}
                  className={`rounded px-2 py-0.5 text-[10px] font-mono transition-all ${
                    selectedTier === tier
                      ? "bg-[#39FF88]/20 text-[#39FF88] border border-[#39FF88]/40"
                      : "text-[#7D8590] hover:text-[#E6EDF3] bg-[#0A0E14] border border-[#1C232E]"
                  }`}
                >
                  {tier} <span className="tabular-nums">({count})</span>
                </button>
              );
            })}
          </div>

          <div className="w-72">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by wallet, ASN, tactic..."
              className="h-7 w-full rounded border border-[#1C232E] bg-[#0A0E14] px-2.5 font-mono text-[10.5px] text-[#E6EDF3] outline-none placeholder:text-[#7D8590] focus:border-[#39FF88]/50"
            />
          </div>
        </div>

        {/* Lead Queue Table */}
        <div className="rounded border border-[#1C232E] bg-[#0D1117] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead className="sticky top-0 z-10 bg-[#0A0E14]">
                <tr className="border-b border-[#1C232E] text-[#7D8590] text-[9.5px] uppercase tracking-wider">
                  <th className="py-2.5 px-3 font-medium">TIER // GATE</th>
                  <th className="py-2.5 px-3 font-medium">SUSPECT WALLET IDENTIFIER</th>
                  <th className="py-2.5 px-3 font-medium">CONSENSUS SCORE [IF|SGR|RULE]</th>
                  <th className="py-2.5 px-3 font-medium">FORENSIC TACTIC</th>
                  <th className="py-2.5 px-3 font-medium">GEOGRAPHIC JURISDICTION / ASN</th>
                  <th className="py-2.5 px-3 text-right font-medium">TOTAL VOLUME</th>
                  <th className="py-2.5 px-3 text-right font-medium">OPERATOR ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C232E]/40">
                {filtered.map((a, idx) => {
                  const isRed = a.tier === "RED";
                  const glowClass = TIER_GLOW[a.tier] || "";
                  const badgeClass = TIER_BADGE[a.tier] || TIER_BADGE.RED;

                  return (
                    <tr
                      key={`${a.address}_${idx}`}
                      className={`hover:bg-[#161B22] transition-colors ${
                        idx % 2 === 1 ? "bg-white/[0.015]" : ""
                      } ${justRefreshed ? "bg-[#39FF88]/5 transition-colors duration-1000" : ""}`}
                    >
                      {/* Risk Tier Badge */}
                      <td className="py-2.5 px-3">
                        <span
                          className={`rounded px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider tabular-nums ${badgeClass}`}
                        >
                          {a.tier} ({a.models_agreed}/3)
                        </span>
                      </td>

                      {/* Suspect Address with Jump */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5 font-bold text-[#E6EDF3]">
                          <span className="font-mono text-[11px] tracking-wide">{a.address}</span>
                          <button
                            onClick={() => navigate({ to: "/" })}
                            className="text-[#7D8590] hover:text-[#39FF88] transition-colors p-0.5"
                            title="Inspect in Graph Explorer"
                          >
                            <ArrowUpRight size={12} />
                          </button>
                        </div>
                      </td>

                      {/* Consensus Score Pill */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#FF3B3B] text-[11.5px] tabular-nums">
                            {a.risk_score_pct}%
                          </span>
                          <span className="rounded bg-[#0A0E14] px-1.5 py-0.2 text-[9px] text-[#7D8590] border border-[#1C232E]">
                            <span className={a.models_agreed >= 1 ? "text-[#39FF88]" : "text-[#7D8590]"}>IF</span>
                            <span className="mx-0.5 text-[#1C232E]">|</span>
                            <span className={a.models_agreed >= 2 ? "text-[#39FF88]" : "text-[#7D8590]"}>SGR</span>
                            <span className="mx-0.5 text-[#1C232E]">|</span>
                            <span className={a.models_agreed >= 3 ? "text-[#39FF88]" : "text-[#7D8590]"}>RULE</span>
                          </span>
                        </div>
                      </td>

                      {/* Primary Tactic */}
                      <td className="py-2.5 px-3">
                        <span className="font-medium text-[#E6EDF3] text-[10.5px]">
                          {a.primary_tactic}
                        </span>
                      </td>

                      {/* Geo / ASN */}
                      <td className="py-2.5 px-3 text-[#7D8590] text-[10.5px]">
                        <span>{a.flag} {a.country}</span>
                        <span className="mx-1 text-[#1C232E]">•</span>
                        <span className="font-mono text-[10px]">{a.asn.slice(0, 16)}</span>
                      </td>

                      {/* Volume */}
                      <td className="py-2.5 px-3 text-right font-bold text-[#E6EDF3] tabular-nums">
                        {a.total_btc_moved} BTC
                      </td>

                      {/* Review Buttons */}
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleReview(a.address, "CONFIRM")}
                            className="flex items-center gap-1 rounded bg-[#39FF88]/15 px-2 py-0.5 text-[9.5px] font-semibold text-[#39FF88] border border-[#39FF88]/30 hover:bg-[#39FF88]/25 transition-all"
                            title="Confirm Threat Lead"
                          >
                            <Check size={10} />
                            <span>CONFIRM</span>
                          </button>
                          <button
                            onClick={() => handleReview(a.address, "DISMISS")}
                            className="flex items-center gap-1 rounded bg-[#0A0E14] px-2 py-0.5 text-[9.5px] font-medium text-[#7D8590] border border-[#1C232E] hover:text-[#FF3B3B] hover:border-[#FF3B3B]/30 transition-all"
                            title="Dismiss Lead"
                          >
                            <X size={10} />
                            <span>DISMISS</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
export default AlertsPage;
