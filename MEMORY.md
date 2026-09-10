# 🧠 SatoshiTrace — Project Memory & Architecture Context

> **Project:** SatoshiTrace (Smart India Hackathon 2026 | Problem Statement ID: SIH26146)  
> **Domain:** Bitcoin & Blockchain Forensics / Cybercrime Intelligence for Law Enforcement (CBI, ED, State Cybercrime Cells, FIU-IND, CERT-In)  
> **Platform Target:** 100% Offline-Ready Linux & Windows Execution (`127.0.0.1`, Zero Cloud Dependency)  
> **Last Updated:** 24 August 2026

---

## 🏛️ System Architecture Overview

SatoshiTrace is an offline forensic intelligence command center designed for Indian law enforcement agencies. It ingests seized Bitcoin P2P metadata dumps, correlates network-layer IP observations with blockchain ledger topologies, and applies multi-model AI consensus to isolate money laundering rings with Section 65B Indian Evidence Act certified electronic evidence dossiers.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SATOSHITRACE ARCHITECTURE                         │
│                      (100% Offline • Localhost • Zero Cloud)                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [1] INGESTION & FORENSIC HASHING LAYER                                     │
│      • Ingests CSV / JSON / XML bulk ledger dumps                           │
│      • Computes SHA-256 Chain-of-Custody hash for legal integrity           │
│      • Validates 14 protocol schema fields                                  │
│      • Resolves GeoIP + Tor/VPN ASNs completely offline                     │
│                                                                             │
│  [2] HETEROGENEOUS GRAPH ENGINE (NetworkX)                                  │
│      • Fuses IP Nodes (Blue), TXID Nodes (Diamond), Wallet Nodes (Green)    │
│      • Edge weights encode transfer amounts (BTC), timestamps, and ports    │
│      • Louvain Community Detection groups criminal syndicates               │
│      • Ego-network slicing & `/api/graph/{job_id}/gnodes` radial converter  │
│                                                                             │
│  [3] THREE-MODEL CONSENSUS AI ENGINE                                        │
│      • Model A: Isolation Forest (outlier transaction anomaly scoring)      │
│      • Model B: Subgraph Density & Degree Centrality Graph Matrix           │
│      • Model C: Algorithmic Tactic Rules (Peeling chain, CoinJoin, Smurf)   │
│      • Consensus Gate: RED (3/3 agreed), ORANGE (2/3), YELLOW (1/3)         │
│      • Whitelist Filter: 500+ pre-tagged Indian & Global exchanges (3.2% FPR)│
│      • SHAP (XAI): Mathematical feature contribution breakdowns (+%)        │
│                                                                             │
│  [4] LEGAL & JUDICIAL COMPLIANCE LAYER                                      │
│      • Section 65B(2) Indian Evidence Act Electronic Dossier (ReportLab PDF)│
│      • Section 91 CrPC / BNSS Statutory Exchange Freeze Notice Generator    │
│      • Human-in-the-Loop Review Gate (Confirm / Dismiss / Hold)             │
│                                                                             │
│  [5] USER INTERFACE & PRESENTATION (Vite + React 19 + Tailwind v4 + GSAP)   │
│      • SATO OS Forensic Kernel Diagnostic Bootup Sequence (`SatoBootSequence`)│
│      • SATO AI Autonomous Forensic Voice & Chat Assistant (`SatoshiCopilot`) │
│      • Judges 2-Minute Guided Winning Demo Tour (`JudgesTour`)              │
│      • Operations Dashboard with live metrics & World Heatmap               │
│      • Interactive Graph Canvas with live NetworkX visualization            │
│      • Prioritized Threat Leads Alert Queue                                 │
│      • 4D Temporal Fund Flow Replay Player                                  │
│      • Investigation Workbench (cross-ledger search, case notes notebook)   │
│      • Whitelist Directory & Section 65B Dossier Hub                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Winning Differentiators for SIH 2026 Evaluators

1. **SATO OS Forensic Kernel Diagnostic Boot (`SatoBootSequence.tsx`):**
   - Sleek, defense-grade double-bezel initialization console with live SHA-256 hex stream validation and latency telemetry benchmarks.
   - Built-in subtle synthesized acoustic engine with sub-bass pulses and tactile micro-clicks (zero external audio dependencies).
   - Triggerable anytime from TopBar and Settings via "**`SATO OS`**".

2. **SATO AI Autonomous Forensic Agent (`SatoshiCopilot.tsx`):**
   - Floating autonomous AI assistant providing explanations for SHAP feature bars, false-positive mathematical proofs (<3.2% FPR), peeling chains, and instant BNS 2023 FIR / Section 91 CrPC requisitions.
   - Offline Speech Synthesis (`window.speechSynthesis`) for audible case narration.

3. **2-Minute Winning Demo Tour Mode (`JudgesTour.tsx`):**
   - Step-by-step guided presentation flow traversing: Graph Canvas -> 3-Model Consensus -> SHAP Inspector -> CrPC Notice -> Section 65B PDF -> 4D Timeline.

4. **100% Offline Air-Gapped Operation:**
   - Operates on `127.0.0.1:8000` + `localhost:3000` with zero internet required.
   - Bundled GeoIP, Tor ASNs, and offline font fallbacks.

---

## 🚀 Quick Launch Commands

```bash
# On Linux / Kali / Ubuntu:
chmod +x run.sh
./run.sh

# On Windows (PowerShell):
.\run.ps1
```
