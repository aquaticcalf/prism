import { z } from "zod"

export const ArticleJsonSchema = z.object({
  date: z.string().nullable(),
  body: z.string(),
})

export const ArticleSchema = ArticleJsonSchema.transform((val) => ({
  date: val.date ? new Date(val.date) : null,
  body: val.body,
}))

export type Article = z.infer<typeof ArticleSchema>
