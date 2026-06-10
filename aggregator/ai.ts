import { service } from "fx"
import { GoogleGenAI } from "@google/genai"
import type { GenerateContentResponse } from "@google/genai"

const prompt = (url: string) =>
  `Visit this URL and output the page's article content verbatim as markdown.
  Do not summarize, rewrite, or add any commentary.
  Output only the raw article text.
  ${url}`

export const AIService = service<{
  generateJson: (url: string, schema: Record<string, unknown>) => string
}>("AIService")

export const makeLive = (apiKey: string) => {
  const ai = new GoogleGenAI({ apiKey })
  return {
    generateJson: async (url: string, schema: Record<string, unknown>) => {
      const r = (await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: [prompt(url)],
        config: {
          tools: [{ urlContext: {} }],
          responseMimeType: "application/json",
          responseSchema: schema,
          thinkingConfig: { thinkingBudget: 0 },
        },
      })) as GenerateContentResponse
      return r.text ?? ""
    },
  }
}
