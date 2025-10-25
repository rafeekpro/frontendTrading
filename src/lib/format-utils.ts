/**
 * Formatting Utilities
 * Common formatting functions for prices, volumes, and numbers
 */

/**
 * Format price with specified decimal places
 * @param price - The price to format
 * @param decimals - Number of decimal places (default: 5)
 * @returns Formatted price string
 */
export function formatPrice(price: number, decimals: number = 5): string {
  return price.toFixed(decimals);
}

/**
 * Format volume with thousands separators
 * @param volume - The volume to format
 * @returns Formatted volume string with commas
 */
export function formatVolume(volume: number): string {
  return volume.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

/**
 * Format number with K, M, B suffixes for large numbers
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string with suffix
 *
 * @example
 * formatNumberWithSuffix(1234) // "1.23K"
 * formatNumberWithSuffix(1234567) // "1.23M"
 * formatNumberWithSuffix(1234567890) // "1.23B"
 */
export function formatNumberWithSuffix(
  value: number,
  decimals: number = 2
): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(decimals)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(decimals)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(decimals)}K`;
  }
  return value.toFixed(decimals);
}

/**
 * Format percentage with sign
 * @param value - The percentage value
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted percentage string with + or - sign
 *
 * @example
 * formatPercentage(1.25) // "+1.25%"
 * formatPercentage(-0.85) // "-0.85%"
 */
export function formatPercentage(
  value: number,
  decimals: number = 2
): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}
