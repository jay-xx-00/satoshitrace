import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Eye, FileText, Flag, ShieldAlert } from "lucide-react";
import { alertRows as defaultAlertRows, type AlertRow } from "@/lib/graph-data";
import { fetchAlerts, type BackendAlert } from "@/lib/api";

const CHIPS = ["High", "Medium", "Low", "Peeling Chain", "CoinJoin", "Smurfing", "LockBit"] as const;

function Consensus({ value }: { value: number }) {
  const c = 2 * Math.PI * 12;
  const color = value >= 75 ? "var(--critical)" : value >= 45 ? "var(--warn)" : "var(--success)";
  return (
    <span className="relative inline-grid h-8 w-8 place-items-center">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 28 28">
        <circle cx="14" cy="14" r="12" fill="none" stroke="var(--muted)" strokeWidth="2.5" />
        <circle
          cx="14"
          cy="14"
          r="12"
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={`${(value / 100) * c} ${c}`}
        />
      </svg>
      <span className="font-mono text-[9px] text-foreground">{value}</span>
    </span>
  );
}

export function AlertDrawer({ onFocus }: { onFocus: (nodeId: string) => void }) {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<string[]>([]);
  const [alerts, setAlerts] = useState<AlertRow[]>(defaultAlertRows);

  const loadAlerts = async () => {
    try {
      const live = await fetchAlerts("default");
      if (live && live.length > 0) {
        const mapped: AlertRow[] = live.map((a, i) => ({
          id: `AL-${9000 + i}`,
          nodeId: a.address.startsWith("bc1qc7") ? "s1" : a.address.startsWith("bc1qh8") ? "s2" : a.address.startsWith("3FZb") ? "s3" : `live-${i}`,
          risk: a.tier === "RED" ? "HIGH" : a.tier === "ORANGE" ? "MEDIUM" : "LOW",
          wallet: a.address.slice(0, 18) + (a.address.length > 18 ? "..." : ""),
          consensus: a.risk_score_pct,
          country: a.country || "IN",
          asn: a.asn.slice(0, 16),
          tactic: a.primary_tactic.includes("Peel") ? "Peeling Chain" : a.primary_tactic.includes("CoinJoin") ? "CoinJoin" : "Smurfing",
          time: new Date().toLocaleTimeString("en-GB", { hour12: false }),
          status: a.review_status === "CONFIRM" ? "ESCALATED" : a.review_status === "DISMISS" ? "REVIEW" : "OPEN",
        }));
        setAlerts(mapped);
      }
    } catch {
      // Keep default fallback
    }
  };

  useEffect(() => {
    loadAlerts();
    const handleRefresh = () => loadAlerts();
    window.addEventListener("satoshitrace-refresh", handleRefresh);
    return () => window.removeEventListener("satoshitrace-refresh", handleRefresh);
  }, []);

  const toggle = (chip: string) =>
    setFilters((f) => (f.includes(chip) ? f.filter((x) => x !== chip) : [...f, chip]));

  const rows = alerts.filter((r) => {
    if (filters.length === 0) return true;
    return filters.some(
      (f) => f.toUpperCase() === r.risk || f === r.tactic,
    );
  });

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex flex-col items-center">
      <button
        onClick={() => setOpen((o) => !o)}
        className="glass pointer-events-auto mb-[-1px] flex items-center gap-1.5 rounded-t-md border border-b-0 border-border/70 px-4 py-1.5 text-[11px] text-foreground hover:text-signal"
      >
        {open ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
        {open ? "Hide Threat Queue" : "Show Prioritized Threat Leads"}
        <span className="mono-xs rounded bg-critical/20 px-1.5 py-0.5 text-critical font-bold">
          {alerts.length} Leads
        </span>
      </button>

      {open && (
        <div className="pointer-events-auto max-h-[46vh] w-full overflow-auto border-t border-border bg-panel/95 backdrop-blur">
          <div className="flex flex-wrap gap-2 border-b border-border px-4 py-2.5">
            {CHIPS.map((chip) => {
              const active = filters.includes(chip);
              return (
                <button
                  key={chip}
                  onClick={() => toggle(chip)}
                  className={[
                    "rounded-full border px-2.5 py-1 text-[10.5px] transition-colors",
                    active
                      ? "border-signal bg-signal/15 text-signal font-bold"
                      : "border-border text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  {chip}
                </button>
              );
            })}
          </div>

          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="mono-xs text-muted-foreground">
                {["Risk Tier", "Wallet Address", "Consensus", "Country", "Relay ASN", "Primary Tactic", "Time (IST)", "Review Status", "Action"].map((h) => (
                  <th key={h} className="whitespace-nowrap border-b border-border px-4 py-2 font-normal">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={`${r.id}_${r.wallet}_${i}`}
                  onClick={() => onFocus(r.nodeId)}
                  className="animate-slide-right group cursor-pointer border-b border-border/60 hover:bg-muted/40 transition-colors"
                >
                  <td className="px-4 py-2">
                    <span
                      className={`mono-xs rounded px-1.5 py-0.5 font-bold ring-1 ${
                        r.risk === "HIGH"
                          ? "bg-critical/20 text-critical ring-critical/40"
                          : r.risk === "MEDIUM"
                            ? "bg-signal/20 text-signal ring-signal/40"
                            : "bg-data/15 text-data ring-data/40"
                      }`}
                    >
                      {r.risk}
                    </span>
                  </td>
                  <td className="px-4 py-2 font-mono text-[11.5px] font-bold text-foreground">
                    {r.wallet}
                  </td>
                  <td className="px-4 py-2">
                    <Consensus value={r.consensus} />
                  </td>
                  <td className="px-4 py-2 text-[11.5px] text-muted-foreground">{r.country}</td>
                  <td className="px-4 py-2 font-mono text-[10.5px] text-muted-foreground">{r.asn}</td>
                  <td className="px-4 py-2 text-[11.5px] font-semibold text-foreground">{r.tactic}</td>
                  <td className="px-4 py-2 font-mono text-[10.5px] text-muted-foreground">{r.time}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`mono-xs rounded px-1.5 py-0.5 ${
                        r.status === "ESCALATED"
                          ? "bg-success/20 text-success font-bold"
                          : r.status === "REVIEW"
                            ? "bg-warn/20 text-warn"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onFocus(r.nodeId);
                      }}
                      className="text-signal opacity-70 group-hover:opacity-100 hover:underline text-[11px] font-semibold flex items-center gap-1"
                    >
                      <Eye size={12} /> Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
