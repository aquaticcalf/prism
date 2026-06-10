import { Tag } from "effect/Context"
import type { Effect } from "effect/Effect"
import { tryPromise, andThen } from "effect/Effect"
import { ApiError } from "./errors"

export class EmbeddingService extends Tag("EmbeddingService")<
  EmbeddingService,
  {
    readonly embed: (text: string) => Effect<number[], ApiError>
  }
>() {}

export const makeEmbeddingLive = (ai: Ai) => ({
  embed: (text: string) =>
    tryPromise({
      try: () =>
        ai.run("@cf/qwen/qwen3-embedding-0.6b", {
          text,
        }) as Promise<{ data: number[][] }>,
      catch: (e) => new ApiError(500, String(e)),
    }).pipe(andThen((res) => res.data?.[0] ?? [])),
})
