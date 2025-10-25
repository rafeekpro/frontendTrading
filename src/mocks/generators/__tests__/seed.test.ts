/**
 * Tests for SeededRandom - Deterministic Random Number Generator
 *
 * TDD Phase: RED
 * These tests MUST FAIL initially - seed.ts does not exist yet
 *
 * Tests verify:
 * - Reproducibility: Same seed produces same sequence
 * - Range validation: Values stay within specified bounds
 * - Distribution: Random values are reasonably distributed
 * - Edge cases: Min/max values, boundary conditions
 */

import { describe, it, expect } from 'vitest';
import { SeededRandom } from '../seed';

describe('SeededRandom', () => {
  describe('Reproducibility', () => {
    it('should produce the same sequence for the same seed', () => {
      const rng1 = new SeededRandom(42);
      const rng2 = new SeededRandom(42);

      const sequence1 = Array.from({ length: 10 }, () => rng1.next());
      const sequence2 = Array.from({ length: 10 }, () => rng2.next());

      expect(sequence1).toEqual(sequence2);
    });

    it('should produce different sequences for different seeds', () => {
      const rng1 = new SeededRandom(42);
      const rng2 = new SeededRandom(123);

      const sequence1 = Array.from({ length: 10 }, () => rng1.next());
      const sequence2 = Array.from({ length: 10 }, () => rng2.next());

      expect(sequence1).not.toEqual(sequence2);
    });

    it('should be independent across multiple instances with same seed', () => {
      const rng1 = new SeededRandom(42);
      const rng2 = new SeededRandom(42);

      // Advance rng1 by 5 steps
      for (let i = 0; i < 5; i++) {
        rng1.next();
      }

      // rng2 should still start from beginning
      const value1 = new SeededRandom(42).next();
      const value2 = rng2.next();

      expect(value1).toBe(value2);
    });
  });

  describe('next() - Basic random generation', () => {
    it('should generate values between 0 and 1', () => {
      const rng = new SeededRandom(42);

      for (let i = 0; i < 100; i++) {
        const value = rng.next();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      }
    });

    it('should generate different values on consecutive calls', () => {
      const rng = new SeededRandom(42);

      const values = Array.from({ length: 100 }, () => rng.next());
      const uniqueValues = new Set(values);

      // At least 90% should be unique (allows for some collision)
      expect(uniqueValues.size).toBeGreaterThan(90);
    });
  });

  describe('nextInt() - Integer generation', () => {
    it('should generate integers within specified range', () => {
      const rng = new SeededRandom(42);

      for (let i = 0; i < 100; i++) {
        const value = rng.nextInt(1, 10);
        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThanOrEqual(10);
      }
    });

    it('should handle negative ranges', () => {
      const rng = new SeededRandom(42);

      for (let i = 0; i < 100; i++) {
        const value = rng.nextInt(-10, -1);
        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(-10);
        expect(value).toBeLessThanOrEqual(-1);
      }
    });

    it('should handle single value range', () => {
      const rng = new SeededRandom(42);

      for (let i = 0; i < 10; i++) {
        const value = rng.nextInt(5, 5);
        expect(value).toBe(5);
      }
    });

    it('should cover entire range given enough iterations', () => {
      const rng = new SeededRandom(42);
      const min = 1;
      const max = 5;
      const values = new Set<number>();

      // Generate many values to cover the range
      for (let i = 0; i < 1000; i++) {
        values.add(rng.nextInt(min, max));
      }

      // Should hit all values in small range
      expect(values.size).toBe(max - min + 1);
      expect(values.has(1)).toBe(true);
      expect(values.has(5)).toBe(true);
    });
  });

  describe('nextFloat() - Floating point generation', () => {
    it('should generate floats within specified range', () => {
      const rng = new SeededRandom(42);

      for (let i = 0; i < 100; i++) {
        const value = rng.nextFloat(0.5, 2.5);
        expect(value).toBeGreaterThanOrEqual(0.5);
        expect(value).toBeLessThanOrEqual(2.5);
      }
    });

    it('should handle negative float ranges', () => {
      const rng = new SeededRandom(42);

      for (let i = 0; i < 100; i++) {
        const value = rng.nextFloat(-5.5, -1.5);
        expect(value).toBeGreaterThanOrEqual(-5.5);
        expect(value).toBeLessThanOrEqual(-1.5);
      }
    });

    it('should maintain precision', () => {
      const rng = new SeededRandom(42);

      for (let i = 0; i < 100; i++) {
        const value = rng.nextFloat(0, 1);
        expect(typeof value).toBe('number');
        expect(Number.isFinite(value)).toBe(true);
      }
    });

    it('should handle very small ranges', () => {
      const rng = new SeededRandom(42);

      for (let i = 0; i < 100; i++) {
        const value = rng.nextFloat(1.0, 1.0001);
        expect(value).toBeGreaterThanOrEqual(1.0);
        expect(value).toBeLessThanOrEqual(1.0001);
      }
    });
  });

  describe('choice() - Array selection', () => {
    it('should select elements from array', () => {
      const rng = new SeededRandom(42);
      const array = [1, 2, 3, 4, 5];

      for (let i = 0; i < 100; i++) {
        const value = rng.choice(array);
        expect(array).toContain(value);
      }
    });

    it('should select all elements given enough iterations', () => {
      const rng = new SeededRandom(42);
      const array = ['a', 'b', 'c'];
      const selected = new Set<string>();

      for (let i = 0; i < 1000; i++) {
        selected.add(rng.choice(array));
      }

      expect(selected.size).toBe(3);
      expect(selected.has('a')).toBe(true);
      expect(selected.has('b')).toBe(true);
      expect(selected.has('c')).toBe(true);
    });

    it('should handle single element array', () => {
      const rng = new SeededRandom(42);
      const array = [42];

      for (let i = 0; i < 10; i++) {
        expect(rng.choice(array)).toBe(42);
      }
    });

    it('should maintain type of array elements', () => {
      const rng = new SeededRandom(42);

      const numbers = [1, 2, 3];
      const num = rng.choice(numbers);
      expect(typeof num).toBe('number');

      const strings = ['a', 'b', 'c'];
      const str = rng.choice(strings);
      expect(typeof str).toBe('string');

      interface TestObject {
        id: number;
        name: string;
      }

      const objects: TestObject[] = [
        { id: 1, name: 'first' },
        { id: 2, name: 'second' },
      ];
      const obj = rng.choice(objects);
      expect(obj).toHaveProperty('id');
      expect(obj).toHaveProperty('name');
    });
  });

  describe('Distribution', () => {
    it('should have approximately uniform distribution', () => {
      const rng = new SeededRandom(42);
      const buckets = new Array(10).fill(0);

      // Generate 10000 samples
      for (let i = 0; i < 10000; i++) {
        const value = rng.next();
        const bucket = Math.floor(value * 10);
        buckets[bucket]++;
      }

      // Each bucket should have roughly 1000 values (±30%)
      for (const count of buckets) {
        expect(count).toBeGreaterThan(700);
        expect(count).toBeLessThan(1300);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle seed of 0', () => {
      const rng = new SeededRandom(0);

      for (let i = 0; i < 10; i++) {
        const value = rng.next();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      }
    });

    it('should handle negative seed', () => {
      const rng = new SeededRandom(-42);

      for (let i = 0; i < 10; i++) {
        const value = rng.next();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      }
    });

    it('should handle large seed', () => {
      const rng = new SeededRandom(2147483647); // Max 32-bit int

      for (let i = 0; i < 10; i++) {
        const value = rng.next();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      }
    });

    it('should handle inverted min/max in nextInt', () => {
      const rng = new SeededRandom(42);

      // Should swap min and max internally
      const value = rng.nextInt(10, 1);
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(10);
    });

    it('should handle inverted min/max in nextFloat', () => {
      const rng = new SeededRandom(42);

      // Should swap min and max internally
      const value = rng.nextFloat(2.5, 0.5);
      expect(value).toBeGreaterThanOrEqual(0.5);
      expect(value).toBeLessThanOrEqual(2.5);
    });
  });
});
