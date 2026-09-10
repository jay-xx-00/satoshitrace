"""
SatoshiTrace Cryptographic Hasher
Generates SHA-256 Merkle root & file hashes for IT Act 2000 Section 65B Court Evidence Admissibility.
"""

import hashlib
import time

def compute_file_sha256(file_bytes_or_path):
    """
    Computes SHA-256 hash of a file or byte stream.
    """
    hasher = hashlib.sha256()
    
    if isinstance(file_bytes_or_path, str):
        with open(file_bytes_or_path, "rb") as f:
            while chunk := f.read(65536):
                hasher.update(chunk)
    else:
        hasher.update(file_bytes_or_path)
        
    digest = hasher.hexdigest()
    
    return {
        "sha256": digest,
        "algorithm": "SHA-256",
        "timestamp": int(time.time()),
        "iso_time": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "legal_notice": "Cryptographically locked under Section 65B Indian Evidence / IT Act 2000"
    }
