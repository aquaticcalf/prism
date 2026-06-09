import { GoogleGenAI } from "@google/genai"
import { prompt } from "./prompt"

import { object, string, nullable, iso } from "zod"

const articleSchema = object({
  date: nullable(iso.date().describe("Publication date of the article or null if not found")),
  body: string().describe("Full article body as markdown"),
})

function toJsonSchema(schema: typeof articleSchema) {
  const { $schema: _, ...rest } = schema.toJSONSchema()
  return rest
}

export async function json(url: string, apiKey: string) {
  const ai = new GoogleGenAI({ apiKey })
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite",
    contents: [prompt(url)],
    config: {
      tools: [{ urlContext: {} }],
      responseMimeType: "application/json",
      responseSchema: toJsonSchema(articleSchema),
      thinkingConfig: { thinkingBudget: 0 },
    },
  })
  return response.text ? articleSchema.parse(JSON.parse(response.text)) : { date: null, body: null }
}
