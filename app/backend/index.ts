import { Hono } from "hono"
import encodeRoutes from "./routes/encode"

const app = new Hono<{ Bindings: Env }>().route("/api/encode", encodeRoutes)

export { PrismEncodeWorkflow } from "./workflows/encode"

export type AppType = typeof app

export default {
  fetch: app.fetch,
}
