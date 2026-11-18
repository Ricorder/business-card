/**
 * То же, что делает `gql` из graphql-tag, но без зависимости: доку мы отдаём
 * наружу как обычную строку (fetch + POST /graphql), а tagged-template нужен
 * только для подсветки синтаксиса в редакторе.
 */
export function gql(strings: TemplateStringsArray, ...placeholders: unknown[]): string {
  return strings.reduce((acc, part, i) => {
    const value = placeholders[i - 1]
    return (i > 0 ? acc + String(value) : acc) + part
  }, '')
}
