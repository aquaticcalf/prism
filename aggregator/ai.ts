import { z } from "zod"
import { service } from "fx"
import { ArticleSchema, ArticleJsonSchema } from "./schema"
import type { Article } from "./schema"
import type { ChatCompletionsOutput } from "./types"

export const AIService = service<{
  generateObject: (html: string) => Promise<Article>
}>("AIService")

const system =
  "You are an article extractor. Given HTML, extract the article body and its publication date."

const prompt = (html: string) =>
  `Extract the article body and publication date from the following HTML. Output the article body verbatim as markdown without any changes. Use ISO 8601 format for the date (e.g. "2026-02-10" or "2026-02-10T11:36:00.000Z"). Set date to null if no publication date is found.

${html}`

const responseSchema = {
  type: "json_schema",
  json_schema: {
    name: "article",
    schema: z.toJSONSchema(ArticleJsonSchema),
  },
} as const

export const makeAIService = (binding: Ai) => ({
  generateObject: async (html: string) => {
    const res = (await binding.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt(html) },
      ],
      response_format: responseSchema,
    })) as ChatCompletionsOutput
    const text = res.choices[0].message.content
    if (!text) throw new Error("Empty response from AI")
    return ArticleSchema.parse(JSON.parse(text))
  },
})
