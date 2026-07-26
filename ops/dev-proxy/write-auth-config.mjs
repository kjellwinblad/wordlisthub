import { chmodSync, renameSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { createAuthConfig } from "./auth-credentials.mjs";

const target = resolve(process.argv[2] ?? "");
const input = await new Promise((resolveInput, rejectInput) => {
  const chunks = [];
  process.stdin.on("data", (chunk) => chunks.push(chunk));
  process.stdin.on("end", () => resolveInput(Buffer.concat(chunks).toString("utf8")));
  process.stdin.on("error", rejectInput);
});
const [username, password, confirmation] = input.split("\0");

if (!target || confirmation === undefined) {
  throw new Error("Credential input is incomplete");
}
if (password !== confirmation) {
  throw new Error("Passwords do not match");
}

const authConfig = createAuthConfig(username, password);
const temporary = `${target}.tmp-${process.pid}`;

writeFileSync(temporary, `${JSON.stringify(authConfig)}\n`, {
  encoding: "utf8",
  flag: "wx",
  mode: 0o600,
});
renameSync(temporary, target);
chmodSync(target, 0o600);

process.stdout.write(
  "Credentials saved; existing 30-day browser sessions are signed out.\n",
);
