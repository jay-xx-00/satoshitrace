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
  PanelLeftClose,
  PanelLeftOpen,
  Activity,
} from "lucide-react";
import { fetchStats } from "@/lib/api";

const NAV_BASE = [
  { to: "/dashboard", label: "Dashboard", code: "DASH", icon: Gauge },
  { to: "/investigation", label: "Investigation", code: "INVS", icon: Search },
  { to: "/", label: "Graph Explorer", code: "TOPO", icon: Network },
  { to: "/alerts", label: "Threat Leads", code: "ALRT", icon: Bell, badgeKey: "alerts" as const },
  { to: "/timeline", label: "Fund Timeline", code: "TIME", icon: TimerReset },
  { to: "/reports", label: "Sec 65B Dossiers", code: "REPT", icon: FileText },
  { to: "/whitelist", label: "Exchange Reg", code: "WHTL", icon: Shield },
  { to: "/settings", label: "System Config", code: "CFG", icon: Settings },
] as const;

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [alertCount, setAlertCount] = useState<number | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

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
    <aside
      className={`flex h-full shrink-0 flex-col border-r border-[#1C232E] bg-[#0D1117] transition-all duration-200 select-none ${
        isCollapsed ? "w-[58px]" : "w-[220px]"
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-[#1C232E]">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative grid place-items-center h-7 w-7 shrink-0 rounded border border-[#1C232E] bg-[#0A0E14] overflow-hidden">
              <img
                src="/satoshi_command_seal.jpg"
                alt="Command Seal"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="text-[12px] font-mono font-bold tracking-widest text-[#E6EDF3] leading-none">
                SATOSHITRACE
              </div>
              <div className="text-[9px] font-mono text-[#39FF88] tracking-wider mt-0.5">
                CBI FORENSIC CORE
              </div>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="mx-auto grid place-items-center h-7 w-7 rounded border border-[#1C232E] bg-[#0A0E14] overflow-hidden">
            <img
              src="/satoshi_command_seal.jpg"
              alt="Command Seal"
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {!isCollapsed && (
          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            className="rounded p-1 text-[#7D8590] hover:text-[#E6EDF3] hover:bg-[#1C232E]/60 transition-colors"
            title="Collapse Sidebar"
          >
            <PanelLeftClose size={14} />
          </button>
        )}
      </div>

      {isCollapsed && (
        <div className="py-2 flex justify-center border-b border-[#1C232E]">
          <button
            type="button"
            onClick={() => setIsCollapsed(false)}
            className="rounded p-1 text-[#7D8590] hover:text-[#E6EDF3] hover:bg-[#1C232E]/60 transition-colors"
            title="Expand Sidebar"
          >
            <PanelLeftOpen size={14} />
          </button>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="mt-2 flex-1 space-y-0.5 px-2">
        {NAV_BASE.map((item) => {
          const active = pathname === item.to;
          const Icon = item.icon;
          const badge =
            "badgeKey" in item && item.badgeKey === "alerts" && alertCount !== null
              ? alertCount.toString()
              : null;

          return (
            <Link
              key={item.label}
              to={item.to}
              title={isCollapsed ? item.label : undefined}
              className={[
                "group relative flex items-center rounded px-2.5 py-2 text-xs font-mono transition-all",
                isCollapsed ? "justify-center" : "gap-2.5",
                active
                  ? "bg-[#1C232E]/70 text-[#E6EDF3] font-semibold border-l-2 border-[#39FF88]"
                  : "text-[#7D8590] hover:bg-[#1C232E]/40 hover:text-[#E6EDF3]",
              ].join(" ")}
            >
              <Icon
                size={15}
                className={
                  active
                    ? "text-[#39FF88] shrink-0"
                    : "text-[#7D8590] group-hover:text-[#E6EDF3] shrink-0"
                }
              />
              {!isCollapsed && <span className="flex-1 truncate tracking-wide text-[11.5px]">{item.label}</span>}
              {!isCollapsed && badge && (
                <span className="rounded bg-[#FF3B3B]/15 px-1.5 py-0.2 font-mono text-[9px] font-bold tabular-nums text-[#FF3B3B] border border-[#FF3B3B]/30">
                  {badge}
                </span>
              )}
              {isCollapsed && badge && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[#FF3B3B]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Defense Telemetry Card */}
      <div className="border-t border-[#1C232E] p-2.5 font-mono text-[10px]">
        {!isCollapsed ? (
          <div className="space-y-1 rounded border border-[#1C232E] bg-[#0A0E14] p-2">
            <div className="flex items-center justify-between">
              <span className="text-[#7D8590] text-[9px] uppercase tracking-wider">DEFENSE OS</span>
              <span className="flex items-center gap-1 text-[#39FF88] text-[9.5px] font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-[#39FF88] animate-pulse" />
                ONLINE
              </span>
            </div>
            <div className="text-[#7D8590] text-[9px] tabular-nums">
              GRAPH: 42 NODES • 68 EDGES
            </div>
            <div className="text-[#7D8590] text-[9px]">
              ENGINE: ISO-FOREST // GAT
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title="Defense Air-Gap Online">
            <span className="h-2 w-2 rounded-full bg-[#39FF88] animate-pulse shadow-[0_0_6px_#39FF88]" />
          </div>
        )}
      </div>
    </aside>
  );
}
