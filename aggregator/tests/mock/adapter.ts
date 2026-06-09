import type { Effect } from "effect/Effect"
import { succeed, fail } from "effect/Effect"
import type { Stream } from "effect/Stream"
import { succeed as streamSucceed, fail as streamFail } from "effect/Stream"
import { ApiError } from "../../errors"

type AIServiceShape = {
  readonly generateJson: (url: string, schema: Record<string, unknown>) => Effect<string, ApiError>
  readonly generateStream: (url: string) => Stream<string, ApiError>
}

export const makeTest = (options: {
  json?: {
    responses?: Record<string, unknown>
    errors?: ApiError
  }
  stream?: {
    responses?: Record<string, string>
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
  generateStream: (url: string) => {
    const err = options.stream?.errors
    if (err) return streamFail(err)
    const text = options.stream?.responses?.[url]
    if (text === undefined) return streamFail(new ApiError(404, `No test response for ${url}`))
    return streamSucceed(text)
  },
})
