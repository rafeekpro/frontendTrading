/**
 * LCG constants from Numerical Recipes
 * These values provide good randomness properties for a Linear Congruential Generator
 */
const LCG_MULTIPLIER = 1664525;
const LCG_INCREMENT = 1013904223;
const LCG_MODULUS = 4294967296; // 2^32 - more efficient than Math.pow(2, 32)

/**
 * SeededRandom - Deterministic Random Number Generator
 *
 * Implements a Linear Congruential Generator (LCG) for reproducible random numbers.
 * Uses the same seed to produce identical sequences across runs.
 *
 * Algorithm: LCG with parameters from Numerical Recipes
 * - a = 1664525 (multiplier)
 * - c = 1013904223 (increment)
 * - m = 2^32 (modulus)
 *
 * @example
 * ```typescript
 * const rng = new SeededRandom(42);
 * const randomValue = rng.next(); // 0.0 - 1.0
 * const randomInt = rng.nextInt(1, 10); // 1-10 inclusive
 * const randomFloat = rng.nextFloat(0.5, 2.5); // 0.5-2.5
 * const randomItem = rng.choice(['a', 'b', 'c']);
 * ```
 */
export class SeededRandom {
  private state: number;

  /**
   * Creates a new seeded random number generator
   * @param seed - Seed value for reproducibility (any integer)
   */
  constructor(seed: number) {
    // Normalize seed to positive integer within modulus range
    this.state = Math.abs(Math.floor(seed)) % LCG_MODULUS;
  }

  /**
   * Generates next random value between 0 (inclusive) and 1 (exclusive)
   * @returns Random float in range [0, 1)
   */
  next(): number {
    // Apply LCG formula: X(n+1) = (a * X(n) + c) mod m
    this.state = (LCG_MULTIPLIER * this.state + LCG_INCREMENT) % LCG_MODULUS;

    // Normalize to [0, 1)
    return this.state / LCG_MODULUS;
  }

  /**
   * Normalizes min/max range to ensure min <= max
   * @private
   */
  private normalizeRange(min: number, max: number): [number, number] {
    return min > max ? [max, min] : [min, max];
  }

  /**
   * Generates random integer within range (inclusive)
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (inclusive)
   * @returns Random integer in range [min, max]
   */
  nextInt(min: number, max: number): number {
    [min, max] = this.normalizeRange(min, max);

    const range = max - min + 1;
    return Math.floor(this.next() * range) + min;
  }

  /**
   * Generates random float within range
   * @param min - Minimum value
   * @param max - Maximum value
   * @returns Random float in range [min, max]
   */
  nextFloat(min: number, max: number): number {
    [min, max] = this.normalizeRange(min, max);

    return this.next() * (max - min) + min;
  }

  /**
   * Selects random element from array
   * @param array - Array to select from
   * @returns Random element from array
   */
  choice<T>(array: T[]): T {
    const index = this.nextInt(0, array.length - 1);
    return array[index]!;
  }
}
