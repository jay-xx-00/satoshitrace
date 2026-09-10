"""
SatoshiTrace Multi-Format Ingestion Parser (CSV / JSON / XML)
"""

import pandas as pd
import io
import json
import xml.etree.ElementTree as ET
from .hasher import compute_file_sha256
from .validator import validate_dataframe

def parse_uploaded_file(file_bytes, filename):
    """
    Parses an uploaded CSV, JSON, or XML file into a standard DataFrame.
    Returns (success, df, file_hash_info, validation_stats, error_message)
    """
    hash_info = compute_file_sha256(file_bytes)
    filename_lower = filename.lower()
    
    try:
        if filename_lower.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(file_bytes))
        elif filename_lower.endswith(".json"):
            data = json.loads(file_bytes.decode("utf-8", errors="ignore"))
            if isinstance(data, list):
                df = pd.DataFrame(data)
            elif isinstance(data, dict) and "transactions" in data:
                df = pd.DataFrame(data["transactions"])
            else:
                df = pd.DataFrame([data])
        elif filename_lower.endswith(".xml"):
            root = ET.fromstring(file_bytes.decode("utf-8", errors="ignore"))
            rows = []
            for child in root.findall(".//transaction") or root.findall(".//record") or list(root):
                row = {elem.tag: elem.text for elem in child}
                rows.append(row)
            df = pd.DataFrame(rows)
        else:
            # Fallback attempt CSV
            df = pd.read_csv(io.BytesIO(file_bytes))
            
        # Clean dataframe column names
        df.columns = [str(c).strip() for c in df.columns]
        
        # Validate schema
        is_valid, missing, stats = validate_dataframe(df)
        if not is_valid:
            return False, None, hash_info, {}, f"Missing required fields: {', '.join(missing)}"
            
        # Fill standard defaults for missing optional columns
        if "src_port" not in df: df["src_port"] = 8333
        if "dst_port" not in df: df["dst_port"] = 8333
        if "fee_btc" not in df: df["fee_btc"] = 0.0001
        if "script_type" not in df: df["script_type"] = "p2wpkh"
        if "geo_country" not in df: df["geo_country"] = "IN"
        if "asn" not in df: df["asn"] = "AS13335 (Cloudflare)"
        
        # Ensure string types for addresses
        df["input_addresses"] = df["input_addresses"].astype(str)
        df["output_addresses"] = df["output_addresses"].astype(str)
        df["txid"] = df["txid"].astype(str)
        
        stats["sha256"] = hash_info["sha256"]
        stats["filename"] = filename
        
        return True, df, hash_info, stats, None
        
    except Exception as e:
        return False, None, hash_info, {}, f"Parsing error: {str(e)}"
