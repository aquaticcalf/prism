export interface VectorizeIndex {
  upsert(
    vectors: { id: string; values: number[]; metadata?: Record<string, unknown> }[],
  ): Promise<{ mutationId?: string }>
}

export interface Ai {
  run(model: string, inputs: Record<string, unknown>): Promise<{ data?: number[][] }>
}
