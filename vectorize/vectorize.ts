import { gen, tryPromise } from "effect/Effect"
import type { Effect } from "effect/Effect"
import { EmbeddingService } from "./ai"
import { ApiError } from "./errors"

export const store = (
  vectorize: VectorizeIndex,
  id: string,
  body: string,
): Effect<string, ApiError, EmbeddingService> =>
  gen(function* () {
    const ai = yield* EmbeddingService
    const values = yield* ai.embed(body)

    const res = yield* tryPromise({
      try: () => vectorize.upsert([{ id, values, metadata: { body } }]),
      catch: (e) => new ApiError(500, String(e)),
    })

    return res.mutationId ?? ""
  })
