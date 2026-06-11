import { describe, it, expect } from "vite-plus/test"
import { run } from "fx"
import { json } from "../json"
import { ApiError, ParseError } from "shared"
import { makeTestAIService, makeTestSchemaAdapter, makeTestBrowserService } from "./mock/adapter"
import type { Article } from "../schema"

const runSafe = async (
  url: string,
  ai: ReturnType<typeof makeTestAIService>,
  browser: ReturnType<typeof makeTestBrowserService>,
) => {
  try {
    const value = await run(json(url), {
      AIService: ai,
      BrowserService: browser,
      SchemaAdapter: makeTestSchemaAdapter(),
    })
    return value as Article
  } catch (e) {
    return e as ApiError | ParseError
  }
}

const exampleUrl = "https://example.com/article"
const articleContent = "# Hello world"

describe("json", () => {
  it("returns parsed article for a valid response", async () => {
    const result = (await runSafe(
      exampleUrl,
      makeTestAIService({
        json: {
          responses: {
            [articleContent]: {
              date: "2024-06-10T00:00:00.000Z",
              body: articleContent,
            },
          },
        },
      }),
      makeTestBrowserService({
        responses: { [exampleUrl]: articleContent },
      }),
    )) as Article

    expect(result.date).toEqual(new Date("2024-06-10T00:00:00.000Z"))
    expect(result.body).toBe(articleContent)
  })

  it("returns null date when response has null date", async () => {
    const result = (await runSafe(
      exampleUrl,
      makeTestAIService({
        json: {
          responses: {
            [articleContent]: {
              date: null,
              body: "Some content",
            },
          },
        },
      }),
      makeTestBrowserService({
        responses: { [exampleUrl]: articleContent },
      }),
    )) as Article

    expect(result.date).toBeNull()
    expect(result.body).toBe("Some content")
  })

  it("fails with ApiError when browser has no response", async () => {
    const result = await runSafe(
      "https://unknown.com",
      makeTestAIService({}),
      makeTestBrowserService({}),
    )

    expect(result).toBeInstanceOf(ApiError)
    expect((result as ApiError).status).toBe(404)
  })

  it("fails with ApiError when browser errors", async () => {
    const result = await runSafe(
      exampleUrl,
      makeTestAIService({}),
      makeTestBrowserService({
        errors: new ApiError(500, "Browser error"),
      }),
    )

    expect(result).toBeInstanceOf(ApiError)
    expect((result as ApiError).status).toBe(500)
  })

  it("fails with ParseError when AI returns empty response", async () => {
    const result = await runSafe(
      exampleUrl,
      makeTestAIService({
        json: {
          responses: {
            [articleContent]: "",
          },
        },
      }),
      makeTestBrowserService({
        responses: { [exampleUrl]: articleContent },
      }),
    )

    expect(result).toBeInstanceOf(ParseError)
    expect((result as ParseError).message).toBe("AI returned empty response")
  })

  it("fails with ParseError for malformed response data", async () => {
    const result = await runSafe(
      exampleUrl,
      makeTestAIService({
        json: {
          responses: {
            [articleContent]: {
              date: "not-a-date",
              body: 42,
            },
          },
        },
      }),
      makeTestBrowserService({
        responses: { [exampleUrl]: articleContent },
      }),
    )

    expect(result).toBeInstanceOf(ParseError)
  })
})
