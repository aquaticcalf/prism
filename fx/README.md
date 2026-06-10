# fx

An ergonomic wrapper around [Effect](https://effect.website) that uses plain
async/await/throw/try-catch while preserving full type safety.

No generators, no `pipe`, no `yield*`, no `succeed`/`fail`.

## Quick start

```ts
import { service, workflow, run, runSafe } from "fx"

// 1. Declare a service type (just a type-key - nothing executes)
const MyService = service<{ greet: (name: string) => string }>()

// 2. Write business logic with plain async/await
const hello = workflow({ svc: MyService }, async ({ svc }, name: string) => {
  return await svc.greet(name)
})

// 3. Wire up a live implementation
const live = { greet: async (name: string) => `Hello, ${name}!` }

// 4. Run it
const msg = await run(hello("world"), [[MyService, live]])
// msg: string
```

## Error handling

**Untagged errors** (errors are `unknown`, caller must narrow manually):

```ts
const hello = workflow({ svc: MyService }, async ({ svc }, name: string) => {
  if (!name) throw new Error("name required")
  return await svc.greet(name)
})
// type: (...args) => Effect<string, unknown, any>
```

**Tagged errors** (errors are fully typed and tracked):

```ts
const hello = workflow({ svc: MyService }, async ({ svc }, name: string) => {
  if (!name) throw new AppError("name required")
  return await svc.greet(name)
}).withErrors<AppError>()
// type: (...args) => Effect<string, AppError, any>
```

**Safe runner** (discriminated union - like Rust `Result`):

```ts
const result = await runSafe(hello("world"), [[MyService, live]])
// { ok: true; value: string } | { ok: false; error: AppError }

if (!result.ok) {
  result.error // narrowed to AppError
}
```

## API

### `service<T>(name?)`

Creates a typed service key. The optional `name` parameter is used for the
underlying Effect tag; auto-incremented names are generated otherwise.

```ts
const Db = service<{ query: (sql: string) => Row[] }>("Db")
```

### `workflow(deps, fn)`

Wraps an async function so it can pull Effect dependencies at runtime.

- `deps` - object mapping service names to `ServiceKey`s
- `fn` - async function receiving resolved services, returning the result
- Returns a callable function that accepts the workflow's own arguments

```ts
const doStuff = workflow({ db: Db, cache: Cache }, async ({ db, cache }, id: string) => {
  const cached = await cache.get(id)
  if (cached) return cached
  return await db.query(id)
})
```

### `.withErrors<E>()`

Annotates a workflow with a typed error union.

```ts
const doStuff = workflow({ db: Db }, async ({ db }, id: string) => {
  const row = await db.query(id)
  if (!row) throw new NotFoundError(id)
  return row
}).withErrors<NotFoundError | DbError>()
```

### `run(effect, provides)`

Runs an Effect with the given service implementations.

- Throws `E` on failure (like Go's `val, err :=` pattern)

```ts
try {
  const val = await run(doStuff("123"), [[Db, myDb]])
} catch (e) {
  // e is NotFoundError | DbError
}
```

### `runSafe(effect, provides)`

Same as `run`, but catches the error into a discriminated union.

```ts
const result = await runSafe(doStuff("123"), [[Db, myDb]])
if (result.ok)
  result.value // A
else result.error // E
```

## File structure

```
fx/
  types.ts     - ServiceKey class + type utilities (Asyncify, ServiceMap, WorkflowFn)
  service.ts   - service() factory
  workflow.ts  - workflow() + withErrors()
  runner.ts    - run(), runSafe()
  index.ts     - re-exports public API
  README.md    - this file
```
