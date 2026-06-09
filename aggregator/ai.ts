import { Tag } from "effect/Context"
import type { Effect } from "effect/Effect"
import { tryPromise, andThen } from "effect/Effect"
import type { Stream } from "effect/Stream"
import { fromEffect, flatMap, filterMap, fromAsyncIterable } from "effect/Stream"
import { fromNullable } from "effect/Option"
import { GoogleGenAI } from "@google/genai"
import type { GenerateContentResponse } from "@google/genai"
import { prompt } from "./prompt"

export class ApiError {
  readonly _tag = "ApiError"
  readonly status: number
  readonly message: string
  constructor(status: number, message: string) {
    this.status = status
    this.message = message
  }
}

export class ParseError {
  readonly _tag = "ParseError"
  readonly message: string
  constructor(message: string) {
    this.message = message
  }
}

export class AIService extends Tag("AIService")<
  AIService,
  {
    readonly generateJson: (
      url: string,
      schema: Record<string, unknown>,
    ) => Effect<string, ApiError>
    readonly generateStream: (url: string) => Stream<string, ApiError>
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
    generateStream: (url: string) =>
      fromEffect(
        tryPromise({
          try: () =>
            ai.models.generateContentStream({
              model: "gemini-2.5-flash-lite",
              contents: [prompt(url)],
              config: {
                tools: [{ urlContext: {} }],
                thinkingConfig: { thinkingBudget: 0 },
              },
            }),
          catch: (e) => new ApiError(500, String(e)),
        }),
      ).pipe(
        flatMap((iterable: AsyncIterable<GenerateContentResponse>) =>
          fromAsyncIterable(iterable, (e) => new ApiError(500, String(e))),
        ),
        filterMap((chunk: GenerateContentResponse) => fromNullable(chunk.text)),
      ),
  }
}
