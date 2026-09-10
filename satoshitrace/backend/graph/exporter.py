"""
SatoshiTrace Cytoscape.js Graph Exporter
Formats NetworkX graphs into styled JSON elements for the dark-mode frontend canvas.
"""

def export_to_cytoscape_elements(G, consensus_lookup=None, cluster_lookup=None):
    """
    Exports a NetworkX graph into Cytoscape.js `elements` array format with rich styling attributes.
    """
    elements = []
    consensus_lookup = consensus_lookup or {}
    cluster_lookup = cluster_lookup or {}
    
    # 1. Export Nodes
    for node_id, data in G.nodes(data=True):
        node_type = data.get("node_type", "WALLET")
        label = data.get("label", str(node_id)[:8])
        
        # Consensus threat styling for wallets
        cons = consensus_lookup.get(node_id, {})
        tier = cons.get("tier", "GREEN")
        risk_score = cons.get("risk_score_pct", 5)
        
        cluster_info = cluster_lookup.get(node_id, {})
        cluster_name = cluster_info.get("cluster_name", "General Network")
        
        # Determine visual style
        if node_type == "IP":
            shape = "hexagon"
            color = "#3B82F6" # Blue
            size = 38
            if data.get("is_tor"):
                color = "#F97316" # Orange for Tor
                label = f"🛡️ {label}"
        elif node_type == "TXID":
            shape = "diamond"
            color = "#9CA3AF" # Grey/white
            size = 28
        else: # WALLET
            shape = "ellipse"
            if tier == "RED":
                color = "#EF4444" # Red
                size = 52
                label = f"🚨 {label}"
            elif tier == "ORANGE":
                color = "#F59E0B" # Orange
                size = 44
                label = f"⚠️ {label}"
            elif tier == "YELLOW":
                color = "#EAB308" # Yellow
                size = 36
            else:
                color = "#10B981" # Green
                size = 32
                
        node_data = {
            "id": str(node_id),
            "label": label,
            "node_type": node_type,
            "tier": tier,
            "risk_score": risk_score,
            "shape": shape,
            "color": color,
            "size": size,
            "cluster_name": cluster_name,
            "is_suspect": tier in ["RED", "ORANGE"],
            "raw_data": {k: v for k, v in data.items() if k not in ["label", "shape", "color"]}
        }
        
        elements.append({
            "group": "nodes",
            "data": node_data
        })
        
    # 2. Export Edges
    for u, v, data in G.edges(data=True):
        edge_type = data.get("edge_type", "CONNECTED_TO")
        amount = data.get("amount", 0.0)
        
        edge_label = f"{amount:.4f} BTC" if amount > 0 else ""
        
        # Edge color matching threat
        source_tier = consensus_lookup.get(u, {}).get("tier", "GREEN")
        target_tier = consensus_lookup.get(v, {}).get("tier", "GREEN")
        
        if source_tier == "RED" or target_tier == "RED":
            edge_color = "#EF4444"
            line_style = "dashed"
        elif source_tier == "ORANGE" or target_tier == "ORANGE":
            edge_color = "#F59E0B"
            line_style = "dashed"
        else:
            edge_color = "#4B5563"
            line_style = "solid"
            
        edge_data = {
            "id": f"{u}_{v}",
            "source": str(u),
            "target": str(v),
            "label": edge_label,
            "edge_type": edge_type,
            "amount_btc": amount,
            "line_style": line_style,
            "color": edge_color
        }
        
        elements.append({
            "group": "edges",
            "data": edge_data
        })
        
    return elements
