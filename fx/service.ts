import { ServiceKey } from "./types"

let serviceId = 0

function service<T>(name?: string): ServiceKey<T> {
  return new ServiceKey<T>(name ?? `service_${++serviceId}`)
}

export { service }
export type { ServiceKey } from "./types"
