import { sqliteTable, text } from "drizzle-orm/sqlite-core"

export const outlets = sqliteTable("outlets", {
  id: text("id").primaryKey(),
  name: text("name"),
  country: text("country"),
})
