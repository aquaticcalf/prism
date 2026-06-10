import { GenericTag } from "effect/Context"
import type { Tag } from "effect/Context"
import type { Effect } from "effect/Effect"
import { gen, tryPromise, provideService, runPromiseExit } from "effect/Effect"
import { failures as causeFailures } from "effect/Cause"

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

let serviceId = 0

function service<T>(name?: string): ServiceKey<T> {
  return new ServiceKey<T>(name ?? `service_${++serviceId}`)
}

function workflow<Deps extends Record<string, ServiceKey<any>>, Args extends any[], Result>(
  deps: Deps,
  fn: (services: ServiceMap<Deps>, ...args: Args) => Promise<Result>,
): WorkflowFn<Result, Args, unknown> & {
  withErrors: <E>() => WorkflowFn<Result, Args, E>
} {
  const wf = (...args: Args): Effect<Result, unknown, any> => {
    return gen(function* () {
      const services = {} as Record<string, any>
      for (const [name, key] of Object.entries(deps)) {
        services[name] = yield* (key as ServiceKey<any>)._tag
      }
      return yield* tryPromise({
        try: () => fn(services as ServiceMap<Deps>, ...args),
        catch: (e) => e as unknown,
      })
    }) as any
  }
  return Object.assign(wf, {
    withErrors<E>(): WorkflowFn<Result, Args, E> {
      return (...args: Args): Effect<Result, E, any> => {
        return gen(function* () {
          const services = {} as Record<string, any>
          for (const [name, key] of Object.entries(deps)) {
            services[name] = yield* (key as ServiceKey<any>)._tag
          }
          return yield* tryPromise({
            try: () => fn(services as ServiceMap<Deps>, ...args),
            catch: (e) => e as E,
          })
        }) as any
      }
    },
  })
}

function run<A, E>(effect: Effect<A, E, any>, provides: [ServiceKey<any>, any][]): Promise<A> {
  let eff = effect as Effect<A, E, never>
  for (const [key, impl] of provides) {
    eff = provideService(eff, key._tag, impl) as any
  }
  return runPromiseExit(eff).then((exit) => {
    if (exit._tag === "Success") {
      return exit.value
    }
    throw [...causeFailures(exit.cause)][0] as E
  })
}

async function runSafe<A, E>(
  effect: Effect<A, E, any>,
  provides: [ServiceKey<any>, any][],
): Promise<{ ok: true; value: A } | { ok: false; error: E }> {
  try {
    const value = await run(effect, provides)
    return { ok: true, value }
  } catch (error) {
    return { ok: false, error: error as E }
  }
}

export { service, workflow, run, runSafe }
export type { ServiceKey }
