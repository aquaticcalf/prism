import { WorkflowEntrypoint, WorkflowEvent, WorkflowStep } from "cloudflare:workers"
import { pipe } from "effect"
import { runPromise, provideService as provideEffectService } from "effect/Effect"
import { json, makeLive, AIService, makeLiveSchemaAdapter, SchemaAdapter } from "aggregator"
import { makeEmbeddingLive, store, EmbeddingService } from "vectorize"

export interface WorkflowParams {
  url: string
}

export class PrismEncodeWorkflow extends WorkflowEntrypoint<Env, WorkflowParams> {
  async run(event: WorkflowEvent<WorkflowParams>, step: WorkflowStep) {
    const { url } = event.payload

    let articleBody: string | null = null
    let articleDate: string | null = null

    await step.do("extract", async () => {
      const article = await runPromise(
        pipe(
          json(url),
          provideEffectService(AIService, makeLive(this.env.AI_API_KEY)),
          provideEffectService(SchemaAdapter, makeLiveSchemaAdapter()),
        ),
      )
      articleBody = article.body
      articleDate = article.date instanceof Date ? article.date.toISOString() : null
    })

    if (!articleBody) return { url, status: "no-content" }

    await step.do("vectorize", async () => {
      return runPromise(
        pipe(
          store(this.env.VECTORIZE, event.instanceId, articleBody!, url),
          provideEffectService(EmbeddingService, makeEmbeddingLive(this.env.AI)),
        ),
      )
    })

    return { url, date: articleDate, vectorized: true }
  }
}
