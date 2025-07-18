import { jest } from '@jest/globals';

// Mock Cloudflare Workers environment
global.crypto = {
  randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9)
};

// Mock environment variables
global.mockEnv = {
  JWT_SECRET: 'test-secret-key',
  DB: {
    prepare: jest.fn(() => ({
      bind: jest.fn(() => ({
        first: jest.fn(),
        all: jest.fn(),
        run: jest.fn()
      }))
    }))
  },
  CACHE: {
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }
};