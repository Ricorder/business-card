import { readFileSync } from 'node:fs'
import { globSync } from 'node:fs'

/**
 * Вычитка русской прозы в исходниках и README.
 *
 * В мои русские строки периодически вклинивается латиница или иероглифы:
 * «вместоcss», «Поле选择», «и套件». Глаз такое не замечает, а в публичном
 * репозитории это видно сразу.
 *
 * Правила намеренно узкие и не трогают легальные сочетания:
 *   1) любой CJK-символ — ошибка всегда;
 *   2) кириллица вплотную к латинице (2+ буквы с каждой стороны) — склейка.
 * Дефис, пробел, точка и подчёркивание разделяют слова, поэтому «CSS-модули»,
 * «AI-агент» и «tRPC-контракт» не попадут в выдачу.
 */

const CYRILLIC = '\u0400-\u04ff'
const GLUED = new RegExp(`[A-Za-z]{2,}[${CYRILLIC}]|[${CYRILLIC}]{2,}[A-Za-z]{2,}`, 'gu')
const CJK = /[\u3000-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uac00-\ud7af]/gu

const roots = [
  'packages/*/src/**/*.ts',
  'packages/*/src/**/*.tsx',
  'packages/*/test/**/*.ts',
  'packages/*/test/**/*.mjs',
  'packages/*/prisma/**/*.ts',
  'scripts/**/*.mjs',
  '*.md',
  'packages/*/*.md',
  'Dockerfile',
  'docker/**/*',
]

const files = roots
  .flatMap((pattern) => globSync(pattern, { cwd: process.cwd() }))
  // Сам себе этот скрипт не кандидат: в его же docstring живут примеры поломок.
  .filter((file) => !file.includes('generated') && file !== 'scripts/proofread.mjs')

const problems = []

for (const file of files) {
  let text
  try {
    text = readFileSync(file, 'utf8')
  } catch {
    continue
  }

  text.split('\n').forEach((line, index) => {
    const where = `${file}:${index + 1}`

    if (CJK.test(line)) {
      problems.push(`${where}: CJK-символ → ${line.trim().slice(0, 110)}`)
    }
    CJK.lastIndex = 0

    for (const match of line.matchAll(GLUED)) {
      problems.push(`${where}: склейка «${match[0]}» → ${line.trim().slice(0, 110)}`)
    }
  })
}

console.log(`вычитка: проверено файлов ${files.length}`)

if (problems.length > 0) {
  console.error(`подозрительных мест: ${problems.length}`)
  for (const problem of problems.slice(0, 80)) {
    console.error('  ' + problem)
  }
  process.exitCode = 1
} else {
  console.log('чисто: кириллица с латиницей не склеена, CJK не найден')
}
