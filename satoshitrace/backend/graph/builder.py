"""
SatoshiTrace Heterogeneous Graph Engine (NetworkX)
Builds multi-layer graphs linking:
- IP Nodes (Network Layer)
- TXID Nodes (Blockchain Ledger Layer)
- Wallet Address Nodes (Entity Identity Layer)
"""

import networkx as nx
from ..geoip.resolver import resolver

def build_heterogeneous_graph(df):
    """
    Constructs a NetworkX graph connecting IPs, Transactions, and Wallets.
    Returns G (networkx.DiGraph)
    """
    G = nx.DiGraph()
    
    for _, row in df.iterrows():
        txid = str(row.get("txid", "")).strip()
        src_ip = str(row.get("src_ip", "")).strip()
        dst_ip = str(row.get("dst_ip", "")).strip()
        ts = int(row.get("timestamp", 0))
        fee = float(row.get("fee_btc", 0.0001))
        script = str(row.get("script_type", "p2wpkh"))
        country = str(row.get("geo_country", "IN"))
        asn = str(row.get("asn", ""))
        
        ip_info = resolver.resolve_ip(src_ip, fallback_country=country, fallback_asn=asn)
        
        # 1. Add Transaction Node
        G.add_node(
            txid,
            node_type="TXID",
            label=f"TX: {txid[:8]}...",
            full_id=txid,
            timestamp=ts,
            fee=fee,
            script_type=script
        )
        
        # 2. Add Source IP Node
        if src_ip:
            G.add_node(
                src_ip,
                node_type="IP",
                label=f"{ip_info['flag']} {src_ip}",
                full_id=src_ip,
                country=ip_info["country"],
                asn=ip_info["asn"],
                is_tor=ip_info["is_tor"],
                is_vpn=ip_info["is_vpn"]
            )
            # Edge: IP -> TXID (Broadcasted from)
            G.add_edge(src_ip, txid, edge_type="BROADCASTED_FROM", weight=1.0)
            
        # 3. Add Input Wallet Nodes
        in_addrs = [a.strip() for a in str(row.get("input_addresses", "")).split(";") if a.strip()]
        try:
            in_amts = [float(a.strip()) for a in str(row.get("input_amounts_btc", "0")).split(";") if a.strip()]
        except Exception:
            in_amts = [0.0] * len(in_addrs)
            
        for idx, addr in enumerate(in_addrs):
            amt = in_amts[idx] if idx < len(in_amts) else 0.0
            if addr not in G:
                G.add_node(
                    addr,
                    node_type="WALLET",
                    label=f"👛 {addr[:8]}...",
                    full_id=addr
                )
            # Edge: Wallet -> TXID (Input spent)
            G.add_edge(addr, txid, edge_type="INPUT_SPENT", amount=amt, timestamp=ts)
            
        # 4. Add Output Wallet Nodes
        out_addrs = [a.strip() for a in str(row.get("output_addresses", "")).split(";") if a.strip()]
        try:
            out_amts = [float(a.strip()) for a in str(row.get("output_amounts_btc", "0")).split(";") if a.strip()]
        except Exception:
            out_amts = [0.0] * len(out_addrs)
            
        for idx, addr in enumerate(out_addrs):
            amt = out_amts[idx] if idx < len(out_amts) else 0.0
            if addr not in G:
                G.add_node(
                    addr,
                    node_type="WALLET",
                    label=f"👛 {addr[:8]}...",
                    full_id=addr
                )
            # Edge: TXID -> Wallet (Output received)
            G.add_edge(txid, addr, edge_type="OUTPUT_RECEIVED", amount=amt, timestamp=ts)
            
    return G
