import { pipe } from "effect"
import { runPromise, provideService as provideEffectService } from "effect/Effect"
import { json, AIService, makeLive } from "aggregator"

export interface AiQueueMessage {
  type: "json"
  jobId: string
  url: string
}

export async function queueConsumer(batch: MessageBatch<AiQueueMessage>, env: Env): Promise<void> {
  for (const msg of batch.messages) {
    const { jobId, url } = msg.body

    try {
      await env.AI_RESULTS.put(jobId, JSON.stringify({ status: "processing" }))

      const result = await runPromise(
        pipe(json(url), provideEffectService(AIService, makeLive(env.AI_API_KEY))),
      )

      await env.AI_RESULTS.put(jobId, JSON.stringify({ status: "done", result }))
      msg.ack()
    } catch (e) {
      await env.AI_RESULTS.put(
        jobId,
        JSON.stringify({
          status: "error",
          error: e instanceof Error ? e.message : String(e),
        }),
      )
      msg.retry()
    }
  }
}
