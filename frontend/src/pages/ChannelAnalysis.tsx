import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, Input, Loading, ErrorMessage, Card } from '../components/common';
import {
  ChannelOverview,
  OverviewTab,
  KeywordsTab,
  PerformanceTab,
  AllVideosTab,
  AlgorithmScore,
  AIRecommendationsPanel,
  GrowthInsightsTab,
  QuickActionsPanel,
} from '../components/channel';
import { AIRecommendationsTable } from '../components/channel/AIRecommendationsTable';
import type { ChannelAnalysisData } from '../types';
import { API_BASE_URL } from '../config/constants';

type TabType = 'overview' | 'keywords' | 'performance' | 'videos' | 'growth';
type RecommendationViewType = 'table' | 'cards';

export function ChannelAnalysis() {
  const [searchParams] = useSearchParams();
  const [channelUrl, setChannelUrl] = useState('');
  const [maxResults, setMaxResults] = useState('50');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [channelData, setChannelData] = useState<ChannelAnalysisData | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [algorithmScore, setAlgorithmScore] = useState<any | null>(null);
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);
  const [recommendationView, setRecommendationView] = useState<RecommendationViewType>('table');
  const [lastSnapshotTimestamp, setLastSnapshotTimestamp] = useState<string | null>(null);

  // Check for URL parameter on mount and auto-analyze
  useEffect(() => {
    console.log('[ChannelAnalysis] Component mounted');
    const urlParam = searchParams.get('url');
    if (urlParam) {
      console.log('[ChannelAnalysis] URL parameter detected, auto-analyzing:', urlParam);
      setChannelUrl(urlParam);
      // Trigger analysis after setting the URL
      setTimeout(() => {
        analyzeChannelWithUrl(urlParam);
      }, 100);
    } else {
      console.log('[ChannelAnalysis] No URL parameter, waiting for user input');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const analyzeChannelWithUrl = async (url: string) => {
    if (!url.trim()) {
      console.warn('[ChannelAnalysis] Empty URL provided');
      setError('Please enter a YouTube channel URL');
      return;
    }

    console.log('[ChannelAnalysis] Starting channel analysis', { url, maxResults });
    setIsLoading(true);
    setError('');
    setChannelData(null);

    const startTime = performance.now();

    try {
      const apiUrl = `${API_BASE_URL}/api/channel/videos?url=${encodeURIComponent(url)}&maxResults=${maxResults}`;
      console.log('[ChannelAnalysis] Fetching channel data from API:', apiUrl);

      const response = await fetch(apiUrl);
      const fetchTime = performance.now() - startTime;

      console.log('[ChannelAnalysis] API response received', {
        status: response.status,
        statusText: response.statusText,
        duration: `${fetchTime.toFixed(0)}ms`
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[ChannelAnalysis] API error response:', errorData);
        throw new Error(errorData.message || 'Failed to fetch channel data');
      }

      const result = await response.json();
      console.log('[ChannelAnalysis] API data parsed', {
        success: result.success,
        channelTitle: result.data?.channel?.title,
        videoCount: result.data?.videos?.length
      });

      if (!result.success) {
        console.error('[ChannelAnalysis] Analysis failed:', result.message);
        throw new Error(result.message || 'Failed to analyze channel');
      }

      console.log('[ChannelAnalysis] Channel data set successfully', {
        channelId: result.data.channel.id,
        totalVideos: result.data.totalVideos
      });
      setChannelData(result.data);

      // Fetch existing recommendations from database
      await fetchExistingRecommendations(result.data.channel.id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      console.error('[ChannelAnalysis] Analysis failed with error:', errorMessage, err);
      setError(errorMessage);
    } finally {
      const totalTime = performance.now() - startTime;
      console.log('[ChannelAnalysis] Analysis completed', {
        duration: `${totalTime.toFixed(0)}ms`,
        success: !error
      });
      setIsLoading(false);
    }
  };

  const analyzeChannel = async () => {
    await analyzeChannelWithUrl(channelUrl);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      analyzeChannel();
    }
  };

  const fetchExistingRecommendations = async (channelId: string) => {
    try {
      const apiUrl = `${API_BASE_URL}/api/channels/${channelId}/recommendations?latest=true`;
      console.log('[ChannelAnalysis] Fetching existing recommendations:', apiUrl);

      const response = await fetch(apiUrl);

      if (!response.ok) {
        console.warn('[ChannelAnalysis] Failed to fetch existing recommendations');
        return;
      }

      const result = await response.json();
      console.log('[ChannelAnalysis] Existing recommendations fetched', {
        count: result.recommendations?.length || 0,
        generatedAt: result.generatedAt,
        hasAlgorithmScore: !!result.algorithmScore
      });

      if (result.recommendations && result.recommendations.length > 0) {
        setRecommendations(result.recommendations);
        setLastSnapshotTimestamp(result.generatedAt);
        if (result.algorithmScore) {
          setAlgorithmScore(result.algorithmScore);
        }
        console.log('[ChannelAnalysis] Loaded existing recommendations and algorithm score from database');
      }
    } catch (err) {
      console.warn('[ChannelAnalysis] Error fetching existing recommendations:', err);
      // Silently fail - not critical
    }
  };

  const generateRecommendations = async () => {
    if (!channelData) {
      console.warn('[ChannelAnalysis] Cannot generate recommendations - no channel data');
      return;
    }

    console.log('[ChannelAnalysis] Generating recommendations', {
      channelId: channelData.channel.id,
      channelTitle: channelData.channel.title
    });

    setIsGeneratingRecommendations(true);
    setError('');

    const startTime = performance.now();

    try {
      const apiUrl = `${API_BASE_URL}/api/channels/${channelData.channel.id}/recommendations`;
      console.log('[ChannelAnalysis] Calling recommendations API:', apiUrl);

      const response = await fetch(apiUrl, { method: 'POST' });
      const fetchTime = performance.now() - startTime;

      console.log('[ChannelAnalysis] Recommendations API response received', {
        status: response.status,
        duration: `${fetchTime.toFixed(0)}ms`
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[ChannelAnalysis] Recommendations API error:', errorData);
        throw new Error(errorData.message || 'Failed to generate recommendations');
      }

      const result = await response.json();
      console.log('[ChannelAnalysis] Recommendations data received', {
        recommendationCount: result.recommendations?.length || 0,
        criticalCount: result.criticalCount,
        highCount: result.highCount,
        algorithmScore: result.algorithmScore?.overall
      });

      setRecommendations(result.recommendations || []);
      setAlgorithmScore(result.algorithmScore || null);
      setLastSnapshotTimestamp(result.generatedAt || new Date().toISOString());

      console.log('[ChannelAnalysis] Recommendations state updated successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate recommendations';
      console.error('[ChannelAnalysis] Recommendations generation failed:', errorMessage, err);
      setError(errorMessage);
    } finally {
      const totalTime = performance.now() - startTime;
      console.log('[ChannelAnalysis] Recommendations generation completed', {
        duration: `${totalTime.toFixed(0)}ms`,
        success: !error
      });
      setIsGeneratingRecommendations(false);
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
            <div className="mb-8">
              <ChannelOverview
                channel={channelData.channel}
                totalVideos={channelData.totalVideos}
              />
            </div>

            {/* Insights Tabs */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
              {/* Tab Navigation */}
              <div className="flex bg-gray-100 border-b-2 border-gray-300">
                <button
                  onClick={() => {
                    console.log('[ChannelAnalysis] Tab changed to: overview');
                    setActiveTab('overview');
                  }}
                  className={`flex-1 px-6 py-4 text-base font-semibold transition-all ${
                    activeTab === 'overview'
                      ? 'bg-white text-primary-600 border-b-4 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => {
                    console.log('[ChannelAnalysis] Tab changed to: keywords');
                    setActiveTab('keywords');
                  }}
                  className={`flex-1 px-6 py-4 text-base font-semibold transition-all ${
                    activeTab === 'keywords'
                      ? 'bg-white text-primary-600 border-b-4 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Keywords & Tags
                </button>
                <button
                  onClick={() => {
                    console.log('[ChannelAnalysis] Tab changed to: performance');
                    setActiveTab('performance');
                  }}
                  className={`flex-1 px-6 py-4 text-base font-semibold transition-all ${
                    activeTab === 'performance'
                      ? 'bg-white text-primary-600 border-b-4 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Performance
                </button>
                <button
                  onClick={() => {
                    console.log('[ChannelAnalysis] Tab changed to: growth');
                    setActiveTab('growth');
                  }}
                  className={`flex-1 px-6 py-4 text-base font-semibold transition-all ${
                    activeTab === 'growth'
                      ? 'bg-white text-primary-600 border-b-4 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Growth Insights
                </button>
                <button
                  onClick={() => {
                    console.log('[ChannelAnalysis] Tab changed to: videos');
                    setActiveTab('videos');
                  }}
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
              {activeTab === 'growth' && <GrowthInsightsTab videos={channelData.videos} />}
              {activeTab === 'videos' && (
                <AllVideosTab
                  videos={channelData.videos}
                  channelTitle={channelData.channel.title}
                />
              )}
            </div>

            {/* Quick Actions Panel */}
            <QuickActionsPanel
              channelId={channelData.channel.id}
              channelTitle={channelData.channel.title}
              onGenerateRecommendations={generateRecommendations}
              isGenerating={isGeneratingRecommendations}
              lastSnapshotTimestamp={lastSnapshotTimestamp}
            />

            {/* Algorithm Score */}
            {algorithmScore && (
              <AlgorithmScore score={algorithmScore} />
            )}

            {/* AI Recommendations Section */}
            {recommendations.length > 0 && (
              <div className="space-y-4">
                {/* View Toggle */}
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">AI-Generated Channel Strategy</h2>
                  <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm border border-gray-200 p-1">
                    <button
                      onClick={() => setRecommendationView('table')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        recommendationView === 'table'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      📊 Table View
                    </button>
                    <button
                      onClick={() => setRecommendationView('cards')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        recommendationView === 'cards'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      🗂️ Card View
                    </button>
                  </div>
                </div>

                {/* Conditional Render Based on View Type */}
                {recommendationView === 'table' ? (
                  <AIRecommendationsTable
                    recommendations={recommendations}
                    isLoading={isGeneratingRecommendations}
                  />
                ) : (
                  <AIRecommendationsPanel
                    recommendations={recommendations}
                    isLoading={isGeneratingRecommendations}
                  />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
