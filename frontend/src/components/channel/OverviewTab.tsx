import type { VideoDetails } from '../../types';
import { VideoItem } from '../video/VideoItem';
import { formatNumber, formatDate } from '../../utils/formatters';
import { useMemo } from 'react';

interface OverviewTabProps {
  videos: VideoDetails[];
}

export function OverviewTab({ videos }: OverviewTabProps) {
  const {topVideos, metrics, topTags, publishingStats} = useMemo(() => {
    // Top performing videos
    const topVideos = [...videos]
      .sort((a, b) => b.statistics.viewCount - a.statistics.viewCount)
      .slice(0, 5);

    // Engagement metrics
    const totalViews = videos.reduce((sum, v) => sum + v.statistics.viewCount, 0);
    const totalLikes = videos.reduce((sum, v) => sum + v.statistics.likeCount, 0);
    const totalComments = videos.reduce((sum, v) => sum + v.statistics.commentCount, 0);
    const avgViews = videos.length > 0 ? Math.round(totalViews / videos.length) : 0;
    const avgEngagement = totalViews > 0 ? ((totalLikes + totalComments) / totalViews * 100).toFixed(2) : '0.00';

    const metrics = {
      avgViews,
      totalEngagement: totalLikes + totalComments,
      avgEngagement,
      totalLikes,
      totalComments,
    };

    // Top tags
    const tagFrequency: Record<string, number> = {};
    videos.forEach(video => {
      video.tags.forEach(tag => {
        tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
      });
    });

    const topTags = Object.entries(tagFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30);

    // Publishing stats
    const dates = videos.map(v => new Date(v.publishedAt)).sort((a, b) => a.getTime() - b.getTime());
    const intervals: number[] = [];
    for (let i = 1; i < dates.length; i++) {
      const days = (dates[i].getTime() - dates[i - 1].getTime()) / (1000 * 60 * 60 * 24);
      intervals.push(days);
    }
    const avgInterval = intervals.length > 0 ? intervals.reduce((sum, i) => sum + i, 0) / intervals.length : 0;

    const videosByYear: Record<number, number> = {};
    dates.forEach(date => {
      const year = date.getFullYear();
      videosByYear[year] = (videosByYear[year] || 0) + 1;
    });

    const mostActiveYear = Object.entries(videosByYear).sort((a, b) => b[1] - a[1])[0];

    const publishingStats = {
      avgInterval: avgInterval.toFixed(1),
      firstVideo: dates[0],
      latestVideo: dates[dates.length - 1],
      mostActiveYear: mostActiveYear ? { year: mostActiveYear[0], count: mostActiveYear[1] } : null,
    };

    return { topVideos, metrics, topTags, publishingStats };
  }, [videos]);

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Videos */}
        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b-2 border-primary-600">
            Top Performing Videos
          </h3>
          <div className="max-h-96 overflow-y-auto">
            {topVideos.map(video => (
              <VideoItem key={video.id} video={video} />
            ))}
          </div>
        </div>

        {/* Engagement Metrics */}
        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b-2 border-primary-600">
            Engagement Metrics
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-4 bg-white rounded-lg border-l-4 border-primary-600">
              <span className="font-semibold text-gray-700">Average Views per Video</span>
              <span className="text-xl font-bold text-primary-600">{formatNumber(metrics.avgViews)}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-white rounded-lg border-l-4 border-primary-600">
              <span className="font-semibold text-gray-700">Total Engagement</span>
              <span className="text-xl font-bold text-primary-600">{formatNumber(metrics.totalEngagement)}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-white rounded-lg border-l-4 border-primary-600">
              <span className="font-semibold text-gray-700">Engagement Rate</span>
              <span className="text-xl font-bold text-primary-600">{metrics.avgEngagement}%</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-white rounded-lg border-l-4 border-primary-600">
              <span className="font-semibold text-gray-700">Total Likes</span>
              <span className="text-xl font-bold text-primary-600">{formatNumber(metrics.totalLikes)}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-white rounded-lg border-l-4 border-primary-600">
              <span className="font-semibold text-gray-700">Total Comments</span>
              <span className="text-xl font-bold text-primary-600">{formatNumber(metrics.totalComments)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Tags */}
        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b-2 border-primary-600">
            Most Common Tags
          </h3>
          <div className="flex flex-wrap gap-2 max-h-96 overflow-y-auto p-2">
            {topTags.length > 0 ? (
              topTags.map(([tag, count]) => (
                <div
                  key={tag}
                  className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border-2 border-primary-600 text-primary-600 font-semibold text-sm transition-all hover:bg-primary-600 hover:text-white hover:scale-105"
                >
                  <span>{tag}</span>
                  <span className="bg-primary-600 text-white px-2 py-0.5 rounded-full text-xs hover-parent-hover:bg-white hover-parent-hover:text-primary-600">
                    {count}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No tags found</p>
            )}
          </div>
        </div>

        {/* Publishing Frequency */}
        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b-2 border-primary-600">
            Publishing Frequency
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between p-3 bg-white rounded-lg">
              <span className="text-gray-700">Average Publishing Interval</span>
              <strong className="text-gray-900">{publishingStats.avgInterval} days</strong>
            </div>
            <div className="flex justify-between p-3 bg-white rounded-lg">
              <span className="text-gray-700">First Video</span>
              <strong className="text-gray-900">{formatDate(publishingStats.firstVideo.toISOString())}</strong>
            </div>
            <div className="flex justify-between p-3 bg-white rounded-lg">
              <span className="text-gray-700">Latest Video</span>
              <strong className="text-gray-900">{formatDate(publishingStats.latestVideo.toISOString())}</strong>
            </div>
            {publishingStats.mostActiveYear && (
              <div className="flex justify-between p-3 bg-white rounded-lg">
                <span className="text-gray-700">Most Active Year</span>
                <strong className="text-gray-900">
                  {publishingStats.mostActiveYear.year} ({publishingStats.mostActiveYear.count} videos)
                </strong>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
