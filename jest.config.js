module.exports = {
  collectCoverage: true,
  coverageDirectory: "var/coverage",
  moduleNameMapper: {
    "~/(.*)": "<rootDir>/src/$1",
  },
  preset: "ts-jest",
  testEnvironment: "node",
};
