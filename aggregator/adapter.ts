import { service } from "fx"
import { make } from "effect/JSONSchema"
import { ArticleSchema } from "./schema"

export const SchemaAdapter = service<{
  toJSONSchema: () => Record<string, unknown>
}>("SchemaAdapter")

export const makeSchemaAdapter = () => {
  const { $schema: _, $defs, ...rest } = make(ArticleSchema)
  const responseSchema = $defs
    ? JSON.parse(
        JSON.stringify(rest, (_, value) =>
          value?.["$ref"]?.startsWith("#/$defs/") ? $defs[value["$ref"].slice(8)] : value,
        ),
      )
    : rest

  return { toJSONSchema: () => responseSchema }
}
