/**
 * Chart Utilities
 * Helper functions for chart formatting and color mapping
 */

/**
 * Get chart color based on value change
 * @param value - The change value (positive/negative/zero)
 * @returns Hex color code for chart stroke
 */
export function getChartColor(value: number): string {
  if (value > 0) return '#22c55e'; // green-500
  if (value < 0) return '#ef4444'; // red-500
  return '#9ca3af'; // gray-400
}

/**
 * Get text color class based on value change
 * @param value - The change value (positive/negative/zero)
 * @returns Tailwind CSS color class
 */
export function getTextColorClass(value: number): string {
  if (value > 0) return 'text-green-500';
  if (value < 0) return 'text-red-500';
  return 'text-gray-400';
}

/**
 * Format number as percentage with sign
 * @param value - The percentage value
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted percentage string (e.g., "+1.25%", "-0.85%")
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Format number as currency
 * @param value - The currency value
 * @param currency - Currency symbol (default: "$")
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted currency string (e.g., "$1,250.75", "-$850.25")
 */
export function formatCurrency(
  value: number,
  currency: string = '$',
  decimals: number = 2
): string {
  const absValue = Math.abs(value);
  const formatted = absValue.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  if (value < 0) {
    return `-${currency}${formatted}`;
  }
  return `${currency}${formatted}`;
}

/**
 * Format price with specific precision
 * @param price - The price value
 * @param precision - Number of decimal places
 * @returns Formatted price string
 */
export function formatPrice(price: number, precision: number): string {
  return price.toFixed(precision);
}
