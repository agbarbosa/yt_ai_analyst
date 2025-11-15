import { Card } from '../components/common';

export function Dashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome to your YouTube analytics dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="text-sm text-gray-600 mb-1">Total Videos Analyzed</div>
          <div className="text-3xl font-bold text-gray-900">0</div>
          <div className="text-xs text-green-600 mt-2">Start analyzing!</div>
        </Card>

        <Card>
          <div className="text-sm text-gray-600 mb-1">Channels Tracked</div>
          <div className="text-3xl font-bold text-gray-900">0</div>
          <div className="text-xs text-green-600 mt-2">Add a channel</div>
        </Card>

        <Card>
          <div className="text-sm text-gray-600 mb-1">Total Views</div>
          <div className="text-3xl font-bold text-gray-900">0</div>
          <div className="text-xs text-gray-500 mt-2">Across all videos</div>
        </Card>

        <Card>
          <div className="text-sm text-gray-600 mb-1">Avg. Engagement</div>
          <div className="text-3xl font-bold text-gray-900">0%</div>
          <div className="text-xs text-gray-500 mt-2">Likes + Comments / Views</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recent Analysis">
          <div className="text-center py-12 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>No recent analysis</p>
            <p className="text-sm mt-2">Start by analyzing a video or channel</p>
          </div>
        </Card>

        <Card title="Recommendations">
          <div className="text-center py-12 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <p>No recommendations yet</p>
            <p className="text-sm mt-2">Analyze content to get AI-powered insights</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
