import type { ChannelDetails } from '../../types';
import { formatNumber, getThumbnailUrl } from '../../utils/formatters';

interface ChannelOverviewProps {
  channel: ChannelDetails;
  totalVideos: number;
}

export function ChannelOverview({ channel, totalVideos }: ChannelOverviewProps) {
  return (
    <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
      {/* Channel Header */}
      <div className="flex gap-6 mb-8">
        <img
          src={getThumbnailUrl(channel.thumbnails, 'medium')}
          alt={channel.title}
          className="w-32 h-32 rounded-full object-cover shadow-md"
        />
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{channel.title}</h2>
          <p className="text-gray-600 mb-2">{channel.customUrl || channel.id}</p>
          <p className="text-gray-700">
            {channel.description.substring(0, 200)}
            {channel.description.length > 200 ? '...' : ''}
          </p>
        </div>
      </div>

      {/* Channel Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-gradient-to-br from-primary-600 to-purple-600 p-6 rounded-xl text-white shadow-md">
          <h3 className="text-sm font-medium opacity-90 uppercase mb-3">Total Views</h3>
          <p className="text-3xl font-bold">{formatNumber(channel.statistics.viewCount)}</p>
        </div>

        <div className="bg-gradient-to-br from-primary-600 to-purple-600 p-6 rounded-xl text-white shadow-md">
          <h3 className="text-sm font-medium opacity-90 uppercase mb-3">Subscribers</h3>
          <p className="text-3xl font-bold">{formatNumber(channel.statistics.subscriberCount)}</p>
        </div>

        <div className="bg-gradient-to-br from-primary-600 to-purple-600 p-6 rounded-xl text-white shadow-md">
          <h3 className="text-sm font-medium opacity-90 uppercase mb-3">Total Videos</h3>
          <p className="text-3xl font-bold">{formatNumber(channel.statistics.videoCount)}</p>
        </div>

        <div className="bg-gradient-to-br from-primary-600 to-purple-600 p-6 rounded-xl text-white shadow-md">
          <h3 className="text-sm font-medium opacity-90 uppercase mb-3">Analyzed Videos</h3>
          <p className="text-3xl font-bold">{formatNumber(totalVideos)}</p>
        </div>
      </div>
    </div>
  );
}
