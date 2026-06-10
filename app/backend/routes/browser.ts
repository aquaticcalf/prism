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
import type { AiQueueMessage } from "../queue"

const browserRoutes = new Hono<{ Bindings: Env }>()
  .get("/", async (c) => {
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
  .get("/json", async (c) => {
    const url = c.req.query("url")
    if (!url) return c.json({ error: "url query param required" }, 400)

    const jobId = crypto.randomUUID()
    const queue = c.env.AI_QUEUE as Queue<AiQueueMessage>
    await queue.send({ type: "json", jobId, url })
    await c.env.AI_RESULTS.put(jobId, JSON.stringify({ status: "pending" }))

    return c.json({ jobId }, 202)
  })

export default browserRoutes
