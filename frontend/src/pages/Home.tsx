import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input } from '../components/common';
import { APP_NAME } from '../config/constants';

export function Home() {
  const [url, setUrl] = useState('');
  const [analysisType, setAnalysisType] = useState<'video' | 'channel'>('video');
  const navigate = useNavigate();

  const handleAnalyze = () => {
    if (!url) return;

    if (analysisType === 'channel') {
      // For channel analysis, go to the channel analysis page
      navigate('/channel-analysis');
    } else {
      // Extract ID from URL or use directly if it's just an ID
      const id = url.includes('youtube.com') || url.includes('youtu.be')
        ? url.split('/').pop()?.split('?')[0] || url
        : url;
      navigate(`/video/${id}`);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          {APP_NAME}
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl">
          Analyze YouTube videos and channels with AI-powered insights.
          Get recommendations to grow your audience and improve engagement.
        </p>
      </div>

      <Card className="w-full max-w-2xl">
        <div className="space-y-6">
          <div className="flex gap-4">
            <button
              onClick={() => setAnalysisType('video')}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
                analysisType === 'video'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Video Analysis
            </button>
            <button
              onClick={() => setAnalysisType('channel')}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
                analysisType === 'channel'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Channel Analysis
            </button>
          </div>

          <div>
            <Input
              type="text"
              placeholder={`Enter YouTube ${analysisType} URL or ID`}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
            />
          </div>

          <Button
            onClick={handleAnalyze}
            className="w-full"
            size="lg"
            disabled={!url}
          >
            Analyze {analysisType === 'video' ? 'Video' : 'Channel'}
          </Button>

          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Example URLs:
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Video: https://www.youtube.com/watch?v=dQw4w9WgXcQ</p>
              <p>Channel: https://www.youtube.com/@channelname</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Deep Analytics
          </h3>
          <p className="text-gray-600">
            Comprehensive analysis of views, engagement, and audience retention
          </p>
        </div>

        <div className="text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            AI Recommendations
          </h3>
          <p className="text-gray-600">
            Smart suggestions to improve content and grow your channel
          </p>
        </div>

        <div className="text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Trend Analysis
          </h3>
          <p className="text-gray-600">
            Track performance over time and identify growth opportunities
          </p>
        </div>
      </div>
    </div>
  );
}
