import { sqliteTable, text, real } from "drizzle-orm/sqlite-core"

export const claims = sqliteTable("claims", {
  id: text("id").primaryKey(),
  subject: text("subject"),
  predicate: text("predicate"),
  object: text("object"),
  confidence: real("confidence"),
})
