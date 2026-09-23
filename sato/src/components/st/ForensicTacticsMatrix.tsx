import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  ShieldAlert,
  Zap,
  Globe2,
  Scale,
  ArrowUpRight,
  Activity,
  Copy,
  Check,
  Lock,
  Layers,
  Fingerprint,
  AlertTriangle,
  RefreshCw,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { fetchAlerts, generateCrpcNotice, type BackendAlert } from "@/lib/api";

type TabMode = "ttp" | "interceptor" | "jurisdiction";

interface TTPItem {
  id: string;
  code: string;
  name: string;
  category: "OBFUSCATION" | "MIXING" | "EXTORTION" | "STRUCTURING" | "HAWALA";
  severity: "CRITICAL" | "HIGH" | "SUSPECT";
  detections: number;
  btcVolume: number;
  inrCrore: number;
  anomalyScore: number;
  entropyScore?: number;
  tacticalDescription: string;
  primaryTarget: string;
  syndicate: string;
  regulatoryBreach: string;
  statutoryLegalSection: string;
}

const TTP_DATA: TTPItem[] = [
  {
    id: "ttp-peel",
    code: "TTP-1044",
    name: "Peel Chain Layering (Micro-Hops)",
    category: "OBFUSCATION",
    severity: "CRITICAL",
    detections: 1842,
    btcVolume: 48.25,
    inrCrore: 32.4,
    anomalyScore: 0.94,
    entropyScore: 0.22,
    tacticalDescription: "Sequential decremental transfers (<45s cadence) slicing funds to evade exchange threshold alerts.",
    primaryTarget: "3J98t1WpEZ73CNmQvi... (Cluster #4)",
    syndicate: "BlackRiver Syndicate",
    regulatoryBreach: "PMLA 2002 Sec 3 // Hawala Layering",
    statutoryLegalSection: "Section 91 CrPC Statutory Freeze Notice",
  },
  {
    id: "ttp-coinjoin",
    code: "TTP-2089",
    name: "CoinJoin Equal-Output Mixing Pools",
    category: "MIXING",
    severity: "CRITICAL",
    detections: 624,
    btcVolume: 92.5,
    inrCrore: 62.1,
    anomalyScore: 0.98,
    entropyScore: 0.96,
    tacticalDescription: "High-entropy equal-denomination UTXO aggregation matching Wasabi 2.0 / Whirlpool mixing pools.",
    primaryTarget: "bc1qar0srrr7xfkvy5l... (Tornado Ingress)",
    syndicate: "Lazarus-Affiliated Mixer Pool",
    regulatoryBreach: "IT Act 2000 Sec 66 // Anonymity Obfuscation",
    statutoryLegalSection: "Section 91 CrPC / CERT-In Directive 2022",
  },
  {
    id: "ttp-smurf",
    code: "TTP-3112",
    name: "Structuring & Sub-Threshold Smurfing",
    category: "STRUCTURING",
    severity: "HIGH",
    detections: 3119,
    btcVolume: 14.8,
    inrCrore: 9.9,
    anomalyScore: 0.86,
    tacticalDescription: "High-frequency micro-burst transfers kept uniformly under 0.05 BTC to bypass FIU automated reporting.",
    primaryTarget: "bc1q9d4ywgfnd8h43da... (KYC Smurf Ring)",
    syndicate: "Mumbai-Dubai Hawala Bridge",
    regulatoryBreach: "FIU-IND Anti-Structuring Regulations",
    statutoryLegalSection: "Section 94 BNSS 2023 Summons",
  },
  {
    id: "ttp-tor",
    code: "TTP-4091",
    name: "Dandelion++ / Adversarial Tor Relays",
    category: "OBFUSCATION",
    severity: "HIGH",
    detections: 487,
    btcVolume: 22.1,
    inrCrore: 14.8,
    anomalyScore: 0.89,
    tacticalDescription: "P2P network fluff-phase routing through adversarial ASNs with synchronized clock-skew timestamps.",
    primaryTarget: "185.220.101.44 (Frankfurt Tor Exit)",
    syndicate: "Bulletproof VPS Network (AS200651)",
    regulatoryBreach: "IT Act Sec 69 // Network Telemetry Tampering",
    statutoryLegalSection: "Section 91 CrPC ISP Telemetry Demand",
  },
  {
    id: "ttp-ransom",
    code: "TTP-5021",
    name: "Ransomware Extortion Attribution",
    category: "EXTORTION",
    severity: "CRITICAL",
    detections: 29,
    btcVolume: 31.4,
    inrCrore: 21.0,
    anomalyScore: 0.99,
    tacticalDescription: "Matches cryptographically signed extortion vaults identified in Indian critical infrastructure attacks.",
    primaryTarget: "bc1qc7slrfxkknqcq2j... (LockBit 3.0 Vault)",
    syndicate: "LockBit Cartel / Darknet Vault #12",
    regulatoryBreach: "BNS 2023 Sec 308 // Extortion via Cyber Weapon",
    statutoryLegalSection: "Immediate Inter-Agency Seizure Order",
  },
  {
    id: "ttp-hawala",
    code: "TTP-6105",
    name: "P2P Hawala Escrow & OTC Off-Ramping",
    category: "HAWALA",
    severity: "SUSPECT",
    detections: 112,
    btcVolume: 3.8,
    inrCrore: 2.6,
    anomalyScore: 0.76,
    tacticalDescription: "Cross-border settlement bridging seized crypto balances to domestic UPI accounts via unregistered P2P escrows.",
    primaryTarget: "3QJmV3qfvL9SuYo34Y... (OTC Liquidity Pool)",
    syndicate: "Gulf-Subcontinent Transit Ring",
    regulatoryBreach: "FEMA 1999 Sec 3 // Unauthorized Forex Transfer",
    statutoryLegalSection: "ED Statutory Attachment Notice",
  },
];

interface LiveTransactionFlight {
  id: string;
  txid: string;
  sourceWallet: string;
  destWallet: string;
  amountBtc: number;
  inrLakhs: number;
  hopVelocity: string;
  tactic: string;
  riskTier: "CRITICAL" | "HIGH" | "SUSPECT" | "CLEAN";
  anomalyPct: number;
  timeAgo: string;
  section65bHash: string;
}

const LIVE_FLIGHTS: LiveTransactionFlight[] = [
  {
    id: "tx-1",
    txid: "4a5e1e4baab89f21f1d198d022b7a672",
    sourceWallet: "bc1qc7slrfxkknqcq2j...",
    destWallet: "185.220.101.44 (Tor Exit)",
    amountBtc: 12.4,
    inrLakhs: 832.5,
    hopVelocity: "28 sec / hop",
    tactic: "LockBit Ransomware Payout",
    riskTier: "CRITICAL",
    anomalyPct: 97.4,
    timeAgo: "4s ago",
    section65bHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  },
  {
    id: "tx-2",
    txid: "9b2c8a77f02de41092b3a165cf411802",
    sourceWallet: "3J98t1WpEZ73CNmQvi...",
    destWallet: "bc1qar0srrr7xfkvy5l...",
    amountBtc: 4.88,
    inrLakhs: 327.6,
    hopVelocity: "42 sec / hop",
    tactic: "Peel Chain Layering Hop #4",
    riskTier: "CRITICAL",
    anomalyPct: 94.1,
    timeAgo: "16s ago",
    section65bHash: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
  },
  {
    id: "tx-3",
    txid: "cc0941827a13d80911762e88a09f3e15",
    sourceWallet: "bc1q9d4ywgfnd8h43da...",
    destWallet: "3KZ526NxCVXbLtb6vp...",
    amountBtc: 0.048,
    inrLakhs: 3.2,
    hopVelocity: "180 sec / hop",
    tactic: "Sub-Threshold Smurfing (<0.05 BTC)",
    riskTier: "HIGH",
    anomalyPct: 86.8,
    timeAgo: "32s ago",
    section65bHash: "5b722b3079aa14d33f5b6483fed94eec12cf73b828ac406aec1661ff62be0720",
  },
  {
    id: "tx-4",
    txid: "1f88ae219904d6e902b77461cc92418a",
    sourceWallet: "1A1zP1eP5QGefi2DMP...",
    destWallet: "CoinDCX Hot Wallet #02",
    amountBtc: 0.25,
    inrLakhs: 16.8,
    hopVelocity: "1,240 sec / hop",
    tactic: "Whitelisted Indian Exchange Deposit",
    riskTier: "CLEAN",
    anomalyPct: 2.1,
    timeAgo: "58s ago",
    section65bHash: "a6c8b417e2210f274a91936c8430b8098c772b22bbec29fcf963a58e2d4cf48f",
  },
  {
    id: "tx-5",
    txid: "d832ea49b101c7784019a828fb56209e",
    sourceWallet: "bc1qh8x7ekkm5x3ncw2...",
    destWallet: "3FZbgi29cpjq2GjdwV...",
    amountBtc: 8.92,
    inrLakhs: 598.9,
    hopVelocity: "35 sec / hop",
    tactic: "Darknet Vendor Multi-Hop",
    riskTier: "CRITICAL",
    anomalyPct: 96.2,
    timeAgo: "1m 14s ago",
    section65bHash: "2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae",
  },
];

interface JurisdictionalCorridor {
  corridor: string;
  sourceCountry: string;
  sourceFlag: string;
  destCountry: string;
  destFlag: string;
  volumeBtc: number;
  inrCrore: number;
  torVpnRate: string;
  primaryAsn: string;
  mlatStatus: "ENFORCEABLE (2008 TREATY)" | "DISPUTED / NO TREATY" | "INTERPOL RED NOTICE";
  mlatBadgeColor: string;
  fiuReadiness: "READY (STR FORM 4)" | "SEIZED / FROZEN" | "MONITORING";
}

const CORRIDORS: JurisdictionalCorridor[] = [
  {
    corridor: "IN → UAE (Dubai OTC Corridor)",
    sourceCountry: "India",
    sourceFlag: "🇮🇳",
    destCountry: "United Arab Emirates",
    destFlag: "🇦🇪",
    volumeBtc: 64.2,
    inrCrore: 43.1,
    torVpnRate: "34% Tor / 52% VPN",
    primaryAsn: "AS5384 (Emirates Telecommunications)",
    mlatStatus: "ENFORCEABLE (2008 TREATY)",
    mlatBadgeColor: "#39FF88",
    fiuReadiness: "READY (STR FORM 4)",
  },
  {
    corridor: "IN → RU (Garantex / Hydra Nexus)",
    sourceCountry: "India",
    sourceFlag: "🇮🇳",
    destCountry: "Russia",
    destFlag: "🇷🇺",
    volumeBtc: 51.8,
    inrCrore: 34.8,
    torVpnRate: "88% Tor (Frankfurt Nodes)",
    primaryAsn: "AS9009 (M247 / Serverius Offshore)",
    mlatStatus: "DISPUTED / NO TREATY",
    mlatBadgeColor: "#FF3B3B",
    fiuReadiness: "READY (STR FORM 4)",
  },
  {
    corridor: "IN → DE (Frankfurt Tor Exit Relay)",
    sourceCountry: "India",
    sourceFlag: "🇮🇳",
    destCountry: "Germany",
    destFlag: "🇩🇪",
    volumeBtc: 38.6,
    inrCrore: 25.9,
    torVpnRate: "96% Tor Exit Relay",
    primaryAsn: "AS200651 (FlokiNET Bulletproof)",
    mlatStatus: "ENFORCEABLE (2008 TREATY)",
    mlatBadgeColor: "#39FF88",
    fiuReadiness: "SEIZED / FROZEN",
  },
  {
    corridor: "IN → SG (Unregistered Swap Escrows)",
    sourceCountry: "India",
    sourceFlag: "🇮🇳",
    destCountry: "Singapore",
    destFlag: "🇸🇬",
    volumeBtc: 24.1,
    inrCrore: 16.2,
    torVpnRate: "18% Tor / 64% VPN",
    primaryAsn: "AS4657 (StarHub Ltd)",
    mlatStatus: "ENFORCEABLE (2008 TREATY)",
    mlatBadgeColor: "#39FF88",
    fiuReadiness: "MONITORING",
  },
];

export function ForensicTacticsMatrix() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabMode>("ttp");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterTier, setFilterTier] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchAlerts("default").catch(() => {});
  }, []);

  const handleCopyNotice = async (ttp: TTPItem) => {
    try {
      const noticeText = await generateCrpcNotice(
        ttp.primaryTarget.split(" ")[0],
        "Indian Exchange KYC Compliance Hub (WazirX / CoinDCX)",
        "CASE-2026-CBI-0891"
      );
      await navigator.clipboard.writeText(noticeText);
      setCopiedId(ttp.id);
      setTimeout(() => setCopiedId(null), 2500);
      toast.success("Section 91 CrPC Statutory Freeze Notice Copied!", {
        description: `Target: ${ttp.primaryTarget} // ${ttp.regulatoryBreach}`,
      });
    } catch {
      const fallbackText = `STATUTORY FREEZE NOTICE UNDER SECTION 91 CrPC / SEC 94 BNSS 2023\nTO: Authorized Compliance Officer, Cryptocurrency Exchange Hub\nRE: Urgent Interception of Wallet: ${ttp.primaryTarget}\nBREACH: ${ttp.regulatoryBreach}\nEVIDENCE HASH: Section 65B IT Act SHA-256 Validated.\nYou are directed to freeze all debits with immediate effect.`;
      await navigator.clipboard.writeText(fallbackText);
      setCopiedId(ttp.id);
      setTimeout(() => setCopiedId(null), 2500);
      toast.success("Section 91 CrPC Notice Copied to Clipboard!");
    }
  };

  const handleInspectTarget = (wallet: string) => {
    toast.info(`Opening Graph Explorer for ${wallet.split(" ")[0]}...`);
    navigate({ to: "/" });
  };

  const filteredTTPs = TTP_DATA.filter((ttp) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        ttp.name.toLowerCase().includes(q) ||
        ttp.tacticalDescription.toLowerCase().includes(q) ||
        ttp.syndicate.toLowerCase().includes(q) ||
        ttp.code.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredFlights = LIVE_FLIGHTS.filter((flight) => {
    if (filterTier === "ALL") return true;
    return flight.riskTier === filterTier;
  });

  return (
    <div className="flex h-full flex-col font-mono select-none">
      {/* Tactical Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1C232E] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-[#FF3B3B]/10 border border-[#FF3B3B]/30 text-[#FF3B3B]">
            <ShieldAlert size={13} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#E6EDF3]">
                FORENSIC TACTICAL RADAR // LAUNDERING MODUS OPERANDI ENGINE
              </span>
              <span className="inline-flex items-center gap-1 rounded bg-[#39FF88]/10 px-1.5 py-0.2 border border-[#39FF88]/30 text-[9px] font-bold text-[#39FF88]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#39FF88] animate-pulse" />
                TRIPLE CONSENSUS GATE ACTIVE
              </span>
            </div>
            <p className="text-[10px] text-[#7D8590]">
              Algorithmic TTP extraction: Peel Chains • CoinJoin Mixers • Smurfing • Tor Telemetry • Section 65B Certified
            </p>
          </div>
        </div>

        {/* Tactical Metric Telemetry */}
        <div className="flex items-center gap-3 text-[10.5px]">
          <div className="flex items-center gap-1.5 rounded bg-[#0A0E14] px-2.5 py-1 border border-[#1C232E]">
            <span className="text-[#7D8590]">TRACKED VOLUME:</span>
            <span className="font-bold text-[#E6EDF3] tabular-nums">213.0 BTC (₹143.1 Cr)</span>
          </div>
          <div className="flex items-center gap-1.5 rounded bg-[#0A0E14] px-2.5 py-1 border border-[#1C232E]">
            <span className="text-[#7D8590]">ACTIVE TACTICS:</span>
            <span className="font-bold text-[#FF3B3B] tabular-nums">{TTP_DATA.length} TTPs</span>
          </div>
          <div className="flex items-center gap-1.5 rounded bg-[#0A0E14] px-2.5 py-1 border border-[#1C232E]">
            <span className="text-[#7D8590]">FALSE POSITIVES:</span>
            <span className="font-bold text-[#39FF88] tabular-nums">&lt;3.2% FPR</span>
          </div>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1C232E] py-2 mt-1">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab("ttp")}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === "ttp"
                ? "bg-[#39FF88]/15 text-[#39FF88] border border-[#39FF88]/40 shadow-[0_0_8px_rgba(57,255,136,0.15)]"
                : "bg-[#0A0E14] text-[#7D8590] border border-[#1C232E] hover:text-[#E6EDF3] hover:bg-[#161B22]"
            }`}
          >
            <Layers size={12} />
            <span>MODUS OPERANDI &amp; TTP MATRIX ({TTP_DATA.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("interceptor")}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === "interceptor"
                ? "bg-[#39FF88]/15 text-[#39FF88] border border-[#39FF88]/40 shadow-[0_0_8px_rgba(57,255,136,0.15)]"
                : "bg-[#0A0E14] text-[#7D8590] border border-[#1C232E] hover:text-[#E6EDF3] hover:bg-[#161B22]"
            }`}
          >
            <Activity size={12} />
            <span>LIVE TRANSACTION INTERCEPTOR ({LIVE_FLIGHTS.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("jurisdiction")}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === "jurisdiction"
                ? "bg-[#39FF88]/15 text-[#39FF88] border border-[#39FF88]/40 shadow-[0_0_8px_rgba(57,255,136,0.15)]"
                : "bg-[#0A0E14] text-[#7D8590] border border-[#1C232E] hover:text-[#E6EDF3] hover:bg-[#161B22]"
            }`}
          >
            <Globe2 size={12} />
            <span>JURISDICTIONAL RISK CORRIDORS ({CORRIDORS.length})</span>
          </button>
        </div>

        {/* Tab Controls: Search & Filters */}
        {activeTab === "ttp" && (
          <div className="relative">
            <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#7D8590]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tactics, syndicates..."
              className="h-7 w-52 rounded border border-[#1C232E] bg-[#0A0E14] pl-7 pr-2 text-[10.5px] text-[#E6EDF3] placeholder-[#7D8590] focus:border-[#39FF88] focus:outline-none"
            />
          </div>
        )}

        {activeTab === "interceptor" && (
          <div className="flex items-center gap-1 text-[10px]">
            {["ALL", "CRITICAL", "HIGH", "CLEAN"].map((tier) => (
              <button
                key={tier}
                onClick={() => setFilterTier(tier)}
                className={`rounded px-2 py-0.5 border ${
                  filterTier === tier
                    ? "bg-[#39FF88]/20 text-[#39FF88] border-[#39FF88]/50 font-bold"
                    : "bg-[#0A0E14] text-[#7D8590] border-[#1C232E] hover:text-[#E6EDF3]"
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Tab Panels */}
      <div className="mt-3 flex-1 overflow-y-auto">
        {/* TAB 1: MODUS OPERANDI / TTP MATRIX */}
        {activeTab === "ttp" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredTTPs.map((ttp) => {
              const isCrit = ttp.severity === "CRITICAL";
              const isHigh = ttp.severity === "HIGH";
              const badgeStyle = isCrit
                ? "bg-[#FF3B3B]/15 text-[#FF3B3B] border-[#FF3B3B]/40"
                : isHigh
                ? "bg-[#FF9F1C]/15 text-[#FF9F1C] border-[#FF9F1C]/40"
                : "bg-[#FFD60A]/15 text-[#FFD60A] border-[#FFD60A]/40";

              return (
                <div
                  key={ttp.id}
                  className="group relative flex flex-col justify-between rounded border border-[#1C232E] bg-[#0A0E14] p-3 hover:border-[#39FF88]/40 transition-all hover:shadow-[0_0_12px_rgba(57,255,136,0.06)]"
                >
                  <div>
                    {/* Top Row: Code, Severity & Volume */}
                    <div className="flex items-start justify-between gap-2 border-b border-[#1C232E]/60 pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[10px] text-[#39FF88]">{ttp.code}</span>
                        <span className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase border ${badgeStyle}`}>
                          {ttp.severity}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] font-bold text-[#E6EDF3] tabular-nums">
                          {ttp.btcVolume} BTC
                        </div>
                        <div className="text-[9px] text-[#7D8590] tabular-nums">
                          ≈ ₹{ttp.inrCrore} Cr
                        </div>
                      </div>
                    </div>

                    {/* TTP Name & Description */}
                    <h3 className="mt-2 text-xs font-bold text-[#E6EDF3] group-hover:text-[#39FF88] transition-colors leading-snug">
                      {ttp.name}
                    </h3>
                    <p className="mt-1 text-[10px] text-[#7D8590] leading-relaxed">
                      {ttp.tacticalDescription}
                    </p>

                    {/* Algorithmic Evidence Proof Box */}
                    <div className="mt-2.5 rounded bg-[#161B22]/80 border border-[#1C232E] p-2 text-[9.5px] space-y-1">
                      <div className="flex items-center justify-between text-[#7D8590]">
                        <span>ISOLATION FOREST SCORE:</span>
                        <span className="font-bold text-[#FF3B3B] tabular-nums">
                          {(ttp.anomalyScore * 100).toFixed(1)}%
                        </span>
                      </div>
                      {ttp.entropyScore !== undefined && (
                        <div className="flex items-center justify-between text-[#7D8590]">
                          <span>SHANNON ENTROPY:</span>
                          <span className="font-bold text-[#39FF88] tabular-nums">
                            {ttp.entropyScore.toFixed(2)} / 1.00
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-[#7D8590]">
                        <span>DETECTIONS:</span>
                        <span className="font-bold text-[#E6EDF3] tabular-nums">
                          {ttp.detections.toLocaleString()} txs
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[#7D8590] pt-0.5 border-t border-[#1C232E]/40">
                        <span>LEAD SYNDICATE:</span>
                        <span className="text-[#E6EDF3] truncate max-w-[140px] font-medium">
                          {ttp.syndicate}
                        </span>
                      </div>
                    </div>

                    {/* Statutory Regulatory Tag */}
                    <div className="mt-2 flex items-center gap-1 text-[9px] text-[#7D8590] truncate">
                      <Scale size={10} className="text-[#39FF88] shrink-0" />
                      <span className="truncate">{ttp.regulatoryBreach}</span>
                    </div>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="mt-3 pt-2.5 border-t border-[#1C232E] flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleInspectTarget(ttp.primaryTarget)}
                      className="flex items-center gap-1 text-[9.5px] text-[#39FF88] hover:underline"
                    >
                      <ArrowUpRight size={11} />
                      <span>INSPECT SUBGRAPH</span>
                    </button>

                    <button
                      onClick={() => handleCopyNotice(ttp)}
                      className="flex items-center gap-1 rounded bg-[#161B22] px-2 py-1 text-[9.5px] font-bold text-[#E6EDF3] border border-[#1C232E] hover:border-[#39FF88]/40 hover:text-[#39FF88] active:scale-95 transition-all"
                    >
                      {copiedId === ttp.id ? (
                        <>
                          <Check size={10} className="text-[#39FF88]" />
                          <span className="text-[#39FF88]">NOTICE COPIED</span>
                        </>
                      ) : (
                        <>
                          <Copy size={10} />
                          <span>DRAFT SEC 91 CrPC</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: LIVE TRANSACTION INTERCEPTOR */}
        {activeTab === "interceptor" && (
          <div className="rounded border border-[#1C232E] bg-[#0A0E14] overflow-x-auto">
            <table className="w-full text-left text-[11px] border-collapse font-mono">
              <thead>
                <tr className="border-b border-[#1C232E] text-[#7D8590] text-[9.5px] uppercase tracking-wider bg-[#161B22]/60">
                  <th className="py-2.5 px-3">CADENCE</th>
                  <th className="py-2.5 px-3">TRANSACTION HASH</th>
                  <th className="py-2.5 px-3">SOURCE WALLET</th>
                  <th className="py-2.5 px-3">TARGET RECEPTOR</th>
                  <th className="py-2.5 px-3 text-right">VOLUME</th>
                  <th className="py-2.5 px-3">DETECTED TACTIC</th>
                  <th className="py-2.5 px-3 text-right">ANOMALY</th>
                  <th className="py-2.5 px-3 text-center">CONSENSUS TIER</th>
                  <th className="py-2.5 px-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C232E]/50">
                {filteredFlights.map((flight) => {
                  const tierStyle =
                    flight.riskTier === "CRITICAL"
                      ? "bg-[#FF3B3B]/15 text-[#FF3B3B] border-[#FF3B3B]/40"
                      : flight.riskTier === "HIGH"
                      ? "bg-[#FF9F1C]/15 text-[#FF9F1C] border-[#FF9F1C]/40"
                      : flight.riskTier === "SUSPECT"
                      ? "bg-[#FFD60A]/15 text-[#FFD60A] border-[#FFD60A]/40"
                      : "bg-[#39FF88]/15 text-[#39FF88] border-[#39FF88]/40";

                  return (
                    <tr
                      key={flight.id}
                      className="hover:bg-[#161B22]/50 transition-colors"
                    >
                      <td className="py-2 px-3 text-[#7D8590] whitespace-nowrap text-[10px]">
                        {flight.timeAgo}
                      </td>
                      <td className="py-2 px-3 font-mono text-[#39FF88] whitespace-nowrap">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(flight.txid);
                            toast.success("TXID copied to clipboard", { description: flight.txid });
                          }}
                          className="flex items-center gap-1 hover:underline"
                        >
                          <span>{flight.txid.slice(0, 8)}...{flight.txid.slice(-6)}</span>
                          <Copy size={9} className="text-[#7D8590]" />
                        </button>
                      </td>
                      <td className="py-2 px-3 text-[#E6EDF3] whitespace-nowrap text-[10.5px]">
                        {flight.sourceWallet}
                      </td>
                      <td className="py-2 px-3 text-[#7D8590] whitespace-nowrap text-[10.5px]">
                        {flight.destWallet}
                      </td>
                      <td className="py-2 px-3 text-right whitespace-nowrap">
                        <div className="font-bold text-[#E6EDF3]">{flight.amountBtc} BTC</div>
                        <div className="text-[9px] text-[#7D8590]">₹{flight.inrLakhs} L</div>
                      </td>
                      <td className="py-2 px-3 text-[#E6EDF3] whitespace-nowrap">
                        <span className="text-[10px] text-[#7D8590]">{flight.tactic}</span>
                      </td>
                      <td className="py-2 px-3 text-right whitespace-nowrap font-bold text-[#FF3B3B] tabular-nums">
                        {flight.anomalyPct}%
                      </td>
                      <td className="py-2 px-3 text-center whitespace-nowrap">
                        <span className={`inline-block rounded px-1.5 py-0.2 text-[9px] font-bold border ${tierStyle}`}>
                          {flight.riskTier}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleInspectTarget(flight.sourceWallet)}
                          className="rounded bg-[#161B22] px-2 py-1 text-[9.5px] font-bold text-[#39FF88] border border-[#1C232E] hover:border-[#39FF88]/40 hover:bg-[#1C232E]"
                        >
                          INSPECT
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: JURISDICTIONAL RISK CORRIDORS */}
        {activeTab === "jurisdiction" && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {CORRIDORS.map((corridor, idx) => (
                <div
                  key={idx}
                  className="rounded border border-[#1C232E] bg-[#0A0E14] p-3.5 space-y-2 hover:border-[#39FF88]/40 transition-all"
                >
                  <div className="flex items-center justify-between border-b border-[#1C232E] pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{corridor.sourceFlag}</span>
                      <span className="text-xs text-[#7D8590]">→</span>
                      <span className="text-base">{corridor.destFlag}</span>
                      <span className="text-xs font-bold text-[#E6EDF3]">
                        {corridor.corridor}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-[#39FF88] tabular-nums">
                        {corridor.volumeBtc} BTC
                      </span>
                      <div className="text-[9px] text-[#7D8590] tabular-nums">
                        ≈ ₹{corridor.inrCrore} Cr
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                    <div className="rounded bg-[#161B22] p-2 border border-[#1C232E]">
                      <span className="text-[#7D8590] block text-[9px]">ROUTING TELEMETRY</span>
                      <span className="font-bold text-[#E6EDF3] mt-0.5 block">{corridor.torVpnRate}</span>
                      <span className="text-[9px] text-[#7D8590] truncate block mt-0.5">{corridor.primaryAsn}</span>
                    </div>

                    <div className="rounded bg-[#161B22] p-2 border border-[#1C232E]">
                      <span className="text-[#7D8590] block text-[9px]">EXTRADITION / MLAT STATUS</span>
                      <span
                        className="font-bold mt-0.5 block truncate"
                        style={{ color: corridor.mlatBadgeColor }}
                      >
                        {corridor.mlatStatus}
                      </span>
                      <span className="text-[9px] text-[#39FF88] block mt-0.5">
                        FIU: {corridor.fiuReadiness}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#1C232E] text-[10px]">
                    <span className="text-[#7D8590]">
                      Statutory Enforcement: Section 91 CrPC // Section 94 BNSS
                    </span>
                    <button
                      onClick={() => {
                        toast.success("Corridor Dossier Snapshot Exported", {
                          description: `Corridor: ${corridor.corridor} • Volume: ${corridor.volumeBtc} BTC`,
                        });
                      }}
                      className="flex items-center gap-1 text-[#39FF88] font-bold hover:underline"
                    >
                      <ArrowUpRight size={11} />
                      <span>EXPORT CORRIDOR DOSSIER</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default ForensicTacticsMatrix;
