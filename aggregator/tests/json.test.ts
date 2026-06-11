import { describe, it, expect } from "vite-plus/test"
import { run } from "fx"
import { json } from "../json"
import { ApiError, ParseError } from "shared"
import { makeTestAIService, makeTestSchemaAdapter } from "./mock/adapter"
import type { Article } from "../schema"

const runSafe = async (url: string, adapter: ReturnType<typeof makeTestAIService>) => {
  try {
    const value = await run(json(url), {
      AIService: adapter,
      SchemaAdapter: makeTestSchemaAdapter(),
    })
    return value as Article
  } catch (e) {
    return e as ApiError | ParseError
  }
}

describe("json", () => {
  it("returns parsed article for a valid response", async () => {
    const result = (await runSafe(
      "https://example.com/article",
      makeTestAIService({
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
      makeTestAIService({
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
    const result = await runSafe("https://unknown.com", makeTestAIService({}))

    expect(result).toBeInstanceOf(ApiError)
    expect((result as ApiError).status).toBe(404)
  })

  it("fails with ApiError when error is registered", async () => {
    const result = await runSafe(
      "https://example.com/article",
      makeTestAIService({
        json: {
          errors: new ApiError(500, "Internal Server Error"),
        },
      }),
    )

    expect(result).toBeInstanceOf(ApiError)
    expect((result as ApiError).status).toBe(500)
  })

  it("fails with ParseError when AI returns empty response", async () => {
    const result = await runSafe(
      "https://example.com/article",
      makeTestAIService({
        json: {
          responses: {
            "https://example.com/article": "",
          },
        },
      }),
    )

    expect(result).toBeInstanceOf(ParseError)
    expect((result as ParseError).message).toBe("AI returned empty response")
  })

  it("fails with ParseError for malformed response data", async () => {
    const result = await runSafe(
      "https://example.com/article",
      makeTestAIService({
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
