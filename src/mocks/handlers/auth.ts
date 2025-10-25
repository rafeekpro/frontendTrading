/**
 * MSW Handlers for Authentication API
 * Mocks login, register, logout, and current user endpoints
 */

import { http, HttpResponse, delay } from 'msw';

/**
 * Auth response types
 */
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

interface MessageResponse {
  message: string;
}

interface ErrorResponse {
  error: string;
}

/**
 * Mock user database
 */
const MOCK_USERS: Map<string, { password: string; user: User }> = new Map([
  [
    'user@example.com',
    {
      password: 'password123',
      user: {
        id: 'user-1',
        email: 'user@example.com',
        name: 'Demo User',
        role: 'trader',
      },
    },
  ],
  [
    'trader@example.com',
    {
      password: 'secure123',
      user: {
        id: 'user-2',
        email: 'trader@example.com',
        name: 'Pro Trader',
        role: 'pro_trader',
      },
    },
  ],
]);

/**
 * Mock token storage (in-memory for development)
 */
const ACTIVE_TOKENS = new Set<string>([
  'valid-token-123',
  'valid-token-456',
]);

/**
 * Generate mock JWT token
 */
function generateToken(): string {
  return `mock-jwt-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength (minimum 6 characters)
 */
function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

/**
 * Extract user from token
 */
function getUserFromToken(token: string): User | null {
  // For demo/testing, accept predefined tokens or any mock-jwt token
  if (
    ACTIVE_TOKENS.has(token) ||
    token.startsWith('valid-token') ||
    token.startsWith('mock-jwt')
  ) {
    // Return first user for demo purposes
    return Array.from(MOCK_USERS.values())[0].user;
  }

  return null;
}

/**
 * Auth API Handlers
 */
export const authHandlers = [
  /**
   * POST /api/auth/login
   * Authenticate user and return token
   */
  http.post('http://localhost/api/auth/login', async ({ request }) => {
    // Realistic network delay
    await delay(Math.random() * 200 + 100); // 100-300ms

    const body = (await request.json()) as LoginRequest;

    // Validate request body
    if (!body.email) {
      return HttpResponse.json<ErrorResponse>(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!body.password) {
      return HttpResponse.json<ErrorResponse>(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    // Check credentials
    const userRecord = MOCK_USERS.get(body.email);

    if (!userRecord || userRecord.password !== body.password) {
      return HttpResponse.json<ErrorResponse>(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate token and return auth response
    const token = generateToken();
    ACTIVE_TOKENS.add(token);

    return HttpResponse.json<AuthResponse>(
      {
        token,
        user: userRecord.user,
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }),

  /**
   * POST /api/auth/register
   * Register new user account
   */
  http.post('http://localhost/api/auth/register', async ({ request }) => {
    // Realistic network delay
    await delay(Math.random() * 200 + 100);

    const body = (await request.json()) as RegisterRequest;

    // Validate request body
    if (!body.email || !body.password || !body.name) {
      return HttpResponse.json<ErrorResponse>(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(body.email)) {
      return HttpResponse.json<ErrorResponse>(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (!isValidPassword(body.password)) {
      return HttpResponse.json<ErrorResponse>(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if email already exists
    if (MOCK_USERS.has(body.email)) {
      return HttpResponse.json<ErrorResponse>(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: body.email,
      name: body.name,
      role: 'trader',
    };

    MOCK_USERS.set(body.email, {
      password: body.password,
      user: newUser,
    });

    // Generate token
    const token = generateToken();
    ACTIVE_TOKENS.add(token);

    return HttpResponse.json<AuthResponse>(
      {
        token,
        user: newUser,
      },
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }),

  /**
   * POST /api/auth/logout
   * Log out current user (invalidate token)
   */
  http.post('http://localhost/api/auth/logout', async ({ request }) => {
    await delay(50); // Quick response

    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (token) {
      ACTIVE_TOKENS.delete(token);
    }

    return HttpResponse.json<MessageResponse>(
      { message: 'Logged out successfully' },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }),

  /**
   * GET /api/auth/me
   * Get current authenticated user
   */
  http.get('http://localhost/api/auth/me', async ({ request }) => {
    await delay(50);

    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return HttpResponse.json<ErrorResponse>(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const user = getUserFromToken(token);

    if (!user) {
      return HttpResponse.json<ErrorResponse>(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    return HttpResponse.json<{ user: User }>(
      { user },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }),
];
