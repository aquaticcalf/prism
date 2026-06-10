import { QueryClient, QueryClientProvider, useMutation, useQuery } from "@tanstack/react-query"
import { StrictMode, useState } from "react"
import { createRoot } from "react-dom/client"
import { hc } from "hono/client"
import type { AppType } from "../backend/index"
import "./style.css"

const queryClient = new QueryClient()

type WorkflowStatus = {
  id: string
  status: string
  output: { url: string; date: string; vectorized: boolean } | null
  error: { message: string } | null
}

function EncodeForm() {
  const [url, setUrl] = useState("")
  const [jobId, setJobId] = useState<string | null>(null)

  const create = useMutation({
    mutationFn: async (targetUrl: string) => {
      const client = hc<AppType>("/")
      const res = await client.api.encode.$post({ json: { url: targetUrl } })
      if (!res.ok) throw new Error(`Error: ${res.status}`)
      const { id } = (await res.json()) as { id: string }
      setJobId(id)
    },
  })

  const status = useQuery({
    queryKey: ["workflow", jobId],
    queryFn: async () => {
      const client = hc<AppType>("/")
      const res = await client.api.encode[":id"].status.$get({ param: { id: jobId! } })
      if (!res.ok) throw new Error(`Error: ${res.status}`)
      return (await res.json()) as WorkflowStatus
    },
    enabled: !!jobId,
    refetchInterval: (query) => {
      const data = query.state.data
      if (!data) return 1000
      if (data.status === "complete" || data.status === "errored" || data.status === "terminated")
        return false
      return 1000
    },
  })

  const StatusBadge = ({ status: s }: { status: string }) => {
    const colors: Record<string, string> = {
      queued: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      running: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      complete: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      errored: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      terminated: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    }
    return (
      <span
        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[s] ?? "bg-gray-100 text-gray-800"}`}
      >
        {s}
      </span>
    )
  }

  return (
    <div className="flex flex-col min-h-dvh bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <div className="flex flex-col items-center gap-6 px-4 sm:px-8 pt-8 sm:pt-12 pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">prism</h1>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            setJobId(null)
            if (url.trim()) create.mutate(url)
          }}
          className="flex gap-2 w-full max-w-lg"
        >
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/article"
            className="min-w-0 flex-1 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={create.isPending}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 shrink-0"
          >
            {create.isPending ? "..." : "Encode"}
          </button>
        </form>

        {create.isError && <p className="text-red-500 text-sm">{create.error.message}</p>}
      </div>

      <div className="flex flex-col items-center flex-1 px-4 sm:px-8 pb-8">
        {status.isLoading && jobId && (
          <div className="flex items-center gap-2 text-zinc-500">
            <div className="animate-spin size-4 border-2 border-blue-500 border-t-transparent rounded-full" />
            <span className="text-sm">Processing...</span>
          </div>
        )}

        {status.data && (
          <div className="flex flex-col items-center gap-4 w-full max-w-lg">
            <div className="flex items-center gap-3">
              <span className="text-sm text-zinc-500">Status:</span>
              <StatusBadge status={status.data.status} />
            </div>

            {status.data.error && (
              <div className="w-full p-4 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
                {status.data.error.message}
              </div>
            )}

            {status.data.output && (
              <div className="w-full p-4 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-sm space-y-3 break-all">
                <div>
                  <span className="font-medium text-zinc-500">URL</span>
                  <p className="mt-0.5">{status.data.output.url}</p>
                </div>
                <div>
                  <span className="font-medium text-zinc-500">Date</span>
                  <p className="mt-0.5">{status.data.output.date}</p>
                </div>
                <div>
                  <span className="font-medium text-zinc-500">Vectorized</span>
                  <p className="mt-0.5">{String(status.data.output.vectorized)}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function App() {
  return <EncodeForm />
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
