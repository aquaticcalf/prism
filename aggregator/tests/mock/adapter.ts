import { ApiError } from "shared"

export const makeTest = (options: {
  json?: {
    responses?: Record<string, unknown>
    errors?: ApiError
  }
}) => ({
  generateJson: async (url: string, _schema: Record<string, unknown>) => {
    const err = options.json?.errors
    if (err) throw err
    const data = options.json?.responses?.[url]
    if (data === undefined) throw new ApiError(404, `No test response for ${url}`)
    return typeof data === "string" ? data : JSON.stringify(data)
  },
})

export const makeSchemaTestAdapter = () => ({
  toJSONSchema: () => ({ type: "object" }) as Record<string, unknown>,
})
