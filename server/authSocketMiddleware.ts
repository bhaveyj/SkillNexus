import { IncomingMessage } from "http";
import { SignJWT, jwtVerify } from "jose";

const CHAT_JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "fallback-secret-change-me"
);

const TOKEN_EXPIRY = "1h";

export interface ChatTokenPayload {
  userId: string;
  name: string;
  email: string;
  image?: string;
}

/**
 * Sign a short-lived JWT for WebSocket authentication.
 * Called from the REST API endpoint before the client connects.
 */
export async function signChatToken(
  payload: ChatTokenPayload
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(CHAT_JWT_SECRET);
}

/**
 * Verify a chat JWT and return the payload.
 * Used during WebSocket upgrade handshake.
 */
export async function verifyChatToken(
  token: string
): Promise<ChatTokenPayload> {
  const { payload } = await jwtVerify(token, CHAT_JWT_SECRET);
  return {
    userId: payload.userId as string,
    name: payload.name as string,
    email: payload.email as string,
    image: payload.image as string | undefined,
  };
}

/**
 * Extract token from WebSocket upgrade request query string.
 */
export function extractTokenFromRequest(
  req: IncomingMessage
): string | null {
  const url = new URL(req.url || "", `http://${req.headers.host}`);
  return url.searchParams.get("token");
}
