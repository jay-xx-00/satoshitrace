"""
SatoshiTrace Graph & Behavioral Feature Extractor
Extracts 6 high-dimensional features per entity for machine learning anomaly detection.
"""

import pandas as pd
import numpy as np
from collections import defaultdict
from .whitelist import whitelist

def extract_wallet_features(df):
    """
    Extracts behavioral, topological, and network features for every unique wallet address.
    Returns:
    - wallet_feature_matrix: DataFrame ready for ML
    - wallet_metadata: Dict with contextual details per wallet
    """
    wallet_stats = defaultdict(lambda: {
        "tx_count": 0,
        "total_btc_in": 0.0,
        "total_btc_out": 0.0,
        "first_seen": float("inf"),
        "last_seen": 0,
        "unique_ips": set(),
        "asns": set(),
        "fan_out_counts": [],
        "fan_in_counts": [],
        "fees_paid": [],
        "is_tor_vpn_count": 0,
        "txids": []
    })
    
    for _, row in df.iterrows():
        ts = int(row.get("timestamp", 0))
        src_ip = str(row.get("src_ip", ""))
        asn = str(row.get("asn", ""))
        txid = str(row.get("txid", ""))
        fee = float(row.get("fee_btc", 0.0001))
        
        is_tor_vpn = any(k in asn for k in ["VPN", "Tor", "Mullvad", "Surfshark", "M247"])
        
        # Parse inputs
        in_addrs = [a.strip() for a in str(row.get("input_addresses", "")).split(";") if a.strip()]
        out_addrs = [a.strip() for a in str(row.get("output_addresses", "")).split(";") if a.strip()]
        
        try:
            in_amts = [float(a.strip()) for a in str(row.get("input_amounts_btc", "0")).split(";") if a.strip()]
        except Exception:
            in_amts = [0.0] * len(in_addrs)
            
        try:
            out_amts = [float(a.strip()) for a in str(row.get("output_amounts_btc", "0")).split(";") if a.strip()]
        except Exception:
            out_amts = [0.0] * len(out_addrs)
            
        # Update inputs
        for idx, addr in enumerate(in_addrs):
            amt = in_amts[idx] if idx < len(in_amts) else 0.0
            st = wallet_stats[addr]
            st["tx_count"] += 1
            st["total_btc_out"] += amt
            st["first_seen"] = min(st["first_seen"], ts)
            st["last_seen"] = max(st["last_seen"], ts)
            st["unique_ips"].add(src_ip)
            st["asns"].add(asn)
            st["fan_out_counts"].append(len(out_addrs))
            st["fees_paid"].append(fee)
            st["txids"].append(txid)
            if is_tor_vpn: st["is_tor_vpn_count"] += 1
            
        # Update outputs
        for idx, addr in enumerate(out_addrs):
            amt = out_amts[idx] if idx < len(out_amts) else 0.0
            st = wallet_stats[addr]
            st["tx_count"] += 1
            st["total_btc_in"] += amt
            st["first_seen"] = min(st["first_seen"], ts)
            st["last_seen"] = max(st["last_seen"], ts)
            st["unique_ips"].add(src_ip)
            st["asns"].add(asn)
            st["fan_in_counts"].append(len(in_addrs))
            st["txids"].append(txid)
            if is_tor_vpn: st["is_tor_vpn_count"] += 1
            
    # Assemble feature matrix
    rows = []
    metadata = {}
    
    for addr, st in wallet_stats.items():
        is_clean, clean_info = whitelist.is_clean(addr)
        
        duration_seconds = max(1, st["last_seen"] - st["first_seen"])
        velocity_tx_per_hour = (st["tx_count"] / duration_seconds) * 3600.0
        
        avg_fan_out = np.mean(st["fan_out_counts"]) if st["fan_out_counts"] else 1.0
        avg_fan_in = np.mean(st["fan_in_counts"]) if st["fan_in_counts"] else 1.0
        fan_ratio = avg_fan_out / max(0.1, avg_fan_in)
        
        ip_entropy = len(st["unique_ips"])
        tor_vpn_ratio = st["is_tor_vpn_count"] / max(1, st["tx_count"])
        avg_fee = np.mean(st["fees_paid"]) if st["fees_paid"] else 0.0001
        
        total_volume = st["total_btc_in"] + st["total_btc_out"]
        
        rows.append({
            "address": addr,
            "velocity": velocity_tx_per_hour,
            "fan_ratio": fan_ratio,
            "ip_entropy": ip_entropy,
            "tor_vpn_ratio": tor_vpn_ratio,
            "avg_fee": avg_fee,
            "total_volume": total_volume,
            "tx_count": st["tx_count"],
            "is_whitelisted": is_clean
        })
        
        metadata[addr] = {
            "address": addr,
            "tx_count": st["tx_count"],
            "total_btc_in": round(st["total_btc_in"], 6),
            "total_btc_out": round(st["total_btc_out"], 6),
            "unique_ips": list(st["unique_ips"])[:10],
            "asns": list(st["asns"])[:5],
            "duration_mins": round(duration_seconds / 60, 1),
            "is_whitelisted": is_clean,
            "whitelist_info": clean_info,
            "txids": list(set(st["txids"]))[:20]
        }
        
    df_features = pd.DataFrame(rows)
    return df_features, metadata
