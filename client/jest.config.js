module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    globals: {
        window: {},
    },
    setupFilesAfterEnv: ['<rootDir>/setupTests.js'],
};
