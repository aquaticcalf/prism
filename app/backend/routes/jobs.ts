import { Hono } from "hono"
import type { Article } from "aggregator"

const jobsRoutes = new Hono<{ Bindings: Env }>()
  .get("/:id", async (c) => {
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
  .delete("/:id", async (c) => {
    const jobId = c.req.param("id")
    const raw = await c.env.AI_RESULTS.get(jobId)
    if (!raw) return c.json({ error: "job not found" }, 404)

    await c.env.AI_RESULTS.delete(jobId)
    return c.body(null, 204)
  })

export default jobsRoutes
