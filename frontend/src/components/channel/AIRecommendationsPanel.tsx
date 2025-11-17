import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ActionItem {
  action: string;
  details: string;
  effort: 'low' | 'medium' | 'high';
  timeline: string;
  order: number;
}

interface ImpactEstimate {
  metric: string;
  currentValue: number;
  projectedValue: number;
  improvement: number;
  confidence: number;
  timeframe: string;
  measurementMethod?: string;
}

interface Recommendation {
  id: string;
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionItems: ActionItem[];
  expectedImpact: ImpactEstimate;
  confidence: number;
  generatedBy: string;
  projectValue?: number;
  reasoning?: string;
}

interface AIRecommendationsPanelProps {
  recommendations: Recommendation[];
  isLoading?: boolean;
}

export function AIRecommendationsPanel({ recommendations, isLoading }: AIRecommendationsPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPriorityIcon = (priority: string): string => {
    switch (priority) {
      case 'critical': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const getCategoryIcon = (category: string): string => {
    const categoryIcons: Record<string, string> = {
      title_optimization: '📝',
      thumbnail_improvement: '🖼️',
      content_structure: '📊',
      engagement_tactics: '💬',
      seo_keywords: '🔍',
      upload_schedule: '📅',
      shorts_strategy: '📱',
      audience_targeting: '🎯',
      retention_improvement: '⏱️',
      cta_optimization: '👆',
      topic_selection: '💡',
    };
    return categoryIcons[category] || '📌';
  };

  const getEffortBadge = (effort: string): string => {
    switch (effort) {
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const toggleCard = (id: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCards(newExpanded);
  };

  const categories = ['all', ...new Set(recommendations.map(r => r.category))];

  const filteredRecommendations = selectedCategory === 'all'
    ? recommendations
    : recommendations.filter(r => r.category === selectedCategory);

  // Sort by priority
  const sortedRecommendations = [...filteredRecommendations].sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <span className="ml-4 text-gray-600">Generating AI recommendations...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          AI-Powered Recommendations
        </h2>
        <div className="flex gap-2">
          <span className="text-sm text-gray-600">
            {sortedRecommendations.length} recommendation{sortedRecommendations.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category === 'all' ? 'All' : category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Priority Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="text-2xl font-bold text-red-700">
            {sortedRecommendations.filter(r => r.priority === 'critical').length}
          </div>
          <div className="text-sm text-red-600">Critical</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="text-2xl font-bold text-orange-700">
            {sortedRecommendations.filter(r => r.priority === 'high').length}
          </div>
          <div className="text-sm text-orange-600">High Priority</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="text-2xl font-bold text-yellow-700">
            {sortedRecommendations.filter(r => r.priority === 'medium').length}
          </div>
          <div className="text-sm text-yellow-600">Medium</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="text-2xl font-bold text-green-700">
            {sortedRecommendations.filter(r => r.priority === 'low').length}
          </div>
          <div className="text-sm text-green-600">Low Priority</div>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {sortedRecommendations.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No recommendations found for the selected category.
          </div>
        ) : (
          sortedRecommendations.map((rec) => (
            <div
              key={rec.id}
              className="border-2 border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Card Header */}
              <div className="bg-gray-50 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPriorityColor(rec.priority)}`}>
                        {getPriorityIcon(rec.priority)} {rec.priority.toUpperCase()}
                      </span>
                      <span className="text-gray-600 text-sm">
                        {getCategoryIcon(rec.category)} {rec.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">{rec.title}</h3>
                    <p className="text-sm text-gray-600">{rec.description}</p>
                  </div>
                  <button
                    onClick={() => toggleCard(rec.id)}
                    className="ml-4 text-gray-500 hover:text-gray-700"
                  >
                    {expandedCards.has(rec.id) ? '▼' : '▶'}
                  </button>
                </div>

                {/* Expected Impact Preview */}
                <div className="mt-3 flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Expected Impact:</span>
                    <span className="font-semibold text-primary-600">
                      +{rec.expectedImpact.improvement.toFixed(1)}% {rec.expectedImpact.metric}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Confidence:</span>
                    <span className="font-semibold text-gray-700">
                      {(rec.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedCards.has(rec.id) && (
                <div className="p-4 bg-white border-t border-gray-200">
                  {/* Expected Impact Details */}
                  <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Expected Impact</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Current:</span>
                        <span className="ml-2 font-semibold">{rec.expectedImpact.currentValue.toFixed(1)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Projected:</span>
                        <span className="ml-2 font-semibold text-green-600">{rec.expectedImpact.projectedValue.toFixed(1)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Timeframe:</span>
                        <span className="ml-2 font-semibold">{rec.expectedImpact.timeframe}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Confidence:</span>
                        <span className="ml-2 font-semibold">{(rec.expectedImpact.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Items */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Action Items</h4>
                    <div className="space-y-3">
                      {rec.actionItems
                        .sort((a, b) => a.order - b.order)
                        .map((item, idx) => (
                          <div key={idx} className="flex gap-3 bg-gray-50 p-3 rounded-lg">
                            <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                              {item.order}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h5 className="font-semibold text-gray-800">{item.action}</h5>
                                <span className={`px-2 py-1 rounded text-xs font-medium border ${getEffortBadge(item.effort)}`}>
                                  {item.effort} effort
                                </span>
                                <span className="text-xs text-gray-500">⏱️ {item.timeline}</span>
                              </div>
                              <div className="text-sm text-gray-600 prose prose-sm max-w-none markdown-content">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.details}</ReactMarkdown>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* AI Info */}
                  <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-500">
                    Generated by {rec.generatedBy}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
