import {
  WorkflowEntrypoint,
  WorkflowStep,
  type WorkflowEvent,
  type WorkflowStepConfig,
} from "cloudflare:workers"
import { run } from "fx"
import { json, makeAIService, makeBrowserService } from "aggregator"
import { makeEmbeddingService, store } from "vectorize"

export interface WorkflowParams {
  url: string
}

const retry: WorkflowStepConfig = {
  retries: { limit: 3, delay: 0, backoff: "constant" },
}

export class PrismEncodeWorkflow extends WorkflowEntrypoint<Env, WorkflowParams> {
  async run(event: WorkflowEvent<WorkflowParams>, step: WorkflowStep) {
    const { url } = event.payload

    let articleBody: string | null = null
    let articleDate: string | null = null

    await step.do("extract", retry, async () => {
      const article = await run(json(url), {
        AIService: makeAIService(this.env.AI),
        BrowserService: makeBrowserService(this.env.BROWSER),
      })
      articleBody = article.body
      articleDate = article.date instanceof Date ? article.date.toISOString() : null
    })

    if (!articleBody) return { url, status: "no-content" }

    await step.do("vectorize", retry, async () => {
      return run(store(this.env.VECTORIZE, event.instanceId, articleBody!, url), {
        EmbeddingService: makeEmbeddingService(this.env.AI),
      })
    })

    return { url, date: articleDate, vectorized: true, articleBody }
  }
}
