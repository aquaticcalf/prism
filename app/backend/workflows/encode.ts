import { WorkflowEntrypoint, WorkflowEvent, WorkflowStep } from "cloudflare:workers"
import { run } from "fx"
import { json, makeAIService, AIService, makeSchemaAdapter, SchemaAdapter } from "aggregator"
import { makeEmbeddingService, store, EmbeddingService } from "vectorize"

export interface WorkflowParams {
  url: string
}

export class PrismEncodeWorkflow extends WorkflowEntrypoint<Env, WorkflowParams> {
  async run(event: WorkflowEvent<WorkflowParams>, step: WorkflowStep) {
    const { url } = event.payload

    let articleBody: string | null = null
    let articleDate: string | null = null

    await step.do("extract", async () => {
      const article = await run(json(url), [
        [AIService, makeAIService(this.env.AI_API_KEY)],
        [SchemaAdapter, makeSchemaAdapter()],
      ])
      articleBody = article.body
      articleDate = article.date instanceof Date ? article.date.toISOString() : null
    })

    if (!articleBody) return { url, status: "no-content" }

    await step.do("vectorize", async () => {
      return run(store(this.env.VECTORIZE, event.instanceId, articleBody!, url), [
        [EmbeddingService, makeEmbeddingService(this.env.AI)],
      ])
    })

    return { url, date: articleDate, vectorized: true }
  }
}
