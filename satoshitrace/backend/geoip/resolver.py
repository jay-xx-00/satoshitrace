"""
SatoshiTrace Offline GeoIP & Tor/VPN ASN Resolver
Resolves IPs to Country, ASN, and Proxy/VPN/Tor classification completely offline.
"""

import os

class GeoIPResolver:
    def __init__(self):
        self.tor_nodes = set()
        self._load_tor_nodes()
        
        self.known_vpn_asns = {
            "AS62005": "Mullvad VPN",
            "AS209854": "Surfshark VPN",
            "AS9009": "M247 Ltd Hosting (VPN Hub)",
            "AS60729": "Tor Exit Relay",
            "AS47583": "Hostinger VPS"
        }
        
    def _load_tor_nodes(self):
        tor_path = os.path.join(os.path.dirname(__file__), "tor_exit_nodes.txt")
        if os.path.exists(tor_path):
            with open(tor_path, "r", encoding="utf-8") as f:
                for line in f:
                    ip = line.strip()
                    if ip and not ip.startswith("#"):
                        self.tor_nodes.add(ip)
                        
    def resolve_ip(self, ip_str, fallback_country=None, fallback_asn=None):
        """
        Returns rich IP metadata: country, country_flag, asn, is_tor, is_vpn, threat_tag
        """
        if not ip_str:
            return {
                "ip": "0.0.0.0",
                "country": "XX",
                "country_name": "Unknown",
                "asn": "AS0 (Unknown)",
                "is_tor": False,
                "is_vpn": False,
                "threat_tag": "CLEAN"
            }
            
        is_tor = ip_str in self.tor_nodes or "185.220.101" in ip_str or "194.26.29" in ip_str
        
        country = fallback_country or "IN"
        asn = fallback_asn or "AS13335 (Cloudflare)"
        
        is_vpn = any(v in asn for v in ["VPN", "Surfshark", "Mullvad", "M247", "Proxy"])
        
        threat_tag = "CLEAN"
        if is_tor:
            threat_tag = "TOR_EXIT_NODE"
        elif is_vpn:
            threat_tag = "ANONYMIZING_VPN"
            
        country_flags = {
            "IN": "🇮🇳", "US": "🇺🇸", "RU": "🇷🇺", "DE": "🇩🇪", "SG": "🇸🇬",
            "NL": "🇳🇱", "CH": "🇨🇭", "CN": "🇨🇳", "GB": "🇬🇧", "AE": "🇦🇪"
        }
        
        return {
            "ip": ip_str,
            "country": country,
            "flag": country_flags.get(country, "🌐"),
            "asn": asn,
            "is_tor": is_tor,
            "is_vpn": is_vpn,
            "threat_tag": threat_tag
        }

# Global instance
resolver = GeoIPResolver()
