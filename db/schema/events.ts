import { sqliteTable, text } from "drizzle-orm/sqlite-core"

export const events = sqliteTable("events", {
  id: text("id").primaryKey(),
  title: text("title"),
  firstSeenAt: text("first_seen_at"),
  lastSeenAt: text("last_seen_at"),
  status: text("status"),
})
