/**
 * YouTube AI Analyst - AI Prompt Templates
 *
 * Comprehensive prompt engineering templates for generating
 * YouTube optimization recommendations using the 2025 algorithm criteria
 *
 * Best Practices Applied:
 * - Clarity and specificity
 * - Structured context + data + task + format + constraints
 * - Example-based learning
 * - Measurable outcomes
 */

import { RecommendationCategory } from '../types/models';

// ============================================================================
// SYSTEM PROMPTS
// ============================================================================

export const YOUTUBE_ALGORITHM_EXPERT_SYSTEM_PROMPT = `You are a YouTube algorithm optimization expert specializing in the 2025 algorithm criteria.

CORE ALGORITHM PRINCIPLES (2025):
The YouTube algorithm prioritizes viewer satisfaction through four key metrics:

1. CLICK-THROUGH RATE (CTR) - 25% weight
   - Thumbnails and titles that drive clicks
   - Target: >10% for search, >5% for browse features
   - First impression quality is critical

2. WATCH TIME & RETENTION - 35% weight
   - Average view duration (AVD)
   - Average percentage viewed (APV)
   - Target: >50% retention rate
   - First 15 seconds are CRITICAL decision point

3. ENGAGEMENT SIGNALS - 25% weight
   - Likes, comments, shares
   - Subscriptions after viewing
   - Playlist additions, saves to watch later
   - Target: >5% engagement rate

4. VIEWER SATISFACTION - 15% weight
   - Survey responses
   - Absence of "Not Interested" clicks
   - No early exits
   - Rewatchability (especially for Shorts)

CRITICAL INSIGHTS:
- The algorithm tests new videos regardless of channel size (democratization)
- Viewers decide whether to continue watching within the first 15 seconds
- Niche targeting outperforms broad appeal
- Shorts serve as discovery tools for channel growth
- Consistency in uploads builds algorithmic momentum

YOUR ROLE:
Provide data-driven, actionable recommendations that improve performance against these metrics.
Be specific, measurable, and realistic. Always reference the data provided and explain your reasoning.`;

export const CREATIVE_OPTIMIZATION_SYSTEM_PROMPT = `You are a YouTube creative optimization specialist focused on maximizing click-through rates and viewer engagement.

EXPERTISE AREAS:
- Title optimization for search and browse features
- Thumbnail psychology and design principles
- Hook creation for maximum retention
- Content structure for watch time
- Call-to-action optimization

PRINCIPLES:
- Every recommendation must be actionable and specific
- Reference psychological principles when applicable
- Consider mobile-first viewing experiences
- Prioritize authenticity over clickbait
- Balance curiosity with clarity

CONSTRAINTS:
- Titles: 60 characters max (mobile-friendly)
- Hooks: First 15 seconds are critical
- CTAs: Clear, specific, and well-timed
- Brand consistency across all creatives`;

// ============================================================================
// CHANNEL-LEVEL PROMPTS
// ============================================================================

export const CHANNEL_STRATEGY_PROMPT = `{{systemPrompt}}

# CHANNEL ANALYSIS & STRATEGY GENERATION

## CHANNEL OVERVIEW
- **Channel Name**: {{channelName}}
- **Subscribers**: {{subscriberCount}}
- **Total Videos**: {{videoCount}}
- **Niche**: {{niche}}
- **Upload Frequency**: {{uploadFrequency}}
- **Channel Age**: {{channelAge}}

## PERFORMANCE METRICS (Last 90 Days)
### Algorithm Score: {{algorithmScore}}/100 ({{scoreGrade}})

**CTR Performance:**
- Average CTR: {{avgCTR}}%
- Benchmark: {{ctrBenchmark}}%
- Gap: {{ctrGap}}%
- Status: {{ctrStatus}}

**Retention Performance:**
- Average Retention: {{avgRetention}}%
- Benchmark: {{retentionBenchmark}}%
- Gap: {{retentionGap}}%
- Status: {{retentionStatus}}

**Engagement Performance:**
- Average Engagement: {{avgEngagement}}%
- Benchmark: {{engagementBenchmark}}%
- Gap: {{engagementGap}}%
- Status: {{engagementStatus}}

**Growth Metrics:**
- Subscriber Growth Rate: {{subGrowthRate}}%
- Views Growth Rate: {{viewsGrowthRate}}%
- Trend: {{growthTrend}}

## CONTENT ANALYSIS
**Top Performing Topics:**
{{topTopics}}

**Underperforming Topics:**
{{weakTopics}}

**Content Mix:**
- Long-form (>8 min): {{longformPercentage}}%
- Mid-form (3-8 min): {{midformPercentage}}%
- Shorts (<60s): {{shortsPercentage}}%

## TOP 5 VIDEOS
{{topVideos}}

## BOTTOM 5 VIDEOS
{{bottomVideos}}

---

# YOUR TASK

Generate a comprehensive 90-day channel optimization strategy with 8-12 prioritized recommendations.

## OUTPUT FORMAT

For each recommendation, provide:

### 1. CATEGORY
Choose from: Title Optimization, Thumbnail Improvement, Content Structure, Engagement Tactics, SEO Keywords, Upload Schedule, Shorts Strategy, Audience Targeting, Retention Improvement, CTA Optimization, Topic Selection, Collaboration

### 2. PRIORITY
- **Critical**: Major issue blocking growth (fix in 0-7 days)
- **High**: Significant opportunity (address in 1-2 weeks)
- **Medium**: Noticeable improvement (implement in 2-4 weeks)
- **Low**: Nice-to-have optimization (consider in 1-2 months)

### 3. CURRENT ISSUE
Explain what's wrong or what opportunity exists. Reference specific data points.

### 4. SPECIFIC ACTION ITEMS
Provide 3-5 step-by-step actions with:
- Clear instructions
- Effort level (Low/Medium/High)
- Timeline (e.g., "5 minutes", "1 hour", "1 week")
- Numbered steps

### 5. EXPECTED IMPACT
Specify:
- Which metric will improve (CTR, Retention, Engagement, etc.)
- Current value
- Projected value after implementation
- Percentage improvement
- Timeframe for results
- Confidence level (Low/Medium/High)

### 6. REASONING
Explain WHY this will work. Reference:
- YouTube algorithm principles
- Industry benchmarks
- Similar successful cases
- Psychological principles (if applicable)

### 7. SUCCESS METRICS
Define how to measure if this recommendation worked:
- Specific KPIs to track
- How to track them
- What success looks like

---

## STRATEGIC PRIORITIES

Focus on:
1. **Quick Wins** (Low effort, high impact) - Prioritize these
2. **Critical Issues** - Things actively hurting performance
3. **Growth Opportunities** - Untapped potential based on data
4. **Competitive Advantages** - What this channel does uniquely well

## CONSTRAINTS

- All recommendations must be data-driven
- Prioritize actionable over aspirational
- Consider the channel's specific niche and audience
- Account for creator's upload capacity ({{uploadFrequency}})
- Recommendations should complement each other
- Be realistic about timelines and effort

---

Generate your comprehensive strategy now:`;

// ============================================================================
// VIDEO-LEVEL PROMPTS
// ============================================================================

export const VIDEO_ANALYSIS_PROMPT = `{{systemPrompt}}

# VIDEO PERFORMANCE ANALYSIS

## VIDEO DETAILS
- **Title**: {{title}}
- **Video ID**: {{videoId}}
- **Published**: {{publishedDate}} ({{daysAgo}} days ago)
- **Duration**: {{duration}}
- **Type**: {{videoType}}

## PERFORMANCE METRICS
### Algorithm Score: {{algorithmScore}}/100 ({{scoreGrade}})

**CTR Analysis:**
- Current CTR: {{ctr}}%
- Traffic Source Breakdown:
  - Search: {{searchCTR}}% (Benchmark: >10%)
  - Browse: {{browseCTR}}% (Benchmark: >5%)
  - Shorts feed: {{shortsCTR}}%
- Total Impressions: {{impressions}}
- Status: {{ctrStatus}}

**Retention Analysis:**
- Average Retention: {{avgRetention}}%
- Average View Duration: {{avgViewDuration}} ({{avgPercentageViewed}}%)
- Retention Breakdown:
  - At 15 seconds: {{retention15s}}% ⚠️ CRITICAL METRIC
  - At 25%: {{retention25}}%
  - At 50%: {{retention50}}%
  - At 75%: {{retention75}}%
  - At 90%: {{retention90}}%
- Status: {{retentionStatus}}

**Engagement Analysis:**
- Total Views: {{views}}
- Likes: {{likes}} ({{likeRate}}%)
- Comments: {{comments}} ({{commentRate}}%)
- Shares: {{shares}} ({{shareRate}}%)
- Overall Engagement Rate: {{engagementRate}}%
- Subscribers Gained: {{subsGained}}
- Status: {{engagementStatus}}

**Traffic Sources:**
{{trafficSourceBreakdown}}

## RETENTION CURVE INSIGHTS
{{retentionCurveAnalysis}}

---

# YOUR TASK

Analyze this video's performance and provide 5-8 specific, actionable recommendations to improve its algorithm performance.

## OUTPUT FORMAT

For each recommendation:

### 1. CATEGORY & PRIORITY
- Category: [Choose appropriate category]
- Priority: Critical/High/Medium/Low

### 2. ISSUE IDENTIFIED
- What specific problem or opportunity have you identified?
- Which data points support this?
- What is the current impact on performance?

### 3. ROOT CAUSE
- Why is this issue occurring?
- What aspect of the video is underperforming?

### 4. RECOMMENDED ACTIONS
Provide 2-4 specific actions:
\`\`\`
1. [Action 1]
   - Details: [Specific instructions]
   - Effort: Low/Medium/High
   - Timeline: [Timeframe]

2. [Action 2]
   ...
\`\`\`

### 5. EXPECTED IMPROVEMENT
- Metric: [CTR/Retention/Engagement]
- Current: [X]
- Projected: [Y]
- Improvement: [Z%]
- Timeframe: [When to expect results]
- Confidence: Low/Medium/High

### 6. REASONING
Explain why this will work, referencing:
- 2025 algorithm principles
- Performance data from this video
- Industry best practices

---

## ANALYSIS PRIORITIES

Focus on these areas in order:

1. **First 15 Seconds** (if retention < 80%)
   - This is THE critical decision point
   - What's causing viewers to leave?
   - How can the hook be improved?

2. **CTR Optimization** (if CTR is below benchmark)
   - Title effectiveness
   - Thumbnail quality
   - Search optimization

3. **Mid-Video Retention** (if retention drops significantly)
   - Pacing issues
   - Content structure
   - Value delivery

4. **Engagement Optimization** (if engagement < 5%)
   - Call-to-action effectiveness
   - Community building
   - Comment prompting

## CONSTRAINTS

- Focus on issues this specific video has
- Prioritize changes that can be made now (title/thumbnail/description updates)
- For structural issues, note for future content
- Be specific about timestamps where relevant
- Reference the retention curve data

---

Generate your analysis and recommendations now:`;

// ============================================================================
// TITLE OPTIMIZATION PROMPTS
// ============================================================================

export const TITLE_OPTIMIZATION_PROMPT = `{{systemPrompt}}

# TITLE OPTIMIZATION TASK

## CURRENT TITLE
"{{currentTitle}}"

## VIDEO CONTEXT
- **Topic**: {{topic}}
- **Target Audience**: {{audience}}
- **Video Length**: {{duration}}
- **Content Type**: {{contentType}}
- **Niche**: {{niche}}

## CURRENT PERFORMANCE
- **CTR**: {{ctr}}%
- **Benchmark**: {{ctrBenchmark}}%
- **Gap**: {{gap}}%
- **Main Traffic Source**: {{trafficSource}}
- **Views**: {{views}}
- **Impressions**: {{impressions}}

## SEO DATA
- **Top Keywords**: {{keywords}}
- **Search Volume**: {{searchVolume}}
- **Competition Level**: {{competition}}
- **Current Ranking**: {{ranking}}

## COMPETITOR TITLES (Similar Videos)
{{competitorTitles}}

---

# YOUR TASK

Generate 5 alternative titles optimized for maximum CTR and algorithm performance.

## TITLE OPTIMIZATION PRINCIPLES (2025)

1. **Length**: 60 characters maximum (mobile-friendly)
2. **Keyword Placement**: Primary keyword in first 40 characters
3. **Curiosity Gap**: Create intrigue without clickbait
4. **Specificity**: Concrete outcomes or numbers when possible
5. **Clarity**: Viewers should know what they'll get
6. **Search Intent**: Match what users are searching for
7. **Emotional Trigger**: Include power words when appropriate

## POWER WORDS THAT INCREASE CTR
- Numbers: "3 Ways", "7 Secrets", "10x Faster"
- Time: "In 5 Minutes", "2024 Guide", "Finally"
- Outcome: "How to", "Step-by-Step", "Complete Guide"
- Intrigue: "Secret", "Exposed", "Truth About"
- Negative: "Stop Doing", "Avoid", "Don't"
- Positive: "Best", "Ultimate", "Perfect"

## OUTPUT FORMAT

For each of the 5 title variations:

### Title [1-5]: [NEW TITLE HERE]

**Character Count**: [X/60]

**Strategy**:
- Primary Keyword Position: [Character range]
- Hook Type: [Curiosity/Benefit/Question/How-to/List]
- Emotional Trigger: [What emotion does it evoke?]
- Target Traffic Source: [Search/Browse/Both]

**Keywords Used**: [List keywords and their positions]

**Expected CTR Improvement**: [X%]

**Reasoning**:
[2-3 sentences explaining why this title will perform better than the current one. Reference psychological principles, search intent, or successful patterns.]

**Potential Concerns**:
[Any risks or considerations, e.g., "May be too long for mobile"]

**A/B Test Recommendation**:
[Should this be tested against current or other variations?]

---

## ADDITIONAL REQUIREMENTS

1. **Keyword Integration**: Ensure primary keyword appears naturally
2. **Mobile Preview**: All titles must be clear even when truncated at 50 chars
3. **Brand Voice**: Maintain consistency with channel's typical style
4. **Avoid**:
   - All caps (except acronyms)
   - Excessive punctuation (!!!)
   - Misleading claims
   - Clickbait that hurts retention
   - Generic phrases ("Amazing", "Incredible" without context)

5. **Traffic Source Optimization**:
   {{#if searchTraffic}}
   - Optimize for search: Include exact match keywords
   {{/if}}
   {{#if browseTraffic}}
   - Optimize for browse: Focus on curiosity and emotion
   {{/if}}

---

Generate your 5 optimized titles now:`;

// ============================================================================
// THUMBNAIL STRATEGY PROMPTS
// ============================================================================

export const THUMBNAIL_OPTIMIZATION_PROMPT = `{{systemPrompt}}

# THUMBNAIL OPTIMIZATION ANALYSIS

## VIDEO DETAILS
- **Title**: {{title}}
- **Topic**: {{topic}}
- **Target Audience**: {{audience}}
- **Niche**: {{niche}}

## CURRENT PERFORMANCE
- **CTR**: {{ctr}}%
- **Benchmark**: {{ctrBenchmark}}%
- **Gap**: {{gap}}%
- **Impressions**: {{impressions}}

## CURRENT THUMBNAIL
**Description**: {{thumbnailDescription}}

**Elements Present**:
{{#if hasText}}
- Text overlay: "{{textOverlay}}"
{{/if}}
{{#if hasFace}}
- Face(s): {{faceCount}}, Expression: {{faceExpression}}
{{/if}}
{{#if hasColors}}
- Color scheme: {{colorScheme}}
{{/if}}
{{#if hasOther}}
- Other elements: {{otherElements}}
{{/if}}

## COMPETITOR THUMBNAILS (High-performing similar videos)
{{competitorThumbnails}}

---

# YOUR TASK

Analyze the current thumbnail and provide specific design recommendations to increase CTR.

## THUMBNAIL BEST PRACTICES (2025)

### Design Principles
1. **Clarity**: Must be readable on mobile (phones are 70%+ of views)
2. **Contrast**: High contrast between elements
3. **Focus**: One clear focal point
4. **Colors**: Bright, vibrant colors perform better
5. **Faces**: Close-up faces increase CTR by 10-15%
6. **Text**: 3-5 words maximum, large font

### Color Psychology by Niche
- **Tech/Gaming**: Blue, purple, neon green
- **Finance/Business**: Blue, gold, black
- **Lifestyle/Vlog**: Warm tones, pastels
- **Education**: Orange, yellow, blue
- **Entertainment**: Red, yellow, high contrast

### Mobile Optimization
- Test at 240x135px (mobile thumbnail size)
- Text must be readable at this size
- Avoid clutter and small details

### Facial Expressions
- Surprise: 😮 (Great for curiosity)
- Excitement: 😃 (Good for positive content)
- Concern/Serious: 😐 (Works for problem-solving)
- Avoid neutral expressions

---

## OUTPUT FORMAT

### SECTION 1: WHAT'S WORKING
[List 2-3 elements that are currently effective and should be kept]

Example:
- ✅ High contrast makes thumbnail stand out
- ✅ Clear subject/focal point

### SECTION 2: WHAT'S NOT WORKING
[List 3-5 specific issues hurting CTR]

Example:
- ❌ Text too small to read on mobile
- ❌ Colors blend together, low contrast
- ❌ Facial expression is neutral, lacks emotion

### SECTION 3: SPECIFIC RECOMMENDATIONS

#### Recommendation 1: [Title]
**Priority**: Critical/High/Medium/Low
**Current Issue**: [What's wrong]
**Recommended Change**: [Specific action]
**Design Details**:
- Colors: [Specific color codes or schemes]
- Text: [Exact text and formatting]
- Layout: [Element positioning]
- Size: [Font sizes, element sizes]

**Rationale**: [Why this will improve CTR]
**Expected Impact**: [X% CTR improvement]

[Repeat for 3-5 recommendations]

### SECTION 4: COMPLETE THUMBNAIL CONCEPT

Provide 2-3 complete thumbnail design concepts:

#### Concept A: [Approach Name]
**Description**: [Full thumbnail description]

**Elements**:
1. Background: [Color/image/style]
2. Main Subject: [Person/object/graphic]
3. Text Overlay: [Exact text, font, size, color, position]
4. Additional Elements: [Arrows, circles, icons, etc.]
5. Color Palette: [List 3-4 colors with hex codes]

**Design Mockup** (Text Description):
[Describe the thumbnail as if explaining to a designer]

**Why This Works**:
- [Reason 1]
- [Reason 2]
- [Reason 3]

**Expected CTR**: [X%]
**Best For**: [Search/Browse/Both]

[Repeat for concepts B and C]

### SECTION 5: A/B TESTING STRATEGY

**Test Priority Order**:
1. [First element to test]
2. [Second element to test]
3. [Third element to test]

**Testing Timeline**: [48 hours per variation recommended]

**Success Criteria**: [X% CTR improvement to declare winner]

---

## CONSTRAINTS

- Must be brand-consistent with channel style
- Should complement the video title
- Avoid misleading imagery
- Keep production effort reasonable for creator
- Consider creator's design skills/tools available

---

Generate your thumbnail optimization analysis now:`;

// ============================================================================
// RETENTION & HOOK OPTIMIZATION PROMPTS
// ============================================================================

export const RETENTION_OPTIMIZATION_PROMPT = `{{systemPrompt}}

# VIDEO RETENTION OPTIMIZATION

## VIDEO DETAILS
- **Title**: {{title}}
- **Duration**: {{duration}}
- **Type**: {{videoType}}
- **Topic**: {{topic}}

## RETENTION PERFORMANCE
### Overall: {{avgRetention}}% ({{avgViewDuration}})

**Critical Metrics:**
- **15-Second Retention**: {{retention15s}}% ⚠️ CRITICAL
  - Benchmark: >80%
  - Gap: {{retention15sGap}}%
  - Status: {{retention15sStatus}}

**Retention Curve:**
- At 0s (start): 100%
- At 15s: {{retention15s}}% {{#if retention15sDropping}}⬇️ {{retention15sDrop}}% drop{{/if}}
- At 25%: {{retention25}}% {{#if retention25Dropping}}⬇️ {{retention25Drop}}% drop{{/if}}
- At 50%: {{retention50}}% {{#if retention50Dropping}}⬇️ {{retention50Drop}}% drop{{/if}}
- At 75%: {{retention75}}% {{#if retention75Dropping}}⬇️ {{retention75Drop}}% drop{{/if}}
- At 90%: {{retention90}}%
- At end: {{retentionEnd}}%

**Drop-off Points** (>15% loss in <30 seconds):
{{dropoffPoints}}

## DETAILED RETENTION DATA
{{retentionCurveData}}

## VIDEO STRUCTURE (If available)
{{videoStructure}}

---

# YOUR TASK

Analyze retention patterns and provide timestamp-specific recommendations to improve watch time.

## RETENTION PRINCIPLES (2025)

### The First 15 Seconds
- **Make or break moment** for 70% of viewers
- Must establish value immediately
- No intros, logos, or fluff
- Hook formula: Problem + Promise + Preview

### Pattern Interrupts
- Change every 5-7 seconds (visual, audio, or content)
- Use B-roll, graphics, zooms, cuts
- Prevent viewer fatigue

### Value Delivery
- Deliver on promise throughout video
- Breadcrumb upcoming value
- Use chapter markers for easy navigation

### Ending Strong
- Last 20 seconds for end screens
- Clear CTA before end screen
- Don't let energy drop at end

---

## OUTPUT FORMAT

### PART 1: HOOK ANALYSIS (0-15 seconds)

**Current Hook Performance**: {{retention15s}}%

{{#if retention15s < 70}}
**STATUS**: 🔴 CRITICAL - Major retention issue
{{else if retention15s < 80}}
**STATUS**: 🟡 WARNING - Below benchmark
{{else}}
**STATUS**: 🟢 GOOD - Meeting benchmark
{{/if}}

**What's Happening** (First 15 seconds):
[Describe what actually happens in the first 15 seconds]

**Why Viewers Are Leaving**:
[Analyze specific reasons based on the content]

**RECOMMENDED HOOK STRUCTURE**:

**Seconds 0-3**: [PATTERN INTERRUPT]
- Current: [What happens now]
- Recommended: [Specific change]
- Example: [Exact opener to use]

**Seconds 4-8**: [VALUE PROPOSITION]
- Current: [What happens now]
- Recommended: [Specific change]
- Example: [Exact script]

**Seconds 9-15**: [PREVIEW/PROOF]
- Current: [What happens now]
- Recommended: [Specific change]
- Example: [Exact script/visual]

**Estimated Retention Improvement**: [X% at 15 seconds]

---

### PART 2: MID-VIDEO RETENTION (15s - 80%)

{{#each dropoffPoints}}
#### Drop-off Point {{@index}}: {{timestamp}}

**Retention**: {{retentionBefore}}% → {{retentionAfter}}% ({{dropAmount}}% loss)

**What's Happening**: [Describe content at this timestamp]

**Why the Drop**: [Analyze the likely cause]

**Recommended Fix**:
1. [Specific action]
2. [Specific action]
3. [Specific action]

**Alternative Approach**: [If major restructuring needed]

**Expected Improvement**: [Reduce drop to X%]

---
{{/each}}

**General Mid-Video Improvements**:

1. **Pacing**:
   - Current: [Analysis]
   - Recommendation: [Specific changes]

2. **Pattern Interrupts**:
   - Current frequency: [Every X seconds]
   - Recommended: [Every 5-7 seconds]
   - Types to add: [Visual/audio/content changes]

3. **Content Structure**:
   - Current: [How content is organized]
   - Recommended: [Better structure]

4. **Value Delivery**:
   - Current: [When value is delivered]
   - Recommended: [Better timing/distribution]

---

### PART 3: END SCREEN OPTIMIZATION (Last 20%)

**Current End Performance**:
- Retention at 80%: {{retention80}}%
- Retention at 90%: {{retention90}}%
- Retention at end: {{retentionEnd}}%

**Analysis**: [Is the ending strong or do viewers leave early?]

**Recommendations**:

1. **Content Wrap-up** (Last 60-90 seconds):
   - [How to conclude strongly]
   - [Final value delivery]

2. **CTA Timing** (20-30 seconds before end):
   - Current CTA: [If any]
   - Recommended CTA: [Specific script]
   - Placement: [Exact timestamp]

3. **End Screen Setup** (Last 20 seconds):
   - Video suggestions: [What to link]
   - Playlist/Subscribe button: [Placement]
   - Keep energy high until end

**Expected Improvement**: [X% increase in end retention]

---

### PART 4: FUTURE VIDEO STRUCTURE

Based on retention analysis, here's the optimal structure for future videos in this niche:

\`\`\`
[0:00-0:15] HOOK
├─ 0:00-0:03: Pattern interrupt (shocking stat, bold claim, visual)
├─ 0:04-0:08: Value promise (what viewer will learn/gain)
└─ 0:09-0:15: Preview/proof (show result or preview content)

[0:15-X:XX] MAIN CONTENT
├─ [Timestamp]: Chapter 1 - [Topic]
│   └─ Pattern interrupts every 5-7 seconds
├─ [Timestamp]: Chapter 2 - [Topic]
│   └─ Breadcrumb next value point
└─ [Timestamp]: Chapter 3 - [Topic]
    └─ Maintain pacing

[X:XX-End] CONCLUSION
├─ [Timestamp]: Recap value delivered
├─ [Timestamp]: CTA (like, subscribe, next video)
└─ [Timestamp]: End screen appears
\`\`\`

**Optimal Video Length for This Content**: [X-Y minutes]
**Rationale**: [Why this length]

---

### PART 5: QUICK WINS (Implement Immediately)

These changes can be made to THIS video right now:

1. **[Quick Win 1]**
   - Action: [What to do]
   - Where: [Specific location]
   - Effort: [Minutes]
   - Impact: [Expected improvement]

2. **[Quick Win 2]**
   [Same format]

3. **[Quick Win 3]**
   [Same format]

---

## SUMMARY

**Current Average Retention**: {{avgRetention}}%
**Projected Average Retention**: {{projectedRetention}}%
**Improvement**: +{{retentionImprovement}}%

**Key Actions**:
1. [Most critical action]
2. [Second most critical action]
3. [Third most critical action]

**Timeline**: [When to expect results]
**Confidence**: [Low/Medium/High]

---

Generate your retention optimization analysis now:`;

// ============================================================================
// SHORTS STRATEGY PROMPTS
// ============================================================================

export const SHORTS_STRATEGY_PROMPT = `{{systemPrompt}}

# YOUTUBE SHORTS STRATEGY

## CHANNEL CONTEXT
- **Channel Name**: {{channelName}}
- **Subscribers**: {{subscriberCount}}
- **Niche**: {{niche}}
- **Primary Content**: {{primaryContent}}
- **Current Shorts**: {{shortsCount}} ({{shortsPercentage}}% of content)

## LONG-FORM PERFORMANCE
- Average Views: {{avgLongformViews}}
- Average CTR: {{avgLongformCTR}}%
- Average Retention: {{avgLongformRetention}}%
- Top Topics: {{topLongformTopics}}

## CURRENT SHORTS PERFORMANCE
{{#if hasShortsData}}
- Average Views: {{avgShortsViews}}
- Average Retention: {{avgShortsRetention}}%
- Average Likes/Views: {{avgShortsLikeRate}}%
- Conversion to Long-form: {{shortsToLongformRate}}%
- Subscriber Conversion: {{shortsSubRate}}%
{{else}}
- No Shorts published yet or insufficient data
{{/if}}

---

# YOUR TASK

Create a comprehensive YouTube Shorts strategy that complements the channel's long-form content and drives discovery and growth.

## SHORTS ALGORITHM PRINCIPLES (2025)

### How Shorts Differ from Long-form
1. **Discovery**: Shorts feed, not search or browse
2. **Speed**: Immediate engagement in first 1-2 seconds
3. **Rewatchability**: Algorithm rewards content watched multiple times
4. **Vertical Format**: Mobile-first, 9:16 aspect ratio
5. **No Thumbnails**: First frame is critical
6. **Loop Potential**: Short videos that invite rewatching

### Shorts Success Metrics
- Views (volume over everything)
- Rewatch rate (highly weighted)
- Likes/comments (quick engagement)
- Share rate (virality signal)
- Subscriber conversion (quality signal)

### Shorts as Growth Engine
- **Discovery Tool**: Introduces channel to new audiences
- **Subscriber Funnel**: Drive traffic to long-form
- **Algorithm Boost**: Active Shorts can help long-form
- **Community Building**: Quick, frequent touchpoints

---

## OUTPUT FORMAT

### SECTION 1: STRATEGIC ASSESSMENT

**Current State**:
{{#if hasShortsData}}
- [Analyze current Shorts performance]
- [What's working]
- [What's not working]
{{else}}
- No Shorts strategy in place
- Opportunity: [Size of opportunity for this channel]
{{/if}}

**Why Shorts Matter for This Channel**:
1. [Reason 1]
2. [Reason 2]
3. [Reason 3]

**Strategic Goal**:
[Primary objective: Discovery/Growth/Community/Revenue]

---

### SECTION 2: CONTENT IDEAS

Generate 10 Shorts concepts derived from existing long-form content:

{{#each topLongformVideos}}
#### Shorts Idea {{@index}}: [Concept Title]

**Source**: Long-form video - "{{title}}"
**Hook** (First 2 seconds): [Exact opener]
**Content** (3-30 seconds): [What happens]
**CTA** (Last 3-5 seconds): [Call to action]

**Duration**: [Optimal length]
**Format**: [Talking head/B-roll/Animation/Screen recording]
**Loop Potential**: [How to make it rewatchable]

**Why This Will Work**:
- [Reason 1]
- [Reason 2]

**Expected Performance**:
- Views: [Estimate based on niche]
- Rewatch Rate: [High/Medium/Low]
- Sub Conversion: [X per 1000 views]

---
{{/each}}

### SECTION 3: SHORTS-TO-LONG-FORM FUNNEL

**Strategy to Convert Shorts Viewers to Long-form Subscribers**:

1. **In-Short CTAs**:
   - Timing: [When in the Short]
   - Script: "[Exact CTA]"
   - Visual: [On-screen element]

2. **Pin Comment Strategy**:
   - Template: "[Exact pinned comment]"
   - Link to: [Specific long-form video]

3. **Profile Optimization**:
   - Description: [What to say]
   - Featured video: [Which one]
   - Playlist: [Create Shorts playlist]

4. **Content Teasing**:
   - How to tease long-form content in Shorts
   - Example: [Specific approach]

**Expected Conversion Rate**: [X% of Shorts viewers → Long-form viewers]

---

### SECTION 4: POSTING SCHEDULE

**Optimal Frequency for Channel Size** ({{subscriberCount}} subscribers):

{{#if subscriberCount < 10000}}
- **Shorts**: 1-2 per day (discovery phase)
- **Long-form**: Maintain current schedule
{{else if subscriberCount < 100000}}
- **Shorts**: 3-5 per week
- **Long-form**: Maintain current schedule
{{else}}
- **Shorts**: 5-7 per week
- **Long-form**: Maintain current schedule
{{/if}}

**Posting Times** (Based on niche):
- Best times: [Specific times and why]
- Days to prioritize: [Which days]
- Avoid: [Times/days to skip]

**Content Calendar Template**:
\`\`\`
Week 1:
- Monday: [Short concept]
- Wednesday: [Short concept]
- Friday: [Short concept]
- [Long-form schedule]

Week 2:
[Pattern]
\`\`\`

**Batching Strategy**:
- [How to efficiently create multiple Shorts]
- [Recommended batch size]
- [Tools/equipment needed]

---

### SECTION 5: PRODUCTION GUIDELINES

**Technical Requirements**:
- **Aspect Ratio**: 9:16 (1080x1920px)
- **Duration**: [Optimal range for this niche]
- **First Frame**: [What makes a compelling first frame]
- **Audio**: [Music/voiceover recommendations]
- **Text Overlays**: [When and how to use]

**Hook Templates** (First 1-2 seconds):

1. **Pattern Interrupt**: "[Example]"
2. **Bold Claim**: "[Example]"
3. **Question**: "[Example]"
4. **Shocking Visual**: [Description]
5. **Curiosity Gap**: "[Example]"

**Quality vs. Quantity**:
- [Guidance on production quality for this niche]
- [What's acceptable vs. what's required]

---

### SECTION 6: OPTIMIZATION TACTICS

**Rewatchability Techniques**:
1. [Technique 1]
2. [Technique 2]
3. [Technique 3]

**Engagement Prompts**:
- Comment baiting: "[Example]"
- Like prompts: "[Example]"
- Share hooks: "[Example]"

**Trend Participation**:
- Relevant trending sounds for this niche
- How to adapt trends to channel brand
- When to jump on trends (timing)

**Testing & Iteration**:
- Metrics to track: [Specific KPIs]
- Success criteria: [What makes a good Short]
- When to double down: [Signals to watch]
- When to pivot: [Red flags]

---

### SECTION 7: 90-DAY ROADMAP

**Phase 1: Testing (Days 1-30)**
- **Goal**: Find what resonates
- **Shorts to publish**: [Number]
- **Focus**: Variety of concepts
- **Success metric**: [KPI]

**Phase 2: Optimization (Days 31-60)**
- **Goal**: Double down on winners
- **Shorts to publish**: [Number]
- **Focus**: Replicate successful formats
- **Success metric**: [KPI]

**Phase 3: Scaling (Days 61-90)**
- **Goal**: Consistent growth engine
- **Shorts to publish**: [Number]
- **Focus**: Systematic production
- **Success metric**: [KPI]

---

### SECTION 8: SUCCESS METRICS

**Track These KPIs**:
1. **Shorts Performance**:
   - Average views per Short
   - Rewatch rate
   - Like/view ratio
   - Comment rate
   - Share rate

2. **Channel Impact**:
   - Subscriber growth rate
   - Shorts→Long-form traffic
   - Overall channel views
   - Watch time (long-form)

3. **Conversion Metrics**:
   - Subscribers from Shorts (%)
   - Shorts viewers who watch long-form (%)
   - Repeat Shorts viewers

**Goal Benchmarks** (90 days):
- Shorts views: [Target]
- Subscriber growth: [Target]
- Conversion rate: [Target]

---

### SECTION 9: TOOLS & RESOURCES

**Editing Tools**:
- [Recommended app/software for this creator]
- [Templates/presets to use]

**Inspiration Sources**:
- [Channels to study in this niche]
- [Trends to monitor]

**Time Investment**:
- Per Short: [Estimated time]
- Per week total: [Estimated time]
- [Tips to reduce time]

---

## SUMMARY

**Why This Strategy Will Work**:
1. [Key success factor 1]
2. [Key success factor 2]
3. [Key success factor 3]

**First Actions** (Next 7 days):
1. [Immediate action]
2. [Immediate action]
3. [Immediate action]

**Expected Results** (90 days):
- Subscriber growth: [X%]
- Shorts views: [X]
- Channel discovery: [X% increase]

**Confidence Level**: [Low/Medium/High]

---

Generate your Shorts strategy now:`;

// ============================================================================
// PROMPT TEMPLATE EXPORT
// ============================================================================

export interface PromptConfig {
  category: RecommendationCategory;
  template: string;
  systemPrompt: string;
  defaultTemperature: number;
  maxTokens: number;
  model: 'claude-sonnet-4.5' | 'gpt-4' | 'gemini-pro';
}

export const PROMPT_TEMPLATES: Record<RecommendationCategory, PromptConfig> = {
  title_optimization: {
    category: 'title_optimization',
    template: TITLE_OPTIMIZATION_PROMPT,
    systemPrompt: CREATIVE_OPTIMIZATION_SYSTEM_PROMPT,
    defaultTemperature: 0.6,
    maxTokens: 2500,
    model: 'claude-sonnet-4.5',
  },
  thumbnail_improvement: {
    category: 'thumbnail_improvement',
    template: THUMBNAIL_OPTIMIZATION_PROMPT,
    systemPrompt: CREATIVE_OPTIMIZATION_SYSTEM_PROMPT,
    defaultTemperature: 0.5,
    maxTokens: 3000,
    model: 'claude-sonnet-4.5',
  },
  content_structure: {
    category: 'content_structure',
    template: VIDEO_ANALYSIS_PROMPT,
    systemPrompt: YOUTUBE_ALGORITHM_EXPERT_SYSTEM_PROMPT,
    defaultTemperature: 0.3,
    maxTokens: 3500,
    model: 'claude-sonnet-4.5',
  },
  retention_improvement: {
    category: 'retention_improvement',
    template: RETENTION_OPTIMIZATION_PROMPT,
    systemPrompt: YOUTUBE_ALGORITHM_EXPERT_SYSTEM_PROMPT,
    defaultTemperature: 0.3,
    maxTokens: 4000,
    model: 'claude-sonnet-4.5',
  },
  shorts_strategy: {
    category: 'shorts_strategy',
    template: SHORTS_STRATEGY_PROMPT,
    systemPrompt: YOUTUBE_ALGORITHM_EXPERT_SYSTEM_PROMPT,
    defaultTemperature: 0.4,
    maxTokens: 4500,
    model: 'claude-sonnet-4.5',
  },
  // Add remaining categories with appropriate templates
  engagement_tactics: {
    category: 'engagement_tactics',
    template: VIDEO_ANALYSIS_PROMPT, // Reuse with engagement focus
    systemPrompt: YOUTUBE_ALGORITHM_EXPERT_SYSTEM_PROMPT,
    defaultTemperature: 0.4,
    maxTokens: 2000,
    model: 'claude-sonnet-4.5',
  },
  seo_keywords: {
    category: 'seo_keywords',
    template: TITLE_OPTIMIZATION_PROMPT, // Reuse with SEO focus
    systemPrompt: CREATIVE_OPTIMIZATION_SYSTEM_PROMPT,
    defaultTemperature: 0.4,
    maxTokens: 2000,
    model: 'claude-sonnet-4.5',
  },
  upload_schedule: {
    category: 'upload_schedule',
    template: CHANNEL_STRATEGY_PROMPT,
    systemPrompt: YOUTUBE_ALGORITHM_EXPERT_SYSTEM_PROMPT,
    defaultTemperature: 0.3,
    maxTokens: 2000,
    model: 'claude-sonnet-4.5',
  },
  audience_targeting: {
    category: 'audience_targeting',
    template: CHANNEL_STRATEGY_PROMPT,
    systemPrompt: YOUTUBE_ALGORITHM_EXPERT_SYSTEM_PROMPT,
    defaultTemperature: 0.3,
    maxTokens: 2500,
    model: 'claude-sonnet-4.5',
  },
  cta_optimization: {
    category: 'cta_optimization',
    template: RETENTION_OPTIMIZATION_PROMPT,
    systemPrompt: CREATIVE_OPTIMIZATION_SYSTEM_PROMPT,
    defaultTemperature: 0.4,
    maxTokens: 2000,
    model: 'claude-sonnet-4.5',
  },
  topic_selection: {
    category: 'topic_selection',
    template: CHANNEL_STRATEGY_PROMPT,
    systemPrompt: YOUTUBE_ALGORITHM_EXPERT_SYSTEM_PROMPT,
    defaultTemperature: 0.3,
    maxTokens: 2500,
    model: 'claude-sonnet-4.5',
  },
  collaboration: {
    category: 'collaboration',
    template: CHANNEL_STRATEGY_PROMPT,
    systemPrompt: YOUTUBE_ALGORITHM_EXPERT_SYSTEM_PROMPT,
    defaultTemperature: 0.4,
    maxTokens: 2000,
    model: 'claude-sonnet-4.5',
  },
  playlist_strategy: {
    category: 'playlist_strategy',
    template: CHANNEL_STRATEGY_PROMPT,
    systemPrompt: YOUTUBE_ALGORITHM_EXPERT_SYSTEM_PROMPT,
    defaultTemperature: 0.3,
    maxTokens: 2000,
    model: 'claude-sonnet-4.5',
  },
  end_screen_optimization: {
    category: 'end_screen_optimization',
    template: RETENTION_OPTIMIZATION_PROMPT,
    systemPrompt: YOUTUBE_ALGORITHM_EXPERT_SYSTEM_PROMPT,
    defaultTemperature: 0.3,
    maxTokens: 2000,
    model: 'claude-sonnet-4.5',
  },
};

/**
 * Utility function to build a prompt with variable substitution
 */
export function buildPrompt(
  template: string,
  variables: Record<string, any>,
  systemPrompt?: string
): string {
  let prompt = template;

  // Add system prompt if provided
  if (systemPrompt) {
    prompt = prompt.replace('{{systemPrompt}}', systemPrompt);
  }

  // Replace all variables
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    prompt = prompt.replace(regex, String(value));
  }

  // Handle conditional blocks (basic implementation)
  // {{#if condition}} ... {{/if}}
  prompt = prompt.replace(/{{#if\s+(\w+)}}(.*?){{\/if}}/gs, (match, condition, content) => {
    return variables[condition] ? content : '';
  });

  return prompt;
}
