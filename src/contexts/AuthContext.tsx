import { createContext, useContext, useEffect, useState, useMemo, useCallback, ReactNode } from 'react';

/**
 * User type from auth API
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

/**
 * Auth context type
 */
interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Constants
const AUTH_TOKEN_KEY = 'auth_token';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider component that manages authentication state and persistence
 * Supports login, logout, and token validation with localStorage persistence
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  // Initialize loading to true if there's a saved token
  const [loading, setLoading] = useState<boolean>(() => {
    return !!localStorage.getItem(AUTH_TOKEN_KEY);
  });
  const [error, setError] = useState<string | null>(null);

  // Validate token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem(AUTH_TOKEN_KEY);

    if (savedToken) {
      // Validate token with API
      fetch('http://localhost/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${savedToken}`,
        },
      })
        .then(async (response) => {
          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            setToken(savedToken);
          } else {
            // Invalid token - clear it
            localStorage.removeItem(AUTH_TOKEN_KEY);
          }
        })
        .catch(() => {
          // Network error - clear invalid token
          localStorage.removeItem(AUTH_TOKEN_KEY);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      // No token - ensure loading is false
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await response.json();

      // Save token to localStorage
      localStorage.setItem(AUTH_TOKEN_KEY, data.token);

      // Update state
      setToken(data.token);
      setUser(data.user);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      // Call logout API if we have a token
      if (token) {
        await fetch('http://localhost/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (err) {
      // Ignore logout API errors - still clear local state
      console.error('Logout API error:', err);
    } finally {
      // Always clear local state and storage
      localStorage.removeItem(AUTH_TOKEN_KEY);
      setToken(null);
      setUser(null);
      setError(null);
    }
  }, [token]);

  const value = useMemo(
    () => ({ user, token, loading, error, login, logout }),
    [user, token, loading, error, login, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context
 * @throws Error if used outside AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
