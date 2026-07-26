---
name: manage-dev-tunnel
description:
  Start, repair, inspect, stop, and report the WordListHub authenticated development
  tunnel at https://devwordlisthub.suckless.ai.
---

# Manage WordListHub development tunnel

Work from the repository root. Read `AGENTS.md` when present and
`ops/dev-proxy/README.md` before changing the tunnel.

## Invariants

- The fixed public URL is `https://devwordlisthub.suckless.ai`.
- Keep the application origin on `127.0.0.1:3000`, nginx on
  `127.0.0.1:18084`, the authentication helper on `127.0.0.1:18085`, and
  cloudflared metrics on `127.0.0.1:20244`.
- Never read, print, commit, or place credentials on a command line.
- Never add a public `0.0.0.0` binding or router forwarding.
- Preserve unrelated working-tree changes.

## Start or repair

1. Check the ignored credential files only for existence, permissions, and nonzero size.
2. Start the application with `npm start`.
3. Run `ops/dev-proxy/up.sh`.
4. Confirm all three Compose services remain running.
5. Run `ops/dev-proxy/show-url.sh`.

## Validate

Require the origin to respond locally, all listeners to use loopback, and
unauthenticated local nginx and public requests to return `401`. Do not claim
authenticated HTTP validation without a disposable Basic Auth credential.

## Stop

Run `docker compose -f ops/dev-proxy/compose.yaml down`.
