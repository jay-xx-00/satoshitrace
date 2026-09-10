"""
SatoshiTrace Ego-Network Sub-Graph Slicing Engine
Enables sub-second rendering of 100k+ transaction datasets by dynamically extracting
the 2-hop neighborhood around focal suspect entities.
"""

import networkx as nx

def extract_ego_subgraph(G, focal_node_id, radius=2, max_nodes=120):
    """
    Extracts a bounded ego-network around a focal node (e.g. flagged criminal wallet).
    """
    if focal_node_id not in G:
        # Fallback to top-degree nodes
        focal_nodes = sorted(G.nodes(), key=lambda n: G.degree(n), reverse=True)[:1]
        if not focal_nodes:
            return G
        focal_node_id = focal_nodes[0]
        
    # Get 2-hop neighbors
    sub_nodes = set([focal_node_id])
    current_frontier = set([focal_node_id])
    
    G_undirected = G.to_undirected()
    
    for _ in range(radius):
        next_frontier = set()
        for n in current_frontier:
            neighbors = set(G_undirected.neighbors(n))
            next_frontier.update(neighbors)
        sub_nodes.update(next_frontier)
        current_frontier = next_frontier
        if len(sub_nodes) >= max_nodes:
            break
            
    # Cap to max_nodes
    selected_nodes = list(sub_nodes)[:max_nodes]
    subgraph = G.subgraph(selected_nodes).copy()
    
    return subgraph

def get_high_threat_overview_graph(G, threat_addresses, max_nodes=150):
    """
    Constructs an overview graph containing all flagged high-threat entities and their direct links.
    """
    threat_set = set(threat_addresses)
    relevant_nodes = set()
    
    for addr in threat_addresses[:25]:
        if addr in G:
            relevant_nodes.add(addr)
            # Add 1-hop neighbors (connecting transactions and IPs)
            relevant_nodes.update(G.predecessors(addr))
            relevant_nodes.update(G.successors(addr))
            
    if len(relevant_nodes) < 10:
        # Add top degree nodes if sparse
        top_deg = sorted(G.nodes(), key=lambda n: G.degree(n), reverse=True)[:50]
        relevant_nodes.update(top_deg)
        
    selected = list(relevant_nodes)[:max_nodes]
    return G.subgraph(selected).copy()
