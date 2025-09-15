const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  roots: ['<rootDir>/src'],
  testRegex: '(/__tests__/.*|\\.(test|spec))\\.(ts|tsx)$',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/**/types.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
    'src/lib/**': { branches: 80, functions: 80, lines: 80, statements: 80 },
    'src/hooks/**': { branches: 80, functions: 80, lines: 80, statements: 80 },
    'src/components/AuthWrapper.tsx': { branches: 80, functions: 80, lines: 80, statements: 80 },
    'src/components/TablePagination.tsx': { branches: 80, functions: 80, lines: 80, statements: 80 },
  },
}

module.exports = createJestConfig(customJestConfig)