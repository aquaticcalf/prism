import { pipe } from "effect"
import { runPromise, provideService as provideEffectService } from "effect/Effect"
import { json } from "aggregator"
import { makeLive, AIService } from "aggregator"
import { makeEmbeddingLive } from "vectorize"

export interface WorkflowParams {
  url: string
}

export class PrismWorkflow extends WorkflowEntrypoint<Env, WorkflowParams> {
  async run(event: WorkflowEvent<WorkflowParams>, step: WorkflowStep) {
    const { url } = event.payload

    const article = await step.do("extract", async () => {
      return runPromise(
        pipe(json(url), provideEffectService(AIService, makeLive(this.env.AI_API_KEY))),
      )
    })

    const body = article?.body
    if (!body) return { url, status: "no-content" }

    await step.do("vectorize", async () => {
      const embedding = makeEmbeddingLive(this.env.AI)
      const values = await runPromise(embedding.embed(body))

      await this.env.VECTORIZE.upsert([
        {
          id: event.instanceId,
          values,
          metadata: { url },
        },
      ])

      return "ok"
    })

    return { url, date: article.date, vectorized: true }
  }
}
