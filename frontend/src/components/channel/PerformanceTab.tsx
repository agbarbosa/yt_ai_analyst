import { useState, useMemo } from 'react';
import type { VideoDetails } from '../../types';
import { formatNumber, formatDate, calculateEngagementRate } from '../../utils/formatters';

interface PerformanceTabProps {
  videos: VideoDetails[];
}

type SortBy = 'views' | 'likes' | 'comments' | 'engagement' | 'date';

export function PerformanceTab({ videos }: PerformanceTabProps) {
  const [sortBy, setSortBy] = useState<SortBy>('views');

  const sortedVideos = useMemo(() => {
    const sorted = [...videos];

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
          const engA = calculateEngagementRate(
            a.statistics.likeCount,
            a.statistics.commentCount,
            a.statistics.viewCount
          );
          const engB = calculateEngagementRate(
            b.statistics.likeCount,
            b.statistics.commentCount,
            b.statistics.viewCount
          );
          return engB - engA;
        });
        break;
      case 'date':
        sorted.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        break;
    }

    return sorted;
  }, [videos, sortBy]);

  return (
    <div className="p-6">
      <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b-2 border-primary-600">
          Video Performance Metrics
        </h3>
        <div className="flex gap-4 mb-4">
          <label className="flex items-center gap-2 font-medium text-gray-700">
            Sort by:
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg cursor-pointer bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="views">Views</option>
              <option value="likes">Likes</option>
              <option value="comments">Comments</option>
              <option value="engagement">Engagement Rate</option>
              <option value="date">Date (Newest)</option>
            </select>
          </label>
        </div>
        <div className="max-h-[600px] overflow-auto">
          <table className="w-full bg-white border-collapse">
            <thead className="sticky top-0 bg-primary-600 text-white z-10">
              <tr>
                <th className="p-3 text-left text-xs font-semibold uppercase">#</th>
                <th className="p-3 text-left text-xs font-semibold uppercase">Title</th>
                <th className="p-3 text-left text-xs font-semibold uppercase">Published</th>
                <th className="p-3 text-left text-xs font-semibold uppercase">Views</th>
                <th className="p-3 text-left text-xs font-semibold uppercase">Likes</th>
                <th className="p-3 text-left text-xs font-semibold uppercase">Comments</th>
                <th className="p-3 text-left text-xs font-semibold uppercase">Engagement Rate</th>
                <th className="p-3 text-left text-xs font-semibold uppercase">Duration</th>
              </tr>
            </thead>
            <tbody>
              {sortedVideos.map((video, index) => {
                const engagement = calculateEngagementRate(
                  video.statistics.likeCount,
                  video.statistics.commentCount,
                  video.statistics.viewCount
                ).toFixed(2);

                return (
                  <tr key={video.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3 max-w-md">
                      <a
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:underline font-semibold"
                      >
                        {video.title}
                      </a>
                    </td>
                    <td className="p-3">{formatDate(video.publishedAt)}</td>
                    <td className="p-3">{formatNumber(video.statistics.viewCount)}</td>
                    <td className="p-3">{formatNumber(video.statistics.likeCount)}</td>
                    <td className="p-3">{formatNumber(video.statistics.commentCount)}</td>
                    <td className="p-3">{engagement}%</td>
                    <td className="p-3">{video.duration}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
