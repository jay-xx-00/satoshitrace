import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FileBarChart, Globe2, Network, ShieldAlert, TrendingUp, ArrowUpRight, Activity, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/st/AppShell";
import { CountUp } from "@/components/st/CountUp";
import { Sparkline } from "@/components/st/Sparkline";
import { ForensicTacticsMatrix } from "@/components/st/ForensicTacticsMatrix";
import { cases as mockCases, sparkline } from "@/lib/mock-data";
import { fetchStats, fetchAlerts, fetchCases, type GlobalStats, type BackendAlert, type CaseItem } from "@/lib/api";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Operations Dashboard — SatoshiTrace" },
      {
        name: "description",
        content: "Live cryptocurrency crime metrics: transactions analysed, high-risk alerts, syndicates detected and flagged jurisdictions.",
      },
    ],
  }),
  component: Dashboard,
});

const RISK_BADGE: Record<string, string> = {
  CRITICAL: "bg-[#FF3B3B]/15 text-[#FF3B3B] border border-[#FF3B3B]/40",
  RED: "bg-[#FF3B3B]/15 text-[#FF3B3B] border border-[#FF3B3B]/40",
  HIGH: "bg-[#FF9F1C]/15 text-[#FF9F1C] border border-[#FF9F1C]/40",
  ORANGE: "bg-[#FF9F1C]/15 text-[#FF9F1C] border border-[#FF9F1C]/40",
  MEDIUM: "bg-[#FFD60A]/15 text-[#FFD60A] border border-[#FFD60A]/40",
  YELLOW: "bg-[#FFD60A]/15 text-[#FFD60A] border border-[#FFD60A]/40",
  LOW: "bg-[#39FF88]/15 text-[#39FF88] border border-[#39FF88]/40",
  GREEN: "bg-[#39FF88]/15 text-[#39FF88] border border-[#39FF88]/40",
};

export function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<GlobalStats>({
    total_transactions_analyzed: 4671,
    high_risk_alerts: 4,
    syndicates_detected: 7,
    countries_flagged: 8,
    active_jobs: 1,
    system_status: "ONLINE_OFFLINE_READY",
    verified_false_positive_rate: "3.2%",
    model_accuracy: "96.8%",
  });
  const [alertsList, setAlertsList] = useState<BackendAlert[]>([]);
  const [caseList, setCaseList] = useState<CaseItem[]>([]);

  const loadData = async () => {
    try {
      const [s, a, c] = await Promise.all([fetchStats(), fetchAlerts("default"), fetchCases()]);
      setStats(s);
      setAlertsList(a);
      if (c && c.length > 0) setCaseList(c);
    } catch {
      // Fallback gracefully
    }
  };

  useEffect(() => {
    loadData();
    const handleRefresh = () => loadData();
    window.addEventListener("satoshitrace-refresh", handleRefresh);
    return () => window.removeEventListener("satoshitrace-refresh", handleRefresh);
  }, []);

  return (
    <AppShell title="Operations Dashboard" breadcrumb="HQ / NATIONAL CYBER OPERATIONS / METRIC FEEDS">
      <div className="h-full overflow-y-auto p-4 space-y-4 font-mono select-none">
        {/* Top 4 KPI Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded border border-[#1C232E] bg-[#0D1117] p-3.5 shadow-sm">
            <div className="text-[10px] uppercase tracking-wider text-[#7D8590]">
              TOTAL TRANSACTIONS ANALYSED
            </div>
            <div className="mt-1 font-mono text-2xl font-bold text-[#E6EDF3] tabular-nums">
              <CountUp value={stats.total_transactions_analyzed} />
            </div>
            <div className="mt-2 h-7">
              <Sparkline data={sparkline} />
            </div>
          </div>

          <div className="rounded border border-[#1C232E] bg-[#0D1117] p-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-[#7D8590]">
                HIGH-RISK ALERTS
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF3B3B] animate-pulse shadow-[0_0_6px_#FF3B3B]" />
            </div>
            <div className="mt-1 font-mono text-2xl font-bold text-[#FF3B3B] tabular-nums">
              <CountUp value={stats.high_risk_alerts} />
            </div>
            <div className="mt-1 flex items-center gap-1 text-[10px] text-[#FF3B3B]">
              <TrendingUp size={11} />
              <span>3-MODEL CONSENSUS RED LEADS</span>
            </div>
          </div>

          <div className="rounded border border-[#1C232E] bg-[#0D1117] p-3.5 shadow-sm">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#7D8590]">
              <Network size={11} className="text-[#39FF88]" />
              <span>SYNDICATES DETECTED</span>
            </div>
            <div className="mt-1 font-mono text-2xl font-bold text-[#E6EDF3] tabular-nums">
              <CountUp value={stats.syndicates_detected} />
            </div>
            <div className="mt-1 text-[10px] text-[#7D8590]">
              LOUVAIN COMMUNITY CLUSTERING
            </div>
          </div>

          <div className="rounded border border-[#1C232E] bg-[#0D1117] p-3.5 shadow-sm">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#7D8590]">
              <CheckCircle2 size={11} className="text-[#39FF88]" />
              <span>MODEL OUTPUT ACCURACY</span>
            </div>
            <div className="mt-1 font-mono text-2xl font-bold text-[#39FF88] tabular-nums">
              {stats.model_accuracy || (stats.verified_false_positive_rate ? `${(100 - parseFloat(stats.verified_false_positive_rate)).toFixed(1)}%` : "96.8%")}
            </div>
            <div className="mt-1.5 flex gap-1.5 text-[9px] text-[#7D8590]">
              <span className="rounded bg-[#39FF88]/10 text-[#39FF88] px-1.5 py-0.5 border border-[#39FF88]/30">
                {stats.model_accuracy || "96.8%"} CORRECT
              </span>
              <span className="rounded bg-[#0A0E14] px-1.5 py-0.5 border border-[#1C232E]">
                3-MODEL CONSENSUS
              </span>
            </div>
          </div>
        </div>

        {/* Middle Two-Column Grid: Case Ledger & Live Threat Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
          {/* Recent Ingested Cases Table (3 cols) */}
          <div className="rounded border border-[#1C232E] bg-[#0D1117] p-3.5 lg:col-span-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1C232E]">
              <div className="flex items-center gap-2">
                <FileBarChart size={13} className="text-[#39FF88]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#E6EDF3]">
                  INGESTED CASE LEDGER
                </h2>
              </div>
              <button
                onClick={() => navigate({ to: "/" })}
                className="flex items-center gap-1 text-[10px] text-[#39FF88] hover:underline"
              >
                <span>OPEN GRAPH EXPLORER</span>
                <ArrowUpRight size={11} />
              </button>
            </div>

            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="border-b border-[#1C232E] text-[#7D8590] text-[9.5px] uppercase tracking-wider bg-[#0A0E14]/80">
                    <th className="py-2 px-2 font-medium">CASE ID</th>
                    <th className="py-2 px-2 font-medium">EVIDENCE FILE</th>
                    <th className="py-2 px-2 font-medium">TIMESTAMP (IST)</th>
                    <th className="py-2 px-2 text-right font-medium">TX COUNT</th>
                    <th className="py-2 px-2 text-right font-medium">ALERTS</th>
                    <th className="py-2 px-2 text-right font-medium">SEAL STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C232E]/40">
                  {(caseList.length > 0 ? caseList : mockCases).map((c, idx) => (
                    <tr
                      key={c.id}
                      className={`hover:bg-[#161B22] transition-colors ${
                        idx % 2 === 1 ? "bg-white/[0.015]" : ""
                      }`}
                    >
                      <td className="py-2 px-2 font-bold text-[#E6EDF3]">{c.id}</td>
                      <td className="py-2 px-2 text-[#7D8590] text-[10px]">{c.filename}</td>
                      <td className="py-2 px-2 text-[#7D8590] tabular-nums">{c.uploaded}</td>
                      <td className="py-2 px-2 text-right text-[#E6EDF3] tabular-nums font-medium">
                        {c.transactions.toLocaleString()}
                      </td>
                      <td className="py-2 px-2 text-right font-bold text-[#FF3B3B] tabular-nums">
                        {c.alerts}
                      </td>
                      <td className="py-2 px-2 text-right">
                        <span className="rounded bg-[#39FF88]/15 px-1.5 py-0.5 text-[9px] font-bold text-[#39FF88] border border-[#39FF88]/30">
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Live Threat Feed (2 cols) */}
          <div className="rounded border border-[#1C232E] bg-[#0D1117] p-3.5 lg:col-span-2 flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-[#1C232E]">
              <div className="flex items-center gap-2">
                <ShieldAlert size={13} className="text-[#FF3B3B]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#E6EDF3]">
                  LIVE THREAT FEED
                </h2>
              </div>
              <span className="text-[10px] text-[#7D8590] tabular-nums">
                {alertsList.length} ACTIVE LEADS
              </span>
            </div>

            <div className="mt-2 space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
              {alertsList.map((a, idx) => (
                <div
                  key={`${a.address}_${idx}`}
                  onClick={() => navigate({ to: "/" })}
                  className="group flex items-center justify-between rounded border border-[#1C232E] bg-[#0A0E14] p-2 text-xs hover:border-[#39FF88]/40 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider tabular-nums ${
                        RISK_BADGE[a.tier] || RISK_BADGE.RED
                      }`}
                    >
                      {a.tier}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate font-mono text-[10.5px] text-[#E6EDF3] group-hover:text-[#39FF88] transition-colors">
                        {a.address}
                      </div>
                      <div className="text-[9px] text-[#7D8590] truncate">
                        {a.primary_tactic}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <div className="font-mono text-[10.5px] font-bold text-[#FF3B3B] tabular-nums">
                      {a.risk_score_pct}%
                    </div>
                    <div className="text-[9px] text-[#7D8590] tabular-nums">
                      {a.country} {a.flag}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Forensic Modus Operandi & Laundering Tactics Radar */}
        <div className="rounded border border-[#1C232E] bg-[#0D1117] p-3.5 shadow-sm">
          <ForensicTacticsMatrix />
        </div>
      </div>
    </AppShell>
  );
}
export default Dashboard;
