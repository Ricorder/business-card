import type { NextConfig } from 'next'

const isDevelopment = process.env.NODE_ENV !== 'production'
const apiGraphqlUrl = process.env.GRAPHQL_UPSTREAM ?? 'http://127.0.0.1:4000/graphql'

/**
 * Статический экспорт: `next build` кладёт готовый HTML/JS в out/, и его
 * раздаёт NestJS из того же контейнера. Поэтому проксировать /graphql нужно
 * только в дев-режиме, где Next сидит на :3000, а API на :4000; в сборке
 * проксей нет, и переписать их было бы нечем.
 */
const config: NextConfig = {
  output: 'export',
  reactStrictMode: true,
  images: { unoptimized: true },
  assetPrefix: undefined,
  ...(isDevelopment
    ? {
        async rewrites() {
          return [{ source: '/graphql', destination: apiGraphqlUrl }]
        },
      }
    : {}),
}

export default config
