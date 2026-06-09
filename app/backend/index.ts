import { pipe } from "effect"
import {
  runPromise,
  provideService as provideEffectService,
  promise as effectPromise,
} from "effect/Effect"
import {
  fromEffect,
  flatMap,
  runForEach,
  provideService as provideStreamService,
} from "effect/Stream"
import { Hono } from "hono"
import { streamText } from "hono/streaming"
import { json, AIService, makeLive } from "aggregator"

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

    const result = await runPromise(
      pipe(json(url), provideEffectService(AIService, makeLive(c.env.AI_API_KEY))),
    )
    return c.json(result)
  })

export type AppType = typeof app

export default app
