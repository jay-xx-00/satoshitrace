export type GNodeType = "ip" | "txid" | "wallet" | "suspect" | "cluster";

export interface GNode {
  id: string;
  type: GNodeType;
  /** percentage coordinates in the virtual graph space */
  x: number;
  y: number;
  label: string;
  sub: string;
  /** full address / identifier */
  full: string;
  tor?: boolean;
  cluster?: string;
  accent?: string;
  risk?: number;
}

export interface GEdge {
  from: string;
  to: string;
  amount: string;
}

export const gNodes: GNode[] = [
  {
    id: "c1",
    type: "cluster",
    x: 50,
    y: 44,
    label: "SYNDICATE // BLACKRIVER",
    sub: "34 wallets • RU / AE",
    full: "CLUSTER-BLACKRIVER",
    accent: "var(--signal)",
    risk: 78,
  },
  {
    id: "c2",
    type: "cluster",
    x: 20,
    y: 76,
    label: "SYNDICATE // NIGHTFERRY",
    sub: "12 wallets • NL / PA",
    full: "CLUSTER-NIGHTFERRY",
    accent: "var(--data)",
    risk: 61,
  },
  {
    id: "s1",
    type: "suspect",
    x: 30,
    y: 26,
    label: "bc1qc7sl",
    sub: "RISK: 94% • Peeling Chain",
    full: "bc1qc7slrfxkknqcq2jhaxxq7f3k2m9x4qz8v2rn0w",
    risk: 94,
    cluster: "c1",
  },
  {
    id: "s2",
    type: "suspect",
    x: 76,
    y: 24,
    label: "bc1qh8x7",
    sub: "RISK: 88% • Smurfing",
    full: "bc1qh8x7ekkm5x3ncw2p9dl4vv0shq2m6tzz8yg7ke",
    risk: 88,
    cluster: "c1",
  },
  {
    id: "s3",
    type: "suspect",
    x: 62,
    y: 12,
    label: "3FZbgi29",
    sub: "RISK: 81% • CoinJoin Exit",
    full: "3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5",
    risk: 81,
    cluster: "c1",
  },
  {
    id: "w1",
    type: "wallet",
    x: 14,
    y: 46,
    label: "bc1qar0s",
    sub: "9.7 BTC • Mixer ingress",
    full: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
    risk: 42,
  },
  {
    id: "w2",
    type: "wallet",
    x: 88,
    y: 60,
    label: "3J98t1Wp",
    sub: "27.4 BTC • Exchange hot",
    full: "3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy",
    risk: 22,
  },
  {
    id: "w3",
    type: "wallet",
    x: 40,
    y: 88,
    label: "1A1zP1eP",
    sub: "3.1 BTC • KYC verified",
    full: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    risk: 11,
  },
  {
    id: "t1",
    type: "txid",
    x: 42,
    y: 20,
    label: "4a5e9f21",
    sub: "12.40 BTC • 08:41:22 IST",
    full: "4a5e9f21c8b7d0e4a1f93b62c7d41e08a55c92b7d0e4a1f93b62c7d41e08a55c",
  },
  {
    id: "t2",
    type: "txid",
    x: 66,
    y: 68,
    label: "b71c02de",
    sub: "0.88 BTC • 08:44:09 IST",
    full: "b71c02de91f3a7c4e0d825b6a1c93f47d0e2b85a91f3a7c4e0d825b6a1c93f47",
  },
  {
    id: "t3",
    type: "txid",
    x: 50,
    y: 74,
    label: "cc097a13",
    sub: "5.02 BTC • 08:47:51 IST",
    full: "cc097a13b4e2f60a8d17c39be05f2a4c76d8901bb4e2f60a8d17c39be05f2a4c",
  },
  {
    id: "t4",
    type: "txid",
    x: 84,
    y: 38,
    label: "9de41b70",
    sub: "1.19 BTC • 08:51:03 IST",
    full: "9de41b70a2c85f3d6e097b41cc2a5d8f30e71b64a2c85f3d6e097b41cc2a5d8f",
  },
  {
    id: "i1",
    type: "ip",
    x: 30,
    y: 62,
    label: "185.220.101.44",
    sub: "DE • AS200651 Foundation for Applied Privacy",
    full: "185.220.101.44",
    tor: true,
  },
  {
    id: "i2",
    type: "ip",
    x: 90,
    y: 20,
    label: "45.153.160.2",
    sub: "RU • AS9009 M247 Europe SRL",
    full: "45.153.160.2",
  },
  {
    id: "i3",
    type: "ip",
    x: 8,
    y: 22,
    label: "104.244.72.115",
    sub: "NL • AS53667 FranTech Solutions",
    full: "104.244.72.115",
    tor: true,
  },
];

export const gEdges: GEdge[] = [
  { from: "c1", to: "s1", amount: "88.20 BTC" },
  { from: "c1", to: "s2", amount: "41.05 BTC" },
  { from: "c1", to: "t1", amount: "12.40 BTC" },
  { from: "c1", to: "t3", amount: "5.02 BTC" },
  { from: "s1", to: "t1", amount: "12.40 BTC" },
  { from: "s1", to: "w1", amount: "9.70 BTC" },
  { from: "s1", to: "i1", amount: "—" },
  { from: "s1", to: "i3", amount: "—" },
  { from: "s2", to: "i2", amount: "—" },
  { from: "s2", to: "s3", amount: "17.80 BTC" },
  { from: "s2", to: "t4", amount: "1.19 BTC" },
  { from: "t1", to: "s3", amount: "6.10 BTC" },
  { from: "t3", to: "w2", amount: "5.02 BTC" },
  { from: "t3", to: "t2", amount: "0.88 BTC" },
  { from: "t2", to: "w2", amount: "0.88 BTC" },
  { from: "w3", to: "c2", amount: "3.10 BTC" },
  { from: "c2", to: "w1", amount: "7.40 BTC" },
  { from: "c2", to: "i1", amount: "—" },
  { from: "i1", to: "t3", amount: "—" },
  { from: "t4", to: "w2", amount: "1.19 BTC" },
];

export type AlertRisk = "HIGH" | "MEDIUM" | "LOW";

export interface AlertRow {
  id: string;
  nodeId: string;
  risk: AlertRisk;
  wallet: string;
  consensus: number;
  country: string;
  asn: string;
  tactic: "Peeling Chain" | "CoinJoin" | "Smurfing";
  time: string;
  status: "OPEN" | "REVIEW" | "ESCALATED";
}

export const alertRows: AlertRow[] = [
  { id: "AL-4471", nodeId: "s1", risk: "HIGH", wallet: "bc1qc7slrfxkknqcq2j", consensus: 94, country: "RU", asn: "AS9009 M247", tactic: "Peeling Chain", time: "08:41:22", status: "OPEN" },
  { id: "AL-4470", nodeId: "s2", risk: "HIGH", wallet: "bc1qh8x7ekkm5x3ncw2", consensus: 88, country: "AE", asn: "AS5384 EITC", tactic: "Smurfing", time: "08:39:04", status: "REVIEW" },
  { id: "AL-4469", nodeId: "s3", risk: "HIGH", wallet: "3FZbgi29cpjq2GjdwV", consensus: 81, country: "NL", asn: "AS53667 FranTech", tactic: "CoinJoin", time: "08:33:47", status: "OPEN" },
  { id: "AL-4468", nodeId: "w1", risk: "MEDIUM", wallet: "bc1qar0srrr7xfkvy5l", consensus: 62, country: "DE", asn: "AS200651 FAP", tactic: "Peeling Chain", time: "08:21:11", status: "REVIEW" },
  { id: "AL-4467", nodeId: "w2", risk: "MEDIUM", wallet: "3J98t1WpEZ73CNmQvi", consensus: 55, country: "SG", asn: "AS16509 Amazon", tactic: "Smurfing", time: "08:14:52", status: "ESCALATED" },
  { id: "AL-4466", nodeId: "t2", risk: "LOW", wallet: "b71c02de91f3a7c4e0", consensus: 31, country: "IN", asn: "AS55836 Jio", tactic: "CoinJoin", time: "08:02:19", status: "OPEN" },
  { id: "AL-4465", nodeId: "w3", risk: "LOW", wallet: "1A1zP1eP5QGefi2DMP", consensus: 18, country: "US", asn: "AS15169 Google", tactic: "Peeling Chain", time: "07:58:40", status: "REVIEW" },
];

export const shapFeatures = [
  { label: "Transaction Velocity", value: 35 },
  { label: "Tor/VPN Origin", value: 28 },
  { label: "High Miner Fee", value: 21 },
  { label: "Wallet Age < 6hrs", value: 14 },
  { label: "IP Entropy", value: 2 },
];
