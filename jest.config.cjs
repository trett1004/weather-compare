module.exports = {
  projects: [
    {
      displayName: "frontend",
      testEnvironment: "jsdom",
      testMatch: ["<rootDir>/src/**/__tests__/**/*.test.[jt]sx?"],
      setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
      transform: { "^.+\\.[jt]sx?$": "babel-jest" },
      moduleNameMapper: {
        "\\.(css|less|scss|sass)$": "<rootDir>/__mocks__/styleMock.js",
        "\\.(svg|png|jpg|jpeg|gif|ico|webp)$":
          "<rootDir>/__mocks__/fileMock.js",
      },
    },
    {
      displayName: "backend",
      testEnvironment: "node",
      testMatch: ["<rootDir>/__tests__/**/*.test.[jt]s"],
      transform: { "^.+\\.[jt]sx?$": "babel-jest" },
      setupFiles: ["<rootDir>/__tests__/setup.js"],
    },
  ],
};
