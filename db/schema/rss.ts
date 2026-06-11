import { sqliteTable, text } from "drizzle-orm/sqlite-core"

export const rss = sqliteTable("rss", {
  id: text("id").primaryKey(),
  outletId: text("outlet_id"),
  url: text("url"),
})
