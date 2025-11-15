import type { VideoDetails } from '../../types';
import { formatNumber, formatDate, getThumbnailUrl } from '../../utils/formatters';

interface VideoItemProps {
  video: VideoDetails;
  onClick?: () => void;
}

export function VideoItem({ video, onClick }: VideoItemProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      window.open(video.url, '_blank');
    }
  };

  return (
    <div
      className="flex gap-4 p-3 bg-white rounded-lg mb-3 transition-transform hover:translate-x-1 hover:shadow-md cursor-pointer"
      onClick={handleClick}
    >
      <img
        src={getThumbnailUrl(video.thumbnails, 'medium')}
        alt={video.title}
        className="w-32 h-18 object-cover rounded flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">{video.title}</h4>
        <p className="text-sm text-gray-600">
          {formatNumber(video.statistics.viewCount)} views •{' '}
          {formatNumber(video.statistics.likeCount)} likes •{' '}
          {formatDate(video.publishedAt)}
        </p>
      </div>
    </div>
  );
}
