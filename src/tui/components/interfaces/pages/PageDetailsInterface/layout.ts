/**
 * Centralized layout calculations for PageDetailsModal
 *
 * Modal structure:
 * - Outer double border: 2 lines (top + bottom)
 * - Header box with single border: 3 lines (border top, text, border bottom)
 * - Tab nav box with single border: 3 lines (border top, text, border bottom)
 * - Footer box with single border: 3 lines (border top, text, border bottom)
 * Total overhead: 11 lines
 */

export const MODAL_LAYOUT = {
  OUTER_BORDER_HEIGHT: 2,
  HEADER_HEIGHT: 3,
  TAB_NAV_HEIGHT: 3,
  FOOTER_HEIGHT: 3,
  get TOTAL_OVERHEAD() {
    return this.OUTER_BORDER_HEIGHT + this.HEADER_HEIGHT + this.TAB_NAV_HEIGHT + this.FOOTER_HEIGHT;
  },
} as const;

/**
 * Calculate the available viewport height for content/lists
 * @param totalHeight - Total modal height (usually terminal height)
 * @returns Available height for content area
 */
export function calculateContentViewportHeight(totalHeight: number): number {
  return Math.max(3, totalHeight - MODAL_LAYOUT.TOTAL_OVERHEAD);
}
