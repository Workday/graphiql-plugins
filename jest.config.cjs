/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/node_modules/'],
  // fix https://github.com/kulshekhar/ts-jest/issues/1057
  moduleNameMapper: {
    '^(..?/.+).jsx?$': '$1',
    '^.+\\.(css|less)$': '<rootDir>/../../tests/test-utils/css-stub.js'
  },
  // https://kulshekhar.github.io/ts-jest/docs/next/guides/esm-support/
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
};
