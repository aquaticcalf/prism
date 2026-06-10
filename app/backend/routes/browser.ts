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

const browserRoutes = new Hono<{ Bindings: Env }>().get("/", async (c) => {
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

export default browserRoutes
