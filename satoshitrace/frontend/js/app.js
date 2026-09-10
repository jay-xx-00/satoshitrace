/**
 * SatoshiTrace Forensic Intelligence Platform - Frontend Controller
 */

const API_BASE = "http://127.0.0.1:8000";
let cy = null;
let currentJobId = "default";
let currentAlerts = [];
let selectedWallet = null;

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Cytoscape instance
  initCytoscape();

  // Load initial graph and statistics from backend
  loadGraphData(currentJobId);
  loadAlerts(currentJobId);
  loadGlobalStats();

  // Setup Event Listeners
  setupEventListeners();
});

/**
 * Cytoscape Graph Canvas Initialization
 */
function initCytoscape() {
  cy = cytoscape({
    container: document.getElementById("cy-container"),
    style: [
      {
        selector: "node",
        style: {
          "label": "data(label)",
          "color": "#E2E8F0",
          "font-size": "10px",
          "font-family": "Outfit, sans-serif",
          "text-valign": "bottom",
          "text-margin-y": "5px",
          "background-color": "data(color)",
          "shape": "data(shape)",
          "width": "data(size)",
          "height": "data(size)",
          "border-width": 1.5,
          "border-color": "rgba(255, 255, 255, 0.25)",
          "transition-property": "background-color, border-color, width, height",
          "transition-duration": "0.3s"
        }
      },
      {
        selector: "node[tier = 'RED']",
        style: {
          "border-color": "#EF4444",
          "border-width": 3,
          "shadow-blur": 25,
          "shadow-color": "#EF4444",
          "shadow-opacity": 0.85
        }
      },
      {
        selector: "node[tier = 'ORANGE']",
        style: {
          "border-color": "#F59E0B",
          "border-width": 2,
          "shadow-blur": 15,
          "shadow-color": "#F59E0B",
          "shadow-opacity": 0.6
        }
      },
      {
        selector: "node:selected",
        style: {
          "border-color": "#38BDF8",
          "border-width": 4,
          "shadow-blur": 30,
          "shadow-color": "#38BDF8",
          "shadow-opacity": 1
        }
      },
      {
        selector: "edge",
        style: {
          "width": 1.5,
          "line-color": "data(color)",
          "target-arrow-color": "data(color)",
          "target-arrow-shape": "triangle",
          "curve-style": "bezier",
          "line-style": "data(line_style)",
          "opacity": 0.65,
          "font-size": "8px",
          "font-family": "JetBrains Mono, monospace",
          "color": "#94A3B8",
          "text-rotation": "autorotate",
          "text-margin-y": "-8px"
        }
      },
      {
        selector: "edge[amount_btc > 0]",
        style: {
          "label": "data(label)"
        }
      }
    ],
    layout: {
      name: "cose",
      animate: true,
      animationDuration: 800,
      nodeRepulsion: 6500,
      idealEdgeLength: 60,
      gravity: 0.25
    }
  });

  // Node click event -> inspect evidence
  cy.on("tap", "node", (evt) => {
    const node = evt.target;
    const data = node.data();
    if (data.node_type === "WALLET") {
      openInspector(data.id);
    }
  });
}

/**
 * Loads graph elements from FastAPI backend
 */
async function loadGraphData(jobId, focalWallet = null) {
  try {
    let url = `${API_BASE}/api/graph/${jobId}`;
    if (focalWallet) {
      url += `?focal_wallet=${encodeURIComponent(focalWallet)}`;
    }
    
    const resp = await fetch(url);
    if (!resp.ok) throw new Error("Failed to fetch graph data");
    
    const data = await resp.json();
    cy.elements().remove();
    cy.add(data.elements);
    
    cy.layout({
      name: "cose",
      animate: true,
      animationDuration: 600,
      nodeRepulsion: 7500,
      idealEdgeLength: 70
    }).run();

  } catch (err) {
    console.error("Graph load error:", err);
  }
}

/**
 * Loads ranked alerts list
 */
async function loadAlerts(jobId) {
  try {
    const resp = await fetch(`${API_BASE}/api/alerts/${jobId}`);
    if (!resp.ok) return;
    const data = await resp.json();
    currentAlerts = data.alerts || [];

    renderAlertQueue(currentAlerts);
  } catch (err) {
    console.error("Alerts load error:", err);
  }
}

/**
 * Renders the bottom threat lead queue table
 */
function renderAlertQueue(alerts) {
  const container = document.getElementById("alert-table-body");
  const countBadge = document.getElementById("badge-alert-count");
  if (!container) return;

  if (countBadge) {
    countBadge.innerText = alerts.length;
  }

  if (alerts.length === 0) {
    container.innerHTML = `<div class="text-xs text-slate-500 text-center py-4">No suspicious entities flagged. System clean.</div>`;
    return;
  }

  container.innerHTML = alerts.map((a) => `
    <div class="alert-row flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 cursor-pointer transition-all" data-wallet="${a.address}">
      <div class="flex items-center gap-3">
        <span class="px-2 py-0.5 rounded text-[10px] font-bold ${a.tier === 'RED' ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'}">
          ${a.tier} (${a.models_agreed}/3)
        </span>
        <span class="font-mono text-xs text-slate-200">${a.address.slice(0, 16)}...</span>
        <span class="text-xs text-slate-400">${a.flag} ${a.country}</span>
      </div>

      <div class="flex items-center gap-4">
        <span class="text-xs font-semibold ${a.tier === 'RED' ? 'text-red-400' : 'text-amber-400'}">${a.primary_tactic}</span>
        <span class="font-mono text-xs font-bold ${a.risk_score_pct >= 90 ? 'text-red-400' : 'text-amber-400'}">${a.risk_score_pct}% Risk</span>
        <span class="text-[10px] text-slate-400 font-mono">${a.total_btc_moved} BTC</span>
      </div>
    </div>
  `).join("");

  // Add click handler to rows
  document.querySelectorAll(".alert-row").forEach((el) => {
    el.addEventListener("click", () => {
      const wallet = el.getAttribute("data-wallet");
      focusOnWallet(wallet);
      openInspector(wallet);
    });
  });
}

/**
 * Focuses Cytoscape camera onto target node
 */
function focusOnWallet(walletAddress) {
  const node = cy.$id(walletAddress);
  if (node.length > 0) {
    cy.animate({
      center: { eles: node },
      zoom: 1.8,
      duration: 600
    });
    node.select();
  }
}

/**
 * Opens Right Inspector Drawer with SHAP breakdown and Consensus Details
 */
async function openInspector(walletAddress) {
  selectedWallet = walletAddress;
  const drawer = document.getElementById("inspector-drawer");
  const addrSpan = document.getElementById("inspect-address");
  const barsContainer = document.getElementById("shap-bars-container");
  const summaryText = document.getElementById("shap-nl-summary");

  if (addrSpan) addrSpan.innerText = walletAddress;
  drawer.classList.add("open");

  try {
    const resp = await fetch(`${API_BASE}/api/explain/${currentJobId}/${encodeURIComponent(walletAddress)}`);
    if (!resp.ok) return;
    const data = await resp.json();

    const shap = data.shap || {};
    const bars = shap.feature_bars || [];

    if (barsContainer) {
      barsContainer.innerHTML = bars.map(b => `
        <div class="space-y-1">
          <div class="flex items-center justify-between text-xs">
            <span class="text-slate-300 font-medium">${b.feature}</span>
            <span class="font-mono font-bold ${b.severity === 'HIGH' ? 'text-red-400' : 'text-amber-400'}">+${b.impact_pct}%</span>
          </div>
          <div class="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div class="shap-bar-fill h-full rounded-full ${b.severity === 'HIGH' ? 'bg-red-500' : 'bg-amber-500'}" style="width: ${b.impact_pct}%"></div>
          </div>
          <p class="text-[10px] text-slate-400">${b.description}</p>
        </div>
      `).join("");
    }

    if (summaryText && shap.natural_language_summary) {
      summaryText.innerText = shap.natural_language_summary;
    }

  } catch (err) {
    console.error("Inspector error:", err);
  }
}

/**
 * Loads high-level statistics
 */
async function loadGlobalStats() {
  try {
    const resp = await fetch(`${API_BASE}/api/stats`);
    if (!resp.ok) return;
    const stats = await resp.json();

    document.getElementById("stat-total-tx").innerText = stats.total_transactions_analyzed.toLocaleString();
    document.getElementById("stat-high-risk").innerText = `${stats.high_risk_alerts} Entities`;
    document.getElementById("stat-syndicates").innerText = `${stats.syndicates_detected} Clusters`;
  } catch (err) {
    console.error("Stats load error:", err);
  }
}

/**
 * Setup Event Handlers
 */
function setupEventListeners() {
  // Close inspector button
  document.getElementById("btn-close-inspector")?.addEventListener("click", () => {
    document.getElementById("inspector-drawer")?.classList.remove("open");
  });

  // Zoom / Fit Controls
  document.getElementById("btn-zoom-in")?.addEventListener("click", () => {
    cy.zoom(cy.zoom() * 1.25);
  });
  document.getElementById("btn-zoom-out")?.addEventListener("click", () => {
    cy.zoom(cy.zoom() * 0.8);
  });
  document.getElementById("btn-fit-graph")?.addEventListener("click", () => {
    cy.fit(null, 50);
  });
  document.getElementById("btn-reset-layout")?.addEventListener("click", () => {
    cy.layout({ name: "cose", animate: true, animationDuration: 600 }).run();
  });

  // Upload Modal triggers
  const uploadModal = document.getElementById("upload-modal");
  document.getElementById("btn-open-upload")?.addEventListener("click", () => {
    uploadModal?.classList.add("active");
  });
  document.getElementById("btn-close-upload-modal")?.addEventListener("click", () => {
    uploadModal?.classList.remove("active");
  });
  document.getElementById("btn-cancel-upload")?.addEventListener("click", () => {
    uploadModal?.classList.remove("active");
  });

  // File Upload handling
  const fileInput = document.getElementById("file-input");
  const dropZone = document.getElementById("drop-zone");

  dropZone?.addEventListener("click", () => fileInput?.click());

  fileInput?.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  });

  // Simulate Attack Trigger
  document.getElementById("btn-simulate-attack")?.addEventListener("click", async () => {
    try {
      const resp = await fetch(`${API_BASE}/api/simulate_attack`, { method: "POST" });
      const data = await resp.json();
      
      // Reload alerts & graph
      await loadAlerts(currentJobId);
      await loadGraphData(currentJobId);
      loadGlobalStats();

      // Open inspector on the newly injected threat
      if (data.injected_wallets && data.injected_wallets.length > 0) {
        openInspector(data.injected_wallets[0]);
      }
    } catch (err) {
      console.error("Simulation error:", err);
    }
  });

  // Export PDF Dossier
  document.getElementById("btn-quick-export-pdf")?.addEventListener("click", () => {
    window.open(`${API_BASE}/api/report/${currentJobId}/pdf`, "_blank");
  });

  // CrPC Section 91 Notice Modal
  const crpcModal = document.getElementById("crpc-modal");
  document.getElementById("btn-generate-crpc")?.addEventListener("click", async () => {
    if (!selectedWallet) return;
    try {
      const formData = new FormData();
      formData.append("wallet_address", selectedWallet);
      formData.append("exchange_name", "WazirX Compliance & Legal Operations");

      const resp = await fetch(`${API_BASE}/api/crpc_notice`, {
        method: "POST",
        body: formData
      });
      const data = await resp.json();

      document.getElementById("crpc-notice-text").value = data.notice_text;
      crpcModal?.classList.add("active");
    } catch (err) {
      console.error("CrPC Notice error:", err);
    }
  });

  document.getElementById("btn-close-crpc-modal")?.addEventListener("click", () => {
    crpcModal?.classList.remove("active");
  });

  document.getElementById("btn-copy-crpc")?.addEventListener("click", () => {
    const textarea = document.getElementById("crpc-notice-text");
    textarea.select();
    navigator.clipboard.writeText(textarea.value);
    alert("Section 91 CrPC statutory text copied to clipboard!");
  });

  // Human Review Confirm / Dismiss Buttons
  document.getElementById("btn-confirm-alert")?.addEventListener("click", async () => {
    if (!selectedWallet) return;
    const formData = new FormData();
    formData.append("decision", "CONFIRM");

    await fetch(`${API_BASE}/api/review/${currentJobId}/${encodeURIComponent(selectedWallet)}`, {
      method: "POST",
      body: formData
    });
    alert(`Lead for ${selectedWallet.slice(0, 16)}... confirmed & escalated to LEA taskforce.`);
  });

  document.getElementById("btn-dismiss-alert")?.addEventListener("click", async () => {
    if (!selectedWallet) return;
    const formData = new FormData();
    formData.append("decision", "DISMISS");

    await fetch(`${API_BASE}/api/review/${currentJobId}/${encodeURIComponent(selectedWallet)}`, {
      method: "POST",
      body: formData
    });
    alert(`Lead for ${selectedWallet.slice(0, 16)}... dismissed as false positive.`);
    document.getElementById("inspector-drawer")?.classList.remove("open");
    loadAlerts(currentJobId);
  });

  // Global Natural Language Search Box
  const searchInput = document.getElementById("global-search");
  searchInput?.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase().trim();
    if (!q) {
      renderAlertQueue(currentAlerts);
      return;
    }

    const filtered = currentAlerts.filter(a => 
      a.address.toLowerCase().includes(q) ||
      a.country.toLowerCase().includes(q) ||
      a.asn.toLowerCase().includes(q) ||
      a.primary_tactic.toLowerCase().includes(q) ||
      (q.includes("vpn") && a.is_vpn) ||
      (q.includes("tor") && a.is_tor) ||
      (q.includes("high") && a.tier === "RED")
    );

    renderAlertQueue(filtered);
  });
}

/**
 * Handle CSV/JSON File Upload
 */
async function handleFileUpload(file) {
  const formData = new FormData();
  formData.append("file", file);

  const submitBtn = document.getElementById("btn-submit-upload");
  if (submitBtn) submitBtn.innerText = "Ingesting & Analyzing...";

  try {
    const resp = await fetch(`${API_BASE}/api/upload`, {
      method: "POST",
      body: formData
    });

    if (!resp.ok) {
      alert("Error parsing file format");
      return;
    }

    const data = await resp.json();
    currentJobId = data.job_id;

    // Refresh UI
    await loadGraphData(currentJobId);
    await loadAlerts(currentJobId);
    loadGlobalStats();

    document.getElementById("upload-modal")?.classList.remove("active");
    alert(`Successfully parsed ${data.total_records} transactions. Found ${data.high_risk_count} high-risk entities across ${data.syndicates_found} syndicates.`);
  } catch (err) {
    console.error("Upload error:", err);
    alert("Upload failed. Please ensure file matches required CSV format.");
  } finally {
    if (submitBtn) submitBtn.innerText = "Begin Forensic Ingestion";
  }
}
