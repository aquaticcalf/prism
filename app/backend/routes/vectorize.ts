import { pipe } from "effect"
import { runPromise, provideService } from "effect/Effect"
import { Hono } from "hono"
import { EmbeddingService, makeEmbeddingLive, store } from "vectorize"

const vectorizeRoutes = new Hono<{ Bindings: Env }>().post("/:id", async (c) => {
  const jobId = c.req.param("id")
  const raw = await c.env.AI_RESULTS.get(jobId)
  if (!raw) return c.json({ error: "job not found" }, 404)

  type Pending = { status: "pending" | "processing" }
  type Done = { status: "done"; result: { date: string | null; body: string } }
  type Failed = { status: "error"; error: string }

  const job = JSON.parse(raw) as Pending | Done | Failed

  if (job.status === "pending" || job.status === "processing") {
    return c.json({ error: "job not ready", status: job.status }, 400)
  }
  if (job.status === "error") {
    return c.json({ error: "job failed", details: job.error }, 500)
  }

  const body = (job as Done).result.body
  if (!body) return c.json({ error: "article body is empty" }, 400)

  const mutationId = await runPromise(
    pipe(
      store(c.env.VECTORIZE, jobId, body),
      provideService(EmbeddingService, makeEmbeddingLive(c.env.AI)),
    ),
  )

  return c.json({ mutationId })
})

export default vectorizeRoutes
