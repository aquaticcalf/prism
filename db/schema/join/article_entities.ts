import { sqliteTable, text } from "drizzle-orm/sqlite-core"

export const articleEntities = sqliteTable("article_entities", {
  articleId: text("article_id"),
  entityId: text("entity_id"),
  role: text("role"),
})
