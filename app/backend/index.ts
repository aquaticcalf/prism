import { Hono } from "hono"
import { queueConsumer } from "./queue"
import browserRoutes from "./routes/browser"
import jobsRoutes from "./routes/jobs"
import vectorizeRoutes from "./routes/vectorize"

const app = new Hono<{ Bindings: Env }>()
  .route("/api/browser", browserRoutes)
  .route("/api/jobs", jobsRoutes)
  .route("/api/vectorize", vectorizeRoutes)

export type AppType = typeof app

export default {
  fetch: app.fetch,
  queue: queueConsumer,
}
