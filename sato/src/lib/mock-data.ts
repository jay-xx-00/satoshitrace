export type RiskLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface AlertItem {
  id: string;
  risk: RiskLevel;
  wallet: string;
  tactic: string;
  ago: string;
}

export interface CaseRow {
  id: string;
  filename: string;
  uploaded: string;
  transactions: number;
  alerts: number;
  status: "COMPLETE" | "PROCESSING" | "FAILED";
}

export const alerts: AlertItem[] = [
  { id: "A-9241", risk: "CRITICAL", wallet: "bc1q7f3k2m9x4qz8v2r", tactic: "Ransomware Payout Cluster", ago: "12s ago" },
  { id: "A-9240", risk: "CRITICAL", wallet: "3J98t1WpEZ73CNmQvi", tactic: "Peel Chain Layering", ago: "1m ago" },
  { id: "A-9239", risk: "HIGH", wallet: "bc1qar0srrr7xfkvy5l", tactic: "Mixer Ingress (Tornado)", ago: "2m ago" },
  { id: "A-9238", risk: "HIGH", wallet: "1A1zP1eP5QGefi2DMP", tactic: "Sanctioned Exchange Hop", ago: "4m ago" },
  { id: "A-9237", risk: "MEDIUM", wallet: "bc1qxy2kgdygjrsqtzq", tactic: "Rapid Fan-Out Pattern", ago: "6m ago" },
  { id: "A-9236", risk: "HIGH", wallet: "3FZbgi29cpjq2GjdwV", tactic: "Darknet Market Deposit", ago: "8m ago" },
  { id: "A-9235", risk: "MEDIUM", wallet: "bc1q9d4ywgfnd8h43da", tactic: "Structured Sub-Threshold TX", ago: "11m ago" },
  { id: "A-9234", risk: "LOW", wallet: "1BvBMSEYstWetqTFn5", tactic: "New Counterparty Anomaly", ago: "14m ago" },
  { id: "A-9233", risk: "CRITICAL", wallet: "bc1qc7slrfxkknqcq2j", tactic: "Known LockBit Wallet", ago: "17m ago" },
  { id: "A-9232", risk: "HIGH", wallet: "3QJmV3qfvL9SuYo34Y", tactic: "Chain-Hop via Monero Swap", ago: "21m ago" },
  { id: "A-9231", risk: "MEDIUM", wallet: "bc1qm34lsc65zpw79lx", tactic: "Dormant Wallet Reactivation", ago: "25m ago" },
  { id: "A-9230", risk: "LOW", wallet: "1FeexV6bAHb8ybZjqQ", tactic: "Velocity Deviation", ago: "29m ago" },
  { id: "A-9229", risk: "HIGH", wallet: "bc1q4c8n5t8bkl2gd0v", tactic: "Cross-Border Burst (RU→AE)", ago: "33m ago" },
  { id: "A-9228", risk: "MEDIUM", wallet: "3KZ526NxCVXbLtb6vp", tactic: "Round-Number Consolidation", ago: "38m ago" },
  { id: "A-9227", risk: "CRITICAL", wallet: "bc1qh8x7ekkm5x3ncw2", tactic: "Terror Financing Watchlist", ago: "44m ago" },
];

export const cases: CaseRow[] = [
  { id: "CBI-2026-0471", filename: "seized_node_dump_mh.csv", uploaded: "08:41 IST", transactions: 148293, alerts: 312, status: "COMPLETE" },
  { id: "CBI-2026-0470", filename: "exchange_logs_wazirx.json", uploaded: "08:12 IST", transactions: 92014, alerts: 87, status: "PROCESSING" },
  { id: "NCB-2026-0119", filename: "darkweb_ledger_pt3.csv", uploaded: "07:55 IST", transactions: 51882, alerts: 204, status: "COMPLETE" },
  { id: "CID-2026-0088", filename: "ransom_wallets_lockbit.txt", uploaded: "07:20 IST", transactions: 13940, alerts: 496, status: "COMPLETE" },
  { id: "CBI-2026-0469", filename: "upi_crypto_bridge.csv", uploaded: "06:48 IST", transactions: 34119, alerts: 41, status: "FAILED" },
  { id: "ED-2026-0233", filename: "hawala_crosslink.parquet", uploaded: "06:03 IST", transactions: 210447, alerts: 158, status: "COMPLETE" },
  { id: "CBI-2026-0468", filename: "seized_hw_wallet_04.dat", uploaded: "05:31 IST", transactions: 7712, alerts: 22, status: "COMPLETE" },
];

export const sparkline = [12, 18, 15, 26, 22, 31, 28, 39, 35, 48, 44, 57, 61, 55, 72];

export const hotspots = [
  { name: "Mumbai", x: 68.5, y: 55, intensity: 0.95 },
  { name: "Delhi", x: 70.5, y: 48, intensity: 0.8 },
  { name: "Moscow", x: 60.5, y: 33, intensity: 0.9 },
  { name: "Dubai", x: 63, y: 51, intensity: 0.7 },
  { name: "Kyiv", x: 57.5, y: 36, intensity: 0.6 },
  { name: "Lagos", x: 49.5, y: 62, intensity: 0.45 },
  { name: "Hong Kong", x: 79, y: 54, intensity: 0.75 },
  { name: "Panama", x: 25, y: 62, intensity: 0.4 },
  { name: "Amsterdam", x: 49, y: 36, intensity: 0.55 },
  { name: "Pyongyang", x: 82.5, y: 42, intensity: 1 },
];

export interface GraphNode {
  id: string;
  label: string;
  type: "ip" | "txid" | "wallet" | "suspect" | "cluster";
  x: number;
  y: number;
  meta: Record<string, string>;
}

export const graphNodes: GraphNode[] = [
  { id: "n1", type: "cluster", label: "SYNDICATE // BLACKRIVER", x: 50, y: 46, meta: { Members: "34 wallets", Region: "RU / AE", Confidence: "0.94" } },
  { id: "n2", type: "suspect", label: "bc1qc7slrfxkknqcq2j", x: 28, y: 30, meta: { Risk: "CRITICAL", Balance: "412.8 BTC", Tags: "LockBit, Ransom" } },
  { id: "n3", type: "suspect", label: "bc1qh8x7ekkm5x3ncw2", x: 74, y: 28, meta: { Risk: "CRITICAL", Balance: "88.2 BTC", Tags: "Watchlist" } },
  { id: "n4", type: "wallet", label: "1A1zP1eP5QGefi2DMP", x: 20, y: 62, meta: { Risk: "LOW", Balance: "3.1 BTC", Tags: "KYC Verified" } },
  { id: "n5", type: "wallet", label: "3J98t1WpEZ73CNmQvi", x: 80, y: 66, meta: { Risk: "MEDIUM", Balance: "27.4 BTC", Tags: "Exchange" } },
  { id: "n6", type: "txid", label: "4a5e...9f21", x: 39, y: 20, meta: { Amount: "12.4 BTC", Confirmations: "1,284", Block: "874,221" } },
  { id: "n7", type: "txid", label: "b71c...02de", x: 62, y: 70, meta: { Amount: "0.88 BTC", Confirmations: "94", Block: "874,902" } },
  { id: "n8", type: "ip", label: "185.220.101.44", x: 34, y: 78, meta: { ASN: "AS200651", Geo: "Frankfurt, DE", Node: "Tor Exit" } },
  { id: "n9", type: "ip", label: "45.153.160.2", x: 84, y: 44, meta: { ASN: "AS9009", Geo: "Moscow, RU", Node: "VPS" } },
  { id: "n10", type: "txid", label: "cc09...7a13", x: 52, y: 78, meta: { Amount: "5.02 BTC", Confirmations: "412", Block: "874,556" } },
  { id: "n11", type: "wallet", label: "bc1qar0srrr7xfkvy5l", x: 14, y: 44, meta: { Risk: "MEDIUM", Balance: "9.7 BTC", Tags: "Mixer Ingress" } },
  { id: "n12", type: "suspect", label: "3FZbgi29cpjq2GjdwV", x: 66, y: 14, meta: { Risk: "HIGH", Balance: "150.0 BTC", Tags: "Darknet" } },
];

export const graphEdges: Array<[string, string]> = [
  ["n1", "n2"],
  ["n1", "n3"],
  ["n1", "n6"],
  ["n1", "n10"],
  ["n2", "n6"],
  ["n2", "n11"],
  ["n2", "n8"],
  ["n3", "n9"],
  ["n3", "n12"],
  ["n6", "n12"],
  ["n10", "n5"],
  ["n10", "n7"],
  ["n7", "n5"],
  ["n4", "n11"],
  ["n8", "n10"],
  ["n1", "n7"],
];
