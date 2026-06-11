import { sqliteTable, text } from "drizzle-orm/sqlite-core"

export const outletArticles = sqliteTable("outlet_articles", {
  outletId: text("outlet_id"),
  articleId: text("article_id"),
})
