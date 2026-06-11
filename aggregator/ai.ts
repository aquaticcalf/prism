import { service } from "fx"
import { GoogleGenAI } from "@google/genai"
import type { GenerateContentResponse } from "@google/genai"

const prompt = (content: string) =>
  `Extract the article body and publication date from the following markdown.
  Output the article body verbatim without any changes.
  Use ISO 8601 format for the date (e.g. "2026-02-10" or "2026-02-10T11:36:00.000Z").
  Set date to null if no publication date is found.
  ${content}`

export const AIService = service<{
  generateJson: (content: string, schema: Record<string, unknown>) => Promise<string>
}>("AIService")

export const makeAIService = (apiKey: string) => {
  const ai = new GoogleGenAI({ apiKey })
  return {
    generateJson: async (content: string, schema: Record<string, unknown>) => {
      const r = (await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: [prompt(content)],
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          thinkingConfig: { thinkingBudget: 0 },
        },
      })) as GenerateContentResponse
      return r.text ?? ""
    },
  }
}
