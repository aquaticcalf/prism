import { sqliteTable, text } from "drizzle-orm/sqlite-core"

export const articles = sqliteTable("articles", {
  id: text("id").primaryKey(),
  outletId: text("outlet_id"),
  canonicalUrl: text("canonical_url"),
  title: text("title"),
  publishedAt: text("published_at"),
  language: text("language"),
  contentHash: text("content_hash"),
  eventId: text("event_id"),
  createdAt: text("created_at"),
})
