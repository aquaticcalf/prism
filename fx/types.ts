import { GenericTag } from "effect/Context"
import type { Tag } from "effect/Context"
import type { Effect } from "effect/Effect"

class ServiceKey<T> {
  readonly _tag: Tag<T, T>
  constructor(name: string) {
    this._tag = GenericTag<T>(name)
  }
}

type Asyncify<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? (...args: A) => Promise<Awaited<R>>
    : T[K]
}

type ServiceMap<T> = {
  [K in keyof T]: T[K] extends ServiceKey<infer S> ? Asyncify<S> : never
}

type WorkflowFn<Result, Args extends any[], E> = (...args: Args) => Effect<Result, E, any>

export { ServiceKey }
export type { Asyncify, ServiceMap, WorkflowFn }
