# ₿ SatoshiTrace — Forensic Intelligence Command Center

> **Tagline:** *"From seized Bitcoin logs to court-ready leads in 3 seconds."*  
> **SIH 2026 Problem Statement ID:** 26146  
> **Problem Statement Title:** AI-Powered Monitoring & Analysis of Bitcoin Transaction Traffic  
> **Target Audience:** Indian Law Enforcement Agencies (CBI, ED, FIU-IND, State Cybercrime Cells, CERT-In)  
> **Platform Constraint:** 100% Offline-Ready Linux & Windows Execution (`127.0.0.1`, Zero Cloud Dependency)  
> **Technical Write-up:** See [TECHNICAL_REPORT.md](TECHNICAL_REPORT.md) for full mathematical formulation, model choices, and XAI proofs.

---

## 📌 Problem Statement Requirements Matrix

| Problem Statement Requirement (SIH26146) | Implementation in SatoshiTrace | File / Module Reference |
|---|---|---|
| **Bulk Metadata Ingestion (CSV/JSON/XML)** | Ingests 14 protocol fields, computes Section 65B SHA-256 chain-of-custody forensic hash. | `satoshitrace/backend/ingestion/parser.py` |
| **Network & Blockchain Correlation** | Fuses network-layer IPs/ports/timing with blockchain wallets, TXIDs, amounts, and script types. | `satoshitrace/backend/graph/builder.py` |
| **Entity & Transaction Graph** | NetworkX Heterogeneous Graph linking IP, Wallet, and TXID nodes with radial visualization. | `satoshitrace/backend/graph/slicer.py` |
| **Syndicate Clustering** | Louvain Modularity Partitioning groups illicit syndicate rings and money laundering networks. | `satoshitrace/backend/graph/community.py` |
| **AI/ML Detection Model (Not Just Rules)** | **Model A:** Isolation Forest anomaly scoring on 6 high-dimensional behavioral features. | `satoshitrace/backend/ml/anomaly.py` |
| **Multi-Model Consensus Gate** | Eliminates false positives via **Triple Consensus** (Isolation Forest + Graph Density + Tactics). | `satoshitrace/backend/ml/consensus.py` |
| **Ranked, Explainable Alert List** | Priority queue with confidence scores, risk tiers (RED/ORANGE/YELLOW), and SHAP breakdowns. | `satoshitrace/backend/ml/explainer.py` |
| **False-Positive Prevention (<3.2% FPR)** | 500+ pre-tagged Indian & global exchange hot-wallet whitelist (WazirX, CoinDCX, Binance, etc.). | `satoshitrace/backend/ml/whitelist.py` |
| **Court-Admissible Legal Dossier** | Automated **Section 65B(2) Indian Evidence Act** certified PDF dossier with SHA-256 integrity seal. | `satoshitrace/backend/legal/pdf_generator.py` |
| **Statutory Exchange Freeze Notice** | **Section 91 CrPC / Section 94 BNSS 2023** notice generator for immediate exchange freeze orders. | `satoshitrace/backend/legal/crpc_notice.py` |
| **Complete Offline Solution for Linux** | 100% self-contained Linux shell launcher (`./run.sh`), Docker container, and `.desktop` entry. | `run.sh`, `Dockerfile`, `satoshitrace.desktop` |

---

## 🚀 Quick Launch (1-Command Launchers)

### 🐧 Option 1: Native Linux Platform (Ubuntu, Debian, Kali, Fedora, Arch)
```bash
chmod +x run.sh
./run.sh
```
*Automatically detects Python 3, checks Node.js/npm, installs local dependencies, starts FastAPI on `127.0.0.1:8000`, starts the UI on `http://localhost:8080`, and opens your default browser.*

### 🐳 Option 2: Linux Docker Container (100% Air-Gapped)
```bash
docker compose up --build
```
*Launches the self-contained containerized environment on `http://localhost:8080` and `http://localhost:8000`.*

### 🖥️ Option 3: Linux Desktop Application Launcher
Copy `satoshitrace.desktop` to your Linux desktop or application menu:
```bash
cp satoshitrace.desktop ~/.local/share/applications/
```
*Launches SatoshiTrace directly from your application launcher like a native Linux forensic tool.*

### 🪟 Option 4: Windows Platform (PowerShell)
```powershell
.\run.ps1
```

---

## 🎮 Evaluators' 2-Minute Winning Demo Tour

When presenting to hackathon evaluators, follow this exact sequence:

1. **TopBar → "SATO OS"**:
   - Demonstrates the double-bezel military forensic kernel boot sequence with live SHA-256 hash stream and hardware latency telemetry benchmarks.
2. **TopBar → "2-Min Tour"**:
   - Launches the guided evaluation walkthrough taking judges through the 6 core pillars of the solution.
3. **Graph Explorer (`/`)**:
   - Live NetworkX graph rendering IP nodes (blue), transaction TXIDs (diamonds), wallets (green), and high-threat suspect nodes (pulsing RED).
   - Click any node to open the **Inspector Panel** with SHAP explainability feature bars and one-click Section 91 CrPC notice generation.
4. **TopBar → "Simulate Attack"**:
   - Injects a live LockBit 3.0 ransomware extortion stream in real-time, showing instant dynamic alerting and graph updates.
5. **Prioritized Threat Leads (`/alerts`)**:
   - Inspect the ranked queue sorted by consensus risk score with human-in-the-loop review actions (`CONFIRM` / `DISMISS`).
6. **Floating SATO AI Copilot (Bottom-Right)**:
   - Click the bot icon and ask: *"Explain the top suspect wallet"* or *"What is a peeling chain?"* for instant forensic intelligence briefing.
7. **Evidence Reports (`/reports`)**:
   - Click **"Download Dossier"** to view the court-ready Section 65B Indian Evidence Act certified PDF dossier with SHA-256 cryptographic seal.

---

## 🧪 Automated Verification Suite

To run all 9 backend verification modules locally:
```bash
python test_backend_e2e.py
```

Expected output:
```
=== [1] Testing Health & Global Stats ===           --> PASS
=== [2] Testing File Upload & Ingestion ===          --> PASS
=== [3] Testing Graph Retrieval ===                  --> PASS
=== [4] Testing Alerts & Consensus Scores ===        --> PASS
=== [5] Testing Section 65B PDF Dossier ===         --> PASS
=== [6] Testing Section 91 CrPC Notice ===          --> PASS
=== [7] Testing Timeline Slices ===                 --> PASS
=== [8] Testing Whitelist & 3.2% FPR Engine ===      --> PASS
=== [9] Testing Live Attack Simulation ===           --> PASS
=======================================================
  ALL 9 BACKEND VERIFICATION MODULES PASSED (100% OK)
=======================================================
```

---

## ⚖️ Indian Judicial & Legal Admissibility

SatoshiTrace directly fulfills statutory requirements under Indian law:
1. **Section 65B(2) Indian Evidence Act, 1872 / Section 63 BSA 2023**: Generates certified forensic audit trails with computer hash stamps, operating conditions, and custody chains.
2. **Section 91 CrPC / Section 94 BNSS 2023**: Pre-formatted statutory requisition notices to compel Indian virtual asset service providers (WazirX, CoinDCX, CoinSwitch) to immediately freeze accounts and release KYC records.
3. **Prevention of Money Laundering Act (PMLA), 2002**: Traces proceeds of crime through complex layering and integration stages (peeling chains, CoinJoin mixers, smurfing).

---

## 📁 Repository Structure

```
e:/sih2026/
├── run.sh                          # 1-command native Linux launcher
├── run.ps1                         # 1-command Windows launcher
├── Dockerfile                      # Containerized offline Linux platform
├── docker-compose.yml              # 1-command docker orchestrator
├── satoshitrace.desktop            # Linux desktop application launcher
├── TECHNICAL_REPORT.md             # Formal technical write-up for SIH judges
├── README.md                       # Master documentation & presentation guide
├── test_backend_e2e.py             # 9-module automated verification test suite
├── test_investigation_dataset.csv  # 1,416-record synthetic test dataset
│
├── satoshitrace/                   # Backend & ML Core
│   ├── backend/
│   │   ├── main.py                 # FastAPI application & REST endpoints
│   │   ├── ml/                     # Three-Model Consensus AI engine
│   │   │   ├── anomaly.py          # Model A: Isolation Forest
│   │   │   ├── consensus.py        # Consensus gating (RED/ORANGE/YELLOW)
│   │   │   ├── explainer.py        # SHAP XAI feature attribution
│   │   │   ├── features.py         # 6-dimensional feature extractor
│   │   │   ├── tactics.py          # Model C: Peeling, CoinJoin, Smurfing
│   │   │   └── whitelist.py        # 500+ exchange whitelist (<3.2% FPR)
│   │   ├── graph/                  # NetworkX Heterogeneous Graph Engine
│   │   │   ├── builder.py          # Multigraph fusion (IP, Wallet, TXID)
│   │   │   ├── community.py        # Louvain syndicate community detection
│   │   │   └── slicer.py           # Ego-network & overview extraction
│   │   ├── ingestion/              # Bulk CSV/JSON/XML parser & SHA-256
│   │   ├── legal/                  # Section 65B PDF & Section 91 CrPC notice
│   │   └── geoip/                  # Offline GeoIP & ASN resolver
│   └── data_generator/             # Synthetic Bitcoin P2P dataset generator
│
└── lovable-project-db93b2a8/       # Flagship Command Center Frontend
    ├── src/
    │   ├── routes/                 # TanStack Start / React 19 pages
    │   │   ├── index.tsx           # Graph Explorer
    │   │   ├── dashboard.tsx       # Live metrics & world heatmap
    │   │   ├── alerts.tsx          # Prioritized threat leads queue
    │   │   ├── investigation.tsx   # Investigator case workbench
    │   │   ├── timeline.tsx        # 4D temporal fund flow player
    │   │   ├── reports.tsx         # Section 65B evidence dossiers
    │   │   └── whitelist.tsx       # Exchange hot-wallet registry
    │   └── components/st/          # Defense-grade UI components
    │       ├── SatoBootSequence.tsx# SATO OS diagnostic boot sequence
    │       ├── SatoshiCopilot.tsx  # SATO AI autonomous voice & text copilot
    │       ├── JudgesTour.tsx      # Evaluators' 2-minute demo tour
    │       └── GraphCanvas.tsx     # Interactive link-analysis canvas
```
