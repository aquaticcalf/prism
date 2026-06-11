import { workflow } from "fx"
import { decodeUnknownSync } from "effect/Schema"
import { ArticleSchema } from "./schema"
import { AIService } from "./ai"
import { BrowserService } from "./browser"
import { SchemaAdapter } from "./adapter"
import { ApiError, ParseError } from "shared"

export const json = workflow(
  { ai: AIService, browser: BrowserService, adapter: SchemaAdapter },
  async ({ ai, browser, adapter }, url: string) => {
    const markdown = await browser.markdown(url)
    const text = await ai.generateJson(markdown, await adapter.toJSONSchema())
    if (!text) throw new ParseError("AI returned empty response")
    try {
      return decodeUnknownSync(ArticleSchema)(JSON.parse(text))
    } catch (e) {
      throw new ParseError(String(e))
    }
  },
).withErrors<ApiError | ParseError>()
