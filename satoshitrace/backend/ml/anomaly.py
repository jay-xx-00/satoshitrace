"""
SatoshiTrace Anomaly Detection Engine (Model A: Isolation Forest)
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

class IsolationForestDetector:
    def __init__(self, contamination=0.035):
        self.contamination = contamination
        self.model = IsolationForest(
            contamination=self.contamination,
            random_state=42,
            n_estimators=120,
            max_samples="auto"
        )
        self.scaler = StandardScaler()
        self.feature_names = ["velocity", "fan_ratio", "ip_entropy", "tor_vpn_ratio", "avg_fee", "total_volume"]
        
    def fit_predict(self, df_features):
        """
        Fits Isolation Forest on numeric features and outputs anomaly scores.
        Returns array of results with anomaly score and decision.
        """
        if len(df_features) == 0:
            return []
            
        X = df_features[self.feature_names].fillna(0).values
        X_scaled = self.scaler.fit_transform(X)
        
        self.model.fit(X_scaled)
        
        # Isolation Forest raw scores: lower score = more anomalous
        raw_scores = self.model.decision_function(X_scaled)
        preds = self.model.predict(X_scaled) # -1 is anomaly, 1 is normal
        
        # Normalize score to 0..1 confidence (1.0 = extremely anomalous)
        # Decision function is typically between -0.5 and +0.5
        min_s, max_s = raw_scores.min(), raw_scores.max()
        if max_s > min_s:
            norm_anomaly_score = 1.0 - ((raw_scores - min_s) / (max_s - min_s))
        else:
            norm_anomaly_score = np.zeros(len(raw_scores))
            
        results = []
        for idx, row in df_features.iterrows():
            is_anomaly = (preds[idx] == -1) and not bool(row.get("is_whitelisted", False))
            score = float(norm_anomaly_score[idx])
            
            # Whitelisted entities override to clean
            if bool(row.get("is_whitelisted", False)):
                is_anomaly = False
                score = 0.05
                
            results.append({
                "address": row["address"],
                "is_model_a_anomaly": bool(is_anomaly),
                "model_a_score": round(score, 4),
                "raw_decision_score": round(float(raw_scores[idx]), 4)
            })
            
        return results

model_a = IsolationForestDetector()
