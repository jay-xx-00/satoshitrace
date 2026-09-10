import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FileBarChart, Globe2, Network, ShieldAlert, TrendingUp, ArrowUpRight } from "lucide-react";
import { AppShell } from "@/components/st/AppShell";
import { CountUp } from "@/components/st/CountUp";
import { Sparkline } from "@/components/st/Sparkline";
import { WorldHeatmap } from "@/components/st/WorldHeatmap";
import { cases, sparkline, type RiskLevel } from "@/lib/mock-data";
import { fetchStats, fetchAlerts, type GlobalStats, type BackendAlert } from "@/lib/api";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Operations Dashboard — SatoshiTrace" },
      {
        name: "description",
        content: "Live cryptocurrency crime metrics: transactions analysed, high-risk alerts, syndicates detected and flagged jurisdictions.",
      },
      { property: "og:title", content: "Operations Dashboard — SatoshiTrace" },
      {
        property: "og:description",
        content: "Live forensic metrics across active Bitcoin investigations.",
      },
    ],
  }),
  component: Dashboard,
});

const RISK_STYLE: Record<string, string> = {
  CRITICAL: "bg-critical/20 text-critical ring-critical/40",
  RED: "bg-critical/20 text-critical ring-critical/40",
  HIGH: "bg-signal/20 text-signal ring-signal/40",
  ORANGE: "bg-signal/20 text-signal ring-signal/40",
  MEDIUM: "bg-warn/15 text-warn ring-warn/40",
  YELLOW: "bg-warn/15 text-warn ring-warn/40",
  LOW: "bg-data/15 text-data ring-data/40",
  GREEN: "bg-success/15 text-success ring-success/40",
};

function Card({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <div className="glass animate-rise p-4" style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<GlobalStats>({
    total_transactions_analyzed: 4671,
    high_risk_alerts: 4,
    syndicates_detected: 7,
    countries_flagged: 8,
    active_jobs: 1,
    system_status: "ONLINE_OFFLINE_READY",
    verified_false_positive_rate: "3.2%",
  });
  const [alertsList, setAlertsList] = useState<BackendAlert[]>([]);

  const loadData = async () => {
    try {
      const [s, a] = await Promise.all([fetchStats(), fetchAlerts("default")]);
      setStats(s);
      setAlertsList(a);
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
    <AppShell title="Operations Dashboard" breadcrumb="HOME / NATIONAL CYBER OPS / LIVE METRICS">
      <div className="h-full overflow-y-auto p-5">
        <div className="grid grid-cols-4 gap-4">
          <Card delay={0}>
            <div className="mono-xs text-muted-foreground">Transactions Analysed</div>
            <div className="mt-1 font-mono text-[26px] font-bold text-foreground">
              <CountUp value={stats.total_transactions_analyzed} />
            </div>
            <Sparkline data={sparkline} />
          </Card>

          <Card delay={60}>
            <div className="mono-xs flex items-center gap-2 text-muted-foreground">
              High Risk Alerts
              <span className="animate-pulse-dot h-2 w-2 rounded-full bg-critical text-critical" />
            </div>
            <div className="mt-1 font-mono text-[26px] font-bold text-critical">
              <CountUp value={stats.high_risk_alerts} />
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-success">
              <TrendingUp size={12} /> 3-Model Consensus Red Leads
            </div>
          </Card>

          <Card delay={120}>
            <div className="mono-xs flex items-center gap-2 text-muted-foreground">
              <Network size={12} /> Syndicates Detected
            </div>
            <div className="mt-1 font-mono text-[26px] font-bold text-foreground">
              <CountUp value={stats.syndicates_detected} />
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              Louvain community clustering
            </div>
          </Card>

          <Card delay={180}>
            <div className="mono-xs flex items-center gap-2 text-muted-foreground">
              <Globe2 size={12} /> Validated False Positive Rate
            </div>
            <div className="mt-1 font-mono text-[26px] font-bold text-success">
              {stats.verified_false_positive_rate}
            </div>
            <div className="mono-xs mt-1.5 flex gap-2 text-muted-foreground">
              <span className="rounded bg-muted px-1.5 py-0.5">500+ Whitelisted</span>
              <span className="rounded bg-muted px-1.5 py-0.5">WazirX / Binance</span>
            </div>
          </Card>
        </div>

        <div className="mt-4 grid grid-cols-5 gap-4">
          <div className="glass animate-rise col-span-3 p-4" style={{ animationDelay: "220ms" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileBarChart size={14} className="text-signal" />
                <h2 className="text-[13px] font-semibold tracking-wide">Recent Ingested Cases</h2>
              </div>
              <button
                onClick={() => navigate({ to: "/" })}
                className="mono-xs flex items-center gap-1 text-signal hover:underline"
              >
                Open Graph Explorer <ArrowUpRight size={12} />
              </button>
            </div>
            <table className="mt-3 w-full text-left text-[12px]">
              <thead>
                <tr className="mono-xs text-muted-foreground border-b border-border/50 pb-2">
                  <th className="pb-2 font-normal">Case ID</th>
                  <th className="pb-2 font-normal">Filename</th>
                  <th className="pb-2 font-normal">Time (IST)</th>
                  <th className="pb-2 text-right font-normal">Transactions</th>
                  <th className="pb-2 text-right font-normal">Alerts</th>
                  <th className="pb-2 text-right font-normal">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {cases.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                    <td className="mono-xs py-2.5 font-bold text-foreground">{c.id}</td>
                    <td className="py-2.5 font-mono text-[11px] text-muted-foreground">{c.filename}</td>
                    <td className="py-2.5 text-muted-foreground">{c.uploaded}</td>
                    <td className="mono-xs py-2.5 text-right text-foreground">{c.transactions.toLocaleString()}</td>
                    <td className="mono-xs py-2.5 text-right font-bold text-critical">{c.alerts}</td>
                    <td className="py-2.5 text-right">
                      <span className="mono-xs rounded bg-success/15 px-2 py-0.5 font-semibold text-success ring-1 ring-success/30">
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="glass animate-rise col-span-2 p-4" style={{ animationDelay: "280ms" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert size={14} className="text-critical" />
                <h2 className="text-[13px] font-semibold tracking-wide">Live Threat Feed</h2>
              </div>
              <span className="mono-xs text-muted-foreground">{alertsList.length} Active Leads</span>
            </div>
            <div className="mt-3 space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {alertsList.map((a, idx) => (
                <div
                  key={`${a.address}_${idx}`}
                  onClick={() => navigate({ to: "/" })}
                  className="flex items-center justify-between rounded-md border border-border/40 bg-background/40 p-2.5 text-[12px] hover:border-signal/50 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`mono-xs shrink-0 rounded px-1.5 py-0.5 ring-1 ${RISK_STYLE[a.tier]}`}>
                      {a.tier}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate font-mono text-[11px] text-foreground">{a.address}</div>
                      <div className="text-[10px] text-muted-foreground">{a.primary_tactic}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono text-[11px] font-bold text-critical">{a.risk_score_pct}%</div>
                    <div className="mono-xs text-[10px] text-muted-foreground">{a.country} {a.flag}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <WorldHeatmap />
        </div>
      </div>
    </AppShell>
  );
}
