/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/src/setupGlobals.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],

  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.cjs',
    '\\.(jpg|jpeg|png|gif|svg|webp)$': '<rootDir>/__mocks__/fileMock.cjs',
  },
  testMatch: ['**/__tests__/**/*.{ts,tsx}', '**/*.test.{ts,tsx}'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
}
