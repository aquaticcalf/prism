import { service } from "fx"
import type { Ai } from "./types"

export const EmbeddingService = service<{
  embed: (text: string) => number[]
}>("EmbeddingService")

export const makeEmbeddingService = (ai: Ai) => ({
  embed: async (text: string) => {
    const res = (await ai.run("@cf/qwen/qwen3-embedding-0.6b", {
      text,
    })) as { data: number[][] }
    return res.data?.[0] ?? []
  },
})
