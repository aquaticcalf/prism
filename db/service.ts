import { service } from "fx"
import { drizzle } from "drizzle-orm/d1"
import type { DrizzleD1Database } from "drizzle-orm/d1"
import type * as schema from "./schema"

export type DB = DrizzleD1Database<typeof schema>

export const DrizzleService = service<{ db: DB }>("DrizzleService")

export const makeDrizzleService = (d1: any) => {
  return { db: drizzle(d1) as unknown as DB }
}
