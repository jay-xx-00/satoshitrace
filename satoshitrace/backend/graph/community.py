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

    def _derive_cluster_name(comp_nodes, g_obj, idx):
        tor_nodes = [n for n in comp_nodes if g_obj.nodes.get(n, {}).get("is_tor")]
        countries = [g_obj.nodes.get(n, {}).get("country") for n in comp_nodes if g_obj.nodes.get(n, {}).get("country")]
        countries = [c for c in countries if c and c not in ["XX", "UNKNOWN"]]
        wallets = [n for n in comp_nodes if g_obj.nodes.get(n, {}).get("node_type") == "WALLET"]
        top_country = max(set(countries), key=countries.count) if countries else None
        
        if tor_nodes:
            suffix = f" [{top_country}]" if top_country else ""
            return f"Tor Onion Relay Ring #{idx + 1}{suffix}"
        elif len(wallets) >= 3:
            suffix = f" [{top_country}]" if top_country else ""
            return f"Multi-Wallet Syndicate #{idx + 1}{suffix}"
        elif top_country:
            return f"Regional Ingress Cluster #{idx + 1} ({top_country})"
        elif wallets:
            return f"Entity Network #{idx + 1} ({str(wallets[0])[:8]}...)"
        else:
            return f"Transaction Nexus #{idx + 1}"

    for c_idx, comp in enumerate(components):
        cluster_name = _derive_cluster_name(comp, G, c_idx)
            
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
