#!/usr/bin/env bash
# ==============================================================================
# SatoshiTrace Launcher (Subdirectory redirect to root launcher)
# ==============================================================================
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." >/dev/null 2>&1 && pwd )"
cd "$DIR"
exec ./run.sh "$@"
