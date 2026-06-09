import { GoogleGenAI } from "@google/genai"
import { prompt } from "./prompt"

export async function* browse(url: string, apiKey: string) {
  const ai = new GoogleGenAI({ apiKey })
  const response = await ai.models.generateContentStream({
    model: "gemini-2.5-flash-lite",
    contents: [prompt(url)],
    config: {
      tools: [{ urlContext: {} }],
      thinkingConfig: { thinkingBudget: 0 },
    },
  })
  for await (const chunk of response) {
    if (chunk.text) yield chunk.text
  }
}
