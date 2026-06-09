import { gen, try as tryEffect } from "effect/Effect"
import { make } from "effect/JSONSchema"
import { decodeUnknownSync } from "effect/Schema"
import { ArticleSchema } from "./schema"
import { AIService } from "./ai"
import { ParseError } from "./errors"

const responseSchema = (() => {
  const { $schema: _, $defs, ...rest } = make(ArticleSchema)
  return $defs
    ? JSON.parse(
        JSON.stringify(rest, (_, value) =>
          value?.["$ref"]?.startsWith("#/$defs/") ? $defs[value["$ref"].slice(8)] : value,
        ),
      )
    : rest
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
