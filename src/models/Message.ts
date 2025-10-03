// src/models/Message.ts
export type Role = "user" | "bot";

export type Message = {
  id: string;
  role: Role;
  text: string;
  timestamp: string; // ISO string (ex: 2025-10-03T12:00:00.000Z)
  conversationId?: number | string;
  userId?: number | string;
  metadata?: Record<string, any>;
};

// helpers
export const makeUserMessage = (text: string, opts?: { id?: string; userId?: number | string }): Message => ({
  id: opts?.id ?? Date.now().toString(),
  role: "user",
  text,
  timestamp: new Date().toISOString(),
  userId: opts?.userId,
});

export const makeBotMessage = (text: string, opts?: { id?: string }): Message => ({
  id: opts?.id ?? (Date.now() + 1).toString(),
  role: "bot",
  text,
  timestamp: new Date().toISOString(),
});
