#!/usr/bin/env bash
# ==============================================================================
# SatoshiTrace — Linux One-Click Installer & Desktop Setup
# Smart India Hackathon (SIH 2026) | Problem Statement ID: SIH26146
# ==============================================================================

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "========================================================================"
echo "  ₿ SatoshiTrace Linux Installer"
echo "  Setting up forensic workstation environment..."
echo "========================================================================"

# Make scripts executable
chmod +x "$DIR/run.sh" 2>/dev/null || true
if [ -f "$DIR/satoshitrace/run.sh" ]; then
    chmod +x "$DIR/satoshitrace/run.sh" 2>/dev/null || true
fi

# Detect package manager to ensure python3 and npm
if ! command -v python3 &> /dev/null; then
    echo "[!] python3 is not found. Attempting install..."
    if command -v apt-get &> /dev/null; then
        sudo apt-get update && sudo apt-get install -y python3 python3-pip python3-venv
    elif command -v dnf &> /dev/null; then
        sudo dnf install -y python3 python3-pip
    elif command -v pacman &> /dev/null; then
        sudo pacman -Sy --noconfirm python python-pip
    fi
fi

if ! command -v npm &> /dev/null; then
    echo "[!] Node.js/npm is not found. Attempting install..."
    if command -v apt-get &> /dev/null; then
        sudo apt-get update && sudo apt-get install -y nodejs npm
    elif command -v dnf &> /dev/null; then
        sudo dnf install -y nodejs npm
    elif command -v pacman &> /dev/null; then
        sudo pacman -Sy --noconfirm nodejs npm
    fi
fi

# Register Desktop Shortcut if desktop environment exists
DESKTOP_DIR="$HOME/.local/share/applications"
mkdir -p "$DESKTOP_DIR"

if [ -f "$DIR/satoshitrace.desktop" ]; then
    sed -e "s|Exec=.*|Exec=bash -c \"cd $DIR \&\& ./run.sh\"|g" "$DIR/satoshitrace.desktop" > "$DESKTOP_DIR/satoshitrace.desktop"
    chmod +x "$DESKTOP_DIR/satoshitrace.desktop"
    update-desktop-database "$DESKTOP_DIR" 2>/dev/null || true
    echo "[+] Desktop shortcut installed: $DESKTOP_DIR/satoshitrace.desktop"
fi

echo "========================================================================"
echo "  Installation complete! You can start SatoshiTrace anytime by running:"
echo "  ./run.sh"
echo "========================================================================"
