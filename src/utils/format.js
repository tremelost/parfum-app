/**
 * Format a number as Indonesian Rupiah currency.
 * @param {number|string} value
 * @returns {string}
 */
export function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)
}

/**
 * Format a date string to Indonesian locale (e.g. "01 Jul 2026").
 * @param {string} value
 * @returns {string}
 */
export function formatDate(value) {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

/**
 * Read an array from localStorage, falling back to a default.
 * @param {string} key
 * @param {Array} fallbackRows
 * @returns {Array}
 */
export function getLocalRows(key, fallbackRows) {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : fallbackRows
  } catch {
    return fallbackRows
  }
}
