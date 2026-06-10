import { Struct, String } from "effect/Schema"

export const VectorRecordSchema = Struct({
  id: String,
  body: String,
})

export type VectorRecord = { id: string; body: string }
