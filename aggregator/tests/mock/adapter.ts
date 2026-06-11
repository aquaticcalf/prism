import { ApiError } from "shared"

export const makeTestAIService = (options: {
  json?: {
    responses?: Record<string, unknown>
    errors?: ApiError
  }
}) => ({
  generateJson: async (content: string, _schema: Record<string, unknown>) => {
    const err = options.json?.errors
    if (err) throw err
    const data = options.json?.responses?.[content]
    if (data === undefined) throw new ApiError(404, `No test response for content`)
    return typeof data === "string" ? data : JSON.stringify(data)
  },
})

export const makeTestSchemaAdapter = () => ({
  toJSONSchema: () => ({ type: "object" }) as Record<string, unknown>,
})

export const makeTestBrowserService = (options: {
  responses?: Record<string, string>
  errors?: ApiError
}) => ({
  markdown: async (url: string) => {
    const err = options.errors
    if (err) throw err
    const content = options.responses?.[url]
    if (content === undefined) throw new ApiError(404, `No test response for ${url}`)
    return content
  },
})
