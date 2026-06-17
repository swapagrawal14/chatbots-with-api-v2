import { pgTable, text, timestamp, uuid, jsonb, integer } from "drizzle-orm/pg-core";

export const conversations = pgTable("conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull().default("New Chat"),
  model: text("model").notNull(),
  provider: text("provider").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: uuid("conversation_id")
    .references(() => conversations.id, { onDelete: "cascade" })
    .notNull(),
  role: text("role").notNull(), // 'user' | 'assistant' | 'system'
  content: text("content").notNull(),
  tokenCount: integer("token_count"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
