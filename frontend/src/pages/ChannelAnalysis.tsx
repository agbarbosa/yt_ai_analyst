import { useState } from 'react';
import { Button, Input, Loading, ErrorMessage, Card } from '../components/common';
import {
  ChannelOverview,
  OverviewTab,
  KeywordsTab,
  PerformanceTab,
  AllVideosTab,
} from '../components/channel';
import type { ChannelAnalysisData } from '../types';
import { API_BASE_URL } from '../config/constants';

type TabType = 'overview' | 'keywords' | 'performance' | 'videos';

export function ChannelAnalysis() {
  const [channelUrl, setChannelUrl] = useState('');
  const [maxResults, setMaxResults] = useState('50');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [channelData, setChannelData] = useState<ChannelAnalysisData | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const analyzeChannel = async () => {
    if (!channelUrl.trim()) {
      setError('Please enter a YouTube channel URL');
      return;
    }

    setIsLoading(true);
    setError('');
    setChannelData(null);

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

      setChannelData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      analyzeChannel();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-purple-600 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center text-white mb-10">
          <h1 className="text-5xl font-bold mb-3 drop-shadow-lg">YouTube Channel SEO Analyst</h1>
          <p className="text-xl opacity-90">
            Analyze YouTube channels for SEO insights and performance metrics
          </p>
        </header>

        {/* Search Section */}
        <Card className="mb-8">
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Enter YouTube channel URL (e.g., https://www.youtube.com/@mkbhd)"
              value={channelUrl}
              onChange={(e) => setChannelUrl(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <div className="flex gap-4 items-center flex-wrap">
              <div className="flex items-center gap-2">
                <label className="font-semibold text-gray-700">Max Videos:</label>
                <select
                  value={maxResults}
                  onChange={(e) => setMaxResults(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg cursor-pointer bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                  <option value="200">200</option>
                </select>
              </div>
              <Button onClick={analyzeChannel} disabled={isLoading} className="flex-1 sm:flex-none">
                {isLoading ? 'Analyzing...' : 'Analyze Channel'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Loading Indicator */}
        {isLoading && (
          <Card>
            <Loading text="Analyzing channel data..." />
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <ErrorMessage message={error} retry={() => setError('')} />
        )}

        {/* Results */}
        {channelData && !isLoading && (
          <>
            {/* Channel Overview */}
            <ChannelOverview
              channel={channelData.channel}
              totalVideos={channelData.totalVideos}
            />

            {/* Insights Tabs */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Tab Navigation */}
              <div className="flex bg-gray-100 border-b-2 border-gray-300">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex-1 px-6 py-4 text-base font-semibold transition-all ${
                    activeTab === 'overview'
                      ? 'bg-white text-primary-600 border-b-4 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('keywords')}
                  className={`flex-1 px-6 py-4 text-base font-semibold transition-all ${
                    activeTab === 'keywords'
                      ? 'bg-white text-primary-600 border-b-4 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Keywords & Tags
                </button>
                <button
                  onClick={() => setActiveTab('performance')}
                  className={`flex-1 px-6 py-4 text-base font-semibold transition-all ${
                    activeTab === 'performance'
                      ? 'bg-white text-primary-600 border-b-4 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Performance
                </button>
                <button
                  onClick={() => setActiveTab('videos')}
                  className={`flex-1 px-6 py-4 text-base font-semibold transition-all ${
                    activeTab === 'videos'
                      ? 'bg-white text-primary-600 border-b-4 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All Videos
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'overview' && <OverviewTab videos={channelData.videos} />}
              {activeTab === 'keywords' && <KeywordsTab videos={channelData.videos} />}
              {activeTab === 'performance' && <PerformanceTab videos={channelData.videos} />}
              {activeTab === 'videos' && (
                <AllVideosTab
                  videos={channelData.videos}
                  channelTitle={channelData.channel.title}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
