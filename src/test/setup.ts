// This file contains setup code for tests

// Global setup
beforeAll(() => {
  // Set up environment variables for testing
  process.env.NODE_ENV = 'test';
  process.env.MONGODB_URI = 'mongodb://localhost:27017/quranic-analysis-system-test';
});

// Global teardown
afterAll(() => {
  // Clean up environment variables after testing
  delete process.env.NODE_ENV;
  delete process.env.MONGODB_URI;
});

// Mock console.error to avoid cluttering test output
global.console.error = jest.fn();

// Add any global mocks
jest.mock('../utils/database', () => ({
  connectDatabase: jest.fn().mockResolvedValue({}),
  disconnectDatabase: jest.fn().mockResolvedValue(undefined)
}));