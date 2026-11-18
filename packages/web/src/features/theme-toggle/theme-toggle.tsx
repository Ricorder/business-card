'use client'

import { useEffect, useState } from 'react'
import { THEME_STORAGE_KEY } from './theme-init'
import type { ThemeValue } from './theme-toggle.types'
import styles from './theme-toggle.module.css'

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeValue | null>(null)

  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme')
    setTheme(current === 'dark' ? 'dark' : 'light')
  }, [])

  function toggle() {
    const next: ThemeValue = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // Приватный режим Safari: локальное хранилище недоступно, тема переключится
      // до перезагрузки страницы. Ронять из-за этого интерфейс не за что.
    }
  }

  return (
    <button type="button" className={styles.toggle} onClick={toggle} aria-label="Переключить тему">
      <span aria-hidden className={styles.icon}>
        {theme === 'dark' ? '☾' : '☀'}
      </span>
      <span className={styles.caption}>{theme === 'dark' ? 'Тёмная' : 'Светлая'}</span>
    </button>
  )
}
