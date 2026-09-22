import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, ShieldAlert, Pin, CheckCircle2, Download, Copy } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/st/AppShell";
import { getPdfReportUrl } from "@/lib/api";

export const Route = createFileRoute("/investigation")({
  head: () => ({
    meta: [
      { title: "Investigation Workbench — SatoshiTrace" },
      {
        name: "description",
        content: "Active forensic case workspace: correlate wallet clusters, query seized ledgers, and compile court-ready lead packets.",
      },
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

export function InvestigationPage() {
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
    <AppShell title="Investigation Workbench" breadcrumb="HQ / ACTIVE CASE DOSSIER / CBI-2026-0471">
      <div className="h-full overflow-y-auto p-4 space-y-3 font-mono select-none">
        {/* Case Header Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-[#1C232E] bg-[#0D1117] p-3">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded border border-[#1C232E] bg-[#0A0E14] text-xs font-bold text-[#39FF88]">
              CBI
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#E6EDF3]">
                  OPERATION BLACKRIVER — CASE CBI-2026-0471
                </h2>
                <span className="rounded bg-[#FF3B3B]/15 px-2 py-0.2 text-[9px] font-bold text-[#FF3B3B] border border-[#FF3B3B]/30">
                  PRIORITY TASKFORCE
                </span>
              </div>
              <p className="text-[10px] text-[#7D8590] mt-0.5">
                EXAMINER: #8412 • SECTION 65B CERTIFIED • OFF-RAMP LIQUIDATION PROBE
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toast.success("Case notes auto-saved to encrypted local SQLite ledger.")}
              className="flex items-center gap-1.5 rounded border border-[#1C232E] bg-[#0A0E14] px-2.5 py-1 text-xs text-[#7D8590] hover:text-[#E6EDF3] transition-all"
            >
              <CheckCircle2 size={12} className="text-[#39FF88]" />
              <span>SAVE NOTES</span>
            </button>
            <button
              onClick={handleExportCase}
              className="flex items-center gap-1.5 rounded border border-[#39FF88]/40 bg-[#39FF88]/15 px-3 py-1 text-xs font-bold text-[#39FF88] hover:bg-[#39FF88]/25 transition-all"
            >
              <Download size={12} />
              <span>EXPORT CASE BUNDLE</span>
            </button>
          </div>
        </div>

        {/* Search & Identifier Query Bar */}
        <div className="rounded border border-[#1C232E] bg-[#0D1117] p-3 space-y-2">
          <div className="flex items-center justify-between text-[10px]">
            <span className="font-bold text-[#39FF88] uppercase tracking-wider">
              CROSS-LEDGER IDENTIFIER QUERY & CORRELATION ENGINE
            </span>
            <span className="text-[#7D8590] tabular-nums">4,671 TRANSACTIONS INDEXED</span>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7D8590]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Query any seized identifier: wallet address (bc1q...), TXID hash, IP address, ASN..."
                className="h-8 w-full rounded border border-[#1C232E] bg-[#0A0E14] pl-9 pr-3 font-mono text-[11px] text-[#E6EDF3] outline-none placeholder:text-[#7D8590] focus:border-[#39FF88]/50"
              />
            </div>
            <button
              type="submit"
              className="rounded border border-[#39FF88]/40 bg-[#39FF88]/15 px-4 text-xs font-bold text-[#39FF88] hover:bg-[#39FF88]/25 transition-all"
            >
              CORRELATE
            </button>
          </form>

          {/* Search Result Card */}
          {searchResult && (
            <div className="mt-2 rounded border border-[#1C232E] bg-[#0A0E14] p-3 space-y-2 animate-rise">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert size={14} className="text-[#FF3B3B]" />
                  <span className="font-mono text-xs font-bold text-[#E6EDF3] truncate max-w-xl">
                    {searchResult.identifier}
                  </span>
                  <span className="rounded bg-[#FF3B3B]/15 px-1.5 py-0.2 text-[9px] font-bold text-[#FF3B3B] border border-[#FF3B3B]/30">
                    {searchResult.risk}
                  </span>
                </div>
                <button
                  onClick={handlePinCurrent}
                  className="flex items-center gap-1 rounded bg-[#39FF88]/15 px-2 py-0.5 text-[10px] font-semibold text-[#39FF88] border border-[#39FF88]/30 hover:bg-[#39FF88]/25"
                >
                  <Pin size={11} />
                  <span>PIN TO CASE FILE</span>
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10.5px]">
                <div className="rounded bg-[#0D1117] p-2 border border-[#1C232E]">
                  <div className="text-[9px] text-[#7D8590]">TYPE:</div>
                  <div className="font-bold text-[#E6EDF3]">{searchResult.type}</div>
                </div>
                <div className="rounded bg-[#0D1117] p-2 border border-[#1C232E]">
                  <div className="text-[9px] text-[#7D8590]">VOLUME MOVED:</div>
                  <div className="font-bold text-[#FF3B3B] tabular-nums">{searchResult.totalBtc}</div>
                </div>
                <div className="rounded bg-[#0D1117] p-2 border border-[#1C232E]">
                  <div className="text-[9px] text-[#7D8590]">ROUTING ORIGIN:</div>
                  <div className="font-bold text-[#E6EDF3] truncate">{searchResult.asn}</div>
                </div>
                <div className="rounded bg-[#0D1117] p-2 border border-[#1C232E]">
                  <div className="text-[9px] text-[#7D8590]">SYNDICATE CLUSTER:</div>
                  <div className="font-bold text-[#FF9F1C] truncate">{searchResult.cluster}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2-Column Split: Pinned Suspects & Case Notes */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
          {/* Pinned Suspects (3 cols) */}
          <div className="rounded border border-[#1C232E] bg-[#0D1117] p-3.5 space-y-2 lg:col-span-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1C232E]">
              <div className="flex items-center gap-2">
                <Pin size={13} className="text-[#39FF88]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#E6EDF3]">
                  PINNED TARGET ENTITIES ({pinned.length})
                </h3>
              </div>
              <span className="text-[10px] text-[#7D8590]">COURT EXHIBIT QUEUE</span>
            </div>

            <div className="space-y-2">
              {pinned.map((p, idx) => (
                <div
                  key={`${p.address}_${idx}`}
                  className="rounded border border-[#1C232E] bg-[#0A0E14] p-2.5 space-y-1.5 hover:border-[#39FF88]/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-[#E6EDF3]">{p.label}</span>
                      <span className="text-[10px] text-[#7D8590] ml-2">({p.role})</span>
                    </div>
                    <span
                      className={`rounded px-1.5 py-0.2 text-[9px] font-bold ${
                        p.risk === "CRITICAL"
                          ? "bg-[#FF3B3B]/15 text-[#FF3B3B] border border-[#FF3B3B]/30"
                          : "bg-[#FF9F1C]/15 text-[#FF9F1C] border border-[#FF9F1C]/30"
                      }`}
                    >
                      {p.risk}
                    </span>
                  </div>

                  <div className="font-mono text-[10.5px] text-[#7D8590] break-all bg-[#0D1117] p-1.5 rounded border border-[#1C232E]">
                    {p.address}
                  </div>

                  <div className="flex items-center justify-between text-[9.5px] text-[#7D8590] pt-1 border-t border-[#1C232E]">
                    <span>VOLUME: <strong className="text-[#E6EDF3] tabular-nums">{p.volume}</strong></span>
                    <span>TACTIC: <strong className="text-[#E6EDF3]">{p.tactics}</strong></span>
                    <span>PINNED: <strong className="text-[#7D8590] tabular-nums">{p.pinnedAt}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Examiner Notes Notebook (2 cols) */}
          <div className="rounded border border-[#1C232E] bg-[#0D1117] p-3.5 flex flex-col justify-between space-y-2 lg:col-span-2">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[#1C232E]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#E6EDF3]">
                  EXAMINER COURT NARRATIVE
                </h3>
                <span className="text-[10px] text-[#39FF88] font-semibold">● AUTO-SAVED</span>
              </div>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-2 h-72 w-full rounded border border-[#1C232E] bg-[#0A0E14] p-2.5 font-mono text-[11px] text-[#E6EDF3] outline-none focus:border-[#39FF88]/50 resize-none leading-relaxed"
                placeholder="Record forensic observations, evidence chain details, and court testimony narrative..."
              />
            </div>

            <div className="pt-2 border-t border-[#1C232E] flex items-center justify-between text-[10px]">
              <span className="text-[#7D8590]">SECTION 65B(2) COMPLIANT RECORD</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(notes);
                  toast.success("Notes copied to clipboard!");
                }}
                className="flex items-center gap-1 text-[#39FF88] hover:underline"
              >
                <Copy size={11} />
                <span>COPY NOTES</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
export default InvestigationPage;
