import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Bell,
  FileText,
  Gauge,
  Network,
  Search,
  Settings,
  Shield,
  TimerReset,
} from "lucide-react";
import { ReticleLogo } from "./Logo";
import { fetchStats } from "@/lib/api";

const NAV_BASE = [
  { to: "/dashboard", label: "Dashboard", icon: Gauge },
  { to: "/investigation", label: "Investigation", icon: Search },
  { to: "/", label: "Graph Explorer", icon: Network },
  { to: "/alerts", label: "Alert Queue", icon: Bell, badgeKey: "alerts" as const },
  { to: "/timeline", label: "Timeline Replay", icon: TimerReset },
  { to: "/reports", label: "Evidence Reports", icon: FileText },
  { to: "/whitelist", label: "Whitelist Manager", icon: Shield },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [alertCount, setAlertCount] = useState<number | null>(null);

  useEffect(() => {
    fetchStats()
      .then((stats) => setAlertCount(stats.high_risk_alerts))
      .catch(() => setAlertCount(null));

    const refresh = () =>
      fetchStats()
        .then((stats) => setAlertCount(stats.high_risk_alerts))
        .catch(() => {});

    window.addEventListener("satoshitrace-refresh", refresh);
    return () => window.removeEventListener("satoshitrace-refresh", refresh);
  }, []);

  return (
    <aside className="flex h-full w-[240px] shrink-0 flex-col border-r border-border bg-panel">
      <div className="flex items-center gap-3 px-4 py-4">
        <div className="relative grid place-items-center h-10 w-10 shrink-0 rounded-xl overflow-hidden ring-1 ring-signal/40 shadow-[0_0_15px_rgba(56,189,248,0.25)] bg-black">
          <img
            src="/satoshi_command_seal.jpg"
            alt="National Cyber Command Seal"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <div className="text-[14.5px] font-bold tracking-[0.14em] text-foreground">
            SATOSHITRACE
          </div>
          <div className="mono-xs mt-0.5 text-signal font-semibold text-[10px]">
            CBI / LEA FORENSIC INTEL
          </div>
        </div>
      </div>

      <div className="mx-4 h-px bg-border" />

      <nav className="mt-3 flex-1 space-y-0.5 px-2">
        {NAV_BASE.map((item) => {
          const active = pathname === item.to;
          const Icon = item.icon;
          const badge = "badgeKey" in item && item.badgeKey === "alerts" && alertCount !== null
            ? alertCount.toString()
            : null;
          return (
            <Link
              key={item.label}
              to={item.to}
              className={[
                "group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-[13px] transition-colors duration-150",
                active
                  ? "bg-panel-2 text-foreground"
                  : "text-muted-foreground hover:bg-panel-2/60 hover:text-foreground",
              ].join(" ")}
            >
              {active && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-signal shadow-[0_0_10px_var(--signal)]" />
              )}
              <Icon
                size={16}
                className={
                  active
                    ? "text-signal drop-shadow-[0_0_6px_var(--signal)]"
                    : "text-muted-foreground group-hover:text-foreground"
                }
              />
              <span className="flex-1 truncate">{item.label}</span>
              {badge && (
                <span className="rounded-full bg-critical/20 px-1.5 py-0.5 font-mono text-[10px] font-bold text-critical ring-1 ring-critical/40">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1.5 border-t border-border px-4 py-3">
        <div className="flex items-center gap-2 text-[12px] text-foreground">
          <span className={`animate-pulse-dot h-2 w-2 rounded-full ${alertCount !== null ? "bg-success" : "bg-muted-foreground"}`} />
          {alertCount !== null ? "Backend Online" : "System Offline-Ready"}
        </div>
        <div className="mono-xs leading-relaxed text-muted-foreground">
          SQLite • NetworkX
          <br />
          IsolationForest • PyGOD
        </div>
        <div className="mono-xs text-muted-foreground/70">v1.0.0 • SatoshiTrace</div>
      </div>
    </aside>
  );
}
