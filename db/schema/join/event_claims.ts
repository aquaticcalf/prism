import { sqliteTable, text } from "drizzle-orm/sqlite-core"

export const eventClaims = sqliteTable("event_claims", {
  eventId: text("event_id"),
  claimId: text("claim_id"),
})
