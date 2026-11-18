/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  rootDir: '.',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  // e2e-файл называется graphql.e2e-spec.ts: строгий шаблон \\.spec\\.ts его
  // не ловил, и сюита молча пропускалась.
  testRegex: 'test/.+spec\\.ts$',
  extensionsToTreatAsEsm: ['.ts'],
  // ts-jest оставляет в коде спецификаторы ./x.js, а на диске лежат ./x.ts.
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true, tsconfig: '<rootDir>/tsconfig.test.json' }],
  },
  globalSetup: '<rootDir>/test/global-setup.ts',
  globalTeardown: '<rootDir>/test/global-teardown.ts',
  collectCoverageFrom: ['src/**/*.ts', '!src/main.ts', '!src/generated/**'],
  testTimeout: 30000,
}

export default config
