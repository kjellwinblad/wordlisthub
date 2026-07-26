#!/usr/bin/env bash

set -euo pipefail

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
token_file="$script_dir/.tunnel-token"

if [[ ! -t 0 || ! -t 1 ]]; then
  echo "Run this command in an interactive terminal." >&2
  exit 1
fi

read -r -s -p "Paste the tunnel token only (the eyJ... value): " tunnel_token
printf "\n"
trap 'unset tunnel_token' EXIT

if [[ ! "$tunnel_token" =~ ^eyJ[A-Za-z0-9_-]{80,}={0,2}$ ]]; then
  echo "That does not look like a Cloudflare tunnel token; no file was written." >&2
  exit 2
fi

umask 077
printf "%s\n" "$tunnel_token" >"$token_file"
echo "Tunnel token stored in $token_file (ignored by Git)."
