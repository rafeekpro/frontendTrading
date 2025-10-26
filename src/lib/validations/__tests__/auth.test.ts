import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema } from '../auth';
import type { LoginFormData, RegisterFormData } from '../auth';

describe('loginSchema', () => {
  describe('email validation', () => {
    it('should accept valid email addresses', () => {
      const validData = {
        email: 'user@example.com',
        password: 'ValidPass123',
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'ValidPass123',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('email');
      }
    });

    it('should reject empty email', () => {
      const invalidData = {
        email: '',
        password: 'ValidPass123',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('password validation', () => {
    it('should accept valid password', () => {
      const validData = {
        email: 'user@example.com',
        password: 'ValidPass123',
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject password shorter than 8 characters', () => {
      const invalidData = {
        email: 'user@example.com',
        password: 'Short1',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('password');
      }
    });

    it('should reject password without uppercase letter', () => {
      const invalidData = {
        email: 'user@example.com',
        password: 'lowercase123',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject password without lowercase letter', () => {
      const invalidData = {
        email: 'user@example.com',
        password: 'UPPERCASE123',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject password without number', () => {
      const invalidData = {
        email: 'user@example.com',
        password: 'NoNumbersHere',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('type inference', () => {
    it('should infer correct LoginFormData type', () => {
      const data: LoginFormData = {
        email: 'user@example.com',
        password: 'ValidPass123',
      };

      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});

describe('registerSchema', () => {
  describe('name validation', () => {
    it('should accept valid name', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'ValidPass123',
        confirmPassword: 'ValidPass123',
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty name', () => {
      const invalidData = {
        name: '',
        email: 'john@example.com',
        password: 'ValidPass123',
        confirmPassword: 'ValidPass123',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('name');
      }
    });

    it('should reject name shorter than 2 characters', () => {
      const invalidData = {
        name: 'J',
        email: 'john@example.com',
        password: 'ValidPass123',
        confirmPassword: 'ValidPass123',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('email validation', () => {
    it('should accept valid email addresses', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'ValidPass123',
        confirmPassword: 'ValidPass123',
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'ValidPass123',
        confirmPassword: 'ValidPass123',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('email');
      }
    });
  });

  describe('password validation', () => {
    it('should accept valid password with all requirements', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'ValidPass123',
        confirmPassword: 'ValidPass123',
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject password shorter than 8 characters', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Short1',
        confirmPassword: 'Short1',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject password without uppercase letter', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'lowercase123',
        confirmPassword: 'lowercase123',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject password without lowercase letter', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'UPPERCASE123',
        confirmPassword: 'UPPERCASE123',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject password without number', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'NoNumbers',
        confirmPassword: 'NoNumbers',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('password confirmation validation', () => {
    it('should accept matching passwords', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'ValidPass123',
        confirmPassword: 'ValidPass123',
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject non-matching passwords', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'ValidPass123',
        confirmPassword: 'DifferentPass456',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const confirmPasswordError = result.error.issues.find(
          (issue) => issue.path.includes('confirmPassword')
        );
        expect(confirmPasswordError).toBeDefined();
      }
    });
  });

  describe('type inference', () => {
    it('should infer correct RegisterFormData type', () => {
      const data: RegisterFormData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'ValidPass123',
        confirmPassword: 'ValidPass123',
      };

      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});
