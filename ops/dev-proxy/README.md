# Authenticated development tunnel

This proxy publishes the loopback-only development server through the named Cloudflare
Tunnel at `https://devwordlisthub.suckless.ai`. nginx requires the shared development
Basic Auth credential and the authentication helper issues a signed, secure, HTTP-only
cookie for 30 days.

Start the application with `npm start`; it must remain bound to
`127.0.0.1:3000`.

Commands:

- `ops/dev-proxy/set-password.sh` creates or changes the ignored authentication file.
- `ops/dev-proxy/set-tunnel-token.sh` stores a rotated connector token at a hidden prompt.
- `ops/dev-proxy/up.sh` starts nginx, the cookie helper, and cloudflared.
- `ops/dev-proxy/show-url.sh` prints the fixed public URL.
- `docker compose -f ops/dev-proxy/compose.yaml down` stops the proxy services.

The public proxy listens locally on `127.0.0.1:18084`, the authentication helper on
`127.0.0.1:18085`, cloudflared metrics on `127.0.0.1:20244`, and the application
origin on `127.0.0.1:3000`. Do not expose the origin with `0.0.0.0`, router port
forwarding, DMZ, UPnP, or remote router administration.
