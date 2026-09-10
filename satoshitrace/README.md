# 🏆 SatoshiTrace: AI-Powered Monitoring & Analysis of Bitcoin Transaction Traffic
## Smart India Hackathon 2026 | Problem Statement ID: SIH26146

> **Theme:** Blockchain & Cybersecurity / Law Enforcement  
> **Platform:** 100% Offline Linux x86_64 / Web Application  
> **Target Agencies:** Central Bureau of Investigation (CBI), Enforcement Directorate (ED), State Cyber Crime Cells, FIU-IND, C3iHub (IIT Kanpur)

---

## 📌 Executive Summary
**SatoshiTrace** is an offline forensic intelligence platform designed for law enforcement agencies to ingest bulk Bitcoin P2P and ledger metadata, correlate network-layer IP observations with blockchain transaction topologies, and apply multi-model AI to detect money laundering syndicates (Peeling Chains, CoinJoin Mixers, Smurfing) with court-admissible Section 65B IT Act explainability.

---

## 🛠️ Architecture & Technical Approach

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        SATOSHITRACE ARCHITECTURE                        │
│                     (Fully Offline — Linux — localhost)                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  [1] INGESTION & HASHING LAYER                                          │
│      • Ingests CSV / JSON / XML bulk metadata logs                      │
│      • Computes SHA-256 Chain-of-Custody hash for legal integrity        │
│      • Validates 14 protocol fields (IPs, ports, TXIDs, amounts, etc.)  │
│      • Resolves GeoIP Country + Tor/VPN ASNs offline                    │
│                                                                         │
│  [2] HETEROGENEOUS GRAPH ENGINE (NetworkX)                              │
│      • Fuses IP Nodes (Blue), TXID Nodes (Diamond), Wallet Nodes (Green)│
│      • Edge weights encode transfer amounts, timestamps, and ports      │
│      • Louvain community detection maps criminal syndicate clusters     │
│      • Server-side ego-network slicing enables 100k+ scale at 60 FPS    │
│                                                                         │
│  [3] THREE-MODEL CONSENSUS AI ENGINE                                    │
│      • Model A: Isolation Forest (outlier transaction anomaly scoring)  │
│      • Model B: Graph Subgraph Anomaly & Degree Centrality Matrix       │
│      • Model C: Algorithmic Tactic Rules (Peeling chain, Mixers, Smurf) │
│      • Consensus Gate: RED (3/3 agreed), ORANGE (2/3), YELLOW (1/3)     │
│      • Whitelist Filter: 500+ pre-tagged clean exchanges (3.2% FPR)     │
│      • SHAP (XAI): Mathematical feature contribution breakdowns (+%)    │
│                                                                         │
│  [4] PRESENTATION & LEGAL EXPORT LAYER                                  │
│      • Cytoscape.js Dark-Mode Cyber Command Center Web Interface        │
│      • Slide-in SHAP Evidence Inspector Drawer                          │
│      • Human-in-the-Loop Review Gate (Confirm / Dismiss / Hold)         │
│      • Section 65B IT Act Certified PDF Forensic Evidence Dossier       │
│      • Section 91 CrPC Statutory Exchange Freezing Notice Generator     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start & Offline Demo Instructions

### 1. Requirements
- Python 3.10+
- Modern Web Browser (Chrome / Firefox / Edge)
- Operating System: Linux (Ubuntu 22.04 LTS / Kali) or Windows (WSL2 / PowerShell)

### 2. Single-Command Launch
```bash
# On Linux / Ubuntu / Kali:
chmod +x run.sh
./run.sh

# On Windows (PowerShell):
.\run.ps1
```

Open your browser at `http://127.0.0.1:3000` (zero internet required).

---

## 🧪 Synthetic Dataset Generation (100k+ Records)
To generate fresh testing datasets matching official SIH26146 parameters:
```bash
python data_generator/generate_dataset.py 10000
```

---

## ⚖️ Legal & Court Admissibility Framework
1. **Section 65B Indian Evidence Act / IT Act 2000:** Every PDF report includes cryptographic SHA-256 hash validation and statutory certification.
2. **Section 91 CrPC Notice Generator:** Automated legal notice ready for compliance officers at WazirX, CoinDCX, and Binance.
3. **Mandatory Lead Disclaimer:** All outputs are formatted as investigative leads requiring human investigator confirmation prior to court action, eliminating legal liability from statistical false positives.
