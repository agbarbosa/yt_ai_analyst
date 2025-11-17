import { Button } from '../common';

interface QuickActionsPanelProps {
  channelId: string;
  channelTitle: string;
  onGenerateRecommendations?: () => void;
  isGenerating?: boolean;
  lastSnapshotTimestamp?: string | null;
}

export function QuickActionsPanel({
  channelId: _channelId,
  channelTitle: _channelTitle,
  onGenerateRecommendations,
  isGenerating,
  lastSnapshotTimestamp
}: QuickActionsPanelProps) {
  const formatTimestamp = (timestamp: string | null | undefined) => {
    if (!timestamp) return null;

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };
  const handleDownloadReport = () => {
    // TODO: Implement PDF/CSV report generation
    alert('Report download feature coming soon!');
  };

  const handleScheduleAnalysis = () => {
    // TODO: Implement scheduled re-analysis
    alert('Scheduled analysis feature coming soon!');
  };

  return (
    <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-xl shadow-lg p-6 mb-6 text-white">
      <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Generate AI Recommendations */}
        <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 hover:bg-opacity-30 transition-all">
          <div className="flex items-start gap-3">
            <div className="text-3xl">🤖</div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">AI Recommendations</h3>
              <p className="text-sm opacity-90 mb-3">
                Get personalized insights to grow your channel
              </p>
              <Button
                onClick={onGenerateRecommendations}
                disabled={isGenerating}
                className="w-full !bg-white !text-primary-600 hover:!bg-gray-100 disabled:!bg-gray-300 disabled:!text-gray-600"
              >
                {isGenerating ? 'Generating...' : lastSnapshotTimestamp ? 'Regenerate Insights' : 'Generate Insights'}
              </Button>
              {lastSnapshotTimestamp && (
                <div className="mt-2 text-xs opacity-80 flex items-center gap-1">
                  <span>⏱️</span>
                  <span>Last Snapshot: {formatTimestamp(lastSnapshotTimestamp)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Download Report */}
        <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 hover:bg-opacity-30 transition-all">
          <div className="flex items-start gap-3">
            <div className="text-3xl">📊</div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Download Report</h3>
              <p className="text-sm opacity-90 mb-3">
                Export comprehensive channel analysis
              </p>
              <Button
                onClick={handleDownloadReport}
                className="w-full !bg-white !text-primary-600 hover:!bg-gray-100"
              >
                Download PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Schedule Re-Analysis */}
        <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 hover:bg-opacity-30 transition-all">
          <div className="flex items-start gap-3">
            <div className="text-3xl">🔄</div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Schedule Analysis</h3>
              <p className="text-sm opacity-90 mb-3">
                Set up automatic channel monitoring
              </p>
              <Button
                onClick={handleScheduleAnalysis}
                className="w-full !bg-white !text-primary-600 hover:!bg-gray-100"
              >
                Schedule
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Quick Tips */}
      <div className="mt-6 bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
        <h4 className="font-semibold mb-2">💡 Quick Tips</h4>
        <ul className="text-sm space-y-1 opacity-90">
          <li>• Check AI recommendations regularly for optimization opportunities</li>
          <li>• Monitor your algorithm score to track performance improvements</li>
          <li>• Review growth insights to identify successful content patterns</li>
        </ul>
      </div>
    </div>
  );
}
