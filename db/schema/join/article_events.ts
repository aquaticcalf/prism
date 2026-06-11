import { sqliteTable, text } from "drizzle-orm/sqlite-core"

export const articleEvents = sqliteTable("article_events", {
  articleId: text("article_id"),
  eventId: text("event_id"),
})
