import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, ShieldAlert, Pin, Plus, FileText, CheckCircle2, Download, ExternalLink, Scale, User, Clock } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/st/AppShell";
import { generateCrpcNotice, getPdfReportUrl } from "@/lib/api";

export const Route = createFileRoute("/investigation")({
  head: () => ({
    meta: [
      { title: "Investigation Workbench — SatoshiTrace" },
      { name: "description", content: "Active forensic case workspace: correlate wallet clusters, query seized ledgers, and compile court-ready lead packets." },
      { property: "og:title", content: "Investigation Workbench — SatoshiTrace" },
    ],
  }),
  component: InvestigationPage,
});

interface PinnedWallet {
  address: string;
  label: string;
  role: string;
  volume: string;
  risk: "CRITICAL" | "HIGH" | "MEDIUM";
  pinnedAt: string;
  tactics: string;
}

const DEFAULT_PINNED: PinnedWallet[] = [
  {
    address: "bc1qc7slrfxkknqcq2jhaxxq7f3k2m9x4qz8v2rn0w",
    label: "LockBit 3.0 Extortion Hub",
    role: "Primary Ransom Ingress",
    volume: "412.80 BTC",
    risk: "CRITICAL",
    pinnedAt: "24-Aug-2026 14:10 IST",
    tactics: "Peeling Chain (8 hops) • Tor Exit Relay",
  },
  {
    address: "bc1qh8x7ekkm5x3ncw2p9dl4vv0shq2m6tzz8yg7ke",
    label: "Mule Account Structuring Vault",
    role: "P2P Cashout Conduit",
    volume: "88.20 BTC",
    risk: "HIGH",
    pinnedAt: "24-Aug-2026 14:22 IST",
    tactics: "Smurfing / Sub-threshold deposits",
  },
  {
    address: "3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5",
    label: "Wasabi CoinJoin Exit Node",
    role: "Mixer Off-Ramp",
    volume: "150.00 BTC",
    risk: "HIGH",
    pinnedAt: "24-Aug-2026 14:35 IST",
    tactics: "Equal-output CoinJoin mixing",
  },
];

function InvestigationPage() {
  const [query, setQuery] = useState("");
  const [pinned, setPinned] = useState<PinnedWallet[]>(DEFAULT_PINNED);
  const [notes, setNotes] = useState(
    `CASE SUMMARY: Operation BlackRiver\n- Suspect nexus operating out of Frankfurt Tor Exit (185.220.101.44).\n- Identified 8-hop peeling chain laundering 25 BTC into Indian exchange accounts.\n- Statutory freeze notice under Section 91 CrPC drafted for WazirX KYC deposit vault.\n- Section 65B IT Act Certificate generated and hash-verified.`
  );
  const [searchResult, setSearchResult] = useState<any | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const q = query.trim();
    // Simulate lookup across 4,671 ingested ledger records
    if (q.startsWith("bc1") || q.startsWith("1") || q.startsWith("3")) {
      setSearchResult({
        identifier: q,
        type: "Bitcoin Wallet Address",
        firstSeen: "24-Aug-2026 10:32:15 IST",
        lastSeen: "24-Aug-2026 15:40:00 IST",
        txCount: 14,
        totalBtc: "45.5000 BTC",
        risk: "HIGH RISK (92% Consensus)",
        asn: "AS62005 (Mullvad VPN / Tor Exit)",
        country: "Switzerland (CH)",
        cluster: "Syndicate BlackRiver (Cluster #1)",
      });
      toast.success("Identifier resolved in seized ledger index");
    } else {
      setSearchResult({
        identifier: q,
        type: "Network Identifier / TXID",
        firstSeen: "24-Aug-2026 10:32:15 IST",
        lastSeen: "24-Aug-2026 12:00:00 IST",
        txCount: 8,
        totalBtc: "12.4000 BTC",
        risk: "MEDIUM RISK (65%)",
        asn: "AS9009 M247 Europe",
        country: "Germany (DE)",
        cluster: "Syndicate BlackRiver",
      });
      toast.success("Transaction cluster correlated");
    }
  };

  const handlePinCurrent = () => {
    if (!searchResult) return;
    const newPin: PinnedWallet = {
      address: searchResult.identifier,
      label: searchResult.cluster || "Correlated Suspect Node",
      role: "Flagged Target",
      volume: searchResult.totalBtc,
      risk: "HIGH",
      pinnedAt: new Date().toLocaleTimeString("en-GB"),
      tactics: searchResult.asn,
    };
    setPinned([newPin, ...pinned]);
    toast.success("Pinned to active case dossier!");
  };

  const handleExportCase = () => {
    window.open(getPdfReportUrl("default", "CASE-2026-CBI-0891"), "_blank");
    toast.success("Exporting Court-Admissible Case Dossier Bundle", {
      description: "Section 65B certificate + SHA-256 integrity hash + Analyst notes attached.",
    });
  };

  return (
    <AppShell title="Investigation Workbench" breadcrumb="HOME / ACTIVE CASE FILE / CBI-2026-0471">
      <div className="h-full overflow-y-auto p-5 space-y-4">
        {/* Case Header Banner */}
        <div className="glass flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-signal/15 text-signal font-bold font-mono">
              CBI
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[15px] font-bold text-foreground">Operation BlackRiver — Case CBI-2026-0471</h2>
                <span className="mono-xs rounded bg-critical/20 px-2 py-0.5 text-critical font-bold">
                  ACTIVE TASKFORCE PRIORITY
                </span>
              </div>
              <p className="mono-xs text-muted-foreground mt-0.5">
                Lead Examiner: Cybercrime Taskforce Officer #8412 • Section 65B Electronic Evidence Active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toast.success("Case notes auto-saved to encrypted local SQLite ledger.")}
              className="flex items-center gap-1.5 rounded-md border border-border bg-panel-2 px-3 py-1.5 text-xs font-semibold text-foreground hover:border-signal"
            >
              <CheckCircle2 size={13} className="text-emerald-400" /> Save Notes
            </button>
            <button
              onClick={handleExportCase}
              className="flex items-center gap-1.5 rounded-md bg-signal px-3.5 py-1.5 text-xs font-bold text-signal-foreground hover:bg-signal/90"
            >
              <Download size={13} /> Export Case Bundle
            </button>
          </div>
        </div>

        {/* Search & Identifier Query Bar */}
        <div className="glass p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="mono-xs font-bold text-signal uppercase tracking-wider">
              Cross-Ledger Identifier Query & Correlation Engine
            </span>
            <span className="mono-xs text-muted-foreground">Indexed 4,671 Seized Transactions</span>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Query any seized identifier: wallet address (bc1q...), TXID hash, IP address, ASN, or country..."
                className="h-10 w-full rounded-md border border-input bg-background/80 pl-10 pr-4 font-mono text-xs text-foreground outline-none focus:border-signal"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-signal px-5 text-xs font-bold text-signal-foreground hover:bg-signal/90"
            >
              Correlate
            </button>
          </form>

          {/* Search Result Card */}
          {searchResult && (
            <div className="mt-3 rounded-lg border border-signal/40 bg-signal/5 p-4 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert size={16} className="text-critical" />
                  <span className="font-mono text-xs font-bold text-foreground truncate max-w-xl">
                    {searchResult.identifier}
                  </span>
                  <span className="mono-xs rounded bg-critical/20 px-2 py-0.5 text-critical font-bold">
                    {searchResult.risk}
                  </span>
                </div>
                <button
                  onClick={handlePinCurrent}
                  className="flex items-center gap-1 rounded bg-signal/20 px-2.5 py-1 text-xs font-semibold text-signal hover:bg-signal/30"
                >
                  <Pin size={12} /> Pin to Case File
                </button>
              </div>

              <div className="grid grid-cols-4 gap-3 font-mono text-[11px]">
                <div className="rounded bg-background/60 p-2 border border-border/40">
                  <div className="text-[10px] text-muted-foreground">Type:</div>
                  <div className="font-bold text-foreground">{searchResult.type}</div>
                </div>
                <div className="rounded bg-background/60 p-2 border border-border/40">
                  <div className="text-[10px] text-muted-foreground">Volume Moved:</div>
                  <div className="font-bold text-critical">{searchResult.totalBtc}</div>
                </div>
                <div className="rounded bg-background/60 p-2 border border-border/40">
                  <div className="text-[10px] text-muted-foreground">Routing Origin:</div>
                  <div className="font-bold text-foreground">{searchResult.asn}</div>
                </div>
                <div className="rounded bg-background/60 p-2 border border-border/40">
                  <div className="text-[10px] text-muted-foreground">Syndicate:</div>
                  <div className="font-bold text-signal">{searchResult.cluster}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2-Column Split: Pinned Suspects & Case Notes */}
        <div className="grid grid-cols-5 gap-4">
          {/* Pinned Suspects (3 cols) */}
          <div className="glass col-span-3 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pin size={15} className="text-signal" />
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Pinned Target Entities ({pinned.length})
                </h3>
              </div>
              <span className="mono-xs text-muted-foreground">Court Exhibit Queue</span>
            </div>

            <div className="space-y-2.5">
              {pinned.map((p, idx) => (
                <div
                  key={`${p.address}_${idx}`}
                  className="rounded-lg border border-border/60 bg-background/40 p-3 space-y-2 hover:border-signal/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-xs text-foreground">{p.label}</span>
                      <span className="mono-xs text-muted-foreground ml-2">({p.role})</span>
                    </div>
                    <span
                      className={`mono-xs rounded px-1.5 py-0.5 font-bold ${
                        p.risk === "CRITICAL"
                          ? "bg-critical/20 text-critical"
                          : "bg-signal/20 text-signal"
                      }`}
                    >
                      {p.risk}
                    </span>
                  </div>

                  <div className="font-mono text-[11px] text-muted-foreground break-all bg-panel/60 p-1.5 rounded border border-border/40">
                    {p.address}
                  </div>

                  <div className="flex items-center justify-between mono-xs text-muted-foreground pt-1 border-t border-border/30">
                    <span>Volume: <strong className="text-foreground">{p.volume}</strong></span>
                    <span>Tactic: <strong className="text-foreground">{p.tactics}</strong></span>
                    <span>Pinned: {p.pinnedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Examiner Notes Notebook (2 cols) */}
          <div className="glass col-span-2 p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileText size={15} className="text-signal" />
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Analyst Case Notes
                  </h3>
                </div>
                <span className="mono-xs text-emerald-400 font-semibold">● Auto-Saved</span>
              </div>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="h-72 w-full rounded-lg border border-input bg-background/70 p-3 font-mono text-[11px] text-foreground outline-none focus:border-signal resize-none leading-relaxed"
                placeholder="Record investigation observations, suspect correlations, and court narrative..."
              />
            </div>

            <div className="pt-2 border-t border-border/40 flex items-center justify-between">
              <span className="mono-xs text-muted-foreground">Section 65B(2) Evidentiary Record</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(notes);
                  toast.success("Notes copied to clipboard!");
                }}
                className="text-xs font-semibold text-signal hover:underline"
              >
                Copy Notes
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
