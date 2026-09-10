"""
SatoshiTrace - Synthetic Bitcoin P2P & Blockchain Transaction Generator
Generates high-fidelity datasets conforming to SIH26146 specifications:
- timestamp, src_ip, dst_ip, src_port, dst_port, txid
- input_addresses[], output_addresses[], input_amounts[], output_amounts[], fee, script_type
- geo_country, asn, is_known_anomaly, tactic_type, cluster_label
"""

import csv
import random
import time
import uuid
import os
import sys

COUNTRIES = ["IN", "US", "RU", "DE", "SG", "NL", "CH", "CN", "GB", "AE"]

ASNS = [
    {"name": "AS13335 (Cloudflare)", "is_tor_vpn": False},
    {"name": "AS16509 (Amazon AWS)", "is_tor_vpn": False},
    {"name": "AS15169 (Google LLC)", "is_tor_vpn": False},
    {"name": "AS55836 (Reliance Jio)", "is_tor_vpn": False},
    {"name": "AS9498 (Bharti Airtel)", "is_tor_vpn": False},
    {"name": "AS62005 (Mullvad VPN)", "is_tor_vpn": True},
    {"name": "AS209854 (Surfshark VPN)", "is_tor_vpn": True},
    {"name": "AS9009 (M247 Ltd Hosting)", "is_tor_vpn": True},
    {"name": "AS47583 (Hostinger VPS)", "is_tor_vpn": False},
    {"name": "AS60729 (Tor Exit Relay Node)", "is_tor_vpn": True},
]

SCRIPT_TYPES = ["p2pkh", "p2sh", "p2wpkh", "p2tr"]

def random_ip():
    return f"{random.randint(11, 220)}.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(1, 254)}"

def random_btc_address(prefix="bc1q"):
    chars = "023456789acdefghjklmnpqrstuvwxyz"
    return prefix + "".join(random.choices(chars, k=38))

def generate_dataset(num_records=5000, output_file=None):
    if not output_file:
        output_file = os.path.join(os.path.dirname(__file__), "..", "backend", "data", "sample_dataset.csv")
    
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    print(f"[*] Generating {num_records} synthetic Bitcoin P2P transaction records...")
    
    base_time = int(time.time()) - (86400 * 3) # 3 days ago
    
    # Pre-generate some known syndicate hubs and exchange pools
    syndicates = {
        "Syndicate-Alpha (LockBit Affiliate)": [random_btc_address("bc1q_lockbit_") for _ in range(5)],
        "Syndicate-Bravo (Darknet Market Nexus)": [random_btc_address("bc1q_darknet_") for _ in range(4)],
        "Syndicate-Charlie (UPI-Crypto Mule Net)": [random_btc_address("bc1q_mule_") for _ in range(6)]
    }
    
    # Pre-generate regular wallet pool
    normal_wallets = [random_btc_address() for _ in range(200)]
    
    records = []
    
    current_time = base_time
    
    # 1. Generate normal organic transactions (approx 93%)
    num_anomalies = int(num_records * 0.07)
    num_normal = num_records - num_anomalies
    
    for i in range(num_normal):
        current_time += random.randint(1, 45)
        src_ip = random_ip()
        dst_ip = random_ip()
        src_port = random.randint(1024, 65535)
        dst_port = 8333 # Standard Bitcoin P2P port
        txid = uuid.uuid4().hex + uuid.uuid4().hex[:32]
        
        asn_obj = random.choice([a for a in ASNS if not a["is_tor_vpn"]])
        country = random.choice(COUNTRIES)
        
        # 1-2 inputs, 1-2 outputs
        num_in = random.randint(1, 2)
        num_out = random.randint(1, 2)
        
        in_addrs = [random.choice(normal_wallets) for _ in range(num_in)]
        out_addrs = [random.choice(normal_wallets) for _ in range(num_out)]
        
        total_btc = round(random.uniform(0.005, 1.85), 6)
        fee = round(random.uniform(0.00004, 0.00025), 8)
        
        in_amts = ";".join([str(round(total_btc / num_in, 6))] * num_in)
        out_amts = ";".join([str(round((total_btc - fee) / num_out, 6))] * num_out)
        
        records.append({
            "timestamp": current_time,
            "src_ip": src_ip,
            "dst_ip": dst_ip,
            "src_port": src_port,
            "dst_port": dst_port,
            "txid": txid,
            "input_addresses": ";".join(in_addrs),
            "output_addresses": ";".join(out_addrs),
            "input_amounts_btc": in_amts,
            "output_amounts_btc": out_amts,
            "fee_btc": fee,
            "script_type": random.choice(SCRIPT_TYPES),
            "geo_country": country,
            "asn": asn_obj["name"],
            "is_known_anomaly": 0,
            "tactic_type": "NORMAL",
            "cluster_label": "ORGANIC_RETAIL"
        })
        
    # 2. Inject high-threat cybercrime patterns (Peeling Chains, CoinJoin Mixers, Smurfing, Rapid Fan-Outs)
    # Pattern A: Peeling Chain (LockBit Ransomware laundering sequence)
    lockbit_wallets = syndicates["Syndicate-Alpha (LockBit Affiliate)"]
    peel_time = base_time + 3600
    current_peel_wallet = lockbit_wallets[0]
    peel_amount = 25.0 # 25 BTC stolen
    
    for hop in range(8):
        peel_time += random.randint(10, 45) # rapid hops
        txid = "tx_peel_" + uuid.uuid4().hex[:24]
        peel_off = round(peel_amount * 0.08, 4) # 8% cashed out
        remaining = round(peel_amount - peel_off - 0.0005, 4)
        next_wallet = lockbit_wallets[(hop + 1) % len(lockbit_wallets)] if hop < len(lockbit_wallets) - 1 else random_btc_address("bc1q_peel_hop_")
        cashout_addr = random_btc_address("bc1q_cashout_")
        
        records.append({
            "timestamp": peel_time,
            "src_ip": "185.220.101." + str(random.randint(10, 99)),
            "dst_ip": random_ip(),
            "src_port": random.randint(20000, 60000),
            "dst_port": 8333,
            "txid": txid,
            "input_addresses": current_peel_wallet,
            "output_addresses": f"{next_wallet};{cashout_addr}",
            "input_amounts_btc": str(peel_amount),
            "output_amounts_btc": f"{remaining};{peel_off}",
            "fee_btc": 0.0005,
            "script_type": "p2wpkh",
            "geo_country": "CH",
            "asn": "AS62005 (Mullvad VPN)",
            "is_known_anomaly": 1,
            "tactic_type": "PEELING_CHAIN",
            "cluster_label": "LockBit-Affiliate-3.0"
        })
        current_peel_wallet = next_wallet
        peel_amount = remaining
        
    # Pattern B: CoinJoin Equal-Output Mixer (Wasabi / Whirlpool pattern)
    mixer_time = base_time + 7200
    mixer_inputs = [random_btc_address("bc1q_mixer_in_") for _ in range(8)]
    mixer_outputs = [random_btc_address("bc1q_mixer_out_") for _ in range(8)]
    equal_amt = 0.500000 # Equal denomination
    
    records.append({
        "timestamp": mixer_time,
        "src_ip": "194.26.29." + str(random.randint(10, 99)),
        "dst_ip": random_ip(),
        "src_port": 45120,
        "dst_port": 8333,
        "txid": "tx_coinjoin_mixer_" + uuid.uuid4().hex[:20],
        "input_addresses": ";".join(mixer_inputs),
        "output_addresses": ";".join(mixer_outputs),
        "input_amounts_btc": ";".join(["0.500500"] * 8),
        "output_amounts_btc": ";".join([f"{equal_amt:.6f}"] * 8),
        "fee_btc": 0.004000,
        "script_type": "p2tr",
        "geo_country": "NL",
        "asn": "AS60729 (Tor Exit Relay Node)",
        "is_known_anomaly": 1,
        "tactic_type": "COINJOIN_MIXER",
        "cluster_label": "Wasabi-Mixer-Pool-A"
    })
    
    # Pattern C: Smurfing / Structuring (Micro-burst transactions below tax threshold)
    smurf_time = base_time + 14400
    smurf_mules = syndicates["Syndicate-Charlie (UPI-Crypto Mule Net)"]
    hub_wallet = random_btc_address("bc1q_smurf_master_")
    
    for s_idx in range(12):
        smurf_time += random.randint(5, 30)
        records.append({
            "timestamp": smurf_time,
            "src_ip": "103.21.244." + str(random.randint(10, 99)),
            "dst_ip": random_ip(),
            "src_port": random.randint(10000, 50000),
            "dst_port": 8333,
            "txid": "tx_smurf_" + uuid.uuid4().hex[:24],
            "input_addresses": random.choice(smurf_mules),
            "output_addresses": hub_wallet,
            "input_amounts_btc": "0.098500",
            "output_amounts_btc": "0.098400",
            "fee_btc": 0.000100,
            "script_type": "p2pkh",
            "geo_country": "IN",
            "asn": "AS209854 (Surfshark VPN)",
            "is_known_anomaly": 1,
            "tactic_type": "SMURFING_STRUCTURING",
            "cluster_label": "UPI-Crypto-Mule-Ring"
        })
        
    # Sort all records chronologically
    records.sort(key=lambda r: r["timestamp"])
    
    # Write to CSV
    headers = [
        "timestamp", "src_ip", "dst_ip", "src_port", "dst_port", "txid",
        "input_addresses", "output_addresses", "input_amounts_btc", "output_amounts_btc",
        "fee_btc", "script_type", "geo_country", "asn", "is_known_anomaly", "tactic_type", "cluster_label"
    ]
    
    with open(output_file, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        writer.writerows(records)
        
    print(f"[+] Successfully generated {len(records)} records in: {output_file}")
    return output_file

if __name__ == "__main__":
    count = int(sys.argv[1]) if len(sys.argv) > 1 else 10000
    generate_dataset(num_records=count)
