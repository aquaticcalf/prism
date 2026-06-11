import { sqliteTable, text } from "drizzle-orm/sqlite-core"

export const eventEntities = sqliteTable("event_entities", {
  eventId: text("event_id"),
  entityId: text("entity_id"),
})
