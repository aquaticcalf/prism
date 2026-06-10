import { gen, try as tryEffect } from "effect/Effect"
import { decodeUnknownSync } from "effect/Schema"
import { ArticleSchema } from "./schema"
import { AIService } from "./ai"
import { SchemaAdapter } from "./adapter"
import { ParseError } from "shared"

export const json = (url: string) =>
  gen(function* () {
    const ai = yield* AIService
    const schemaAdapter = yield* SchemaAdapter
    const text = yield* ai.generateJson(url, schemaAdapter.toJSONSchema())
    if (!text) return { date: null, body: null }
    return yield* tryEffect({
      try: () => decodeUnknownSync(ArticleSchema)(JSON.parse(text)),
      catch: (e) => new ParseError(String(e)),
    })
  })
