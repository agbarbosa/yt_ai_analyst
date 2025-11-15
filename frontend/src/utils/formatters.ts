/**
 * Format number with commas for better readability
 * @param num - The number to format
 * @returns Formatted number string
 */
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Format date to readable string
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Get thumbnail URL from thumbnails object with fallback
 * @param thumbnails - Thumbnails object from YouTube API
 * @param preferredSize - Preferred thumbnail size
 * @returns Thumbnail URL or empty string
 */
export function getThumbnailUrl(
  thumbnails: Record<string, { url: string } | undefined> | undefined,
  preferredSize: string = 'medium'
): string {
  if (!thumbnails) {
    return '';
  }

  const sizes = [preferredSize, 'high', 'medium', 'default', 'standard'];

  for (const size of sizes) {
    const thumb = thumbnails[size];
    if (thumb && 'url' in thumb) {
      return thumb.url;
    }
  }

  return '';
}

/**
 * Calculate engagement rate
 * @param likes - Number of likes
 * @param comments - Number of comments
 * @param views - Number of views
 * @returns Engagement rate as percentage
 */
export function calculateEngagementRate(likes: number, comments: number, views: number): number {
  if (views === 0) return 0;
  return ((likes + comments) / views) * 100;
}

/**
 * Extract words from text for keyword analysis
 * @param text - Text to extract words from
 * @param minLength - Minimum word length
 * @returns Array of words
 */
export function extractWords(text: string, minLength: number = 4): string[] {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'been', 'be',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
    'could', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who',
    'when', 'where', 'why', 'how'
  ]);

  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length >= minLength && !stopWords.has(word));
}

/**
 * Export data to CSV file
 * @param data - Array of objects to export
 * @param filename - Name of the CSV file
 */
export function exportToCSV<T extends Record<string, unknown>>(data: T[], filename: string): void {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        const stringValue = String(value ?? '');
        // Escape quotes and wrap in quotes if contains comma or quote
        if (stringValue.includes(',') || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ];

  const csv = csvRows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}
