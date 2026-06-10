declare class VectorizeIndex {
  upsert(
    vectors: { id: string; values: number[]; metadata?: Record<string, unknown> }[],
  ): Promise<{ mutationId?: string }>
}

declare class Ai {
  run(model: string, inputs: Record<string, unknown>): Promise<{ data?: number[][] }>
}
