import { useMemo } from 'react';
import type { VideoDetails } from '../../types';

interface GrowthInsightsTabProps {
  videos: VideoDetails[];
}

export function GrowthInsightsTab({ videos }: GrowthInsightsTabProps) {
  const insights = useMemo(() => {
    if (!videos || videos.length === 0) {
      return {
        avgViews: 0,
        avgLikes: 0,
        avgComments: 0,
        totalViews: 0,
        totalVideos: 0,
        engagementRate: 0,
        topPerformers: [],
        contentGaps: [],
        publishingPatterns: {},
        bestDay: 'N/A',
        bestTime: 'N/A',
      };
    }

    const totalViews = videos.reduce((sum, v) => sum + (v.statistics.viewCount || 0), 0);
    const totalLikes = videos.reduce((sum, v) => sum + (v.statistics.likeCount || 0), 0);
    const totalComments = videos.reduce((sum, v) => sum + (v.statistics.commentCount || 0), 0);

    const avgViews = totalViews / videos.length;
    const avgLikes = totalLikes / videos.length;
    const avgComments = totalComments / videos.length;
    const engagementRate = totalViews > 0 ? ((totalLikes + totalComments) / totalViews) * 100 : 0;

    // Find top performers (top 20% by views)
    const sortedByViews = [...videos].sort((a, b) =>
      (b.statistics.viewCount || 0) - (a.statistics.viewCount || 0)
    );
    const topCount = Math.max(3, Math.floor(videos.length * 0.2));
    const topPerformers = sortedByViews.slice(0, topCount);

    // Analyze publishing patterns
    const publishingPatterns: Record<string, number> = {};
    videos.forEach(video => {
      const date = new Date(video.publishedAt);
      const day = date.toLocaleDateString('en-US', { weekday: 'long' });
      publishingPatterns[day] = (publishingPatterns[day] || 0) + 1;
    });

    // Find best day
    const bestDay = Object.entries(publishingPatterns).reduce((best, [day, count]) =>
      count > (publishingPatterns[best] || 0) ? day : best,
      'N/A'
    );

    // Analyze time patterns (simplified)
    const avgPublishHour = videos.reduce((sum, video) => {
      const date = new Date(video.publishedAt);
      return sum + date.getHours();
    }, 0) / videos.length;

    const bestTime = `${Math.floor(avgPublishHour)}:00`;

    // Content gaps analysis (simplified)
    const contentGaps = [
      'Consider creating more "How-to" tutorials',
      'Explore trending topics in your niche',
      'Increase video frequency for better algorithm performance',
    ];

    return {
      avgViews,
      avgLikes,
      avgComments,
      totalViews,
      totalVideos: videos.length,
      engagementRate,
      topPerformers,
      contentGaps,
      publishingPatterns,
      bestDay,
      bestTime,
    };
  }, [videos]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  };

  return (
    <div className="p-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-4">
          <div className="text-sm opacity-90">Total Views</div>
          <div className="text-2xl font-bold">{formatNumber(insights.totalViews)}</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-4">
          <div className="text-sm opacity-90">Avg Views/Video</div>
          <div className="text-2xl font-bold">{formatNumber(insights.avgViews)}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-4">
          <div className="text-sm opacity-90">Avg Engagement</div>
          <div className="text-2xl font-bold">{insights.engagementRate.toFixed(2)}%</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-4">
          <div className="text-sm opacity-90">Total Videos</div>
          <div className="text-2xl font-bold">{insights.totalVideos}</div>
        </div>
      </div>

      {/* Publishing Patterns */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Publishing Patterns</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Best Publishing Day</h4>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-3xl font-bold text-blue-700">{insights.bestDay}</div>
              <p className="text-sm text-blue-600 mt-1">Most videos published on this day</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Common Publishing Time</h4>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-3xl font-bold text-green-700">{insights.bestTime}</div>
              <p className="text-sm text-green-600 mt-1">Average upload time</p>
            </div>
          </div>
        </div>

        {/* Day Distribution */}
        <div className="mt-6">
          <h4 className="font-semibold text-gray-700 mb-3">Upload Distribution by Day</h4>
          <div className="grid grid-cols-7 gap-2">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
              const count = insights.publishingPatterns[day] || 0;
              const maxCount = Math.max(...Object.values(insights.publishingPatterns), 1);
              const percentage = (count / maxCount) * 100;

              return (
                <div key={day} className="text-center">
                  <div className="text-xs text-gray-600 mb-2 font-medium">{day.slice(0, 3)}</div>
                  <div className="bg-gray-200 rounded-lg overflow-hidden h-24 flex flex-col justify-end">
                    <div
                      className="bg-primary-500 transition-all duration-500"
                      style={{ height: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{count}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Top Performing Videos</h3>
        <div className="space-y-3">
          {insights.topPerformers.slice(0, 5).map((video, idx) => (
            <div key={video.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex-shrink-0 w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold">
                {idx + 1}
              </div>
              <img
                src={video.thumbnails.medium?.url || video.thumbnails.default?.url}
                alt={video.title}
                className="w-24 h-16 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-800 truncate">{video.title}</h4>
                <div className="flex gap-4 text-sm text-gray-600 mt-1">
                  <span>{formatNumber(video.statistics.viewCount)} views</span>
                  <span>{formatNumber(video.statistics.likeCount)} likes</span>
                  <span>{formatNumber(video.statistics.commentCount)} comments</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Smart Insights */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">💡</span>
          Smart Insights
        </h3>
        <div className="space-y-3">
          <div className="bg-white rounded-lg p-4 border border-purple-100">
            <p className="text-gray-700">
              <strong>Best performing videos</strong> are published on <strong>{insights.bestDay}s</strong> around <strong>{insights.bestTime}</strong>
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-purple-100">
            <p className="text-gray-700">
              Your top {insights.topPerformers.length} videos account for a significant portion of total views. Analyze what makes them successful!
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-purple-100">
            <p className="text-gray-700">
              Average engagement rate is <strong>{insights.engagementRate.toFixed(2)}%</strong>.
              Industry benchmark is around <strong>4-5%</strong>.
              {insights.engagementRate >= 4
                ? ' You\'re doing great! 🎉'
                : ' There\'s room for improvement.'}
            </p>
          </div>
        </div>
      </div>

      {/* Content Gaps */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Content Opportunities</h3>
        <ul className="space-y-2">
          {insights.contentGaps.map((gap, idx) => (
            <li key={idx} className="flex items-start gap-2 text-gray-700">
              <span className="text-green-500 font-bold">✓</span>
              <span>{gap}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
