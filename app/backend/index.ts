import { Hono } from "hono"
import { streamText } from "hono/streaming"
import { browse, json } from "aggregator"

const app = new Hono<{ Bindings: Env }>()
  .get("/api/browser", async (c) => {
    const url = c.req.query("url")
    if (!url) return c.json({ error: "url query param required" }, 400)

    return streamText(c, async (stream) => {
      for await (const text of browse(url, c.env.AI_API_KEY)) {
        await stream.write(text)
      }
    })
  })
  .get("/api/browser/json", async (c) => {
    const url = c.req.query("url")
    if (!url) return c.json({ error: "url query param required" }, 400)

    const result = await json(url, c.env.AI_API_KEY)
    return c.json(result)
  })

export type AppType = typeof app

export default app
