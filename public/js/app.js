// Global variables
let channelData = null;
let allVideos = [];
let currentSort = 'views';

// API Configuration
const API_BASE_URL = window.location.origin;

/**
 * Main function to analyze a YouTube channel
 */
async function analyzeChannel() {
    const channelUrl = document.getElementById('channelUrl').value.trim();
    const maxResults = document.getElementById('maxResults').value;

    if (!channelUrl) {
        showError('Please enter a YouTube channel URL');
        return;
    }

    // Show loading, hide error and results
    document.getElementById('loadingIndicator').classList.remove('hidden');
    document.getElementById('errorMessage').classList.add('hidden');
    document.getElementById('resultsContainer').classList.add('hidden');
    document.getElementById('analyzeBtn').disabled = true;

    try {
        const response = await fetch(
            `${API_BASE_URL}/api/channel/videos?url=${encodeURIComponent(channelUrl)}&maxResults=${maxResults}`
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch channel data');
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message || 'Failed to analyze channel');
        }

        channelData = result.data;
        allVideos = result.data.videos;

        // Display all the data
        displayChannelOverview();
        displayOverviewTab();
        displayKeywordsTab();
        displayPerformanceTab();
        displayVideosTab();

        // Show results
        document.getElementById('resultsContainer').classList.remove('hidden');
        document.getElementById('loadingIndicator').classList.add('hidden');

    } catch (error) {
        showError(error.message);
        document.getElementById('loadingIndicator').classList.add('hidden');
    } finally {
        document.getElementById('analyzeBtn').disabled = false;
    }
}

/**
 * Display channel overview section
 */
function displayChannelOverview() {
    const channel = channelData.channel;

    // Channel header
    document.getElementById('channelThumbnail').src = getThumbnailUrl(channel.thumbnails, 'medium');
    document.getElementById('channelTitle').textContent = channel.title;
    document.getElementById('channelCustomUrl').textContent = channel.customUrl || channel.id;
    document.getElementById('channelDescription').textContent =
        channel.description.substring(0, 200) + (channel.description.length > 200 ? '...' : '');

    // Channel statistics
    document.getElementById('totalViews').textContent = formatNumber(channel.statistics.viewCount);
    document.getElementById('subscriberCount').textContent = formatNumber(channel.statistics.subscriberCount);
    document.getElementById('videoCount').textContent = formatNumber(channel.statistics.videoCount);
    document.getElementById('analyzedCount').textContent = formatNumber(channelData.totalVideos);
}

/**
 * Display overview tab with key insights
 */
function displayOverviewTab() {
    // Top performing videos
    const topVideos = [...allVideos]
        .sort((a, b) => b.statistics.viewCount - a.statistics.viewCount)
        .slice(0, 5);

    const topVideosHTML = topVideos.map(video => `
        <div class="video-item" onclick="window.open('${video.url}', '_blank')">
            <img src="${getThumbnailUrl(video.thumbnails, 'medium')}" alt="${escapeHtml(video.title)}">
            <div class="video-item-info">
                <div class="video-item-title">${escapeHtml(video.title)}</div>
                <div class="video-item-stats">
                    ${formatNumber(video.statistics.viewCount)} views •
                    ${formatNumber(video.statistics.likeCount)} likes •
                    ${formatDate(video.publishedAt)}
                </div>
            </div>
        </div>
    `).join('');

    document.getElementById('topVideos').innerHTML = topVideosHTML;

    // Engagement metrics
    const totalViews = allVideos.reduce((sum, v) => sum + v.statistics.viewCount, 0);
    const totalLikes = allVideos.reduce((sum, v) => sum + v.statistics.likeCount, 0);
    const totalComments = allVideos.reduce((sum, v) => sum + v.statistics.commentCount, 0);
    const avgViews = totalViews / allVideos.length;
    const avgEngagement = ((totalLikes + totalComments) / totalViews * 100).toFixed(2);

    const metricsHTML = `
        <div class="metric-item">
            <span class="metric-label">Average Views per Video</span>
            <span class="metric-value">${formatNumber(Math.round(avgViews))}</span>
        </div>
        <div class="metric-item">
            <span class="metric-label">Total Engagement</span>
            <span class="metric-value">${formatNumber(totalLikes + totalComments)}</span>
        </div>
        <div class="metric-item">
            <span class="metric-label">Engagement Rate</span>
            <span class="metric-value">${avgEngagement}%</span>
        </div>
        <div class="metric-item">
            <span class="metric-label">Total Likes</span>
            <span class="metric-value">${formatNumber(totalLikes)}</span>
        </div>
        <div class="metric-item">
            <span class="metric-label">Total Comments</span>
            <span class="metric-value">${formatNumber(totalComments)}</span>
        </div>
    `;

    document.getElementById('engagementMetrics').innerHTML = metricsHTML;

    // Top tags
    displayTopTags();

    // Publishing stats
    displayPublishingStats();
}

/**
 * Display top tags
 */
function displayTopTags() {
    const tagFrequency = {};

    allVideos.forEach(video => {
        video.tags.forEach(tag => {
            tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
        });
    });

    const sortedTags = Object.entries(tagFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 30);

    const tagsHTML = sortedTags.map(([tag, count]) => `
        <div class="tag-item">
            <span>${escapeHtml(tag)}</span>
            <span class="tag-count">${count}</span>
        </div>
    `).join('');

    document.getElementById('topTags').innerHTML = tagsHTML || '<p>No tags found</p>';
}

/**
 * Display publishing statistics
 */
function displayPublishingStats() {
    const dates = allVideos.map(v => new Date(v.publishedAt));
    const sortedDates = dates.sort((a, b) => a - b);

    // Calculate time differences between videos
    const intervals = [];
    for (let i = 1; i < sortedDates.length; i++) {
        const days = (sortedDates[i] - sortedDates[i - 1]) / (1000 * 60 * 60 * 24);
        intervals.push(days);
    }

    const avgInterval = intervals.length > 0
        ? intervals.reduce((sum, i) => sum + i, 0) / intervals.length
        : 0;

    // Videos by year
    const videosByYear = {};
    dates.forEach(date => {
        const year = date.getFullYear();
        videosByYear[year] = (videosByYear[year] || 0) + 1;
    });

    const statsHTML = `
        <div class="stats-item">
            <span>Average Publishing Interval</span>
            <strong>${avgInterval.toFixed(1)} days</strong>
        </div>
        <div class="stats-item">
            <span>First Video</span>
            <strong>${formatDate(sortedDates[0])}</strong>
        </div>
        <div class="stats-item">
            <span>Latest Video</span>
            <strong>${formatDate(sortedDates[sortedDates.length - 1])}</strong>
        </div>
        <div class="stats-item">
            <span>Most Active Year</span>
            <strong>${Object.entries(videosByYear).sort((a, b) => b[1] - a[1])[0][0]} (${Object.entries(videosByYear).sort((a, b) => b[1] - a[1])[0][1]} videos)</strong>
        </div>
    `;

    document.getElementById('publishingStats').innerHTML = statsHTML;
}

/**
 * Display keywords and tags analysis tab
 */
function displayKeywordsTab() {
    // Tag analysis
    const tagFrequency = {};
    allVideos.forEach(video => {
        video.tags.forEach(tag => {
            tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
        });
    });

    window.allTags = Object.entries(tagFrequency).sort((a, b) => b[1] - a[1]);
    filterTags();

    // Title keywords analysis
    const titleWords = {};
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who', 'when', 'where', 'why', 'how']);

    allVideos.forEach(video => {
        const words = video.title.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 3 && !stopWords.has(word));

        words.forEach(word => {
            titleWords[word] = (titleWords[word] || 0) + 1;
        });
    });

    const topKeywords = Object.entries(titleWords)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 50);

    const keywordsHTML = topKeywords.map(([word, count]) => `
        <div class="keyword-item">
            <span>${escapeHtml(word)}</span>
            <strong>${count}</strong>
        </div>
    `).join('');

    document.getElementById('titleKeywords').innerHTML = keywordsHTML || '<p>No keywords found</p>';
}

/**
 * Filter tags based on search and minimum frequency
 */
function filterTags() {
    const searchTerm = document.getElementById('tagSearch').value.toLowerCase();
    const minFreq = parseInt(document.getElementById('minFreq').value) || 1;

    const filteredTags = window.allTags.filter(([tag, count]) =>
        tag.toLowerCase().includes(searchTerm) && count >= minFreq
    );

    const maxCount = filteredTags.length > 0 ? filteredTags[0][1] : 1;

    const tagsHTML = filteredTags.map(([tag, count]) => `
        <div class="tag-analysis-item">
            <span class="tag-name">${escapeHtml(tag)}</span>
            <div class="tag-frequency">
                <div class="frequency-bar">
                    <div class="frequency-fill" style="width: ${(count / maxCount) * 100}%"></div>
                </div>
                <strong>${count}</strong>
            </div>
        </div>
    `).join('');

    document.getElementById('tagAnalysis').innerHTML = tagsHTML || '<p>No tags match your criteria</p>';
}

/**
 * Display performance tab
 */
function displayPerformanceTab() {
    sortVideos();
}

/**
 * Sort videos in performance table
 */
function sortVideos() {
    const sortBy = document.getElementById('sortBy').value;
    currentSort = sortBy;

    let sorted = [...allVideos];

    switch (sortBy) {
        case 'views':
            sorted.sort((a, b) => b.statistics.viewCount - a.statistics.viewCount);
            break;
        case 'likes':
            sorted.sort((a, b) => b.statistics.likeCount - a.statistics.likeCount);
            break;
        case 'comments':
            sorted.sort((a, b) => b.statistics.commentCount - a.statistics.commentCount);
            break;
        case 'engagement':
            sorted.sort((a, b) => {
                const engA = (a.statistics.likeCount + a.statistics.commentCount) / a.statistics.viewCount;
                const engB = (b.statistics.likeCount + b.statistics.commentCount) / b.statistics.viewCount;
                return engB - engA;
            });
            break;
        case 'date':
            sorted.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
            break;
    }

    const tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Published</th>
                    <th>Views</th>
                    <th>Likes</th>
                    <th>Comments</th>
                    <th>Engagement Rate</th>
                    <th>Duration</th>
                </tr>
            </thead>
            <tbody>
                ${sorted.map((video, index) => {
                    const engagement = ((video.statistics.likeCount + video.statistics.commentCount) / video.statistics.viewCount * 100).toFixed(2);
                    return `
                        <tr>
                            <td>${index + 1}</td>
                            <td class="video-title-cell">
                                <a href="${video.url}" target="_blank" class="video-link">${escapeHtml(video.title)}</a>
                            </td>
                            <td>${formatDate(video.publishedAt)}</td>
                            <td>${formatNumber(video.statistics.viewCount)}</td>
                            <td>${formatNumber(video.statistics.likeCount)}</td>
                            <td>${formatNumber(video.statistics.commentCount)}</td>
                            <td>${engagement}%</td>
                            <td>${video.duration}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;

    document.getElementById('performanceTable').innerHTML = tableHTML;
}

/**
 * Display all videos tab
 */
function displayVideosTab() {
    filterVideos();
}

/**
 * Filter videos based on search term
 */
function filterVideos() {
    const searchTerm = document.getElementById('videoSearch').value.toLowerCase();

    const filtered = allVideos.filter(video =>
        video.title.toLowerCase().includes(searchTerm) ||
        video.description.toLowerCase().includes(searchTerm) ||
        video.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );

    const tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>Thumbnail</th>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Tags</th>
                    <th>Published</th>
                    <th>Views</th>
                    <th>Likes</th>
                    <th>Duration</th>
                </tr>
            </thead>
            <tbody>
                ${filtered.map(video => `
                    <tr>
                        <td>
                            <img src="${getThumbnailUrl(video.thumbnails, 'default')}" alt="Thumbnail" style="width: 80px; border-radius: 4px;">
                        </td>
                        <td class="video-title-cell">
                            <a href="${video.url}" target="_blank" class="video-link">${escapeHtml(video.title)}</a>
                        </td>
                        <td style="max-width: 300px; font-size: 0.85rem; color: #666;">
                            ${escapeHtml(video.description.substring(0, 100))}${video.description.length > 100 ? '...' : ''}
                        </td>
                        <td style="max-width: 200px; font-size: 0.85rem;">
                            ${video.tags.slice(0, 3).map(tag => `<span style="background: #eee; padding: 2px 6px; border-radius: 3px; margin: 2px; display: inline-block;">${escapeHtml(tag)}</span>`).join('')}
                            ${video.tags.length > 3 ? `<span style="color: #666;">+${video.tags.length - 3}</span>` : ''}
                        </td>
                        <td>${formatDate(video.publishedAt)}</td>
                        <td>${formatNumber(video.statistics.viewCount)}</td>
                        <td>${formatNumber(video.statistics.likeCount)}</td>
                        <td>${video.duration}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    document.getElementById('videosTable').innerHTML = tableHTML;
}

/**
 * Export data to CSV
 */
function exportToCSV() {
    const headers = ['Title', 'URL', 'Published', 'Views', 'Likes', 'Comments', 'Duration', 'Tags', 'Description'];

    const rows = allVideos.map(video => [
        `"${video.title.replace(/"/g, '""')}"`,
        video.url,
        video.publishedAt,
        video.statistics.viewCount,
        video.statistics.likeCount,
        video.statistics.commentCount,
        video.duration,
        `"${video.tags.join(', ').replace(/"/g, '""')}"`,
        `"${video.description.replace(/"/g, '""')}"`
    ]);

    const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${channelData.channel.title}_videos_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

/**
 * Switch between tabs
 */
function switchTab(tabName) {
    // Remove active class from all tabs and contents
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    // Add active class to selected tab
    event.target.classList.add('active');
    document.getElementById(tabName).classList.add('active');
}

/**
 * Show error message
 */
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}

/**
 * Format number with commas
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Format date to readable string
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Safely get thumbnail URL with fallback logic
 * @param {Object} thumbnails - Thumbnails object from YouTube API
 * @param {string} preferredSize - Preferred thumbnail size (default: 'medium')
 * @returns {string} - Thumbnail URL or empty string if not available
 */
function getThumbnailUrl(thumbnails, preferredSize = 'medium') {
    if (!thumbnails) {
        return '';
    }

    // Try preferred size first, then fallback to other sizes
    const sizes = [preferredSize, 'high', 'medium', 'default', 'standard'];

    for (const size of sizes) {
        if (thumbnails[size] && thumbnails[size].url) {
            return thumbnails[size].url;
        }
    }

    return '';
}

// Allow Enter key to trigger analysis
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('channelUrl').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            analyzeChannel();
        }
    });
});
