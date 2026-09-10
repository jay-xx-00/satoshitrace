/**
 * SatoshiTrace Offline Backend API Client
 * Connects directly to FastAPI localhost engine (http://127.0.0.1:8000)
 */

export const API_BASE = typeof window !== "undefined"
  ? (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      ? "http://127.0.0.1:8000/api"
      : `http://${window.location.hostname}:8000/api`)
  : "http://127.0.0.1:8000/api";

export interface GlobalStats {
  total_transactions_analyzed: number;
  high_risk_alerts: number;
  syndicates_detected: number;
  countries_flagged: number;
  active_jobs: number;
  system_status: string;
  verified_false_positive_rate: string;
}

export interface BackendAlert {
  address: string;
  tier: "RED" | "ORANGE" | "YELLOW" | "GREEN";
  risk_label: string;
  risk_score_pct: number;
  models_agreed: number;
  primary_tactic: string;
  tactics_list: Array<{ tactic: string; badge: string; severity?: string }>;
  country: string;
  flag: string;
  asn: string;
  is_tor: boolean;
  is_vpn: boolean;
  total_btc_moved: number;
  tx_count: number;
  cluster_name: string;
  shap_explanation: {
    feature_bars: Array<{
      feature: string;
      impact_pct: number;
      direction: string;
      description: string;
      severity: string;
    }>;
    natural_language_summary: string;
    investigator_guidance?: string;
  };
  review_status: string;
}

export interface GraphData {
  job_id: string;
  node_count: number;
  edge_count: number;
  elements: Array<{
    group: "nodes" | "edges";
    data: any;
  }>;
}

export async function fetchStats(): Promise<GlobalStats> {
  const resp = await fetch(`${API_BASE}/stats`);
  if (!resp.ok) throw new Error("Failed to fetch stats");
  return resp.json();
}

export async function fetchAlerts(jobId = "default"): Promise<BackendAlert[]> {
  const resp = await fetch(`${API_BASE}/alerts/${jobId}`);
  if (!resp.ok) throw new Error("Failed to fetch alerts");
  const data = await resp.json();
  return data.alerts || [];
}

export async function fetchGraph(jobId = "default", focalWallet?: string): Promise<GraphData> {
  let url = `${API_BASE}/graph/${jobId}`;
  if (focalWallet) url += `?focal_wallet=${encodeURIComponent(focalWallet)}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error("Failed to fetch graph");
  return resp.json();
}

export async function fetchExplanation(jobId = "default", wallet: string) {
  const resp = await fetch(`${API_BASE}/explain/${jobId}/${encodeURIComponent(wallet)}`);
  if (!resp.ok) throw new Error("Failed to fetch explanation");
  return resp.json();
}

export async function simulateAttack() {
  const resp = await fetch(`${API_BASE}/simulate_attack`, { method: "POST" });
  if (!resp.ok) throw new Error("Simulation failed");
  return resp.json();
}

export async function uploadSeizedLogs(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const resp = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: formData,
  });
  if (!resp.ok) {
    const err = await resp.json();
    throw new Error(err.detail || "Upload failed");
  }
  return resp.json();
}

export async function submitReview(jobId = "default", wallet: string, decision: "CONFIRM" | "DISMISS" | "HOLD") {
  const formData = new FormData();
  formData.append("decision", decision);
  const resp = await fetch(`${API_BASE}/review/${jobId}/${encodeURIComponent(wallet)}`, {
    method: "POST",
    body: formData,
  });
  return resp.json();
}

export async function generateCrpcNotice(wallet: string, exchange = "WazirX Compliance Hub", caseId = "CASE-2026-CBI-0891") {
  const formData = new FormData();
  formData.append("wallet_address", wallet);
  formData.append("exchange_name", exchange);
  formData.append("case_id", caseId);
  const resp = await fetch(`${API_BASE}/crpc_notice`, {
    method: "POST",
    body: formData,
  });
  const data = await resp.json();
  return data.notice_text as string;
}

export function getPdfReportUrl(jobId = "default", caseId = "CASE-2026-CBI-0891") {
  return `${API_BASE}/report/${jobId}/pdf?case_id=${encodeURIComponent(caseId)}`;
}

export interface AiChatResponse {
  response: string;
  source: string; // "ollama:llama3.2" | "sato_nlg_engine"
  offline: boolean;
}

export async function aiChat(message: string, jobId = "default"): Promise<AiChatResponse> {
  const resp = await fetch(`${API_BASE}/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, job_id: jobId }),
  });
  if (!resp.ok) throw new Error("AI chat endpoint failed");
  return resp.json();
}
