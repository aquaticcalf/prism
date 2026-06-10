import { Tag } from "effect/Context"
import { make } from "effect/JSONSchema"
import { ArticleSchema } from "./schema"

export class SchemaAdapter extends Tag("SchemaAdapter")<
  SchemaAdapter,
  { readonly toJSONSchema: () => Record<string, unknown> }
>() {}

export const makeLiveSchemaAdapter = () => {
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
