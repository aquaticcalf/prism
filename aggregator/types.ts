type ChatCompletionChoice = {
  index: number
  message: { role: "assistant"; content: string | null; refusal: string | null }
  finish_reason: "stop" | "length" | "tool_calls" | "content_filter" | "function_call"
  logprobs: unknown
}

type ChatCompletionsOutput = {
  id: string
  object: string
  created: number
  model: string
  choices: Array<ChatCompletionChoice>
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number }
}

declare global {
  interface Ai {
    run(model: string, inputs: Record<string, unknown>): Promise<unknown>
  }
}

export { ChatCompletionsOutput }
