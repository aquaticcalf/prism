import { workflow } from "fx"
import { AIService } from "./ai"
import { BrowserService } from "./browser"
import { ApiError, ParseError } from "shared"

export const json = workflow(
  { ai: AIService, browser: BrowserService },
  async ({ ai, browser }, url: string) => {
    const html = await browser.html(url)
    return await ai.generateObject(html)
  },
).withErrors<ApiError | ParseError>()
