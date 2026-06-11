import { workflow } from "fx"
import { EmbeddingService } from "./ai"
import type { VectorizeIndex } from "./types"
import { ApiError } from "shared"

export const store = workflow(
  { ai: EmbeddingService },
  async ({ ai }, vectorize: VectorizeIndex, id: string, body: string, url: string) => {
    const values = await ai.embed(body)
    const res = await vectorize.upsert([{ id, values, metadata: { url } }])
    return res.mutationId ?? ""
  },
).withErrors<ApiError>()
