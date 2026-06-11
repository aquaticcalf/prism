import { workflow } from "fx"
import { decodeUnknownSync } from "effect/Schema"
import { ArticleSchema } from "./schema"
import { AIService } from "./ai"
import { SchemaAdapter } from "./adapter"
import { ApiError, ParseError } from "shared"

export const json = workflow(
  { ai: AIService, adapter: SchemaAdapter },
  async ({ ai, adapter }, url: string) => {
    const text = await ai.generateJson(url, await adapter.toJSONSchema())
    if (!text) throw new ParseError("AI returned empty response")
    try {
      return decodeUnknownSync(ArticleSchema)(JSON.parse(text))
    } catch (e) {
      throw new ParseError(String(e))
    }
  },
).withErrors<ApiError | ParseError>()
