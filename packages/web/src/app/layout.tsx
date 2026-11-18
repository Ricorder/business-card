import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { themeInitScript } from '@/features/theme-toggle/theme-init'
import './globals.css'

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:4000'

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: 'Евгений Колесников — Fullstack-разработчик',
  description:
    'Цифровая визитка: пять лет восемь месяцев коммерческой разработки на TypeScript. Опыт, стек и контакты; содержимое отдаётся GraphQL-запросом card.',
  keywords: ['Fullstack', 'TypeScript', 'Next.js', 'NestJS', 'GraphQL', 'React Native', 'Москва'],
  authors: [{ name: 'Евгений Колесников' }],
  openGraph: {
    title: 'Евгений Колесников — Fullstack-разработчик',
    description: 'Визитка с опытом, стеком и контактами. Данные приходят из GraphQL API этого же сервиса.',
    type: 'profile',
    url: appUrl,
  },
  alternates: { canonical: '/' },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // suppressHydrationWarning нужен ровно из-за инлайнового скрипта темы: он
    // ставит data-theme на <html> до гидратации, и серверный HTML изначально
    // отличается от клиентского.
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
