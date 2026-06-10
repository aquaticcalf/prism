import { Hono } from "hono"

const encodeRoutes = new Hono<{ Bindings: Env }>()
  .post("/", async (c) => {
    const { url } = await c.req.json<{ url: string }>()
    if (!url) return c.json({ error: "url is required" }, 400)

    const id = crypto.randomUUID()
    await c.env.PRISM_ENCODE_WORKFLOW.create({ id, params: { url } })

    return c.json({ id }, 201)
  })
  .get("/:id/status", async (c) => {
    const { id } = c.req.param()
    const instance = await c.env.PRISM_ENCODE_WORKFLOW.get(id)
    if (!instance) return c.json({ error: "workflow not found" }, 404)

    const status = await instance.status()
    return c.json({ id, ...status })
  })

export default encodeRoutes
