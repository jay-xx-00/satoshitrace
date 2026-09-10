"""
SatoshiTrace Three-Model Consensus Gate
Eliminates single-model false positives by combining:
1. Model A: Isolation Forest (Statistical Outliers)
2. Model B: Graph Subgraph Anomaly / Ego-Network Density
3. Model C: Rule-Based Tactic Detector (Peeling Chains, CoinJoin, Smurfing, Tor/VPN)

Consensus Rules:
- 3/3 Models Agree -> RED (HIGH RISK INVESTIGATIVE LEAD)
- 2/3 Models Agree -> ORANGE (MEDIUM RISK LEAD)
- 1/3 Models Agree -> YELLOW (LOW SUSPICION NOTICE)
- 0/3 Models Agree -> GREEN (CLEAN)
"""

def evaluate_consensus(model_a_result, graph_metric, tactics_list, is_whitelisted=False):
    """
    Evaluates multi-model consensus for an entity.
    """
    if is_whitelisted:
        return {
            "tier": "GREEN",
            "risk_label": "CLEAN_WHITELISTED",
            "risk_score_pct": 2,
            "models_agreed": 0,
            "total_models": 3,
            "status": "WHITELISTED",
            "flag_color": "#10B981" # Green
        }
        
    vote_a = bool(model_a_result.get("is_model_a_anomaly", False))
    
    # Model B: Graph Structural Anomaly (High degree centrality + high entropy or isolated burst)
    subgraph_density = graph_metric.get("subgraph_density", 1.0)
    vote_b = subgraph_density > 2.5 or graph_metric.get("is_graph_anomaly", False)
    
    # Model C: Confirmed Laundering Tactic
    has_high_threat_tactic = any(t.get("severity") in ["HIGH", "CRITICAL"] for t in tactics_list)
    vote_c = has_high_threat_tactic or len(tactics_list) >= 2
    
    agreed_count = sum([vote_a, vote_b, vote_c])
    
    # Weighted risk score calculation (0..100)
    score_a = model_a_result.get("model_a_score", 0.0) * 35.0
    score_b = min(30.0, (subgraph_density / 3.5) * 30.0)
    score_c = 35.0 if has_high_threat_tactic else (len(tactics_list) * 15.0)
    
    total_score = min(99, int(score_a + score_b + score_c))
    
    if agreed_count == 3:
        tier = "RED"
        risk_label = "HIGH RISK INVESTIGATIVE LEAD"
        flag_color = "#EF4444" # Red
        total_score = max(88, total_score)
    elif agreed_count == 2:
        tier = "ORANGE"
        risk_label = "MEDIUM RISK LEAD"
        flag_color = "#F59E0B" # Orange
        total_score = max(65, min(87, total_score))
    elif agreed_count == 1:
        tier = "YELLOW"
        risk_label = "LOW SUSPICION NOTICE"
        flag_color = "#EAB308" # Yellow
        total_score = max(35, min(64, total_score))
    else:
        tier = "GREEN"
        risk_label = "NORMAL TRAFFIC"
        flag_color = "#10B981" # Green
        total_score = min(25, total_score)
        
    return {
        "tier": tier,
        "risk_label": risk_label,
        "risk_score_pct": total_score,
        "models_agreed": agreed_count,
        "total_models": 3,
        "model_a_vote": vote_a,
        "model_b_vote": vote_b,
        "model_c_vote": vote_c,
        "flag_color": flag_color,
        "is_escalated": tier in ["RED", "ORANGE"]
    }
