import { sqliteTable, text } from "drizzle-orm/sqlite-core"

export const articleClaims = sqliteTable("article_claims", {
  articleId: text("article_id"),
  claimId: text("claim_id"),
})
