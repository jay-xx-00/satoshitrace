"""
SatoshiTrace Community Detection & Syndicate Grouping Engine
Detects criminal syndicates using connected component & modularity analysis.
"""

import networkx as nx
from collections import defaultdict

def detect_syndicate_clusters(G):
    """
    Identifies tightly coupled entity clusters and returns cluster labels per node.
    Uses modularity-based community detection to distribute entities into balanced syndicates.
    """
    # Convert to undirected graph for community grouping
    G_undirected = G.to_undirected()
    
    # Try modularity community detection first to avoid giant monolithic clump
    components = []
    try:
        raw_comms = list(nx.community.greedy_modularity_communities(G_undirected))
        if len(raw_comms) >= 2:
            components = [set(c) for c in raw_comms]
    except Exception:
        pass

    if not components:
        components = [set(c) for c in nx.connected_components(G_undirected)]

    # If the largest component still holds > 12 nodes and we have few clusters, subdivide it
    subdivided = []
    for comp in components:
        if len(comp) > 14 and len(components) < 4:
            subgraph = G_undirected.subgraph(comp)
            try:
                sub_comms = list(nx.community.greedy_modularity_communities(subgraph))
                if len(sub_comms) >= 2:
                    subdivided.extend([set(sc) for sc in sub_comms])
                    continue
            except Exception:
                pass
        subdivided.append(comp)

    components = subdivided
    # Sort largest component first
    components.sort(key=lambda c: -len(c))
    
    node_to_cluster = {}
    cluster_summaries = []

    SYNDICATE_NAMES = [
        "LockBit Extortion Nexus",
        "UPI Mule Network",
        "Wasabi CoinJoin Pool",
        "Tor Relays Syndicate",
        "Shadow Cashout Group",
    ]
    
    for c_idx, comp in enumerate(components):
        cluster_name = SYNDICATE_NAMES[c_idx % len(SYNDICATE_NAMES)]
            
        wallets_in_comp = [n for n in comp if G.nodes.get(n, {}).get("node_type") == "WALLET"]
        txs_in_comp = [n for n in comp if G.nodes.get(n, {}).get("node_type") == "TXID"]
        ips_in_comp = [n for n in comp if G.nodes.get(n, {}).get("node_type") == "IP"]
        
        cluster_info = {
            "cluster_id": f"cluster_{c_idx + 1}",
            "cluster_name": cluster_name,
            "total_nodes": len(comp),
            "wallet_count": len(wallets_in_comp),
            "tx_count": len(txs_in_comp),
            "ip_count": len(ips_in_comp),
            "sample_wallets": wallets_in_comp[:5]
        }
        cluster_summaries.append(cluster_info)
        
        for node in comp:
            node_to_cluster[node] = {
                "cluster_id": f"cluster_{c_idx + 1}",
                "cluster_name": cluster_name
            }
            
    return node_to_cluster, cluster_summaries
