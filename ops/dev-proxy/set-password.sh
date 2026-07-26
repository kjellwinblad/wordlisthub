#!/usr/bin/env bash

set -euo pipefail

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
username=${1:-developer}
auth_config_file="$script_dir/.auth-config"

case "$username" in
  "" | *:*)
    echo "Username must be non-empty and must not contain a colon." >&2
    exit 2
    ;;
esac

if [[ ! -t 0 || ! -t 1 ]]; then
  echo "Run this command in an interactive terminal." >&2
  exit 1
fi

echo "Create shared Basic Auth credentials for user '$username'."
echo "Use a long, disposable password that is not used anywhere else."

read -r -s -p "Password (at least 12 characters): " password
printf "\n"
read -r -s -p "Confirm password: " confirmation
printf "\n"
trap 'unset password confirmation' EXIT

printf "%s\0%s\0%s" "$username" "$password" "$confirmation" |
  node "$script_dir/write-auth-config.mjs" "$auth_config_file"
