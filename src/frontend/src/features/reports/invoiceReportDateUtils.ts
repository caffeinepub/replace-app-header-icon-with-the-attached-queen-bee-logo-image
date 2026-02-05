/**
 * Utility functions for handling invoice date filtering in the report.
 * Converts bigint timestamps to Date objects and provides date comparison helpers.
 */

/**
 * Convert Invoice.createdAt (bigint nanoseconds) to a Date object
 */
export function invoiceCreatedAtToDate(createdAt: bigint): Date {
  // Convert nanoseconds to milliseconds
  const milliseconds = Number(createdAt / 1_000_000n);
  return new Date(milliseconds);
}

/**
 * Check if an invoice's createdAt falls within the given date range (inclusive)
 * @param createdAt - Invoice createdAt timestamp (bigint nanoseconds)
 * @param startDate - Start of date range (inclusive), or null for no lower bound
 * @param endDate - End of date range (inclusive), or null for no upper bound
 */
export function isInvoiceInDateRange(
  createdAt: bigint,
  startDate: Date | null,
  endDate: Date | null
): boolean {
  const invoiceDate = invoiceCreatedAtToDate(createdAt);
  
  // Set time to start of day for startDate comparison
  if (startDate) {
    const startOfDay = new Date(startDate);
    startOfDay.setHours(0, 0, 0, 0);
    if (invoiceDate < startOfDay) {
      return false;
    }
  }
  
  // Set time to end of day for endDate comparison
  if (endDate) {
    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);
    if (invoiceDate > endOfDay) {
      return false;
    }
  }
  
  return true;
}
