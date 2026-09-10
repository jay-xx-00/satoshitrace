"""
SatoshiTrace Whitelist & Known Clean Entity Filter
Prevents false positives on high-volume crypto exchanges and mining pools.
"""

import json
import os

class EntityWhitelist:
    def __init__(self):
        self.whitelisted_addresses = {}
        self._load_whitelist()
        
    def _load_whitelist(self):
        json_path = os.path.join(os.path.dirname(__file__), "..", "data", "known_exchanges.json")
        if os.path.exists(json_path):
            with open(json_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                for ent in data.get("entities", []):
                    name = ent.get("name", "Unknown Clean Entity")
                    cat = ent.get("category", "EXCHANGE")
                    for addr in ent.get("addresses", []):
                        self.whitelisted_addresses[addr] = {
                            "name": name,
                            "category": cat,
                            "is_whitelisted": True
                        }
                        
    def is_clean(self, address):
        """
        Returns (is_whitelisted, entity_info)
        """
        if address in self.whitelisted_addresses:
            return True, self.whitelisted_addresses[address]
        # Heuristic match
        for w_addr, info in self.whitelisted_addresses.items():
            if w_addr.lower() in address.lower():
                return True, info
        return False, None

whitelist = EntityWhitelist()
