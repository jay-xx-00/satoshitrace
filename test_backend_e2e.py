import requests
import json
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://127.0.0.1:8000"

def test_api():
    print("=== [1] Testing Health & Global Stats ===")
    r = requests.get(f"{BASE_URL}/api/health")
    assert r.status_code == 200, f"Health failed: {r.status_code}"
    print("✓ Health Check Passed:", r.json())

    r_stats = requests.get(f"{BASE_URL}/api/stats")
    assert r_stats.status_code == 200
    print("✓ Global Stats Passed:", r_stats.json())

    print("\n=== [2] Testing File Upload & Ingestion with Test Dataset ===")
    with open(r"e:\sih2026\test_investigation_dataset.csv", "rb") as f:
        files = {"file": ("test_investigation_dataset.csv", f, "text/csv")}
        r = requests.post(f"{BASE_URL}/api/upload", files=files)
    assert r.status_code == 200, f"Upload failed: {r.text}"
    upload_data = r.json()
    job_id = upload_data["job_id"]
    print(f"✓ Upload Passed. Job ID: {job_id}")
    print(f"  SHA-256 Custody Hash: {upload_data['sha256']}")
    print(f"  Total Records: {upload_data['total_records']}")
    print(f"  Alerts Count: {upload_data['alerts_count']}")
    print(f"  Syndicates Found: {upload_data['syndicates_found']}")

    print("\n=== [3] Testing Graph Retrieval ===")
    r = requests.get(f"{BASE_URL}/api/graph/{job_id}")
    assert r.status_code == 200, f"Graph failed: {r.text}"
    graph_data = r.json()
    elements = graph_data.get("elements", [])
    print(f"✓ Graph Elements Retrieved: {len(elements)} items")

    print("\n=== [4] Testing Alerts & Consensus Scores ===")
    r = requests.get(f"{BASE_URL}/api/alerts/{job_id}")
    assert r.status_code == 200, f"Alerts failed: {r.text}"
    alerts_data = r.json()
    alerts = alerts_data.get("alerts", [])
    print(f"✓ Alerts Retrieved: {len(alerts)} alerts")
    for idx, a in enumerate(alerts[:5]):
        print(f"  [{idx+1}] Tier: {a['tier']} | Score: {a['risk_score_pct']}% | Addr: {a['address']} | Consensus: {a['models_agreed']}/3 | Tactic: {a['primary_tactic']}")

    print("\n=== [5] Testing Section 65B Electronic Dossier PDF Generation ===")
    r = requests.get(f"{BASE_URL}/api/report/{job_id}/pdf")
    assert r.status_code == 200, f"PDF report failed: {r.status_code}"
    assert r.headers.get("content-type") == "application/pdf"
    print(f"✓ Court-Ready Section 65B PDF generated successfully ({len(r.content)} bytes)")

    print("\n=== [6] Testing Section 91 CrPC Statutory Exchange Notice ===")
    first_addr = alerts[0]["address"] if alerts else "bc1q_test_target"
    r = requests.post(f"{BASE_URL}/api/crpc_notice", data={
        "wallet_address": first_addr,
        "exchange_name": "WazirX India / Zanmai Labs Pvt Ltd",
        "case_id": "CASE-2026-CBI-0891"
    })
    assert r.status_code == 200
    notice_text = r.json().get("notice_text", "")
    print(f"✓ Section 91 CrPC Notice generated ({len(notice_text)} chars)")
    print(f"  Snippet: {notice_text[:120]}...")

    print("\n=== [7] Testing Timeline Slices ===")
    r = requests.get(f"{BASE_URL}/api/timeline/{job_id}")
    assert r.status_code == 200
    timeline = r.json()
    print(f"✓ Timeline snapshots: {len(timeline.get('snapshots', []))} steps")

    print("\n=== [8] Testing Whitelist & 3.2% FPR Engine ===")
    r = requests.get(f"{BASE_URL}/api/whitelist")
    assert r.status_code == 200
    print(f"✓ Whitelist loaded: {len(r.json())} whitelisted exchanges/pools")

    print("\n=== [9] Testing Live Ransomware Attack Simulation ===")
    r = requests.post(f"{BASE_URL}/api/simulate_attack")
    assert r.status_code == 200
    sim = r.json()
    print(f"✓ Simulation triggered: {sim.get('attack_type')}, status: {sim.get('threat_level')}")

    print("\n=======================================================")
    print("  ALL 9 BACKEND VERIFICATION MODULES PASSED (100% OK)")
    print("=======================================================")

if __name__ == "__main__":
    test_api()
