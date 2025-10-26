/**
 * Tests for Authentication API MSW Handlers
 * RED PHASE: These tests should FAIL until we implement the handlers
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { authHandlers } from '../handlers/auth';

// Setup MSW test server
const server = setupServer(...authHandlers);

describe('Authentication API Handlers', () => {
  // Start server before all tests
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

  // Reset handlers after each test
  afterEach(() => server.resetHandlers());

  // Clean up after all tests
  afterAll(() => server.close());

  describe('POST /api/auth/login', () => {
    it('should successfully log in with valid credentials', async () => {
      const response = await fetch('http://localhost/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'user@example.com',
          password: 'Password123',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain(
        'application/json'
      );
      expect(data).toHaveProperty('token');
      expect(data).toHaveProperty('user');
      expect(data.user).toHaveProperty('id');
      expect(data.user).toHaveProperty('email');
      expect(data.user.email).toBe('user@example.com');
    });

    it('should return user details with token', async () => {
      const response = await fetch('http://localhost/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'trader@example.com',
          password: 'secure123',
        }),
      });

      const data = await response.json();

      expect(data.user).toHaveProperty('name');
      expect(data.user).toHaveProperty('email');
      expect(data.user).toHaveProperty('role');
      expect(typeof data.token).toBe('string');
      expect(data.token.length).toBeGreaterThan(0);
    });

    it('should reject login with invalid credentials', async () => {
      const response = await fetch('http://localhost/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'wrong@example.com',
          password: 'wrongpassword',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('Invalid credentials');
    });

    it('should reject login with missing email', async () => {
      const response = await fetch('http://localhost/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: 'Password123',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
    });

    it('should reject login with missing password', async () => {
      const response = await fetch('http://localhost/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'user@example.com',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
    });

    it('should have realistic response delay (100-300ms)', async () => {
      const startTime = Date.now();

      await fetch('http://localhost/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'user@example.com',
          password: 'Password123',
        }),
      });

      const duration = Date.now() - startTime;

      expect(duration).toBeGreaterThanOrEqual(100);
      expect(duration).toBeLessThan(500);
    });
  });

  describe('POST /api/auth/register', () => {
    it('should successfully register new user', async () => {
      const response = await fetch('http://localhost/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'New User',
          email: 'newuser@example.com',
          password: 'securepass123',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toHaveProperty('token');
      expect(data).toHaveProperty('user');
      expect(data.user.email).toBe('newuser@example.com');
      expect(data.user.name).toBe('New User');
    });

    it('should reject registration with existing email', async () => {
      const response = await fetch('http://localhost/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test User',
          email: 'user@example.com', // Already exists
          password: 'Password123',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('already exists');
    });

    it('should reject registration with weak password', async () => {
      const response = await fetch('http://localhost/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: '123', // Too weak
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
    });

    it('should validate email format', async () => {
      const response = await fetch('http://localhost/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test User',
          email: 'invalid-email', // Invalid format
          password: 'securepass123',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should successfully log out user', async () => {
      const response = await fetch('http://localhost/api/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer valid-token-123',
        },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('message');
      expect(data.message).toContain('Logged out successfully');
    });

    it('should handle logout without token gracefully', async () => {
      const response = await fetch('http://localhost/api/auth/logout', {
        method: 'POST',
      });

      const data = await response.json();

      // Should still succeed (idempotent)
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('message');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user with valid token', async () => {
      const response = await fetch('http://localhost/api/auth/me', {
        headers: {
          Authorization: 'Bearer valid-token-123',
        },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('user');
      expect(data.user).toHaveProperty('id');
      expect(data.user).toHaveProperty('email');
      expect(data.user).toHaveProperty('name');
    });

    it('should reject request without token', async () => {
      const response = await fetch('http://localhost/api/auth/me');

      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('Unauthorized');
    });

    it('should reject request with invalid token', async () => {
      const response = await fetch('http://localhost/api/auth/me', {
        headers: {
          Authorization: 'Bearer invalid-token',
        },
      });

      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toHaveProperty('error');
    });
  });
});
