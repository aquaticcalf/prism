import { pipe } from "effect"
import { runPromise, promise as effectPromise } from "effect/Effect"
import {
  fromEffect,
  flatMap,
  runForEach,
  provideService as provideStreamService,
} from "effect/Stream"
import { Hono } from "hono"
import { streamText } from "hono/streaming"
import { AIService, makeLive } from "aggregator"
import type { Article } from "aggregator"
import { queueConsumer, type AiQueueMessage } from "./queue"

const app = new Hono<{ Bindings: Env }>()
  .get("/api/browser", async (c) => {
    const url = c.req.query("url")
    if (!url) return c.json({ error: "url query param required" }, 400)

    return streamText(c, async (stream) => {
      const program = pipe(
        fromEffect(AIService).pipe(flatMap((ai) => ai.generateStream(url))),
        provideStreamService(AIService, makeLive(c.env.AI_API_KEY)),
      )
      await runPromise(runForEach(program, (text) => effectPromise(() => stream.write(text))))
    })
  })
  .get("/api/browser/json", async (c) => {
    const url = c.req.query("url")
    if (!url) return c.json({ error: "url query param required" }, 400)

    const jobId = crypto.randomUUID()
    const queue = c.env.AI_QUEUE as Queue<AiQueueMessage>
    await queue.send({ type: "json", jobId, url })
    await c.env.AI_RESULTS.put(jobId, JSON.stringify({ status: "pending" }))

    return c.json({ jobId }, 202)
  })
  .get("/api/jobs/:id", async (c) => {
    const jobId = c.req.param("id")
    const raw = await c.env.AI_RESULTS.get(jobId)
    if (!raw) return c.json({ error: "job not found" }, 404)

    type Pending = { status: "pending" | "processing" }
    type Done = { status: "done"; result: Article }
    type Failed = { status: "error"; error: string }

    const job = JSON.parse(raw) as Pending | Done | Failed

    if (job.status === "pending" || job.status === "processing") {
      return c.json({ status: job.status })
    }
    if (job.status === "error") {
      return c.json({ status: "error", error: job.error }, 500)
    }
    return c.json({ status: "done", result: (job as Done).result })
  })

export type AppType = typeof app

export default {
  fetch: app.fetch,
  queue: queueConsumer,
}
