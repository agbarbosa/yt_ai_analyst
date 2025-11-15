interface AlgorithmScoreProps {
  score: {
    overall: number;
    breakdown: {
      ctrScore: number;
      watchTimeScore: number;
      engagementScore: number;
      satisfactionScore: number;
    };
    grade: string;
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
  };
}

export function AlgorithmScore({ score }: AlgorithmScoreProps) {
  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number): string => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    if (score >= 40) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const getScoreBorderColor = (score: number): string => {
    if (score >= 80) return 'border-green-500';
    if (score >= 60) return 'border-yellow-500';
    if (score >= 40) return 'border-orange-500';
    return 'border-red-500';
  };

  const getProgressColor = (score: number): string => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">YouTube Algorithm Performance Score</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Score Circle */}
        <div className="flex flex-col items-center justify-center">
          <div className={`relative w-40 h-40 rounded-full border-8 ${getScoreBorderColor(score.overall)} ${getScoreBgColor(score.overall)} flex items-center justify-center`}>
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(score.overall)}`}>
                {score.overall}
              </div>
              <div className="text-sm text-gray-600">out of 100</div>
            </div>
          </div>
          <div className={`mt-4 text-3xl font-bold ${getScoreColor(score.overall)}`}>
            Grade: {score.grade}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {score.overall >= 80 && 'Excellent - Viral Potential'}
            {score.overall >= 60 && score.overall < 80 && 'Good - Above Average'}
            {score.overall >= 40 && score.overall < 60 && 'Average - Needs Work'}
            {score.overall < 40 && 'Needs Improvement'}
          </div>
        </div>

        {/* Performance Breakdown */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Performance Breakdown</h3>

          {/* CTR Score */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700">Click-Through Rate (CTR)</span>
              <span className={`text-sm font-bold ${getScoreColor((score.breakdown.ctrScore / 25) * 100)}`}>
                {score.breakdown.ctrScore}/25
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full ${getProgressColor((score.breakdown.ctrScore / 25) * 100)} transition-all duration-500`}
                style={{ width: `${(score.breakdown.ctrScore / 25) * 100}%` }}
              />
            </div>
          </div>

          {/* Watch Time Score */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700">Watch Time & Retention</span>
              <span className={`text-sm font-bold ${getScoreColor((score.breakdown.watchTimeScore / 35) * 100)}`}>
                {score.breakdown.watchTimeScore}/35
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full ${getProgressColor((score.breakdown.watchTimeScore / 35) * 100)} transition-all duration-500`}
                style={{ width: `${(score.breakdown.watchTimeScore / 35) * 100}%` }}
              />
            </div>
          </div>

          {/* Engagement Score */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700">Engagement (Likes, Comments, Shares)</span>
              <span className={`text-sm font-bold ${getScoreColor((score.breakdown.engagementScore / 25) * 100)}`}>
                {score.breakdown.engagementScore}/25
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full ${getProgressColor((score.breakdown.engagementScore / 25) * 100)} transition-all duration-500`}
                style={{ width: `${(score.breakdown.engagementScore / 25) * 100}%` }}
              />
            </div>
          </div>

          {/* Satisfaction Score */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700">Viewer Satisfaction</span>
              <span className={`text-sm font-bold ${getScoreColor((score.breakdown.satisfactionScore / 15) * 100)}`}>
                {score.breakdown.satisfactionScore}/15
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full ${getProgressColor((score.breakdown.satisfactionScore / 15) * 100)} transition-all duration-500`}
                style={{ width: `${(score.breakdown.satisfactionScore / 15) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Strengths, Weaknesses, Opportunities */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {/* Strengths */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-800 mb-2 flex items-center">
            <span className="mr-2">✓</span>
            Strengths
          </h4>
          <ul className="text-sm text-green-700 space-y-1">
            {score.strengths.map((strength, idx) => (
              <li key={idx} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-semibold text-red-800 mb-2 flex items-center">
            <span className="mr-2">✗</span>
            Weaknesses
          </h4>
          <ul className="text-sm text-red-700 space-y-1">
            {score.weaknesses.map((weakness, idx) => (
              <li key={idx} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{weakness}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Opportunities */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
            <span className="mr-2">⚡</span>
            Opportunities
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            {score.opportunities.map((opportunity, idx) => (
              <li key={idx} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{opportunity}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
