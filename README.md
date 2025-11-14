# YouTube Channel AI Analyst

A comprehensive Node.js application that analyzes YouTube channels for SEO insights. Features both a powerful REST API and an interactive web dashboard for analyzing video performance, tags, keywords, and engagement metrics.

## Features

### Web Dashboard (SEO Tool)
- 🎯 **Interactive Web UI** - Beautiful, responsive dashboard for channel analysis
- 📊 **SEO Insights** - Keyword analysis, tag frequency, and title optimization
- 📈 **Performance Metrics** - Track views, likes, comments, and engagement rates
- 🔍 **Advanced Filtering** - Search and filter videos, tags, and keywords
- 📉 **Data Visualization** - Charts and metrics for publishing patterns
- 💾 **CSV Export** - Download complete channel data for offline analysis
- 🏆 **Top Performers** - Identify best-performing videos and content patterns

### REST API
- 🎥 Fetch all videos from a YouTube channel
- 📊 Get detailed statistics (views, likes, comments)
- 🏷️ Extract video tags and metadata
- ⏱️ Retrieve publication dates and video duration
- 🔍 Support for multiple YouTube URL formats
- 📈 Channel statistics and information

## Prerequisites

- Node.js (v18 or higher)
- YouTube Data API v3 Key

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd yt_ai_analyst
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and add your YouTube API key:

```env
YOUTUBE_API_KEY=your_actual_api_key_here
PORT=3000
```

#### How to get a YouTube API Key:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **YouTube Data API v3**
4. Go to **Credentials** and create an **API Key**
5. Copy the API key to your `.env` file

### 4. Start the server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The application will be available at:
- **Web Dashboard**: `http://localhost:3000`
- **API**: `http://localhost:3000/api`
- **Health Check**: `http://localhost:3000/health`

## Using the Web Dashboard

1. Open your browser and navigate to `http://localhost:3000`
2. Enter a YouTube channel URL in any of these formats:
   - `https://www.youtube.com/@username`
   - `https://www.youtube.com/channel/UCxxxxx`
   - `https://www.youtube.com/c/channelname`
   - `https://www.youtube.com/user/username`
3. Select the maximum number of videos to analyze (10-200)
4. Click "Analyze Channel"

### Dashboard Features

**Overview Tab:**
- Channel statistics (subscribers, total views, video count)
- Top 5 performing videos
- Engagement metrics (average views, engagement rate)
- Most common tags
- Publishing frequency analysis

**Keywords & Tags Tab:**
- Complete tag analysis with frequency counts
- Filter tags by search term and minimum frequency
- Title keyword extraction (identifies most used words in video titles)
- SEO optimization insights

**Performance Tab:**
- Sortable table of all videos by:
  - Views
  - Likes
  - Comments
  - Engagement Rate
  - Publication Date
- Detailed metrics for each video

**All Videos Tab:**
- Searchable table of all analyzed videos
- Complete video information (title, description, tags, stats)
- CSV export functionality for offline analysis

## API Endpoints

### Health Check

```http
GET /health
```

Returns the API status.

**Response:**
```json
{
  "status": "OK",
  "message": "YouTube AI Analyst API is running"
}
```

### Get Channel Videos

```http
GET /api/channel/videos?url=<channel_url>&maxResults=<number>
```

Fetches all videos from a YouTube channel with detailed information.

**Query Parameters:**
- `url` (required): YouTube channel URL
- `maxResults` (optional): Maximum number of videos to fetch (default: 50, max: 500)

**Supported URL formats:**
- `https://www.youtube.com/channel/UCxxxxx`
- `https://www.youtube.com/@username`
- `https://www.youtube.com/c/channelname`
- `https://www.youtube.com/user/username`

**Example Request:**
```bash
curl "http://localhost:3000/api/channel/videos?url=https://www.youtube.com/@mkbhd&maxResults=10"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "channel": {
      "id": "UCBJycsmduvYEL83R_U4JriQ",
      "title": "Marques Brownlee",
      "description": "Channel description...",
      "customUrl": "@mkbhd",
      "publishedAt": "2008-03-21T20:45:23Z",
      "thumbnails": { ... },
      "statistics": {
        "viewCount": 1000000,
        "subscriberCount": 500000,
        "videoCount": 1500
      }
    },
    "videos": [
      {
        "id": "dQw4w9WgXcQ",
        "title": "Video Title",
        "description": "Video description...",
        "publishedAt": "2024-01-15T10:30:00Z",
        "thumbnails": { ... },
        "tags": ["tech", "review", "gadgets"],
        "duration": "10:25",
        "statistics": {
          "viewCount": 50000,
          "likeCount": 2500,
          "commentCount": 150
        },
        "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      }
    ],
    "totalVideos": 10
  }
}
```

### Get Channel Info

```http
GET /api/channel/info?url=<channel_url>
```

Fetches basic information about a YouTube channel without videos.

**Query Parameters:**
- `url` (required): YouTube channel URL

**Example Request:**
```bash
curl "http://localhost:3000/api/channel/info?url=https://www.youtube.com/@mkbhd"
```

## Project Structure

```
yt_ai_analyst/
├── src/
│   ├── index.js              # Main application entry point
│   ├── routes/
│   │   └── channel.js        # Channel-related API routes
│   ├── services/
│   │   └── youtubeService.js # YouTube API integration
│   └── utils/
│       └── youtubeHelper.js  # Helper functions
├── public/
│   ├── index.html            # Web dashboard UI
│   ├── css/
│   │   └── style.css         # Dashboard styling
│   └── js/
│       └── app.js            # Dashboard logic and SEO analysis
├── .env.example              # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- `400 Bad Request`: Missing or invalid parameters
- `500 Internal Server Error`: Server or API errors

Example error response:
```json
{
  "success": false,
  "error": "Failed to fetch channel videos",
  "message": "Invalid YouTube channel URL"
}
```

## Rate Limits

YouTube Data API v3 has quota limits. Each request consumes quota units:
- Default quota: 10,000 units per day
- Video list request: ~3-5 units
- Channel info: ~1 unit

Monitor your usage in the [Google Cloud Console](https://console.cloud.google.com/).

## Technologies Used

- **Express.js**: Web framework
- **Axios**: HTTP client for API requests
- **dotenv**: Environment variable management
- **CORS**: Cross-origin resource sharing

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
