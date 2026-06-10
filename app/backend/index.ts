import { Hono } from "hono"
import browserRoutes from "./routes/browser"
import encodeRoutes from "./routes/encode"

const app = new Hono<{ Bindings: Env }>()
  .route("/api/browser", browserRoutes)
  .route("/api/encode", encodeRoutes)

export { PrismEncodeWorkflow } from "./workflows/encode"

export type AppType = typeof app

export default {
  fetch: app.fetch,
}
