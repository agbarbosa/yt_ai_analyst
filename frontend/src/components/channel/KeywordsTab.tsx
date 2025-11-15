import { useState, useMemo } from 'react';
import type { VideoDetails } from '../../types';
import { extractWords } from '../../utils/formatters';
import { Input } from '../common';

interface KeywordsTabProps {
  videos: VideoDetails[];
}

export function KeywordsTab({ videos }: KeywordsTabProps) {
  const [tagSearch, setTagSearch] = useState('');
  const [minFreq, setMinFreq] = useState(2);

  const { allTags, titleKeywords } = useMemo(() => {
    // Tag analysis
    const tagFrequency: Record<string, number> = {};
    videos.forEach(video => {
      video.tags.forEach(tag => {
        tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
      });
    });

    const allTags = Object.entries(tagFrequency).sort((a, b) => b[1] - a[1]);

    // Title keywords
    const titleWords: Record<string, number> = {};
    videos.forEach(video => {
      const words = extractWords(video.title);
      words.forEach(word => {
        titleWords[word] = (titleWords[word] || 0) + 1;
      });
    });

    const titleKeywords = Object.entries(titleWords)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50);

    return { allTags, titleKeywords };
  }, [videos]);

  const filteredTags = useMemo(() => {
    return allTags.filter(([tag, count]) =>
      tag.toLowerCase().includes(tagSearch.toLowerCase()) && count >= minFreq
    );
  }, [allTags, tagSearch, minFreq]);

  const maxCount = filteredTags.length > 0 ? filteredTags[0][1] : 1;

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tag Analysis */}
        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b-2 border-primary-600">
            Tag Analysis
          </h3>
          <div className="flex flex-wrap gap-4 mb-4">
            <Input
              type="text"
              placeholder="Search tags..."
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
              className="flex-1 min-w-[200px]"
            />
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Min frequency:</label>
              <input
                type="number"
                value={minFreq}
                onChange={(e) => setMinFreq(parseInt(e.target.value) || 1)}
                min="1"
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="max-h-[500px] overflow-y-auto space-y-2">
            {filteredTags.length > 0 ? (
              filteredTags.map(([tag, count]) => (
                <div
                  key={tag}
                  className="flex justify-between items-center p-3 bg-white rounded-lg"
                >
                  <span className="font-semibold text-gray-900">{tag}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-600 to-purple-600 transition-all"
                        style={{ width: `${(count / maxCount) * 100}%` }}
                      />
                    </div>
                    <strong className="text-gray-900 w-8 text-right">{count}</strong>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No tags match your criteria</p>
            )}
          </div>
        </div>

        {/* Title Keywords */}
        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b-2 border-primary-600">
            Title Keywords
          </h3>
          <div className="max-h-[500px] overflow-y-auto space-y-2">
            {titleKeywords.length > 0 ? (
              titleKeywords.map(([word, count]) => (
                <div
                  key={word}
                  className="flex justify-between items-center p-3 bg-white rounded-lg border-l-3 border-purple-600"
                >
                  <span className="text-gray-900 capitalize">{word}</span>
                  <strong className="text-gray-900">{count}</strong>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No keywords found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
