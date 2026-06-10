import type { Effect } from "effect/Effect"
import { succeed, fail } from "effect/Effect"
import { ApiError } from "../../errors"

type AIServiceShape = {
  readonly generateJson: (url: string, schema: Record<string, unknown>) => Effect<string, ApiError>
}

export const makeTest = (options: {
  json?: {
    responses?: Record<string, unknown>
    errors?: ApiError
  }
}): AIServiceShape => ({
  generateJson: (url: string, _schema: Record<string, unknown>) => {
    const err = options.json?.errors
    if (err) return fail(err)
    const data = options.json?.responses?.[url]
    if (data === undefined) return fail(new ApiError(404, `No test response for ${url}`))
    return succeed(JSON.stringify(data))
  },
})
