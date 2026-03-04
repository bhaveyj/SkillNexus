import "dotenv/config";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import {
  extractTokenFromRequest,
  verifyChatToken,
  ChatTokenPayload,
} from "./authSocketMiddleware";
import {
  validateSessionParticipant,
  getOtherParticipantId,
  saveMessage,
} from "./chatService";

// ─── Types ───────────────────────────────────────────────────────────────────

interface AuthenticatedSocket extends WebSocket {
  userId: string;
  userData: ChatTokenPayload;
  isAlive: boolean;
  subscribedSessions: Set<string>;
}

/** Inbound message types from the client */
type InboundMessage =
  | { type: "CHAT_MESSAGE"; sessionId: string; content: string }
  | { type: "JOIN_SESSION"; sessionId: string }
  | { type: "LEAVE_SESSION"; sessionId: string }
  | { type: "TYPING_START"; sessionId: string }
  | { type: "TYPING_STOP"; sessionId: string };

/** Outbound message types to the client */
type OutboundMessage =
  | {
      type: "CHAT_MESSAGE";
      sessionId: string;
      message: {
        id: string;
        sessionId: string;
        senderId: string;
        content: string;
        createdAt: string;
        sender: {
          id: string;
          name: string | null;
          email: string;
          image: string | null;
        };
      };
    }
  | { type: "TYPING_START"; sessionId: string; userId: string }
  | { type: "TYPING_STOP"; sessionId: string; userId: string }
  | { type: "USER_ONLINE"; sessionId: string; userId: string }
  | { type: "USER_OFFLINE"; sessionId: string; userId: string }
  | { type: "SESSION_JOINED"; sessionId: string }
  | { type: "ERROR"; message: string };

// ─── In-memory state ─────────────────────────────────────────────────────────

/**
 * Maps sessionId → Set of connected sockets.
 * This is the core room management structure.
 */
const sessionClients = new Map<string, Set<AuthenticatedSocket>>();

/**
 * Maps userId → Set of connected sockets (a user can have multiple tabs).
 */
const userClients = new Map<string, Set<AuthenticatedSocket>>();

// ─── Helpers ─────────────────────────────────────────────────────────────────

function send(socket: AuthenticatedSocket, data: OutboundMessage) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
  }
}

function broadcastToSession(
  sessionId: string,
  data: OutboundMessage,
  excludeSocket?: AuthenticatedSocket
) {
  const clients = sessionClients.get(sessionId);
  if (!clients) return;

  for (const client of clients) {
    if (client !== excludeSocket && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  }
}

function addToSession(sessionId: string, socket: AuthenticatedSocket) {
  if (!sessionClients.has(sessionId)) {
    sessionClients.set(sessionId, new Set());
  }
  sessionClients.get(sessionId)!.add(socket);
  socket.subscribedSessions.add(sessionId);
}

function removeFromSession(sessionId: string, socket: AuthenticatedSocket) {
  const clients = sessionClients.get(sessionId);
  if (clients) {
    clients.delete(socket);
    if (clients.size === 0) {
      sessionClients.delete(sessionId);
    }
  }
  socket.subscribedSessions.delete(sessionId);
}

function addUserClient(userId: string, socket: AuthenticatedSocket) {
  if (!userClients.has(userId)) {
    userClients.set(userId, new Set());
  }
  userClients.get(userId)!.add(socket);
}

function removeUserClient(userId: string, socket: AuthenticatedSocket) {
  const clients = userClients.get(userId);
  if (clients) {
    clients.delete(socket);
    if (clients.size === 0) {
      userClients.delete(userId);
    }
  }
}

// ─── Message handlers ────────────────────────────────────────────────────────

async function handleJoinSession(
  socket: AuthenticatedSocket,
  sessionId: string
) {
  const session = await validateSessionParticipant(sessionId, socket.userId);
  if (!session) {
    send(socket, {
      type: "ERROR",
      message: "Not authorized for this session",
    });
    return;
  }

  addToSession(sessionId, socket);
  send(socket, { type: "SESSION_JOINED", sessionId });

  // Notify the other participant that this user is online
  const otherUserId = getOtherParticipantId(session, socket.userId);
  broadcastToSession(
    sessionId,
    { type: "USER_ONLINE", sessionId, userId: socket.userId },
    socket
  );

  // Check if the other participant is already online in this session
  const otherSockets = userClients.get(otherUserId);
  if (otherSockets) {
    const otherInSession = [...otherSockets].some((s) =>
      s.subscribedSessions.has(sessionId)
    );
    if (otherInSession) {
      send(socket, { type: "USER_ONLINE", sessionId, userId: otherUserId });
    }
  }

  console.log(
    `[WS] User ${socket.userId} joined session ${sessionId}`
  );
}

async function handleChatMessage(
  socket: AuthenticatedSocket,
  sessionId: string,
  content: string
) {
  // Validate session membership
  const session = await validateSessionParticipant(sessionId, socket.userId);
  if (!session) {
    send(socket, {
      type: "ERROR",
      message: "Not authorized for this session",
    });
    return;
  }

  // Validate content
  const trimmed = content.trim();
  if (!trimmed || trimmed.length > 5000) {
    send(socket, {
      type: "ERROR",
      message: "Message must be between 1 and 5000 characters",
    });
    return;
  }

  // Persist to DB
  const savedMessage = await saveMessage(sessionId, socket.userId, trimmed);

  const outbound: OutboundMessage = {
    type: "CHAT_MESSAGE",
    sessionId,
    message: {
      id: savedMessage.id,
      sessionId: savedMessage.sessionId,
      senderId: savedMessage.senderId,
      content: savedMessage.content,
      createdAt: savedMessage.createdAt.toISOString(),
      sender: savedMessage.sender,
    },
  };

  // Broadcast to ALL participants in the session (including sender for confirmation)
  const clients = sessionClients.get(sessionId);
  if (clients) {
    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(outbound));
      }
    }
  }
}

function handleTyping(
  socket: AuthenticatedSocket,
  sessionId: string,
  isTyping: boolean
) {
  if (!socket.subscribedSessions.has(sessionId)) return;

  broadcastToSession(
    sessionId,
    {
      type: isTyping ? "TYPING_START" : "TYPING_STOP",
      sessionId,
      userId: socket.userId,
    },
    socket
  );
}

// ─── Connection handler ─────────────────────────────────────────────────────

function handleConnection(socket: AuthenticatedSocket) {
  socket.isAlive = true;
  socket.subscribedSessions = new Set();

  addUserClient(socket.userId, socket);

  console.log(
    `[WS] User connected: ${socket.userData.name} (${socket.userId})`
  );

  // Pong handler for heartbeat
  socket.on("pong", () => {
    socket.isAlive = true;
  });

  // Message handler
  socket.on("message", async (raw) => {
    try {
      const data: InboundMessage = JSON.parse(raw.toString());

      switch (data.type) {
        case "JOIN_SESSION":
          await handleJoinSession(socket, data.sessionId);
          break;

        case "LEAVE_SESSION":
          removeFromSession(data.sessionId, socket);
          broadcastToSession(data.sessionId, {
            type: "USER_OFFLINE",
            sessionId: data.sessionId,
            userId: socket.userId,
          });
          console.log(
            `[WS] User ${socket.userId} left session ${data.sessionId}`
          );
          break;

        case "CHAT_MESSAGE":
          await handleChatMessage(socket, data.sessionId, data.content);
          break;

        case "TYPING_START":
          handleTyping(socket, data.sessionId, true);
          break;

        case "TYPING_STOP":
          handleTyping(socket, data.sessionId, false);
          break;

        default:
          send(socket, { type: "ERROR", message: "Unknown message type" });
      }
    } catch (err) {
      console.error("[WS] Error processing message:", err);
      send(socket, { type: "ERROR", message: "Invalid message format" });
    }
  });

  // Disconnect handler
  socket.on("close", () => {
    // Notify all sessions this user was in
    for (const sessionId of socket.subscribedSessions) {
      broadcastToSession(sessionId, {
        type: "USER_OFFLINE",
        sessionId,
        userId: socket.userId,
      });
      removeFromSession(sessionId, socket);
    }

    removeUserClient(socket.userId, socket);
    console.log(
      `[WS] User disconnected: ${socket.userData.name} (${socket.userId})`
    );
  });

  socket.on("error", (err) => {
    console.error(`[WS] Socket error for user ${socket.userId}:`, err.message);
  });
}

// ─── Server bootstrap ────────────────────────────────────────────────────────

// Render injects $PORT; fall back to WS_PORT for local dev, then 3001
const PORT = parseInt(process.env.PORT || process.env.WS_PORT || "3001", 10);

/**
 * Comma-separated list of allowed origins, e.g.:
 * ALLOWED_ORIGINS=https://skillnexus.vercel.app,https://www.skillnexus.vercel.app
 * Leave unset in development to allow all origins.
 */
const ALLOWED_ORIGINS: Set<string> | null = process.env.ALLOWED_ORIGINS
  ? new Set(
      process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim().toLowerCase())
    )
  : null;

function isOriginAllowed(origin: string | undefined): boolean {
  if (!ALLOWED_ORIGINS) return true; // dev: allow all
  if (!origin) return false;
  return ALLOWED_ORIGINS.has(origin.toLowerCase());
}

const server = http.createServer((_req, res) => {
  // Health check / ping endpoint (used by Render's health checks)
  const origin = _req.headers.origin || "";
  if (isOriginAllowed(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ status: "ok", connections: userClients.size }));
});

const wss = new WebSocketServer({ noServer: true });

// Handle upgrade with origin check + JWT authentication
server.on("upgrade", async (req, socket, head) => {
  try {
    // Origin validation — blocks connections from unauthorized domains
    const origin = req.headers.origin;
    if (!isOriginAllowed(origin)) {
      console.warn(`[WS] Rejected connection from disallowed origin: ${origin}`);
      socket.write("HTTP/1.1 403 Forbidden\r\n\r\n");
      socket.destroy();
      return;
    }

    const token = extractTokenFromRequest(req);
    if (!token) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }

    const userData = await verifyChatToken(token);

    wss.handleUpgrade(req, socket, head, (ws) => {
      const authSocket = ws as AuthenticatedSocket;
      authSocket.userId = userData.userId;
      authSocket.userData = userData;
      wss.emit("connection", authSocket, req);
    });
  } catch (err) {
    console.error("[WS] Auth failed:", err);
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
  }
});

wss.on("connection", handleConnection);

// Heartbeat interval — detect broken connections
const heartbeatInterval = setInterval(() => {
  for (const client of wss.clients) {
    const authClient = client as AuthenticatedSocket;
    if (!authClient.isAlive) {
      authClient.terminate();
      continue;
    }
    authClient.isAlive = false;
    authClient.ping();
  }
}, 30_000);

wss.on("close", () => {
  clearInterval(heartbeatInterval);
});

server.listen(PORT, () => {
  console.log(`[WS] WebSocket server running on port ${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("[WS] Shutting down...");
  wss.close();
  server.close();
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("[WS] Shutting down...");
  wss.close();
  server.close();
  process.exit(0);
});
