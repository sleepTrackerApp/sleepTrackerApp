const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/**
 * Parse a value to a Date. Returns null if unparseable.
 * @param {Date|string|*} value
 * @returns {Date|null}
 */
function toDate(value) {
  if (value === null || value === '') return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Format a value as Australian date dd/mm/yyyy.
 * @param {Date|string|*} value - Date object, ISO string, or parseable date string.
 * @returns {string} - Formatted date "dd/mm/yyyy" or original value if unparseable.
 */
function formatDateAU(value) {
  const d = toDate(value);
  if (!d) return typeof value === 'string' ? value : '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Format a value as human-readable date, e.g. "14 Jan, 2026".
 * @param {Date|string|*} value - Date object, ISO string, or parseable date string.
 * @returns {string} - Formatted date "d MMM, yyyy" or original value if unparseable.
 */
function formatDateReadable(value) {
  const d = toDate(value);
  if (!d) return typeof value === 'string' ? value : '';
  const day = d.getDate();
  const month = MONTH_NAMES[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month}, ${year}`;
}

module.exports = { formatDateAU, formatDateReadable };
