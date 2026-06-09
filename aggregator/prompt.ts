export function prompt(url: string) {
  return `Visit this URL and output the page's article content verbatim as markdown.
  Do not summarize, rewrite, or add any commentary.
  Output only the raw article text.
  ${url}`
}
