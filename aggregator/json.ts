import { GoogleGenAI } from "@google/genai"
import { prompt } from "./prompt"

export async function json(url: string, apiKey: string) {
  const ai = new GoogleGenAI({ apiKey })
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite",
    contents: [prompt(url)],
    config: {
      tools: [{ urlContext: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          date: {
            type: "date",
            description: "Publication date of the article in UTC, or null if not found",
          },
          body: { type: "STRING", description: "Full article body as markdown" },
        },
        required: ["date", "body"],
      },
      thinkingConfig: { thinkingBudget: 0 },
    },
  })
  return response.text ? JSON.parse(response.text) : { date: null, body: null }
}
