import { sqliteTable, text } from "drizzle-orm/sqlite-core"

export const entities = sqliteTable("entities", {
  id: text("id").primaryKey(),
  name: text("name"),
  type: text("type"),
  normalizedName: text("normalized_name"),
})
