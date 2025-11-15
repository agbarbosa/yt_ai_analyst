import { useState, useMemo } from 'react';
import type { VideoDetails } from '../../types';
import { formatNumber, formatDate, getThumbnailUrl, exportToCSV } from '../../utils/formatters';
import { Input, Button } from '../common';

interface AllVideosTabProps {
  videos: VideoDetails[];
  channelTitle: string;
}

export function AllVideosTab({ videos, channelTitle }: AllVideosTabProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVideos = useMemo(() => {
    return videos.filter(video =>
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [videos, searchTerm]);

  const handleExport = () => {
    const exportData = videos.map(video => ({
      Title: video.title,
      URL: video.url,
      Published: video.publishedAt,
      Views: video.statistics.viewCount,
      Likes: video.statistics.likeCount,
      Comments: video.statistics.commentCount,
      Duration: video.duration,
      Tags: video.tags.join(', '),
      Description: video.description,
    }));

    const filename = `${channelTitle}_videos_${new Date().toISOString().split('T')[0]}.csv`;
    exportToCSV(exportData, filename);
  };

  return (
    <div className="p-6">
      <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b-2 border-primary-600">
          All Videos
        </h3>
        <div className="flex flex-wrap gap-4 mb-4">
          <Input
            type="text"
            placeholder="Search videos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[250px]"
          />
          <Button
            onClick={handleExport}
            className="bg-green-600 hover:bg-green-700"
          >
            Export to CSV
          </Button>
        </div>
        <div className="max-h-[600px] overflow-auto">
          <table className="w-full bg-white border-collapse">
            <thead className="sticky top-0 bg-primary-600 text-white z-10">
              <tr>
                <th className="p-3 text-left text-xs font-semibold uppercase">Thumbnail</th>
                <th className="p-3 text-left text-xs font-semibold uppercase">Title</th>
                <th className="p-3 text-left text-xs font-semibold uppercase">Description</th>
                <th className="p-3 text-left text-xs font-semibold uppercase">Tags</th>
                <th className="p-3 text-left text-xs font-semibold uppercase">Published</th>
                <th className="p-3 text-left text-xs font-semibold uppercase">Views</th>
                <th className="p-3 text-left text-xs font-semibold uppercase">Likes</th>
                <th className="p-3 text-left text-xs font-semibold uppercase">Duration</th>
              </tr>
            </thead>
            <tbody>
              {filteredVideos.map(video => (
                <tr key={video.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-3">
                    <img
                      src={getThumbnailUrl(video.thumbnails, 'default')}
                      alt="Thumbnail"
                      className="w-20 rounded"
                    />
                  </td>
                  <td className="p-3 max-w-xs">
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline font-semibold"
                    >
                      {video.title}
                    </a>
                  </td>
                  <td className="p-3 max-w-sm text-sm text-gray-600">
                    {video.description.substring(0, 100)}
                    {video.description.length > 100 ? '...' : ''}
                  </td>
                  <td className="p-3 max-w-xs text-sm">
                    <div className="flex flex-wrap gap-1">
                      {video.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-block bg-gray-200 px-2 py-1 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                      {video.tags.length > 3 && (
                        <span className="text-gray-600">+{video.tags.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3">{formatDate(video.publishedAt)}</td>
                  <td className="p-3">{formatNumber(video.statistics.viewCount)}</td>
                  <td className="p-3">{formatNumber(video.statistics.likeCount)}</td>
                  <td className="p-3">{video.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
