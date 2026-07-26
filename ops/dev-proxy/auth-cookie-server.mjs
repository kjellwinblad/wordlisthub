import { readFileSync } from "node:fs";
import { createServer } from "node:http";

import {
  hasValidCookie,
  issueCookie,
  parseAuthConfig,
  verifyBasicAuthorization,
} from "./auth-credentials.mjs";

const host = "127.0.0.1";
const port = 18085;
const configFile = process.env.DEV_PROXY_AUTH_CONFIG_FILE;

if (!configFile) {
  throw new Error("DEV_PROXY_AUTH_CONFIG_FILE is required");
}

const authConfig = parseAuthConfig(readFileSync(configFile, "utf8"));

const server = createServer((request, response) => {
  response.setHeader("Cache-Control", "no-store");

  if (request.method !== "GET" || request.url !== "/check") {
    response.writeHead(404).end();
    return;
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (hasValidCookie(request.headers.cookie ?? "", nowSeconds, authConfig)) {
    response.writeHead(204).end();
    return;
  }

  if (verifyBasicAuthorization(request.headers.authorization ?? "", authConfig)) {
    response.setHeader("X-Dev-Auth-Set-Cookie", issueCookie(nowSeconds, authConfig));
    response.writeHead(204).end();
    return;
  }

  response.setHeader(
    "WWW-Authenticate",
    'Basic realm="WordListHub development", charset="UTF-8"',
  );
  response.writeHead(401).end();
});

server.listen(port, host, () => {
  process.stdout.write(`Authentication helper listening on ${host}:${port}\n`);
});
