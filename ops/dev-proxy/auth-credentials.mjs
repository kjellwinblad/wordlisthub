import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const cookieName = "wordlisthub_dev_auth";
const cookieLifetimeSeconds = 30 * 24 * 60 * 60;
const passwordBytes = 32;
const scryptOptions = {
  N: 16_384,
  r: 8,
  p: 1,
  maxmem: 32 * 1024 * 1024,
};

function decode(value, expectedBytes, fieldName) {
  if (typeof value !== "string" || !/^[A-Za-z0-9_-]+$/.test(value)) {
    throw new Error(`${fieldName} is invalid`);
  }

  const decoded = Buffer.from(value, "base64url");
  if (decoded.length !== expectedBytes) {
    throw new Error(`${fieldName} has the wrong length`);
  }

  return decoded;
}

function safeTextEqual(first, second) {
  const firstBytes = Buffer.from(first);
  const secondBytes = Buffer.from(second);

  return (
    firstBytes.length === secondBytes.length && timingSafeEqual(firstBytes, secondBytes)
  );
}

function signatureFor(payload, authConfig) {
  return createHmac("sha256", authConfig.cookieKey).update(payload).digest("base64url");
}

function cookieValue(cookieHeader) {
  for (const part of cookieHeader.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0) {
      continue;
    }

    if (part.slice(0, separator).trim() === cookieName) {
      return part.slice(separator + 1).trim();
    }
  }

  return "";
}

export function createAuthConfig(username, password) {
  if (!username || username.includes(":")) {
    throw new Error("Username must be non-empty and must not contain a colon");
  }
  if (password.length < 12) {
    throw new Error("Password must contain at least 12 characters");
  }

  const passwordSalt = randomBytes(16);
  const passwordHash = scryptSync(password, passwordSalt, passwordBytes, scryptOptions);

  return {
    version: 1,
    username,
    passwordSalt: passwordSalt.toString("base64url"),
    passwordHash: passwordHash.toString("base64url"),
    cookieKey: randomBytes(32).toString("base64url"),
  };
}

export function parseAuthConfig(serialized) {
  const value = JSON.parse(serialized);

  if (
    value?.version !== 1 ||
    typeof value.username !== "string" ||
    !value.username ||
    value.username.includes(":")
  ) {
    throw new Error("Authentication configuration is invalid");
  }

  return {
    username: value.username,
    passwordSalt: decode(value.passwordSalt, 16, "passwordSalt"),
    passwordHash: decode(value.passwordHash, passwordBytes, "passwordHash"),
    cookieKey: decode(value.cookieKey, 32, "cookieKey"),
  };
}

export function verifyBasicAuthorization(authorization, authConfig) {
  if (!authorization.startsWith("Basic ")) {
    return false;
  }

  let decoded;
  try {
    decoded = Buffer.from(authorization.slice(6), "base64").toString("utf8");
  } catch {
    return false;
  }

  const separator = decoded.indexOf(":");
  if (separator < 1) {
    return false;
  }

  const username = decoded.slice(0, separator);
  const password = decoded.slice(separator + 1);
  if (password.length > 1024 || !safeTextEqual(username, authConfig.username)) {
    return false;
  }

  const suppliedHash = scryptSync(
    password,
    authConfig.passwordSalt,
    passwordBytes,
    scryptOptions,
  );

  return timingSafeEqual(suppliedHash, authConfig.passwordHash);
}

export function issueCookie(nowSeconds, authConfig) {
  const expiresAt = nowSeconds + cookieLifetimeSeconds;
  const payload = `v1.${expiresAt}`;
  const token = `${payload}.${signatureFor(payload, authConfig)}`;

  return [
    `${cookieName}=${token}`,
    "Path=/",
    `Max-Age=${cookieLifetimeSeconds}`,
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
  ].join("; ");
}

export function hasValidCookie(cookieHeader, nowSeconds, authConfig) {
  const token = cookieValue(cookieHeader);
  const parts = token.split(".");

  if (parts.length !== 3 || parts[0] !== "v1" || !/^\d+$/.test(parts[1])) {
    return false;
  }

  const expiresAt = Number(parts[1]);
  if (
    !Number.isSafeInteger(expiresAt) ||
    expiresAt <= nowSeconds ||
    expiresAt > nowSeconds + cookieLifetimeSeconds
  ) {
    return false;
  }

  const expected = Buffer.from(signatureFor(`${parts[0]}.${parts[1]}`, authConfig));
  const supplied = Buffer.from(parts[2]);

  return expected.length === supplied.length && timingSafeEqual(expected, supplied);
}
