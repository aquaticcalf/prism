import { Tag } from "effect/Context"
import type { Effect } from "effect/Effect"
import { tryPromise, andThen } from "effect/Effect"
import { GoogleGenAI } from "@google/genai"
import type { GenerateContentResponse } from "@google/genai"
import { ApiError } from "shared"

const prompt = (url: string) =>
  `Visit this URL and output the page's article content verbatim as markdown.
  Do not summarize, rewrite, or add any commentary.
  Output only the raw article text.
  ${url}`

export class AIService extends Tag("AIService")<
  AIService,
  {
    readonly generateJson: (
      url: string,
      schema: Record<string, unknown>,
    ) => Effect<string, ApiError>
  }
>() {}

export const makeLive = (apiKey: string) => {
  const ai = new GoogleGenAI({ apiKey })
  return {
    generateJson: (url: string, schema: Record<string, unknown>) =>
      tryPromise({
        try: () =>
          ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: [prompt(url)],
            config: {
              tools: [{ urlContext: {} }],
              responseMimeType: "application/json",
              responseSchema: schema,
              thinkingConfig: { thinkingBudget: 0 },
            },
          }),
        catch: (e) => new ApiError(500, String(e)),
      }).pipe(andThen((r: GenerateContentResponse) => r.text ?? "")),
  }
}
