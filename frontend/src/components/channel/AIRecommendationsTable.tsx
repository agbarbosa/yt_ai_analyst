import { useState, useMemo } from 'react';
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

interface AIRecommendationsTableProps {
  recommendations: Recommendation[];
  isLoading?: boolean;
}

type SortField = 'actionItemNumber' | 'category' | 'priority' | 'effortLevel' | 'projectValue';
type SortOrder = 'asc' | 'desc';

export function AIRecommendationsTable({ recommendations, isLoading }: AIRecommendationsTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('actionItemNumber');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [searchTerm, setSearchTerm] = useState('');

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
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
      collaboration: '🤝',
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

  const formatCategoryName = (category: string): string => {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getPriorityValue = (priority: string): number => {
    const priorityMap: Record<string, number> = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1,
    };
    return priorityMap[priority] || 0;
  };

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const categories = useMemo(() => {
    return ['all', ...new Set(recommendations.map(r => r.category))];
  }, [recommendations]);

  const filteredAndSortedRecommendations = useMemo(() => {
    let filtered = recommendations;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(r => r.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case 'actionItemNumber':
          aValue = recommendations.indexOf(a) + 1;
          bValue = recommendations.indexOf(b) + 1;
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        case 'priority':
          aValue = getPriorityValue(a.priority);
          bValue = getPriorityValue(b.priority);
          break;
        case 'effortLevel':
          aValue = getPriorityValue(a.actionItems[0]?.effort || 'medium');
          bValue = getPriorityValue(b.actionItems[0]?.effort || 'medium');
          break;
        case 'projectValue':
          aValue = a.projectValue || 0;
          bValue = b.projectValue || 0;
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return sorted;
  }, [recommendations, selectedCategory, searchTerm, sortField, sortOrder]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="text-gray-400">⇅</span>;
    return sortOrder === 'asc' ? <span>↑</span> : <span>↓</span>;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Generating AI recommendations...</p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-600">No recommendations available.</p>
        <p className="text-sm text-gray-500 mt-2">Click "Generate Insights" to get AI-powered recommendations.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header Controls */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search recommendations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : formatCategoryName(cat)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-3 text-sm text-gray-600">
          Showing {filteredAndSortedRecommendations.length} of {recommendations.length} recommendations
        </div>
      </div>

      {/* Table - Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort('actionItemNumber')}
              >
                # <SortIcon field="actionItemNumber" />
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort('category')}
              >
                Category <SortIcon field="category" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Summary
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort('effortLevel')}
              >
                Effort <SortIcon field="effortLevel" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Timeline
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort('projectValue')}
              >
                Value <SortIcon field="projectValue" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Success Metric
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedRecommendations.map((rec, index) => {
              const isExpanded = expandedRows.has(rec.id);
              const primaryEffort = rec.actionItems[0]?.effort || 'medium';

              return (
                <>
                  <tr
                    key={rec.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => toggleRow(rec.id)}
                  >
                    {/* Action Item Number */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">{index + 1}</span>
                        <span className="ml-2">{isExpanded ? '▼' : '▶'}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-xl mr-2">{getCategoryIcon(rec.category)}</span>
                        <span className="text-xs text-gray-600">{formatCategoryName(rec.category)}</span>
                      </div>
                    </td>

                    {/* Summary */}
                    <td className="px-4 py-4">
                      <div className="flex items-start gap-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(rec.priority)}`}>
                          {getPriorityIcon(rec.priority)} {rec.priority}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 line-clamp-2">{rec.title}</p>
                        </div>
                      </div>
                    </td>

                    {/* Effort Level */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getEffortBadge(primaryEffort)}`}>
                        {primaryEffort}
                      </span>
                    </td>

                    {/* Timeline */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-xs text-gray-900">
                        <div className="font-medium">{rec.actionItems[0]?.timeline || 'N/A'}</div>
                        <div className="text-gray-500">{rec.expectedImpact.timeframe}</div>
                      </div>
                    </td>

                    {/* Project Value */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      {rec.projectValue !== undefined ? (
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${rec.projectValue}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium text-gray-700">{rec.projectValue}%</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">N/A</span>
                      )}
                    </td>

                    {/* Success Metric */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-xs">
                        <div className="font-medium text-gray-900">{rec.expectedImpact.metric}</div>
                        <div className="text-gray-600">
                          {rec.expectedImpact.currentValue.toFixed(1)} → {rec.expectedImpact.projectedValue.toFixed(1)}
                        </div>
                        <div className="text-green-600 font-medium">
                          +{rec.expectedImpact.improvement.toFixed(1)}%
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Row */}
                  {isExpanded && (
                    <tr key={`${rec.id}-expanded`}>
                      <td colSpan={7} className="px-4 py-6 bg-gray-50">
                        <div className="max-w-5xl mx-auto space-y-4">
                          {/* Detailed Description */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">📋 Detailed Description</h4>
                            <div className="text-sm text-gray-700 prose prose-sm max-w-none">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>{rec.description}</ReactMarkdown>
                            </div>
                          </div>

                          {/* Reasoning */}
                          {rec.reasoning && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 mb-2">💭 Reasoning</h4>
                              <p className="text-sm text-gray-700">{rec.reasoning}</p>
                            </div>
                          )}

                          {/* Success Metric Details */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">📊 Success Metric Details</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Current Value:</span>
                                <div className="font-medium text-gray-900">{rec.expectedImpact.currentValue.toFixed(2)}</div>
                              </div>
                              <div>
                                <span className="text-gray-600">Target Value:</span>
                                <div className="font-medium text-gray-900">{rec.expectedImpact.projectedValue.toFixed(2)}</div>
                              </div>
                              <div>
                                <span className="text-gray-600">Improvement:</span>
                                <div className="font-medium text-green-600">+{rec.expectedImpact.improvement.toFixed(1)}%</div>
                              </div>
                              <div>
                                <span className="text-gray-600">Confidence:</span>
                                <div className="font-medium text-gray-900">{(rec.expectedImpact.confidence * 100).toFixed(0)}%</div>
                              </div>
                              {rec.expectedImpact.measurementMethod && (
                                <div className="col-span-2 md:col-span-4">
                                  <span className="text-gray-600">Measurement:</span>
                                  <div className="font-medium text-gray-900">{rec.expectedImpact.measurementMethod}</div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Items */}
                          {rec.actionItems.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 mb-2">✅ Action Items</h4>
                              <div className="space-y-2">
                                {rec.actionItems.map((item) => (
                                  <div key={item.order} className="flex items-start gap-3 p-3 bg-white rounded border border-gray-200">
                                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-medium">
                                      {item.order}
                                    </span>
                                    <div className="flex-1">
                                      <p className="text-sm text-gray-900">{item.action}</p>
                                      <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                                        <span className={`px-2 py-0.5 rounded border ${getEffortBadge(item.effort)}`}>
                                          {item.effort}
                                        </span>
                                        <span>⏱️ {item.timeline}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-gray-200">
        {filteredAndSortedRecommendations.map((rec, index) => {
          const isExpanded = expandedRows.has(rec.id);
          const primaryEffort = rec.actionItems[0]?.effort || 'medium';

          return (
            <div key={rec.id} className="p-4">
              <div
                className="cursor-pointer"
                onClick={() => toggleRow(rec.id)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-700">#{index + 1}</span>
                    <span className="text-xl">{getCategoryIcon(rec.category)}</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(rec.priority)}`}>
                      {getPriorityIcon(rec.priority)} {rec.priority}
                    </span>
                  </div>
                  <button className="text-gray-400">
                    {isExpanded ? '▼' : '▶'}
                  </button>
                </div>

                {/* Summary */}
                <h3 className="text-sm font-medium text-gray-900 mb-2">{rec.title}</h3>

                {/* Quick Info */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-500">Effort:</span>
                    <span className={`ml-2 px-2 py-0.5 rounded border ${getEffortBadge(primaryEffort)}`}>
                      {primaryEffort}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Value:</span>
                    <span className="ml-2 font-medium text-gray-700">
                      {rec.projectValue !== undefined ? `${rec.projectValue}%` : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Timeline:</span>
                    <span className="ml-2 text-gray-700">{rec.actionItems[0]?.timeline || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Impact:</span>
                    <span className="ml-2 text-green-600 font-medium">
                      +{rec.expectedImpact.improvement.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">📋 Description</h4>
                    <div className="text-sm text-gray-700 prose prose-sm">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{rec.description}</ReactMarkdown>
                    </div>
                  </div>

                  {rec.reasoning && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">💭 Reasoning</h4>
                      <p className="text-sm text-gray-700">{rec.reasoning}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">📊 Success Metric</h4>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Metric:</span>
                        <span className="font-medium">{rec.expectedImpact.metric}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current → Target:</span>
                        <span className="font-medium">
                          {rec.expectedImpact.currentValue.toFixed(1)} → {rec.expectedImpact.projectedValue.toFixed(1)}
                        </span>
                      </div>
                      {rec.expectedImpact.measurementMethod && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Track in:</span>
                          <span className="font-medium text-xs">{rec.expectedImpact.measurementMethod}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
