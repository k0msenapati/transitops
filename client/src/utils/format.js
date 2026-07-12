/**
 * Formats a raw database role name (e.g., "fleet_manager") into a human-readable title (e.g., "Fleet Manager").
 * @param {string} r The raw role string
 * @returns {string} The formatted role name
 */
export function formatRole(r) {
  if (!r) return ''
  return r
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
