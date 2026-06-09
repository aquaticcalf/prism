import { Hono } from "hono"
import { streamText } from "hono/streaming"
import { GoogleGenAI } from "@google/genai"

const app = new Hono<{ Bindings: Env }>()

  .get("/api/browser", async (c) => {
    const url = c.req.query("url")
    if (!url) return c.json({ error: "url query param required" }, 400)

    const ai = new GoogleGenAI({ apiKey: c.env.AI_API_KEY })

    const response = await ai.models.generateContentStream({
      model: "gemini-2.5-flash-lite",
      contents: [
        `Visit this URL and output the page's article content verbatim as markdown.
        Do not summarize, rewrite, or add any commentary.
        Output only the raw article text.
        ${url}`,
      ],
      config: {
        tools: [{ urlContext: {} }],
      },
    })

    return streamText(c, async (stream) => {
      for await (const chunk of response) {
        if (chunk.text) {
          await stream.write(chunk.text)
        }
      }
    })
  })

export type AppType = typeof app

export default app
