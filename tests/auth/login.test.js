import { jest } from '@jest/globals';
import { onRequestPost } from '../../functions/auth/login.js';
import bcrypt from 'bcryptjs';

// Mock bcrypt
jest.mock('bcryptjs');
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mock-jwt-token')
}));

describe('Login Function', () => {
  let mockRequest;
  let mockEnv;
  let mockCtx;

  beforeEach(() => {
    mockRequest = {
      method: 'POST',
      json: jest.fn(),
      headers: {
        get: jest.fn()
      }
    };

    mockEnv = {
      JWT_SECRET: 'test-secret',
      DB: {
        prepare: jest.fn(() => ({
          bind: jest.fn(() => ({
            first: jest.fn(),
            run: jest.fn()
          }))
        }))
      }
    };

    mockCtx = {};
  });

  test('should return error for missing credentials', async () => {
    mockRequest.json.mockResolvedValue({});

    const response = await onRequestPost({ request: mockRequest, env: mockEnv, ctx: mockCtx });
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result.success).toBe(false);
    expect(result.error).toContain('الزامی');
  });

  test('should return error for invalid user', async () => {
    mockRequest.json.mockResolvedValue({
      username: 'testuser',
      password: 'testpass123'
    });

    mockEnv.DB.prepare().bind().first.mockResolvedValue(null);

    const response = await onRequestPost({ request: mockRequest, env: mockEnv, ctx: mockCtx });
    const result = await response.json();

    expect(response.status).toBe(401);
    expect(result.success).toBe(false);
    expect(result.error).toContain('اشتباه');
  });

  test('should return success for valid credentials', async () => {
    mockRequest.json.mockResolvedValue({
      username: 'testuser',
      password: 'testpass123'
    });

    const mockUser = {
      id: 1,
      username: 'testuser',
      password_hash: 'hashed-password',
      role: 'operator',
      full_name: 'Test User'
    };

    mockEnv.DB.prepare().bind().first.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(true);

    const response = await onRequestPost({ request: mockRequest, env: mockEnv, ctx: mockCtx });
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.success).toBe(true);
    expect(result.data.user.username).toBe('testuser');
  });
});