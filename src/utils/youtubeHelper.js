/**
 * Extract channel ID from various YouTube URL formats
 * @param {string} url - YouTube channel URL
 * @returns {string|null} - Channel ID or username
 */
export function extractChannelIdentifier(url) {
  try {
    const urlObj = new URL(url);

    // Handle different URL formats
    // Format 1: youtube.com/channel/UCxxxxx
    if (url.includes('/channel/')) {
      const match = url.match(/\/channel\/([a-zA-Z0-9_-]+)/);
      return match ? match[1] : null;
    }

    // Format 2: youtube.com/@username
    if (url.includes('/@')) {
      const match = url.match(/\/@([a-zA-Z0-9_-]+)/);
      return match ? match[1] : null;
    }

    // Format 3: youtube.com/c/customname or youtube.com/user/username
    if (url.includes('/c/') || url.includes('/user/')) {
      const match = url.match(/\/(c|user)\/([a-zA-Z0-9_-]+)/);
      return match ? match[2] : null;
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Format video duration from ISO 8601 to readable format
 * @param {string} duration - ISO 8601 duration (e.g., PT1H2M10S)
 * @returns {string} - Formatted duration (e.g., 1:02:10)
 */
export function formatDuration(duration) {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

  const hours = (match[1] || '').replace('H', '');
  const minutes = (match[2] || '').replace('M', '');
  const seconds = (match[3] || '').replace('S', '');

  const parts = [];
  if (hours) parts.push(hours);
  parts.push(minutes.padStart(2, '0') || '00');
  parts.push(seconds.padStart(2, '0') || '00');

  return parts.join(':');
}
