import { service } from "fx"
import { ApiError } from "shared"

export const BrowserService = service<{
  markdown: (url: string) => Promise<string>
}>("BrowserService")

export const makeBrowserService = (browser: {
  quickAction(action: string, options: { url: string }): Promise<Response>
}) => ({
  markdown: async (url: string) => {
    const response = await browser.quickAction("markdown", { url })
    const data = (await response.json()) as { success: boolean; result: string }
    if (!data.success) throw new ApiError(500, "Browser rendering failed")
    return data.result
  },
})
