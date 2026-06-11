import { ApiError } from "shared"

export const makeTestAIService = (options: {
  responses?: Record<string, { date: string | null; body: string }>
  errors?: ApiError
}) => ({
  generateObject: async (html: string) => {
    const err = options.errors
    if (err) throw err
    const article = options.responses?.[html]
    if (!article) throw new ApiError(404, `No test response for content`)
    return {
      date: article.date ? new Date(article.date) : null,
      body: article.body,
    }
  },
})

export const makeTestBrowserService = (options: {
  responses?: Record<string, string>
  errors?: ApiError
}) => ({
  html: async (url: string) => {
    const err = options.errors
    if (err) throw err
    const content = options.responses?.[url]
    if (content === undefined) throw new ApiError(404, `No test response for ${url}`)
    return content
  },
})
