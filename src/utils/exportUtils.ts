
/**
 * Converts an array of objects to a CSV string
 */
export function objectsToCSV<T>(data: T[], columns: { key: keyof T, header: string }[]): string {
  // Create header row
  const headerRow = columns.map(col => `"${col.header}"`).join(',');
  
  // Create data rows
  const rows = data.map(item => {
    return columns.map(column => {
      const value = item[column.key];
      // Handle special cases like dates and ensure proper escaping for CSV
      if (value instanceof Date) {
        return `"${value.toLocaleDateString()}"`;
      }
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(',');
  });
  
  // Combine header and rows
  return [headerRow, ...rows].join('\n');
}

/**
 * Downloads a string as a file
 */
export function downloadString(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  
  // Append to the DOM (required for Firefox)
  document.body.appendChild(link);
  
  // Trigger download
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports data to CSV and triggers download
 */
export function exportToCSV<T>(
  data: T[], 
  columns: { key: keyof T, header: string }[],
  filename: string
): void {
  const csvContent = objectsToCSV(data, columns);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  downloadString(csvContent, `${filename}-${timestamp}.csv`, 'text/csv;charset=utf-8;');
}
