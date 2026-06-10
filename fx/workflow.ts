import { gen, tryPromise } from "effect/Effect"
import type { Effect } from "effect/Effect"
import { ServiceKey } from "./types"
import type { ServiceMap, WorkflowFn } from "./types"

function makeRunner<Deps extends Record<string, ServiceKey<any>>, Args extends any[], Result, E>(
  deps: Deps,
  fn: (services: ServiceMap<Deps>, ...args: Args) => Promise<Result>,
  wrap: (e: unknown) => E,
): (...args: Args) => Effect<Result, E, any> {
  return (...args: Args): Effect<Result, E, any> => {
    return gen(function* () {
      const services = {} as Record<string, any>
      for (const [name, key] of Object.entries(deps)) {
        services[name] = yield* (key as ServiceKey<any>)._tag
      }
      return yield* tryPromise({
        try: () => fn(services as ServiceMap<Deps>, ...args),
        catch: (e) => wrap(e),
      })
    }) as any
  }
}

function workflow<Deps extends Record<string, ServiceKey<any>>, Args extends any[], Result>(
  deps: Deps,
  fn: (services: ServiceMap<Deps>, ...args: Args) => Promise<Result>,
): WorkflowFn<Result, Args, unknown> & {
  withErrors: <E>() => WorkflowFn<Result, Args, E>
} {
  const run = makeRunner(deps, fn, (e) => e as unknown)
  return Object.assign(run, {
    withErrors<E>(): WorkflowFn<Result, Args, E> {
      return makeRunner(deps, fn, (e) => e as E)
    },
  })
}

export { workflow }
