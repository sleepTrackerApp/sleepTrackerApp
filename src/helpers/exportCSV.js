/**
 * Helper function to export an array of objects to CSV format.
 */

const { Parser } = require('@json2csv/plainjs');

/**
 * Function to export data to CSV format.
 * @param entry - Array of objects to be converted to CSV
 * @returns {*|string} - CSV string or 'NULL Entries' if input is invalid
 */
function exportCSV(entry) {
  if (!Array.isArray(entry) || entry.length === 0) {
    return 'NULL Entries';
  }

  const parser = new Parser({
    quote: '"',
    delimter: ',',
    widthBOM: true,
  });

  return parser.parse(entry);
}

module.exports = { exportCSV };
