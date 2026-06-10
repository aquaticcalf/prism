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
import { PrismWorkflow } from "./workflow"

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
  .post("/api/workflows", async (c) => {
    const { url } = (await c.req.json()) as { url: string }
    if (!url) return c.json({ error: "url required" }, 400)

    const workflowId = crypto.randomUUID()
    await c.env.PRISM_WORKFLOW.create({ id: workflowId, params: { url } })

    return c.json({ workflowId }, 202)
  })
  .get("/api/workflows/:id/status", async (c) => {
    const workflowId = c.req.param("id")
    const instance = c.env.PRISM_WORKFLOW.get(workflowId)
    const status = await instance.status()

    return c.json(status)
  })

export type AppType = typeof app

export { PrismWorkflow }

export default {
  fetch: app.fetch,
}
