import { Struct, NullOr, Date as DateSchema, String } from "effect/Schema"

export const ArticleSchema = Struct({
  date: NullOr(
    DateSchema.annotations({
      description: "Publication date of the article or null if not found",
    }),
  ),
  body: String.annotations({ description: "Full article body as markdown" }),
})

export type Article = { date: Date | null; body: string }
