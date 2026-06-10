import type { Effect } from "effect/Effect"
import { provideService, runPromiseExit } from "effect/Effect"
import { failures as causeFailures } from "effect/Cause"
import { ServiceKey } from "./types"

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

export { run, runSafe }
