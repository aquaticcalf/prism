import { GenericTag } from "effect/Context"
import type { Tag } from "effect/Context"
import type { Effect } from "effect/Effect"

class ServiceKey<T> {
  readonly _tag: Tag<T, T>
  readonly name: string
  private static registry = new Map<string, ServiceKey<any>>()

  constructor(name: string) {
    this._tag = GenericTag<T>(name)
    this.name = name
    ServiceKey.registry.set(name, this)
  }

  static getByName(name: string): ServiceKey<any> | undefined {
    return ServiceKey.registry.get(name)
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
