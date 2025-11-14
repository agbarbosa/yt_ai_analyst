# 🎬 YouTube AI Analyst - Algorithm 2025 Edition

An intelligent YouTube channel and video analyzer powered by AI, optimized for the 2025 YouTube algorithm. Provides actionable recommendations to improve CTR, retention, engagement, and overall algorithm performance.

## ✨ Features

### Algorithm Scoring (0-100 Scale)
- **CTR Analysis** (25% weight): Thumbnail and title effectiveness
- **Watch Time & Retention** (35% weight): First 15-second hook analysis
- **Engagement** (25% weight): Likes, comments, shares tracking
- **Viewer Satisfaction** (15% weight): Negative signal detection

### AI-Powered Recommendations
- Channel-level strategy generation
- Video-specific optimization
- Title alternatives (5 suggestions per video)
- Thumbnail design recommendations
- Retention improvement with timestamp-specific fixes
- YouTube Shorts strategy

### 2025 Algorithm Optimization
- First 15-second retention focus (critical metric)
- Traffic source-specific CTR targets (10% search, 5% browse)
- Niche targeting over broad appeal
- Small channel democratization support

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- YouTube Data API v3 credentials
- Anthropic Claude API key

### Installation

```bash
# Clone the repository
git clone https://github.com/agbarbosa/yt_ai_analyst.git
cd yt_ai_analyst

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
# Required: YOUTUBE_API_KEY, ANTHROPIC_API_KEY, DATABASE_URL
```

### Database Setup

```bash
# Create PostgreSQL database
createdb yt_ai_analyst

# Run migrations
psql -d yt_ai_analyst -f src/database/schema.sql
```

### Start Development Server

```bash
npm run dev
```

Server will start at `http://localhost:3000`

## 🐳 Docker Setup (Recommended)

For a complete production-ready environment with all dependencies:

### Quick Start with Docker

```bash
# 1. Clone repository
git clone https://github.com/agbarbosa/yt_ai_analyst.git
cd yt_ai_analyst

# 2. Configure environment
cp .env.docker .env
# Edit .env with your API keys

# 3. Start all services
./docker-start.sh
```

### What's Included

- ✅ **Application**: Node.js 20 with TypeScript
- ✅ **PostgreSQL 15**: Automatically initialized with schema
- ✅ **MongoDB 7**: Analytics storage
- ✅ **Redis 7**: Caching and job queue
- ✅ **Admin Tools** (optional): pgAdmin, Mongo Express, Redis Commander

### Docker Commands

```bash
# Start services
./docker-start.sh

# Stop services
./docker-stop.sh

# View logs
./docker-logs.sh [service]

# Reset everything (caution!)
./docker-reset.sh
```

### Service URLs (Docker)

- **Application**: http://localhost:3000
- **pgAdmin**: http://localhost:5050 (with `--profile admin`)
- **Mongo Express**: http://localhost:8081 (with `--profile admin`)
- **Redis Commander**: http://localhost:8082 (with `--profile admin`)

📖 **Complete Docker Guide**: See [DOCKER_SETUP.md](DOCKER_SETUP.md)

## 📡 API Endpoints

### Channel Analysis
```http
GET /api/channels/:channelId/analysis
```

Returns channel statistics, algorithm score, and recent video performance.

**Example:**
```bash
curl http://localhost:3000/api/channels/UC_x5XG1OV2P6uZZ5FSM9Ttw/analysis
```

### Video Analysis
```http
GET /api/videos/:videoId/analysis
```

Returns detailed video metrics and algorithm breakdown.

**Example:**
```bash
curl http://localhost:3000/api/videos/dQw4w9WgXcQ/analysis
```

### Generate Recommendations
```http
POST /api/videos/:videoId/recommendations
```

Generates AI-powered optimization recommendations for a video.

**Example:**
```bash
curl -X POST http://localhost:3000/api/videos/dQw4w9WgXcQ/recommendations
```

### Optimize Title
```http
POST /api/videos/:videoId/optimize-title
```

Generates 5 alternative titles optimized for CTR.

### Search Channels
```http
GET /api/search/channels?q=search+query&maxResults=10
```

Search for YouTube channels by keyword.

## 📊 Algorithm Scoring System

### Scoring Breakdown

| Component | Max Points | Weight | Benchmark |
|-----------|-----------|--------|-----------|
| CTR | 25 | 25% | 10% (search), 5% (browse) |
| Watch Time | 35 | 35% | 50% retention, 8min AVD |
| Engagement | 25 | 25% | 5% engagement rate |
| Satisfaction | 15 | 15% | <10% negative signals |

### Grade Scale

- **90-100 (A+)**: Viral potential, excellent algorithm performance
- **80-89 (A)**: Very good, strong algorithm signals
- **70-79 (B+)**: Above average, solid performance
- **60-69 (B)**: Average, room for improvement
- **50-59 (C+)**: Below average, needs optimization
- **40-49 (C)**: Poor, significant issues
- **30-39 (D)**: Very poor, major problems
- **0-29 (F)**: Critical issues, immediate attention needed

## 🏗️ Project Structure

```
yt_ai_analyst/
├── src/
│   ├── ai/
│   │   └── prompts.ts           # AI prompt templates
│   ├── config/
│   │   └── index.ts             # Configuration management
│   ├── database/
│   │   ├── postgres.ts          # Database connection
│   │   └── schema.sql           # Database schema
│   ├── services/
│   │   ├── youtube-api.ts       # YouTube API integration
│   │   ├── algorithm-scorer.ts  # Scoring engine
│   │   ├── ai-service.ts        # AI generation
│   │   └── recommendation-engine.ts # Recommendation generator
│   ├── types/
│   │   └── models.ts            # TypeScript interfaces
│   ├── utils/
│   │   └── logger.ts            # Logging utility
│   └── server.ts                # Express API server
├── YOUTUBE_ALGORITHM_PLAN_2025.md  # Comprehensive plan
├── IMPLEMENTATION_SUMMARY.md       # Implementation guide
└── package.json
```

## 🔧 Configuration

### Environment Variables

Key configuration in `.env`:

```env
# YouTube API
YOUTUBE_API_KEY=your_key_here
YOUTUBE_CLIENT_ID=your_client_id
YOUTUBE_CLIENT_SECRET=your_secret

# AI Services
ANTHROPIC_API_KEY=your_claude_api_key

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/yt_ai_analyst

# Server
PORT=3000
NODE_ENV=development
```

See `.env.example` for full configuration options.

## 🧪 Development

### Run Tests
```bash
npm test
```

### Lint Code
```bash
npm run lint
```

### Format Code
```bash
npm run format
```

### Build for Production
```bash
npm run build
npm start
```

## 📈 Usage Examples

### Analyze a Channel

```typescript
import { youtubeAPI, algorithmScorer } from './src/services';

const channelId = 'UC_x5XG1OV2P6uZZ5FSM9Ttw';

// Fetch channel data
const channelData = await youtubeAPI.getChannelData(channelId);

// Fetch recent videos
const videoIds = await youtubeAPI.getChannelVideos(channelId, 20);
const videos = await youtubeAPI.getVideosDataBatch(videoIds);

// Calculate algorithm score
const score = algorithmScorer.calculateChannelScore(videos);

console.log(`Channel Score: ${score.overall}/100 (${score.grade})`);
console.log('Strengths:', score.strengths);
console.log('Weaknesses:', score.weaknesses);
```

### Generate Recommendations

```typescript
import { recommendationEngine } from './src/services';

const video = await youtubeAPI.getVideoData('dQw4w9WgXcQ');
const algorithmScore = algorithmScorer.calculateVideoScore(video);

const recommendations = await recommendationEngine.generateVideoRecommendations(
  video,
  algorithmScore
);

recommendations.forEach(rec => {
  console.log(`[${rec.priority}] ${rec.title}`);
  console.log(`Expected impact: +${rec.expectedImpact.improvement}%`);
});
```

## 🎯 Key Metrics & Benchmarks

### 2025 Algorithm Priorities

1. **First 15 Seconds**: 70% of viewers decide here
2. **CTR by Source**:
   - Search: Target >10%
   - Browse: Target >5%
3. **Retention**: Target >50% average
4. **Engagement**: Target >5% rate
5. **Satisfaction**: Target <10% negative signals

### Channel Size Benchmarks

- **Nano** (<1K subs): Lower thresholds, focus on consistency
- **Micro** (1K-10K): Building momentum phase
- **Small** (10K-100K): Optimization critical
- **Medium** (100K-1M): Scale and efficiency
- **Large** (1M-10M): Community and brand
- **Mega** (10M+): Innovation and trends

## 🛠️ Tech Stack

- **Runtime**: Node.js 20+ with TypeScript 5
- **Framework**: Express.js
- **Database**: PostgreSQL 14+
- **AI**: Anthropic Claude Sonnet 4.5
- **APIs**: YouTube Data API v3
- **Validation**: Zod
- **Logging**: Winston

## 📚 Documentation

- **[YOUTUBE_ALGORITHM_PLAN_2025.md](YOUTUBE_ALGORITHM_PLAN_2025.md)** - Complete strategic plan
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Implementation guide
- **[API Documentation](docs/api.md)** - API reference (coming soon)

## 🔄 Roadmap

### Phase 1: Foundation ✅
- [x] Project setup and configuration
- [x] YouTube API integration
- [x] Database schema
- [x] Algorithm scoring engine
- [x] Basic API endpoints

### Phase 2: Enhancement (In Progress)
- [ ] YouTube Analytics API integration
- [ ] Real-time retention curve analysis
- [ ] Competitor benchmarking
- [ ] Automated data collection jobs

### Phase 3: Advanced Features
- [ ] Web dashboard
- [ ] Real-time notifications
- [ ] A/B testing framework
- [ ] Historical trend analysis

### Phase 4: Scale
- [ ] Multi-user support
- [ ] Team collaboration features
- [ ] White-label options
- [ ] API rate optimization

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 📄 License

MIT License - see LICENSE file for details

## 👤 Author

**Alex Barbosa**
- GitHub: [@agbarbosa](https://github.com/agbarbosa)

## 🙏 Acknowledgments

- YouTube Creator Academy for algorithm insights
- Anthropic for Claude API
- OpenAI for prompt engineering best practices
- YouTube data analysis community

## 📞 Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/agbarbosa/yt_ai_analyst/issues)
- Documentation: See IMPLEMENTATION_SUMMARY.md

---

**Built with ❤️ for YouTube creators seeking algorithm success in 2025**
