import { createHmac, timingSafeEqual } from "node:crypto";

export type Role = "employee" | "hr" | "operations";

type Account = { email: string; role: Role };

export const SESSION_COOKIE = "melius_session";

const accounts: Account[] = [
  { email: "diego.ramirez@melius.demo", role: "employee" },
  { email: "rh@melius.demo", role: "hr" },
  { email: "operaciones@melius.demo", role: "operations" },
];

function sessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.includes("reemplazar")) {
    throw new Error("SESSION_SECRET debe configurarse con un valor seguro.");
  }
  return secret;
}

function signature(payload: string) {
  return createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

function safeEquals(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function authenticateDemo(email: string, password: string) {
  const demoPassword = process.env.DEMO_PASSWORD;
  const account = accounts.find((candidate) => candidate.email === email.trim().toLowerCase());

  if (!account || !demoPassword || !safeEquals(password, demoPassword)) return null;
  return account;
}

export function createSession(account: Account) {
  const payload = JSON.stringify({ email: account.email, role: account.role, exp: Date.now() + 8 * 60 * 60 * 1000 });
  return `${Buffer.from(payload).toString("base64url")}.${signature(payload)}`;
}

export function readSession(token: string | undefined): Account | null {
  if (!token) return null;
  const [encodedPayload, receivedSignature] = token.split(".");
  if (!encodedPayload || !receivedSignature) return null;

  try {
    const payload = Buffer.from(encodedPayload, "base64url").toString("utf8");
    if (!safeEquals(receivedSignature, signature(payload))) return null;
    const session = JSON.parse(payload) as Account & { exp: number };
    const account = accounts.find((candidate) => candidate.email === session.email && candidate.role === session.role);
    return account && session.exp > Date.now() ? account : null;
  } catch {
    return null;
  }
}
