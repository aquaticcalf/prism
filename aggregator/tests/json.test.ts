import { describe, it, expect } from "vite-plus/test"
import { pipe } from "effect"
import { runPromise, provideService, catchAll, succeed } from "effect/Effect"
import { json } from "../json"
import { AIService } from "../ai"
import { SchemaAdapter } from "../adapter"
import { ApiError, ParseError } from "shared"
import { makeTest, makeSchemaTestAdapter } from "./mock/adapter"
import type { Article } from "../schema"

const runSafe = (url: string, adapter: ReturnType<typeof makeTest>) =>
  runPromise(
    pipe(
      provideService(json(url), AIService, adapter),
      (effect) => provideService(effect, SchemaAdapter, makeSchemaTestAdapter()),
      catchAll((e) => succeed(e as ApiError | ParseError)),
    ),
  )

describe("json", () => {
  it("returns parsed article for a valid response", async () => {
    const result = (await runSafe(
      "https://example.com/article",
      makeTest({
        json: {
          responses: {
            "https://example.com/article": {
              date: "2024-06-10T00:00:00.000Z",
              body: "# Hello world",
            },
          },
        },
      }),
    )) as Article

    expect(result.date).toEqual(new Date("2024-06-10T00:00:00.000Z"))
    expect(result.body).toBe("# Hello world")
  })

  it("returns null date when response has null date", async () => {
    const result = (await runSafe(
      "https://example.com/article",
      makeTest({
        json: {
          responses: {
            "https://example.com/article": {
              date: null,
              body: "Some content",
            },
          },
        },
      }),
    )) as Article

    expect(result.date).toBeNull()
    expect(result.body).toBe("Some content")
  })

  it("fails with ApiError for unregistered URL", async () => {
    const result = await runSafe("https://unknown.com", makeTest({}))

    expect(result).toBeInstanceOf(ApiError)
    expect((result as ApiError).status).toBe(404)
  })

  it("fails with ApiError when error is registered", async () => {
    const result = await runSafe(
      "https://example.com/article",
      makeTest({
        json: {
          errors: new ApiError(500, "Internal Server Error"),
        },
      }),
    )

    expect(result).toBeInstanceOf(ApiError)
    expect((result as ApiError).status).toBe(500)
  })

  it("fails with ParseError for malformed response data", async () => {
    const result = await runSafe(
      "https://example.com/article",
      makeTest({
        json: {
          responses: {
            "https://example.com/article": {
              date: "not-a-date",
              body: 42,
            },
          },
        },
      }),
    )

    expect(result).toBeInstanceOf(ParseError)
  })
})
