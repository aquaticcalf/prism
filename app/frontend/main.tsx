import { StrictMode, useRef, useState } from "react"
import { createRoot } from "react-dom/client"
import "./style.css"

function App() {
  const [url, setUrl] = useState("")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const preRef = useRef<HTMLPreElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    setContent("")
    setError("")

    try {
      const res = await fetch(`/api/browser?url=${encodeURIComponent(url)}`, {
        signal: controller.signal,
      })
      if (!res.ok) {
        setError(`Error: ${res.status}`)
        setLoading(false)
        return
      }

      const reader = res.body?.getReader()
      if (!reader) {
        setError("No response body")
        setLoading(false)
        return
      }

      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        setContent((prev) => prev + decoder.decode(value, { stream: true }))
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-dvh bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 overflow-hidden">
      <div className="flex flex-col items-center gap-6 px-8 pt-8 shrink-0">
        <h1 className="text-3xl font-bold">prism</h1>

        <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-2xl">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/article"
            className="flex-1 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 shrink-0"
          >
            {loading ? "Loading..." : "Fetch"}
          </button>
        </form>

        {error && <p className="text-red-500">{error}</p>}
      </div>

      {content && (
        <div className="relative flex-1 w-full max-w-2xl mx-auto px-8 pb-8 min-h-0">
          <button
            onClick={() => {
              void navigator.clipboard.writeText(content)
              setCopied(true)
              setTimeout(() => setCopied(false), 2000)
            }}
            className="absolute top-6 right-11 px-3 py-1.5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-xs font-medium hover:bg-zinc-300 dark:hover:bg-zinc-700 z-10"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
          <pre
            ref={preRef}
            className="h-full w-full p-4 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-sm leading-relaxed whitespace-pre-wrap font-sans overflow-auto"
          >
            {content}
          </pre>
        </div>
      )}
    </div>
  )
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
