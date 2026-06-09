import { gen, try as tryEffect } from "effect/Effect"
import { make } from "effect/JSONSchema"
import { decodeUnknownSync } from "effect/Schema"
import { ArticleSchema } from "./schema"
import { AIService, ParseError } from "./ai"

const responseSchema = (() => {
  const { $schema: _, ...rest } = make(ArticleSchema)
  return rest
})()

export const json = (url: string) =>
  gen(function* () {
    const ai = yield* AIService
    const text = yield* ai.generateJson(url, responseSchema)
    if (!text) return { date: null, body: null }
    return yield* tryEffect({
      try: () => decodeUnknownSync(ArticleSchema)(JSON.parse(text)),
      catch: (e) => new ParseError(String(e)),
    })
  })
