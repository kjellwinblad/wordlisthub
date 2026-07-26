#!/bin/sh

set -eu

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
token_file="$script_dir/.tunnel-token"
auth_config_file="$script_dir/.auth-config"

if [ ! -s "$token_file" ]; then
  echo "Tunnel token is missing. Run: npm run dev:proxy:tunnel-token" >&2
  exit 1
fi

if [ ! -s "$auth_config_file" ]; then
  echo "Basic Auth credentials are missing. Run: npm run dev:proxy:password" >&2
  exit 1
fi

DEV_PROXY_UID=$(id -u)
DEV_PROXY_GID=$(id -g)
docker_operating_system=$(docker info --format '{{.OperatingSystem}}')
case "$docker_operating_system" in
  *"Docker Desktop"*)
    DEV_PROXY_HOST_GATEWAY=host-gateway
    ;;
  *)
    DEV_PROXY_HOST_GATEWAY=127.0.0.1
    ;;
esac
export DEV_PROXY_UID DEV_PROXY_GID DEV_PROXY_HOST_GATEWAY

exec docker compose -f "$script_dir/compose.yaml" up -d
