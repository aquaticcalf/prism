import { workflow } from "fx"
import { DrizzleService } from "./service"

export const run = workflow({ drizzle: DrizzleService }, async ({ drizzle }, query: string) => {
  return drizzle.db.run(query)
})

export const exec = workflow({ drizzle: DrizzleService }, async ({ drizzle }, query: string) => {
  return drizzle.db.all(query)
})
