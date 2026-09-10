"""
SatoshiTrace — Standalone Linux Release Packaging Utility
Creates a clean, portable distribution tarball and zip for Linux deployment.
"""

import os
import tarfile
import zipfile
import hashlib
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent

IGNORE_DIRS = {
    ".git", ".agents", "__pycache__", ".pytest_cache", ".idea", ".vscode",
    "antigravity-skills-1.3.0", "node_modules", ".vinxi", ".output", ".wrangler"
}

IGNORE_EXTENSIONS = {
    ".pyc", ".pyo", ".pyd", ".swp", ".tmp"
}

def is_ignored(path: Path) -> bool:
    for part in path.parts:
        if part in IGNORE_DIRS or part.startswith("antigravity-skills"):
            return True
    if path.suffix in IGNORE_EXTENSIONS:
        return True
    return False

def package_tar(output_filename="satoshitrace-linux-x86_64.tar.gz"):
    print(f"[*] Packaging release into {output_filename}...")
    dest_path = ROOT_DIR / output_filename
    
    with tarfile.open(dest_path, "w:gz") as tar:
        for file_or_dir in ROOT_DIR.iterdir():
            if file_or_dir.name in {output_filename, output_filename + ".sha256", "satoshitrace-linux-x86_64.zip"}:
                continue
            if is_ignored(file_or_dir):
                continue
            
            if file_or_dir.is_file():
                arcname = f"satoshitrace/{file_or_dir.name}"
                tar.add(file_or_dir, arcname=arcname)
            elif file_or_dir.is_dir():
                for root, dirs, files in os.walk(file_or_dir):
                    # Prune ignored directories in-place
                    dirs[:] = [d for d in dirs if d not in IGNORE_DIRS and not d.startswith("antigravity-skills")]
                    for f in files:
                        p = Path(root) / f
                        if not is_ignored(p):
                            rel = p.relative_to(ROOT_DIR)
                            arcname = f"satoshitrace/{rel.as_posix()}"
                            tar.add(p, arcname=arcname)
                            
    # Generate SHA-256
    sha256 = hashlib.sha256(dest_path.read_bytes()).hexdigest()
    sha_file = ROOT_DIR / f"{output_filename}.sha256"
    sha_file.write_text(f"{sha256}  {output_filename}\n", encoding="utf-8")
    
    size_mb = dest_path.stat().st_size / (1024 * 1024)
    print(f"[OK] Created {output_filename} ({size_mb:.2f} MB)")
    print(f"[OK] SHA-256: {sha256}")

if __name__ == "__main__":
    package_tar()
