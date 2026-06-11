import { service } from "fx"
import { ApiError } from "shared"

export const BrowserService = service<{
  html: (url: string) => Promise<string>
}>("BrowserService")

export const makeBrowserService = (browser: {
  quickAction(action: string, options: { url: string }): Promise<Response>
}) => ({
  html: async (url: string) => {
    const response = await browser.quickAction("content", { url })
    const data = (await response.json()) as { success: boolean; result: string }
    if (!data.success) throw new ApiError(500, "Browser rendering failed")
    return data.result
  },
})
