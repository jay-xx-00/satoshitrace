"""
SatoshiTrace Field & Schema Validator
Validates required Bitcoin P2P metadata parameters as defined in SIH26146.
"""

REQUIRED_FIELDS = [
    "timestamp", "src_ip", "dst_ip", "txid",
    "input_addresses", "output_addresses"
]

OPTIONAL_FIELDS = [
    "src_port", "dst_port", "input_amounts_btc", "output_amounts_btc",
    "fee_btc", "script_type", "geo_country", "asn"
]

def validate_dataframe(df):
    """
    Validates that the uploaded dataframe contains all mandatory columns.
    Returns (is_valid, missing_fields, stats_dict)
    """
    cols = set(df.columns)
    missing = [f for f in REQUIRED_FIELDS if f not in cols]
    
    if missing:
        return False, missing, {}
        
    stats = {
        "total_rows": len(df),
        "columns_found": list(df.columns),
        "unique_txids": int(df["txid"].nunique()) if "txid" in df else len(df),
        "has_ip_layer": "src_ip" in df and "dst_ip" in df,
        "has_amounts": "input_amounts_btc" in df or "output_amounts_btc" in df,
        "has_geoip": "geo_country" in df
    }
    
    return True, [], stats
